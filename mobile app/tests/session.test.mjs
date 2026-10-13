import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
const source = (await fs.readFile(new URL('../src/session.js', import.meta.url),'utf8')).replace('export function installSession','function installSession');
const jwt = (exp) => 'header.' + Buffer.from(JSON.stringify({exp})).toString('base64url') + '.signature';
const future = () => jwt(Math.floor(Date.now()/1000)+3600);
const expired = () => jwt(1);
function setup(handler, initial = {}) {
  const values = new Map(Object.entries(initial));
  const window = {
    localStorage: { getItem:k=>values.get(k)||null, setItem:(k,v)=>values.set(k,String(v)), removeItem:k=>values.delete(k) },
    fetch:handler, atob:s=>Buffer.from(s,'base64').toString('utf8'),
    location:{href:'https://localhost/index.html'},
    addEventListener(){}, setInterval(){},
    document:{hidden:false,addEventListener(){}}
  };
  vm.runInNewContext(source + '; installSession(window);', {window, Request,Headers,URL,AbortSignal,Date});
  return {window,values,session:window.TeenLaunchSession};
}
const response = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
test('login persists both tokens; next page reuses them',async()=>{
  const shared={teenlaunch_token:future(),teenlaunch_refresh_token:'rotation-1'};
  const {session,values}=setup(async()=>response({}),shared);
  session.saveSession({token:future(),refreshToken:'rotation-2',user:{id:'user'}});
  assert.equal(values.get('teenlaunch_refresh_token'),'rotation-2');
  const reopened=setup(async()=>response({}),Object.fromEntries(values));
  assert.equal(await reopened.session.refreshIfNeeded(),values.get('teenlaunch_token'));
});
test('concurrent requests refresh once and replace captured old authorization headers',async()=>{
  let refreshes=0;const tokens=[];const fresh=future();
  const {window,values}=setup(async input=>{
    const request=typeof input==='string'?new Request(input):input;
    if(request.url.endsWith('/auth/refresh')) {
      refreshes++; await new Promise(resolve=>setTimeout(resolve,10));
      return response({token:fresh,refreshToken:'rotated'});
    }
    tokens.push(request.headers.get('Authorization'));return response({ok:true});
  },{teenlaunch_token:expired(),teenlaunch_refresh_token:'old'});
  const opts={headers:{Authorization:'Bearer stale-token'}};
  await Promise.all([window.fetch('https://teenlaunch-production.up.railway.app/api/auth/me',opts),window.fetch('https://teenlaunch-production.up.railway.app/api/profile',opts)]);
  assert.equal(refreshes,1);assert.deepEqual(tokens,['Bearer '+fresh,'Bearer '+fresh]);
  assert.equal(values.get('teenlaunch_refresh_token'),'rotated');
});
test('401 retries a POST once while preserving its body',async()=>{
  let sends=0;const bodies=[];
  const {window}=setup(async input=>{
    const request=typeof input==='string'?new Request(input):input;
    if(request.url.endsWith('/auth/refresh')) return response({token:future(),refreshToken:'new'});
    bodies.push(await request.text());return response({},++sends===1?401:200);
  },{teenlaunch_token:future(),teenlaunch_refresh_token:'old'});
  const result=await window.fetch('https://teenlaunch-production.up.railway.app/api/profile',{method:'POST',headers:{Authorization:'Bearer old'},body:'payload'});
  assert.equal(result.status,200);assert.deepEqual(bodies,['payload','payload']);
});
test('transient refresh errors retain the session',async()=>{
  const {session,values}=setup(async()=>response({},503),{teenlaunch_token:expired(),teenlaunch_refresh_token:'valid'});
  await assert.rejects(session.refreshSession());assert.equal(values.get('teenlaunch_refresh_token'),'valid');
});
test('undeployed refresh endpoint retains session and gives actionable error',async()=>{
  const {session,values}=setup(async()=>response({},404),{teenlaunch_refresh_token:'valid'});
  await assert.rejects(session.refreshSession(),/not available on the server/);
  assert.equal(values.get('teenlaunch_refresh_token'),'valid');
});
test('invalid refresh clears all session data',async()=>{
  const {session,values}=setup(async()=>response({},401),{teenlaunch_token:expired(),teenlaunch_refresh_token:'invalid',teenlaunch_user:'{}',teenlaunch_profile:'{}'});
  await assert.rejects(session.refreshSession());assert.equal(values.size,0);
});
test('logout during refresh cannot resurrect the session',async()=>{
  let finish;
  const {session,values}=setup(()=>new Promise(resolve=>{finish=resolve}),{teenlaunch_token:expired(),teenlaunch_refresh_token:'old'});
  const pending=session.refreshSession();session.clearSession();finish(response({token:future(),refreshToken:'new'}));
  await pending;assert.equal(values.size,0);
});
test('logout request clears both tokens even when offline',async()=>{
  const {window,values}=setup(async()=>{throw new Error('offline')},{teenlaunch_token:future(),teenlaunch_refresh_token:'old'});
  await assert.rejects(window.fetch('https://teenlaunch-production.up.railway.app/api/auth/logout',{method:'POST',headers:{Authorization:'Bearer old'}}));
  assert.equal(values.size,0);
});
test('external requests keep their original authorization',async()=>{
  let authorization;
  const {window}=setup(async request=>{authorization=request.headers.get('Authorization');return response({})},{teenlaunch_token:future()});
  await window.fetch(new Request('https://example.com/',{headers:{Authorization:'Bearer external'}}));
  assert.equal(authorization,'Bearer external');
});
