import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const mobile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.dirname(mobile);
const out = path.join(repo, '.pages-site');
const built = spawnSync(process.execPath, [path.join(mobile, 'scripts/build.mjs')], { stdio: 'inherit' });
if (built.status !== 0) process.exit(built.status || 1);
// A dedicated Pages artifact prevents publishing the backend, archives or credentials.
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
const allowed = new Set(['.html','.css','.js','.json','.png','.jpg','.jpeg','.svg','.webp','.ico','.pdf','.woff','.woff2','.ttf','.gif','.avif','.mp4','.webm','.txt']);
async function copy(from, to) {
  const stat = await fs.lstat(from);
  if (stat.isSymbolicLink()) throw new Error('No symlinks allowed: ' + from);
  if (stat.isDirectory()) {
    await fs.mkdir(to, { recursive: true });
    for (const name of await fs.readdir(from)) {
      if (name.startsWith('.') || ['node_modules','backend','qa'].includes(name)) continue;
      await copy(path.join(from, name), path.join(to, name));
    }
  } else if (allowed.has(path.extname(from).toLowerCase()) || path.basename(from) === 'CNAME') {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
}
for (const name of ['index.html','mobile-showcase.html','style.css','script.js','favicon.ico','CNAME','assets','components','css','js','data','pages','output']) {
  try { await fs.access(path.join(repo, name)); }
  catch (error) { if (error.code === 'ENOENT' && ['components','data','output'].includes(name)) continue; throw error; }
  await copy(path.join(repo, name), path.join(out, name));
}
const preview = path.join(out, 'mobile app');
await copy(path.join(mobile, 'www'), preview);
async function patch(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await patch(file); continue; }
    if (!file.endsWith('.html')) continue;
    const html = await fs.readFile(file, 'utf8');
    await fs.writeFile(file, html.replace(/<head([^>]*)>/i, '<head$1><script>window.TEENLAUNCH_WEB_PREVIEW=true;</script>'));
  }
}
await patch(preview);
await fs.writeFile(path.join(out, '.nojekyll'), '');
console.log('Pages artifact ready: .pages-site/ (website unchanged, preview at /mobile%20app/)');
