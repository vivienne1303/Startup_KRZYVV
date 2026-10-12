(()=>{
const script=document.currentScript;
const root=new URL('./',script.src);
const links=[['⌂','Home','index.html'],['⌕','Explore','site/pages/opportunities.html'],['▤','Learn','site/pages/resources.html'],['✧','Copilot','site/pages/career-copilot.html'],['⚑','Journey','site/pages/my-journey.html']];
const nav=document.createElement('nav');nav.className='mobile-tabs';nav.setAttribute('aria-label','App navigation');
links.forEach(([icon,label,path])=>{const a=document.createElement('a');a.href=new URL(path,root).href;const span=document.createElement('span');span.textContent=icon;span.setAttribute('aria-hidden','true');a.append(span,document.createTextNode(label));if(new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page');nav.append(a);});
document.body.append(nav);
const setHome=()=>document.querySelectorAll('.brand').forEach(a=>a.href=new URL('index.html',root).href);
setHome();new MutationObserver(setHome).observe(document.body,{childList:true,subtree:true});
if(!window.TEENLAUNCH_WEB_PREVIEW&&!window.Capacitor?.isNativePlatform()&&'serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register(new URL('sw.js',root)).catch(()=>{});
})();
