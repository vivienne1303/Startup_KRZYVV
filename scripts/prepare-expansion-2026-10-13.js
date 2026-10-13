const fs = require('node:fs');
const path = require('node:path');
const {supabaseAdmin: client} = require('../backend/config/supabase');
const dir = path.join(__dirname, '../output/expansion-2026-10-13');
const asOf = '2026-10-13';
const clean = value => String(value || '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&rsquo;/g,"'").replace(/\s+/g,' ').trim();
const brief = value => clean(value).slice(0,700);
async function get(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
  if(!response.ok) throw Error('Source HTTP '+response.status+' '+new URL(url).hostname);
  return response.text();
}
async function main() {
  fs.mkdirSync(dir,{recursive:true});
  const {duplicateOf,usableProject,projectListing,discoverProjects} = await import('../opportunity-automation/refresh.mjs');
  const rows=[];
  for(let offset=0;;offset+=500) {
    const {data,error}=await client.from('opportunities').select('*').order('id').range(offset,offset+499);
    if(error) throw error;
    rows.push(...data);if(data.length<500) break;
  }
  fs.writeFileSync(path.join(dir,'baseline.json'),JSON.stringify(rows,null,2));
  const additions=[],rejected=[];
  const add=item=>{
    if(duplicateOf([...rows,...additions],item)) {rejected.push({title:item.title,reason:'Duplicate'});return false;}
    additions.push(item);return true;
  };
  const links=new Set(),listingEvidence=new Map();
  for(let page=1;page<=12;page++) {
    const evidence=path.join(dir,'internsg-directory-'+page+'.html');
    const html=fs.existsSync(evidence)?fs.readFileSync(evidence,'utf8'):await get(page===1?'https://www.internsg.com/jobs/':'https://www.internsg.com/jobs/'+page+'/');
    fs.writeFileSync(path.join(dir,'internsg-directory-'+page+'.html'),html);
    for(const match of html.matchAll(/href=["'](https:\/\/www\.internsg\.com\/job\/[^"'#?]+)(?:\?[^"']*)?["']/g)) links.add(match[1]);
    for(const match of html.matchAll(/<a\b[^>]*href=["'](https:\/\/www\.internsg\.com\/job\/[^"'#?]+)(?:\?[^"']*)?["'][^>]*>([\s\S]*?)<\/a>/g)) listingEvidence.set(match[1],clean(match[2]));
  }
  console.log(JSON.stringify({baseline:rows.length,local_urls:links.size}));
  for(const url of links) {
    if(additions.length>=50) break;
    if(rows.some(r=>r.source_url?.replace(/\/$/,'')===url.replace(/\/$/,''))) continue;
    try {
      const html=await get(url);
      const structured=[...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{try{const j=JSON.parse(m[1]);return j['@graph']|| (Array.isArray(j)?j:[j]);}catch{return [];}});
      const job=structured.find(j=>j['@type']==='JobPosting');
      if(!job || job.employmentType!=='INTERN') continue;
      const text=clean(job.description),page=clean(html),addr=job.jobLocation?.address;
      const closing=Date.parse(job.validThrough);
      const deadline=Number.isFinite(closing)?new Date(closing).toISOString().slice(0,10):null;
      if(addr?.addressCountry!=='SG'||deadline&&deadline<asOf||/position (?:has been |is )?(?:closed|filled)|job (?:has )?expired|no longer accepting applications/i.test(page)) continue;
      if(/financial advis[eo]r|insurance agent|commission.based|mid.career|career conversion/i.test(job.title+' '+text)) continue;
      const instructions=page.match(/Application Instructions\s+([\s\S]*?)(?:Apply for this position|Related Job Searches|Discuss this Job)/i)?.[1];
      if(!instructions) continue;
      const urlFinal=url.replace(/\/$/,'')+'/';
      const organisation=clean(job.hiringOrganization.name);
      const locationText=page.match(/Location Name\s+([\s\S]*?)(?:Company Profile|Address\s)/i)?.[1]||'';
      const format=/hybrid/i.test(text)?'hybrid':/work from home/i.test(locationText+' '+listingEvidence.get(url))||/work from home|remote internship|virtual internship/i.test(text)?'online':'in_person';
      const checked=new Date().toISOString();
      const item={title:clean(job.title)+' — '+organisation,organisation,category:'Internships',categories:['Internships'],description:brief(text),
        minimum_age:null,maximum_age:null,education_levels:[],application_deadline:deadline,start_date:null,end_date:null,
        source_url:urlFinal,application_url:urlFinal,source_type:'ai_fetched',source_name:'INTERNSG',location:[addr.streetAddress,addr.addressRegion,'Singapore'].filter(Boolean).join(', '),format,
        host_country:'SG',eligibility_scope:'unknown',eligible_countries:[],travel_required:format!=='online',application_method:'external',internal_application_enabled:false,
        eligibility:'Review employer requirements and work eligibility in the listing. '+brief(text.match(/(?:Requirements|Qualifications):?\s*([\s\S]+)/i)?.[1]||''),
        skills:[],discovery:{deadline_status:deadline?'confirmed':'unknown',student_eligibility:/students?|undergraduate|currently (?:enrolled|studying)|pursuing (?:a |an )?(?:diploma|degree)/i.test(text)?'confirmed':'unknown',application_access:'available',
          discovered_url:urlFinal,official_url:urlFinal,last_checked_at:checked,fees:null,parental_consent:null,school_membership:null,restrictions:'Employer requirements and Singapore work eligibility apply; minimum age and closing date are not assumed.',notes:brief(instructions),evidence_urls:[urlFinal]}};
      if(add(item)) {fs.writeFileSync(path.join(dir,'internsg-'+additions.length+'.html'),html);if(additions.length%10===0)console.log('Reviewed '+additions.length+' new listings');}
    } catch(error) {rejected.push({url,reason:error.message});}
  }
  const projects=await discoverProjects();
  fs.writeFileSync(path.join(dir,'zooniverse-live.json'),JSON.stringify(projects,null,2));
  for(const project of projects.filter(usableProject)) {
    if(additions.length>=50) break;
    const item=projectListing(project,new Date().toISOString());
    if(duplicateOf([...rows,...additions],item)) continue;
    try {
      const html=await get(item.source_url);
      if(add(item)) fs.writeFileSync(path.join(dir,'zooniverse-'+project.id+'.html'),html);
    } catch(error) {rejected.push({url:item.source_url,reason:error.message});}
  }
  fs.writeFileSync(path.join(dir,'rejected.json'),JSON.stringify(rejected,null,2));
  if(additions.length!==50) throw Error('Only '+additions.length+' verified new opportunities; need more sources');
  const manifest={as_of:asOf,additions};
  fs.writeFileSync(path.join(__dirname,'../data/opportunities-expansion-2026-10-13.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({selected:additions.length,singapore:additions.filter(x=>x.host_country==='SG').length,global_online:additions.filter(x=>x.eligibility_scope==='worldwide').length}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
