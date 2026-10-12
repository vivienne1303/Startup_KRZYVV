// Read-only public-source research. Raw evidence stays in the dated output folder.
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '../output/expansion-2026-10-07');
fs.mkdirSync(dir, {recursive:true});
const clean = s => String(s||'').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&nbsp;|&amp;|&quot;|&ndash;|&mdash;|&rsquo;|&lsquo;|&ldquo;|&rdquo;|&lt;|&gt;/g,s=>({'&nbsp;':' ','&amp;':'&','&quot;':'"','&ndash;':'–','&mdash;':'—','&rsquo;':"'",'&lsquo;':"'",'&ldquo;':'"','&rdquo;':'"','&lt;':'<','&gt;':'>'}[s])).replace(/\s+/g,' ').trim();
async function get(url, name) {
  const r = await fetch(url, {signal:AbortSignal.timeout(20000)});
  const t = await r.text();
  fs.writeFileSync(path.join(dir, name), t);
  console.log(JSON.stringify({name,status:r.status,length:t.length}));
  return t;
}
async function main() {
  const mode = process.argv[2] || 'probe';
  if(mode==='review') {
    const research=JSON.parse(fs.readFileSync(path.join(dir,'researched.json')));
    for(const x of research.filter(x=>x.kind==='devpost')){
      const h=fs.readFileSync(path.join(dir,x.evidence_file),'utf8'),t=clean(h);
      const s=[...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>{try{return JSON.parse(m[1]);}catch{return null;}}).find(x=>x?.['@type']==='Event');
      console.log(JSON.stringify({kind:x.kind,title:x.title,url:x.url,dates:{start:s?.startDate,end:s?.endDate},eligibility:t.slice(t.indexOf('Who can participate'),t.indexOf('Who can participate')+600),body:t.slice(t.indexOf('Who can participate')+600,t.indexOf('Who can participate')+1400)}));
    }
    const summaries=research.filter(x=>x.kind==='unstop').map(x=>{let p=JSON.parse(fs.readFileSync(path.join(dir,x.evidence_file))).data.competition;let t=clean(p.details);return {id:p.id,title:p.title,region:p.region,organisation:p.organisation.name,countries:p.eligible_countries,deadline:p.regnRequirements.end_regn_dt,eligibility:p.filters.filter(f=>f.type==='eligible').map(f=>f.name),restrictions:[...t.matchAll(/.{0,70}(?:only|must|eligible|registration fee|payment|worldwide|international|across the globe|global|on.campus|offline|India|Indian|internally|selected colleges|school students).{0,110}/gi)].map(m=>m[0]),summary:t.slice(0,260)};});
    fs.writeFileSync(path.join(dir,'unstop-review.json'),JSON.stringify(summaries,null,2));
    console.log(JSON.stringify({unstop:summaries.length,global:summaries.filter(x=>x.restrictions.some(s=>/worldwide|across the globe|international students|all countries/i.test(s))).map(x=>({id:x.id,title:x.title,restrictions:x.restrictions})),flags:summaries.filter(x=>x.restrictions.some(s=>/only.*(students|college|university)|registration fee|payment|selected colleges|internally/i.test(s))).map(x=>({id:x.id,title:x.title,restrictions:x.restrictions})).slice(0,25)}));
  }
  if(mode==='inspect') {
    const research=JSON.parse(fs.readFileSync(path.join(dir,'researched.json')));
    for(const kind of ['internsg','devpost']){
      const x=research.find(x=>x.kind===kind);const h=fs.readFileSync(path.join(dir,x.evidence_file),'utf8');
      console.log(JSON.stringify({kind,title:x.title,file:x.evidence_file,structured:[...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1].slice(0,7000)),description:clean(h).slice(clean(h).indexOf('Job Description')-150,clean(h).indexOf('Job Description')+4500)}));
      if(kind==='devpost'){let t=clean(h);console.log(t.slice(t.indexOf('Who can participate'),t.indexOf('Who can participate')+700));}
    }
    const a=research.filter(x=>x.kind==='unstop').slice(0,3).map(x=>JSON.parse(fs.readFileSync(path.join(dir,x.evidence_file))).data.competition);
    console.log(JSON.stringify(a.map(x=>({title:x.title,countries:x.eligible_countries,opCountries:x.opportunityCountries,locations:x.locations,loc:x.location,address:x.address_with_country_logo,regs:{eligibility:x.regnRequirements.eligibility,allowed_countries:x.regnRequirements.allowed_countries},details:clean(x.details).slice(0,1000)}))));
  }
  if(mode === 'details') {
    const baseline=JSON.parse(fs.readFileSync(path.join(dir,'baseline.json')));
    const key=s=>clean(s).toLowerCase().replace(/\b(pte|ltd|limited|private|llp|inc)\b/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
    const urls=new Set(baseline.flatMap(x=>[x.source_url,x.application_url]).filter(Boolean).map(x=>x.replace(/\/$/,'')));
    const titles=new Set(baseline.map(x=>key(x.title.split(/ — | – /)[0])+'|'+key(x.organisation || x.organizer)));
    const internships=[];
    for(const file of fs.readdirSync(dir).filter(x=>/^internsg-page-\d+\.html$/.test(x))) {
      const h=fs.readFileSync(path.join(dir,file),'utf8');
      for(const m of h.matchAll(/<a class="[^"]*job-listing-row[^"]*" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
        const [_,url,html]=m;if(!html.includes('Intern/TS'))continue;
        const title=clean(html.match(/class="job-listing-title"[^>]*>([\s\S]*?)<\/span>/)?.[1]);
        const org=clean(html.match(/class="job-listing-company"[^>]*>([\s\S]*?)(?:<span|<\/div>)/)?.[1]);
        if(/recruit|employment agency|financial adviser|insurance|wealth planner|sales.*(consultant|associate)/i.test(org+' '+title))continue;
        const k=key(title)+'|'+key(org);if(urls.has(url.replace(/\/$/,''))||titles.has(k))continue;
        titles.add(k);urls.add(url.replace(/\/$/,''));
        internships.push({kind:'internsg',url,title,organisation:org,summary:clean(html)});
      }
    }
    const unstop=JSON.parse(fs.readFileSync(path.join(dir,'unstop-list.json'))).filter(x=>{
      const req=x.regnRequirements;return x.visibility==='public'&&x.regn_open===1&&x.paid===0&&req?.end_regn_dt?.slice(0,10)>='2026-10-07'
      &&!req.same_organisation&&!req.only_official_domains&& !urls.has(('https://unstop.com/'+x.public_url).replace(/\/$/,''))
      &&/institute|university|college|school|iit|iim/i.test(x.organisation?.name||'')
      && x.filters?.some(f=>f.type==='eligible'&&/student|undergraduate|postgraduate|all|school/i.test(f.name));
    }).map(x=>({kind:'unstop',url:'https://unstop.com/'+x.public_url,id:x.id,title:x.title,organisation:x.organisation.name,listing:x}));
    const candidates=[...internships, ...unstop.filter(x=>x.listing.region==='online').slice(0,90),...unstop.filter(x=>x.listing.region!=='online').slice(0,65)];
    const devpost=fs.readdirSync(dir).filter(x=>/^devpost-page-/.test(x)).flatMap(x=>JSON.parse(fs.readFileSync(path.join(dir,x))).hackathons||[]).filter(x=>!urls.has(x.url.replace(/\/$/,''))&&!x.invite_only);
    candidates.push(...devpost.map(x=>({kind:'devpost',url:x.url,title:x.title,organisation:x.organization_name,listing:x})));
    fs.writeFileSync(path.join(dir,'candidates.json'),JSON.stringify(candidates,null,2));
    console.log(JSON.stringify({candidates:candidates.length,internships:internships.length,unstop:unstop.length,devpost:devpost.length}));
    let next=0;const report=[];
    await Promise.all(Array.from({length:4},async()=>{while(next<candidates.length){const x=candidates[next++],name=x.kind+'-'+(x.id||new URL(x.url).hostname.replace(/\./g,'-')+'-'+new URL(x.url).pathname.replace(/[^a-z0-9]/gi,'').slice(0,100));
      try{let file=name+(x.kind==='unstop'?'.json':'.html');let url=x.kind==='unstop'?'https://unstop.com/api/public/competition/'+x.id:x.url;
      const r=await fetch(url,{signal:AbortSignal.timeout(20000)}),t=await r.text();fs.writeFileSync(path.join(dir,file),t);report.push({...x,evidence_file:file,http_status:r.status});}
      catch(e){report.push({...x,error:e.message});}
      if(report.length%25===0)console.log(JSON.stringify({researched:report.length,total:candidates.length}));
    }}));
    fs.writeFileSync(path.join(dir,'researched.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({researched:report.length,failed:report.filter(x=>x.http_status!==200).length}));
  }
  if(mode === 'local-global-list') {
    const jobs=await fetch('https://api.mycareersfuture.gov.sg/v2/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({search:'intern',limit:100,page:0,sortBy:['new_posting_date']}),signal:AbortSignal.timeout(20000)});
    const jt=await jobs.text();fs.writeFileSync(path.join(dir,'mcf-search.json'),jt);console.log(JSON.stringify({mcf:jobs.status,preview:jt.slice(0,600)}));
    await Promise.all([9,10,11,12,13,14,15,16].map(async p=>{try{await get('https://www.internsg.com/jobs/'+p+'/','internsg-page-'+p+'.html');}catch(e){console.log(e.message);}}));
    await Promise.all([1,2,3,4,5,6,7,8,9,10].map(async p=>{try{await get('https://devpost.com/api/hackathons?page='+p+'&status=open','devpost-page-'+p+'.json');}catch(e){console.log(e.message);}}));
  }
  if(mode === 'more-probes') {
    for(const [name,url,options] of [
      ['unstop-details.json','https://unstop.com/api/public/competition/1765990',{}],
      ['mcf-search.json','https://api.mycareersfuture.gov.sg/v2/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({search:'intern',limit:100,page:0,sortBy:'new_posting_date'})}],
      ['internsg-page-1.html','https://www.internsg.com/jobs/1/',{}],
      ['devpost-students.json','https://devpost.com/api/hackathons?page=1&status[]=open&challenge_type[]=online&order_by=recently_added',{}]
    ]) {try {const r=await fetch(url,{...options,signal:AbortSignal.timeout(20000)}),t=await r.text();fs.writeFileSync(path.join(dir,name),t);console.log(JSON.stringify({name,status:r.status,length:t.length,preview:t.slice(0,400)}));}catch(e){console.log(name+': '+e.message);}}
  }
  if(mode === 'assets') {
    const html=fs.readFileSync(path.join(dir,'mcf-web.txt'),'utf8');
    await Promise.all([...html.matchAll(/<script[^>]*src="([^"]+)/g)].map(m=>m[1]).filter(s=>s.startsWith('/app-')).map(async s=>{
      try{const t=await get(new URL(s,'https://www.mycareersfuture.gov.sg').href,path.basename(s));
      const urls=[...new Set(t.match(/https:[^"'`\s]{1,150}/g))].filter(s=>/api|service|career/i.test(s));
      if(urls.length)console.log(JSON.stringify({file:s,urls:urls.slice(0,20)}));}catch(e){console.log(e.message);}
    }));
    const nyc=fs.readFileSync(path.join(dir,'nyc-web.txt'),'utf8');
    const chunks=[...nyc.matchAll(/<script[^>]*src="([^"]+)/g)].map(m=>m[1]);
    await Promise.all(chunks.filter(s=>/page-|9304-|layout-/.test(s)).map(async s=>{try{await get(new URL(s,'https://discover.nyc.gov.sg').href,'nyc-'+path.basename(s));}catch(e){console.log(e.message);}}));
  }
  if(mode === 'probe') {
    const p=JSON.parse(fs.readFileSync(path.join(dir,'probe-unstop.json')));
    const x=p.data.data[0];
    console.log(JSON.stringify({unstopKeys:Object.keys(x),organisation:x.organisation || x.organization,filters:x.filters,eligibility:x.regnRequirements.eligibility}));
    const mcf=fs.readFileSync(path.join(dir,'mcf-web.txt'),'utf8');
    const scripts=[...mcf.matchAll(/<script[^>]*src="([^"]+)/g)].map(m=>m[1]);
    for(const s of scripts.filter(s=>/main|index/.test(s))) {
      const t=await get(new URL(s,'https://www.mycareersfuture.gov.sg').href,'mcf-main.js');
      console.log(JSON.stringify({endpoints:[...new Set(t.match(/https:[^"'`\s]{1,130}/g))].filter(s=>/api|service|career/i.test(s)).slice(0,35)}));
    }
    for(const [name,url] of [['unstop-detail.json','https://unstop.com/api/public/opportunity/'+x.id],['unstop-html.txt','https://unstop.com/'+x.public_url]]) {
      try{await get(url,name);}catch(e){console.log(name+': '+e.message);}
    }
  }
  if(mode === 'unstop-list') {
    let next=1; const rows=[];
    await Promise.all(Array.from({length:3},async()=>{
      while(next<=35) {const page=next++;try{const t=await get('https://unstop.com/api/public/opportunity/search?opportunity=competitions&page='+page,'unstop-page-'+page+'.json');rows.push(...JSON.parse(t).data.data);}catch(e){console.log('page '+page+': '+e.message);}}
    }));
    fs.writeFileSync(path.join(dir,'unstop-list.json'),JSON.stringify(rows,null,2));
    console.log(JSON.stringify({count:rows.length,open:rows.filter(x=>x.regn_open===1 && x.regnRequirements?.end_regn_dt?.slice(0,10)>= '2026-10-07').length}));
  }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
