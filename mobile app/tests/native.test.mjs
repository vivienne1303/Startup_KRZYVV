import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=(await fs.readFile(new URL('../src/native.js',import.meta.url),'utf8')).replace(/^import .*;\r?$/gm,'');
function setup() {
  const callbacks=new Map(), events=new Map(), classes=new Set(), calls=[];
  const location={href:'https://localhost/index.html',origin:'https://localhost',pathname:'/index.html',replace:url=>calls.push(['replace',url])};
  const doc={
    currentScript:{src:'https://localhost/native.js'},
    documentElement:{classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}},
    addEventListener:(event,callback)=>events.set(event,callback),
    querySelector:()=>null,
    activeElement:{scrollIntoView:()=>calls.push(['scroll'])}
  };
  const App={addListener:async(event,fn)=>{callbacks.set(event,fn)},minimizeApp:async()=>calls.push(['minimize'])};
  const Keyboard={addListener:App.addListener,hide:async()=>calls.push(['hide-keyboard'])};
  const Browser={open:async opts=>calls.push(['browser',opts.url])};
  const Clipboard={write:async opts=>calls.push(['clipboard',opts.string])};
  const window={document:doc,location,open:()=>{},fetch:()=>{},print:()=>{}};
  const session={refreshIfNeeded:async()=>calls.push(['refresh'])};
  vm.runInNewContext(source,{
    window,document:doc,location,navigator:{},history:{back:()=>calls.push(['back'])},
    URL,console,Capacitor:{isNativePlatform:()=>true},App,Keyboard,Browser,Clipboard,
    installSession:()=>session,registerPlugin:()=>({print:async()=>calls.push(['print'])})
  });
  return {window,doc,callbacks,events,classes,calls,location};
}
test('external HTTPS links open the native browser; unsafe schemes are ignored',async()=>{
  const c=setup();await c.window.TeenLaunchNative.openExternal('https://example.com/apply');
  await c.window.TeenLaunchNative.openExternal('javascript:alert(1)');
  assert.deepEqual(c.calls,[['browser','https://example.com/apply']]);
});
test('portfolio URL is public HTTPS and native clipboard receives text',async()=>{
  const c=setup();const url=c.window.TeenLaunchNative.publicPortfolioUrl('a b');
  assert.equal(url,'https://www.teenlaunch.app/pages/public-portfolio.html?slug=a%20b');
  await c.window.TeenLaunchNative.copyText(url);assert.deepEqual(c.calls,[['clipboard',url]]);
});
test('Android back navigates history, falls back home and minimizes at the root',async()=>{
  const c=setup();await c.callbacks.get('backButton')({canGoBack:true});
  assert.deepEqual(c.calls.pop(),['back']);
  c.location.pathname='/site/pages/profile.html';
  await c.callbacks.get('backButton')({canGoBack:false});
  assert.deepEqual(c.calls.pop(),['replace','https://localhost/index.html']);
  c.location.pathname='/index.html';await c.callbacks.get('backButton')({canGoBack:false});
  assert.deepEqual(c.calls.pop(),['minimize']);
});
test('keyboard hides tabs; back dismisses keyboard before navigating',async()=>{
  const c=setup();c.callbacks.get('keyboardDidShow')();
  assert.ok(c.classes.has('keyboard-open'));
  await c.callbacks.get('backButton')({canGoBack:true});
  assert.deepEqual(c.calls.pop(),['hide-keyboard']);
  c.callbacks.get('keyboardDidHide')();assert.ok(!c.classes.has('keyboard-open'));
});
test('back closes an open dialog before navigating',async()=>{
  const c=setup();c.doc.querySelector=selector=>selector==='dialog[open]'?{close:()=>c.calls.push(['dialog'])}:null;
  await c.callbacks.get('backButton')({canGoBack:true});assert.deepEqual(c.calls,[['dialog']]);
});
test('resume checks session expiry and print opens the native plugin',async()=>{
  const c=setup();await c.callbacks.get('resume')();await c.window.print();
  assert.deepEqual(c.calls,[['refresh'],['print']]);
});
