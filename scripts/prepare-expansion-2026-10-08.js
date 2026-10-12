// Convert retained public evidence into a reviewed, duplicate-checked dated batch.
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'../output/expansion-2026-10-08');
const asOf='2026-10-08';
const clean=s=>String(s||'').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&nbsp;|&amp;|&quot;|&ndash;|&mdash;|&rsquo;|&lsquo;|&ldquo;|&rdquo;|&lt;|&gt;|&rarr;/g,s=>({'&nbsp;':' ','&amp;':'&','&quot;':'"','&ndash;':'–','&mdash;':'—','&rsquo;':"'",'&lsquo;':"'",'&ldquo;':'"','&rdquo;':'"','&lt;':'<','&gt;':'>','&rarr;':'→'}[s])).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const key=s=>clean(s).toLowerCase().replace(/internship/g,'intern').replace(/\b(pte|ltd|limited|private|llp|inc)\b/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const date=s=>{if(!s)return null;const d=new Date(s);return Number.isFinite(+d)?d.toISOString().slice(0,10):null;};
const jsonld=h=>[...h.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>{try{const p=JSON.parse(m[1]);return p['@graph']||[p];}catch{return [];}});
const brief=s=>{const t=clean(s);return t.length<=450?t:t.slice(0,450).replace(/\s+\S*$/,'')+'…';};
const baseline=JSON.parse(fs.readFileSync(path.join(dir,'baseline.json')));
const urlKey=s=>{const u=new URL(s);u.hash='';return u.hostname.replace(/^www\./,'')+u.pathname.replace(/\/$/,'');};
const urls=new Set(baseline.flatMap(x=>[x.source_url,x.application_url]).filter(Boolean).map(urlKey));
const titleKeys=new Set(baseline.map(x=>key(x.title.split(/ — | – /)[0])+'|'+key(x.organisation||x.organizer)));
const roleKey=s=>key(s).split(' ').sort().join(' ');
const roles=new Set(baseline.map(x=>roleKey(x.title.split(/ ? | ? /)[0])+'|'+key(x.organisation||x.organizer)));
const additions=[],rejected=[];
function reject(x,reason){rejected.push({title:x.title,url:x.url,reason});}
function add(x,p){
  const k=key(p.title.split(/ — | – /)[0])+'|'+key(p.organisation);
  const rk=roleKey(p.title.split(/ ? | ? /)[0])+'|'+key(p.organisation);
  if(urls.has(urlKey(p.source_url))||titleKeys.has(k)||roles.has(rk))return reject(x,'Duplicate URL or role and employer');
  urls.add(urlKey(p.source_url));titleKeys.add(k);roles.add(rk);additions.push(p);
}
function base(x,category){return {title:clean(x.title),organisation:clean(x.organisation),category,categories:[category],
  minimum_age:null,maximum_age:null,education_levels:[],application_deadline:null,start_date:null,end_date:null,
  source_url:x.url,application_url:x.url,host_country:null,location:'Location not specified',format:'online',
  eligibility_scope:'unknown',eligible_countries:[],travel_required:null,source_type:'ai_fetched',source_name:x.organisation,
  application_method:'external',internal_application_enabled:false,
  discovery:{deadline_status:'unknown',student_eligibility:'unknown',application_access:'unknown',discovered_url:x.url,official_url:x.url,
    last_checked_at:asOf,fees:null,parental_consent:null,school_membership:null,restrictions:null,notes:null,evidence_urls:[x.url]}};}
for(const x of JSON.parse(fs.readFileSync(path.join(dir,'researched.json')))) {
  if(x.http_status!==200){reject(x,'Source could not be loaded');continue;}
  const raw=fs.readFileSync(path.join(dir,x.evidence_file),'utf8');
  if(x.kind==='internsg') {
    const job=jsonld(raw).find(x=>x['@type']==='JobPosting');
    if(!job||job.employmentType!=='INTERN'){reject(x,'Not a structured internship posting');continue;}
    const text=clean(job.description), page=clean(raw),deadline=date(job.validThrough);
    if(deadline&&deadline<asOf){reject(x,'Posting expired');continue;}
    if(/position (?:has been |is )?(?:closed|filled)|job (?:has )?expired|no longer accepting applications/i.test(page)){reject(x,'Applications closed');continue;}
    if(/financial advisor|financial adviser|insurance agent|commission.based|financial services consultant|Gordon Lee & Associates|GRIT|mid.career|career conversion/i.test(x.title+' '+x.organisation+' '+text)){reject(x,'Not a suitable student internship');continue;}
    const addr=job.jobLocation?.address;
    if(addr?.addressCountry!=='SG'){reject(x,'Local country could not be verified');continue;}
    const p=base(x,'Internships');p.source_url=p.application_url=x.url.split('?')[0];p.title=clean(job.title)+' — '+clean(job.hiringOrganization.name);p.organisation=clean(job.hiringOrganization.name);
    const remote=/work from home|remote|virtual internship/i.test(x.summary+' '+(addr?.streetAddress||''));
    p.host_country='SG';p.location=[addr?.addressRegion,addr?.streetAddress,'Singapore'].filter(Boolean).join(', ');p.format=remote?(addr?.streetAddress && !/work from home|remote/i.test(addr.streetAddress)?'hybrid':'online'):/hybrid/i.test(x.summary)?'hybrid':'in_person';
    p.application_deadline=deadline;p.description=brief(text.replace(/^(The )?Job Description:?\s*/i,''));
    const req=text.match(/(?:Requirements|Qualifications|Who (?:we|you)[^:]{0,30}):?\s*([\s\S]+)/i)?.[1];
    p.eligibility=brief(req || 'Student suitability depends on the employer’s internship requirements; review the full posting before applying.');
    p.discovery.student_eligibility=/students?|pursuing|undergraduate|currently (?:enrolled|studying)|diploma or degree/i.test(text)?'confirmed':'unknown';
    p.discovery.deadline_status=deadline?'confirmed':'unknown';
    const instructions=page.match(/Application Instructions\s+([\s\S]*?)(?:Apply for this position|Related Job Searches|Discuss this Job)/i)?.[1];
    p.discovery.application_access=instructions?'available':'unknown';
    p.discovery.notes=brief((instructions||'Apply through the official listing.')+' Posted '+date(job.datePosted)+'. '+x.summary);
    p.discovery.restrictions=p.eligibility;
    if(job.baseSalary?.value?.value)p.description+=' Stated allowance: SGD '+job.baseSalary.value.value+'/'+String(job.baseSalary.value.unitText||'month').toLowerCase()+'.';
    add(x,p);
  }
  if(x.kind==='unstop') {
    let c;try{c=JSON.parse(raw).data.competition;}catch{reject(x,'Invalid organiser detail data');continue;}
    const text=clean(c?.details),r=c?.regnRequirements;
    if(/Vortexa 3\.0/i.test(c?.title || '')){reject(x,'Duplicate event listings advertise conflicting dates');continue;}
    if(!r||c.visibility!=='public'||c.regn_open!==1||r.reg_status!=='STARTED'||r.end_regn_dt.slice(0,10)<asOf){reject(x,'Registration not open');continue;}
    if(/(?:registration|entry|participation) fee[^.!]{0,100}(?:[1-9][0-9]{1,}|paid|payable)|Rs[ .]*[1-9][0-9]+|INR[ .]*[1-9][0-9]+/i.test(text)){reject(x,'Fee conflicts with free listing');continue;}
    if(c.paid||r.enable_payment||r.reg_restricted||r.same_organisation||r.only_official_domains){reject(x,'Paid or restricted registration');continue;}
    if(/(?:registration|entry|participation|final round) (?:fee|charges?|amount)[^.!]{0,100}(?:₹\s*[1-9]|INR\s*[1-9]|Rs\.?\s*[1-9])/i.test(text)){reject(x,'Fee conflicts with free listing');continue;}
    if(/(?:only|restricted to|exclusive(?:ly)? (?:for|to)|must be|must (?:be )?belong to)[^.!]{0,45}(?:students (?:of|from)|current [A-Z][a-z]+ students)|intra.college|intra.university|internal (?:hackathon|competition|event)|only (?:for|to) (?:our|the host)/.test(text)){reject(x,'Internal or institution-restricted event');continue;}
    if(/(?:Date|on):?\s*(?:\d{1,2}(?:st|nd|rd|th)?\s+)?(?:January|February|March|April|May|June|July|August|September)[,\s]+(?:\d{1,2}[,\s]+)?2026/i.test(text)){reject(x,'Past event date conflicts with open registration');continue;}
    let eligibility;try{eligibility=JSON.parse(r.eligibility||'{}');}catch{eligibility={};}
    if(!eligibility.sector?.includes('students') && !c.filters.some(f=>f.type==='eligible'&&/student|undergraduate|postgraduate|all/i.test(f.name))){reject(x,'Student eligibility not established');continue;}
    const cat=c.type==='hackathons'?'Hackathons':'Competitions';const p=base(x,cat);p.title=clean(c.title)+' — '+clean(c.organisation.name);p.organisation=clean(c.organisation.name);
    p.application_deadline=r.end_regn_dt.slice(0,10);p.discovery.deadline_status='confirmed';p.discovery.student_eligibility='confirmed';p.discovery.application_access='login_required';
    // Registration-window dates are not event dates. Do not copy them into start/end_date.
    p.format=c.region==='online'?'online':c.region==='hybrid'?'hybrid':'in_person';
    if(p.format==='online' && /offline (?:final|round|presentation)|on.campus|physically present|in.person (?:final|round)|final pitch[^.!]{0,100}Dehradun/i.test(text))p.format='hybrid';
    if(/The Vault: Pitch to Investors/i.test(c.title))p.format='hybrid';
    const a=c.address_with_country_logo;p.host_country=a?.country_code||'IN';
    if(!/^[A-Z]{2}$/.test(p.host_country))p.host_country='IN';
    p.location=p.format==='online'?'Online; organised in India':[a?.address,a?.city,a?.state,p.host_country==='IN'?'India':p.host_country].filter(Boolean).join(', ');
    p.travel_required=p.format!=='online';
    if(/(?:students|participants|applicants|teams)[^.!]{0,70}(?:worldwide|from (?:any|all) countr|across the globe)|open (?:to|for)[^.!]{0,60}(?:worldwide|international students)/i.test(text))p.eligibility_scope='worldwide';
    else if(/(?:India.only|Indian (?:students|citizens|nationals)|(?:across|throughout) India|pan.India|colleges (?:in|across) India)/i.test(text)){p.eligibility_scope='countries';p.eligible_countries=['IN'];}
    const groups=c.filters.filter(f=>f.type==='eligible').map(f=>f.name);
    p.education_levels=groups.filter(s=>/Undergraduate|Postgraduate|School/i.test(s));
    const extra=[...text.matchAll(/.{0,45}(?:eligible|eligibility|open to|must be|students only|undergraduate|postgraduate|citizen|resident|India.only|college ID|school ID|registration fee).{0,110}/gi)].slice(0,3).map(m=>m[0]);
    p.eligibility=brief(groups.join(', ')+'. Team size '+r.min_team_size+'-'+r.max_team_size+'. '+extra.join(' '));
    p.description=brief(text||cat+' hosted by '+p.organisation+'.');p.skills=(c.skills||[]).map(s=>s.skill||s.skill_name).filter(Boolean).slice(0,5);
    p.discovery.fees='Registration marked free; consult organiser for travel and other costs.';p.discovery.restrictions=p.eligibility;
    p.discovery.notes='Registration closes '+r.end_regn_dt+'. '+(p.travel_required?'Physical participation required; check venue and travel arrangements. ':'')+'Country eligibility is unspecified unless explicitly stated.';
    p.discovery.evidence_urls.push('https://unstop.com/api/public/competition/'+c.id);
    add(x,p);
  }
  if(x.kind==='devpost') {
    const text=clean(raw),event=jsonld(raw).find(s=>s['@type']==='Event'),start=text.indexOf('Who can participate');
    const elig=text.slice(start,text.indexOf('View full rules',start));
    const deadline=date(event?.endDate);
    if(!deadline||deadline<asOf||start<0){reject(x,'Missing current deadline or eligibility');continue;}
    if(/CodeSprint|NextByte|HACK PRADESH|Reality Check/i.test(x.title)){reject(x,'Conflicting timeline, fees or participation requirements');continue;}
    if(/Professionals\/Post grads only|Invite.only/i.test(elig)||/MCA 2026 projects|Affinda AI Innovation Challenge|AI Lodge Hackathon/i.test(x.title)){reject(x,'Professional, internal or unconfirmed student event');continue;}
    const p=base(x,'Hackathons');p.application_deadline=deadline;p.discovery.deadline_status='confirmed';p.discovery.application_access='login_required';
    p.discovery.student_eligibility=/students|high school|college/i.test(elig+text.slice(start,start+1900))?'confirmed':'unknown';
    p.title=clean(x.title);p.organisation=clean(x.organisation)||'Devpost organiser';p.source_name='Devpost';
    p.format=x.listing.displayed_location.location==='Online'?'online':'in_person';p.location=p.format==='online'?'Global (online)':x.listing.displayed_location.location;
    p.travel_required=p.format!=='online';
    if(/All countries\/territories/i.test(elig))p.eligibility_scope='worldwide';
    if(/Above legal age of majority/i.test(elig))p.minimum_age=18;
    p.eligibility=brief(elig);p.skills=x.listing.themes.map(t=>t.name);
    const about=text.indexOf('About the challenge',start);p.description=brief(about>=0?text.slice(about+19,about+550):event?.description||'Build and submit a project for '+p.title+'.');
    p.discovery.restrictions=p.eligibility;p.discovery.notes='Submission deadline '+event.endDate+'. Worldwide access is subject to the organiser’s excluded countries and other rules; check full rules before entry.';
    if(/CodeSprint/i.test(p.title)){p.format='hybrid';p.host_country='IN';p.location='Online building; final pitch in Dehradun, India';p.travel_required=true;p.discovery.notes+=' Final pitch is advertised for 22 November in Dehradun; platform submission date is earlier than the stated build window, so confirm timeline with organiser.';}
    if(/HackFW|HTCJ/.test(p.title))p.host_country='US';
    add(x,p);
  }
}
fs.writeFileSync(path.join(__dirname,'../data/opportunities-expansion-2026-10-08.json'),JSON.stringify({as_of:asOf,additions},null,2)+'\n');
fs.writeFileSync(path.join(dir,'rejected.json'),JSON.stringify(rejected,null,2)+'\n');
console.log(JSON.stringify({prepared:additions.length,rejected:rejected.length,bySource:additions.reduce((a,x)=>(a[new URL(x.source_url).hostname.includes('internsg')?'InternSG':new URL(x.source_url).hostname.includes('unstop')?'Unstop':'Devpost']=(a[new URL(x.source_url).hostname.includes('internsg')?'InternSG':new URL(x.source_url).hostname.includes('unstop')?'Unstop':'Devpost']||0)+1,a),{}),online:additions.filter(x=>x.format==='online').length,worldwide:additions.filter(x=>x.eligibility_scope==='worldwide').length}));
