import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../www/',import.meta.url));
async function files(dir) {
  const result=[];
  for(const e of await fs.readdir(dir,{withFileTypes:true})) {
    const p=path.join(dir,e.name);
    if(e.isDirectory())result.push(...await files(p));else result.push(p);
  }
  return result;
}
test('clean bundle excludes development files, environment files and private key material',async()=>{
  const list=await files(root);
  assert.ok(list.length>100);
  for(const file of list) {
    const relative=path.relative(root,file).replaceAll('\\','/');
    assert.doesNotMatch(relative,/(^|\/)(?:qa|backend|node_modules|\.env[^/]*)(\/|$)|\.(?:pem|key|jks|keystore|ps1|py)$/i);
    if(/\.(?:html|js|json|css)$/.test(file)) {
      const text=await fs.readFile(file,'utf8');
      assert.doesNotMatch(text,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sb_secret_[A-Za-z0-9]+/,relative);
      for(const match of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
        try { assert.notEqual(JSON.parse(Buffer.from(match[1],'base64url')).role,'service_role',relative); }
        catch(error) { if(error.code==='ERR_ASSERTION')throw error; }
      }
    }
  }
});
test('all 33 pages have integration, valid local references and no installation prompts',async()=>{
  const html=(await files(root)).filter(file=>file.endsWith('.html'));
  assert.equal(html.length,33);
  for(const file of html) {
    const text=await fs.readFile(file,'utf8');
    assert.match(text,/native\.js/,file);
    assert.match(text,/viewport-fit=cover/,file);
    assert.doesNotMatch(text,/id=["'](?:install|install-note)["']/,file);
    for(const match of text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
      const ref=match[1];
      if(/^(?:[a-z]+:|\/\/|#|\?)/i.test(ref))continue;
      const clean=decodeURIComponent(ref.split(/[?#]/)[0]);
      if(!clean)continue;
      const target=clean.startsWith('/')?path.join(root,clean):path.resolve(path.dirname(file),clean);
      await assert.doesNotReject(fs.access(target),path.relative(root,file)+' -> '+ref);
    }
  }
});
