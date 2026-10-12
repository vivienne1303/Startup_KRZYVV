import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'www');
if (out !== path.resolve(root, 'www')) throw new Error('Unexpected output path');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
const allowed = new Set(['.html','.css','.js','.json','.png','.jpg','.jpeg','.svg','.webp','.ico','.pdf','.woff','.woff2','.ttf','.gif','.avif','.mp4','.webm']);
async function copyRuntime(from, to) {
  const stat = await fs.lstat(from);
  if (stat.isSymbolicLink()) throw new Error('Symlinks are not allowed in the app bundle: ' + from);
  if (stat.isDirectory()) {
    await fs.mkdir(to, { recursive: true });
    for (const name of await fs.readdir(from)) {
      if (name.startsWith('.') || ['node_modules','backend','qa'].includes(name)) continue;
      await copyRuntime(path.join(from,name), path.join(to,name));
    }
  } else if (allowed.has(path.extname(from).toLowerCase())) {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
}
for (const file of ['index.html','app.css','app.js','mobile-pages.css','mobile-pages.js']) {
  await copyRuntime(path.join(root,file),path.join(out,file));
}
for (const name of ['index.html','mobile-showcase.html','script.js','style.css','assets','css','js','pages','output','data','components']) {
  const source = path.join(root, 'site', name);
  try { await fs.access(source); }
  catch (error) { if (error.code === 'ENOENT' && ['output','data','components'].includes(name)) continue; throw error; }
  await copyRuntime(source, path.join(out,'site',name));
}
await fs.copyFile(path.join(root,'src/native.css'),path.join(out,'native.css'));
await build({ entryPoints:[path.join(root,'src/native.js')], bundle:true, format:'iife', target:'chrome110', outfile:path.join(out,'native.js') });
let count = 0;
async function patchHtml(dir) {
  for (const entry of await fs.readdir(dir,{withFileTypes:true})) {
    const file = path.join(dir,entry.name);
    if (entry.isDirectory()) { await patchHtml(file); continue; }
    if (!file.endsWith('.html')) continue;
    let html = await fs.readFile(file,'utf8');
    const relative = path.relative(path.dirname(file),out).replaceAll('\\','/') || '.';
    // Run synchronously before page scripts so all API requests use session handling.
    html = html.replace(/<head([^>]*)>/i, '<head$1><script src="' + relative + '/native.js"></script>');
    html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="' + relative + '/native.css"></head>');
    html = html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">');
    html = html.replace(/<link\b[^>]*rel=["']manifest["'][^>]*>/gi,'');
    html = html.replace(/<p\b[^>]*id=["']install-note["'][\s\S]*?<\/p>/gi,'');
    html = html.replace(/<button\b[^>]*id=["']install["'][\s\S]*?<\/button>/gi,'');
    await fs.writeFile(file,html);
    count++;
  }
}
await patchHtml(out);
console.log('Built ' + count + ' HTML pages in www; no backend, environment files, QA profiles or preview tools included.');
