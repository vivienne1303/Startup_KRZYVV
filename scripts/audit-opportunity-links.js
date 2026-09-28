// Read-only: checks public pages and extracts application links; never submits forms.
const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, '../output/opportunity-link-audit');
const decode = value => value.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
async function inspect(url) {
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return {url,error:'Unsupported protocol'};
    const response = await fetch(url, {signal:AbortSignal.timeout(25000),headers:{'User-Agent':'Mozilla/5.0 TeenLaunch-LinkCheck/1.0'}});
    const html = await response.text();
    const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s+/g,' ').trim());
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map(m=>({url:new URL(decode(m[1]),response.url).href,text:decode(m[2].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim())}))
      .filter(x=>/apply|register|registration|submit|nomination|entry form|application|sign up/i.test(x.text) && /^https?:/.test(x.url)).slice(0,25);
    const rolePath=html.match(/:api-role="'([^']+)/)?.[1];
    let roles=null;
    if(rolePath) roles=await(await fetch(new URL(rolePath,response.url),{signal:AbortSignal.timeout(15000)})).json();
    return {url,status:response.status,final_url:response.url,title,soft_error:/^(404|page not found|not found|error|access denied|just a moment)/i.test(title),links,roles:roles?.code};
  }catch(e){return {url,error:e.cause?.code||e.message};}
}
async function main() {
  fs.mkdirSync(output,{recursive:true});
  const response=await fetch('https://teenlaunch-production.up.railway.app/api/opportunities');
  if(!response.ok)throw Error('Live opportunities unavailable');
  const {opportunities}=await response.json();
  fs.writeFileSync(path.join(output,'opportunities-before.json'),JSON.stringify(opportunities,null,2));
  const urls=[...new Set(opportunities.flatMap(x=>[x.source_url,x.application_url]).filter(Boolean))];
  const results=[];let next=0;
  await Promise.all(Array.from({length:5},async()=>{while(next<urls.length){results.push(await inspect(urls[next++]));}}));
  results.sort((a,b)=>a.url.localeCompare(b.url));
  fs.writeFileSync(path.join(output,'links.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({opportunities:opportunities.length,urls:urls.length,issues:results.filter(x=>x.error||x.status>=400||x.soft_error)},null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
