// Local-only browser smoke test; all API calls are intercepted with fixtures.
// Requires Microsoft Edge (or BROWSER_PATH), no extra npm dependencies.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const root = path.join(repo, '.pages-site');
const profile = path.join(repo, 'mobile app/qa/edge-pages-preview');
const errors = [], failed = [], calls = [];
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.ico':'image/x-icon'};
const server = http.createServer(async (req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { failed.push(req.url); res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/mobile%20app/`;
await fs.mkdir(profile, { recursive: true });
await fs.rm(path.join(profile, 'DevToolsActivePort'), { force: true });
const browser = spawn(process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket, sequence = 0;
const pending = new Map();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let port;
  for (let i=0; i<100; i++) {
    try { port = Number((await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); if(port)break; } catch {}
    await delay(100);
  }
  assert.ok(port, 'Edge debugging port did not become available');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve,reject) => { socket.addEventListener('open',resolve,{once:true}); socket.addEventListener('error',reject,{once:true}); });
  const command = (method,params={}) => new Promise((resolve,reject) => {
    const id = ++sequence;
    const timeout = setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout: '+method));},15000);
    pending.set(id,{resolve:value=>{clearTimeout(timeout);resolve(value)},reject});
    socket.send(JSON.stringify({id,method,params}));
  });
  const token = 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url') + '.preview';
  socket.addEventListener('message', async event => {
    const msg = JSON.parse(event.data);
    if (msg.id) { const item=pending.get(msg.id);pending.delete(msg.id); if(item)msg.error?item.reject(new Error(msg.error.message)):item.resolve(msg.result);return; }
    if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    if(msg.method==='Fetch.requestPaused') {
      const {requestId,request}=msg.params;
      calls.push({url:request.url,method:request.method});
      const route=new URL(request.url).pathname;
      let data={};
      if(route==='/api/auth/login')data={token,refreshToken:'preview-refresh-token',user:{id:'preview',name:'Preview User'}};
      else if(route==='/api/auth/me')data={user:{id:'preview',name:'Preview User'},profile:{},role:'user'};
      else if(route==='/api/career-dna/latest')data={result:{id:'preview-dna'}};
      else if(route.includes('opportunities'))data={opportunities:[],total:0};
      else if(route.includes('registrations'))data={registrations:[]};
      else if(route==='/api/profile/saved')data={opportunities:[]};
      await command('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:new URL(base).origin},{name:'Access-Control-Allow-Headers',value:'Authorization,Content-Type'}],body:Buffer.from(JSON.stringify(data)).toString('base64')});
    }
  });
  await command('Runtime.enable');await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await command('Fetch.enable',{patterns:[{urlPattern:'https://teenlaunch-production.up.railway.app/*'}]});
  const evaluate = async expression => {
    const response=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(response.exceptionDetails)throw new Error(response.exceptionDetails.text);
    return response.result.value;
  };
  async function navigate(url, expected) {
    await command('Page.navigate',{url});
    for(let i=0;i<100;i++) {
      await delay(100);
      try {if(await evaluate(`document.readyState==='complete' && location.href.includes(${JSON.stringify(expected)})`)) {await delay(250);return;}}catch{}
    }
    throw new Error('Page did not load: '+url);
  }
  await navigate(base,'/mobile%20app/');
  assert.equal(await evaluate('Boolean(window.TeenLaunchSession && window.TeenLaunchNative && window.TEENLAUNCH_WEB_PREVIEW)'),true);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Home overflows phone viewport');
  assert.equal(await evaluate('document.querySelectorAll(".tabs a").length'),5);
  const screenshot = await command('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(path.join(profile, 'mobile-preview.png'), Buffer.from(screenshot.data, 'base64'));
  await evaluate('document.querySelector(".tabs a:nth-child(2)").click()');
  for(let i=0;i<100;i++){await delay(100);if(await evaluate('location.pathname.endsWith("opportunities.html") && document.readyState==="complete"'))break;}
  assert.equal(await evaluate('Boolean(document.querySelector(".mobile-tabs"))'),true,'Explore mobile navigation missing');
  await navigate(base+'site/pages/my-journey.html','auth.html');
  assert.equal(await evaluate('new URLSearchParams(location.search).get("returnTo")'),'my-journey.html','Protected page must preserve its login return path');
  await navigate(base+'site/pages/auth.html?mode=login&returnTo='+encodeURIComponent('../../index.html'),'auth.html');
  await evaluate(`document.querySelector('[data-auth-form="login"] [name="email"]').value='preview@example.invalid';document.querySelector('[data-auth-form="login"] [name="password"]').value='preview-only';document.querySelector('[data-auth-form="login"]').requestSubmit()`);
  for(let i=0;i<100;i++){await delay(100);if(await evaluate('location.pathname.endsWith("/mobile%20app/index.html")'))break;}
  assert.equal(await evaluate('location.pathname.endsWith("/mobile%20app/index.html")'),true,'Login did not return to mobile home');
  assert.equal(await evaluate('localStorage.getItem("teenlaunch_refresh_token")'),'preview-refresh-token');
  await command('Page.reload');await delay(700);
  assert.equal(await evaluate('localStorage.getItem("teenlaunch_refresh_token")'),'preview-refresh-token');
  assert.equal(await evaluate('window.TeenLaunchNative.publicPortfolioUrl("preview slug")'),'https://www.teenlaunch.app/pages/public-portfolio.html?slug=preview%20slug');
  await navigate(base+'site/pages/resources.html','resources.html');
  assert.equal(await evaluate('document.querySelectorAll(".mobile-tabs a").length'),5);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true,'Resources overflows phone viewport');
  assert.equal(await evaluate('navigator.serviceWorker.getRegistrations().then(items=>items.length)'),0);
  assert.deepEqual(errors,[],'Browser JavaScript exceptions');assert.deepEqual(failed,[],'Local asset 404s');
  assert.ok(calls.some(call=>call.url.endsWith('/auth/login')&&call.method==='POST'));
  console.log('Phone browser passed: home, Explore, resources, navigation, mocked login/return path, token persistence after reload, public portfolio URL, no JS exceptions or missing assets. No production API writes.');
} finally {
  socket?.close();browser.kill();server.close();
}
