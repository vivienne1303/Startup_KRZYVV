import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const root = path.join(repo, '.pages-site');
const mobile = path.join(root, 'mobile app');
async function files(dir) {
  const result = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...await files(file)); else result.push(file);
  }
  return result;
}
test('Pages keeps every published website file byte-for-byte unchanged', async () => {
  for (const file of await files(root)) {
    const relative = path.relative(root, file);
    if (relative.startsWith('mobile app' + path.sep) || relative === '.nojekyll') continue;
    assert.deepEqual(await fs.readFile(file), await fs.readFile(path.join(repo, relative)), relative);
  }
  assert.equal((await fs.readFile(path.join(root, 'CNAME'), 'utf8')).trim(), 'www.teenlaunch.app');
  await fs.access(path.join(root, 'index.html'));
});
test('all 33 preview pages and CSS assets resolve under the encoded subdirectory', async () => {
  const list = await files(mobile);
  assert.equal(list.filter(file => file.endsWith('.html')).length, 33);
  for (const file of list.filter(file => /\.(html|css)$/.test(file))) {
    const text = await fs.readFile(file, 'utf8');
    if (file.endsWith('.html')) {
      assert.match(text, /TEENLAUNCH_WEB_PREVIEW=true/);
      assert.match(text, /native\.js/);
    }
    const refs = file.endsWith('.html')
      ? [...text.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map(match => match[1])
      : [...text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/gi)].map(match => match[1]);
    const url = new URL(encodeURI(path.relative(root, file).replaceAll('\\', '/')), 'https://www.teenlaunch.app/');
    for (const ref of refs) {
      if (/^(?:[a-z]+:|\/\/|#|\?)/i.test(ref)) continue;
      const resolved = new URL(ref, url);
      assert.ok(resolved.pathname.startsWith('/mobile%20app/'), `${file} escapes preview: ${ref}`);
      await assert.doesNotReject(fs.access(path.join(root, decodeURIComponent(resolved.pathname))), `${file} -> ${ref}`);
    }
  }
});
test('Pages exposes no backend, dependencies, archives, environment files or private keys', async () => {
  for (const file of await files(root)) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    assert.doesNotMatch(relative, /(^|\/)(backend|node_modules|qa|android|\.env[^/]*)(\/|$)|\.(zip|pem|key|jks|keystore|ps1|py|log)$/i);
    if (!/\.(html|js|json|css|txt)$/.test(file)) continue;
    const text = await fs.readFile(file, 'utf8');
    assert.doesNotMatch(text, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sb_secret_[A-Za-z0-9]+/, relative);
    for (const match of text.matchAll(/eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g)) {
      let payload; try { payload = JSON.parse(Buffer.from(match[1], 'base64url')); } catch { continue; }
      assert.notEqual(payload.role, 'service_role', relative);
    }
  }
});
