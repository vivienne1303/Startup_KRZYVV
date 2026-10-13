import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
const source=await fs.readFile(new URL('../../backend/controllers/sessionController.js',import.meta.url),'utf8');
function controller(result) {
  let clients=0;
  const mockRequire = name => {
    if(name==='@supabase/supabase-js')return {createClient:()=>{clients++;return {auth:{refreshSession:async ({refresh_token})=>{assert.ok(refresh_token);return result}}}}};
    if(name==='ws')return class {};
    if(name==='../config/env')return {supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'public-test-key'};
    if(name==='../utils/asyncHandler')return handler=>handler;
    if(name==='../utils/httpError')return class extends Error {constructor(statusCode,message){super(message);this.statusCode=statusCode;}};
    if(name==='../utils/sanitize')return {sanitizeAuthUser:user=>({id:user.id})};
    throw new Error(name);
  };
  const module={exports:{}};vm.runInNewContext(source,{require:mockRequire,module});
  const res={headers:{},set(k,v){this.headers[k]=v},json(value){this.body=value}};
  return {refresh:module.exports.refresh,res,clients:()=>clients};
}
test('refresh creates an isolated client per user and returns only required session fields',async()=>{
  const c=controller({data:{session:{access_token:'access',refresh_token:'rotated',expires_at:123},user:{id:'u',private:'hidden'}}});
  await c.refresh({body:{refreshToken:'user-one'}},c.res);
  await c.refresh({body:{refreshToken:'user-two'}},c.res);
  assert.equal(c.clients(),2);assert.equal(c.res.body.refreshToken,'rotated');
  assert.equal(c.res.body.user.private,undefined);assert.equal(c.res.headers['Cache-Control'],'no-store');
});
test('missing refresh tokens are rejected before accessing Supabase',async()=>{
  const c=controller({});await assert.rejects(c.refresh({body:{}},c.res),e=>e.statusCode===400);assert.equal(c.clients(),0);
});
test('invalid refresh returns 401 while upstream outages return 503',async()=>{
  for(const [status,expected] of [[400,401],[429,503],[500,503],[undefined,503]]) {
    const c=controller({error:{status}});await assert.rejects(c.refresh({body:{refreshToken:'token'}},c.res),e=>e.statusCode===expected);
  }
});
