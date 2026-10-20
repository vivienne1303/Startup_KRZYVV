import {duplicateOf,discoverProjects,usableProject,projectListing,expiredReason,singaporeDay} from './refresh.mjs';

export const clean=value=>String(value||'').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))).replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&rsquo;|&lsquo;/g,"'").replace(/\s+/g,' ').trim();
export const sourceClosed=html=>/\b(?:this|the) (?:position|job(?: posting)?|listing|opportunity) (?:(?:has been |is )(?:closed|filled|expired)|(?:has )?expired)\b|\bno longer accepting applications\b|(?:^|[.!?:]\s*)applications (?:are |have been )closed(?:[.!]|$)/i.test(clean(html));
export function structuredData(html) {
  return [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m=>{try{const j=JSON.parse(m[1]);return j['@graph']||(Array.isArray(j)?j:[j]);}catch{return [];}});
}
const date=value=>{const parsed=Date.parse(value);return Number.isFinite(parsed)?/^\d{4}-\d{2}-\d{2}$/.test(value)?value:singaporeDay(new Date(parsed)):null;};
const exactClose=value=>typeof value==='string'&&value.includes('T')&&Number.isFinite(Date.parse(value))?new Date(value).toISOString():null;
export function internship(html,url,listingText='',now=new Date()) {
  if(sourceClosed(html))return null;
  const job=structuredData(html).find(j=>j['@type']==='JobPosting');
  if(!job||!(Array.isArray(job.employmentType)?job.employmentType:[job.employmentType]).includes('INTERN'))return null;
  const posted=Date.parse(job.datePosted),closing=date(job.validThrough);
  // An accessible page with no deadline alone does not establish current recruitment.
  if(!Number.isFinite(posted)||posted>now.getTime()+86400000||now-posted>45*86400000||closing&&closing<singaporeDay(now))return null;
  const address=job.jobLocation?.address,text=clean(job.description),page=clean(html);
  if(address?.addressCountry!=='SG'||!job.hiringOrganization?.name||!job.title)return null;
  if(/financial advis[eo]r|insurance agent|commission.based|mid.career|career conversion/i.test(job.title+' '+text))return null;
  const instructions=page.match(/Application Instructions\s+([\s\S]*?)(?:Apply for this position|Related Job Searches|Discuss this Job)/i)?.[1];
  if(!instructions)return null;
  const organisation=clean(job.hiringOrganization.name),checked=now.toISOString();
  const locationText=page.match(/Location Name\s+([\s\S]*?)(?:Company Profile|Address\s)/i)?.[1]||'';
  const format=/hybrid/i.test(text)?'hybrid':/work from home/i.test(locationText+' '+listingText)||/work from home|remote internship|virtual internship/i.test(text)?'online':'in_person';
  const student=/students?|undergraduate|currently (?:enrolled|studying)|pursuing (?:a |an )?(?:diploma|degree)/i.test(text)?'confirmed':'unknown';
  const verified=Boolean(closing&&student==='confirmed');
  return {title:clean(job.title)+' — '+organisation,organisation,organizer:organisation,category:'Internships',categories:['Internships'],description:text.slice(0,900),minimum_age:null,maximum_age:null,education_levels:[],application_deadline:closing,deadline:closing,expiry_date:closing,start_date:null,end_date:null,
    source_url:url,application_url:url,source_type:'ai_fetched',source_name:'INTERNSG',external_id:job.identifier?.value?'internsg:'+job.identifier.value:null,
    location:[address.streetAddress,address.addressRegion,'Singapore'].filter(Boolean).join(', '),format,mode:format,host_country:'SG',eligibility_scope:'unknown',eligible_countries:[],travel_required:format!=='online',application_method:'external',internal_application_enabled:false,
    eligibility:'Review employer requirements and Singapore work eligibility. '+clean(text.match(/(?:Requirements|Qualifications):?\s*([\s\S]+)/i)?.[1]).slice(0,500),skills:[],status:'published',is_published:true,verification_status:verified?'verified':'pending_review',verified_at:verified?checked:null,last_verified_at:verified?checked:null,last_synced_at:checked,
    discovery:{deadline_status:closing?'confirmed':'unknown',application_closes_at:exactClose(job.validThrough),student_eligibility:student,application_access:'available',discovered_url:url,official_url:url,last_checked_at:checked,fees:null,parental_consent:null,school_membership:null,restrictions:'Employer requirements apply. Unstated ages, eligibility and closing dates remain unknown.',notes:'Source listing posted '+date(job.datePosted)+'. '+clean(instructions).slice(0,500),evidence_urls:[url]}};
}
export function hackathon(html,listing,now=new Date()) {
  const event=structuredData(html).find(j=>j['@type']==='Event');
  if(listing.open_state!=='open'||listing.invite_only||sourceClosed(html)||!event)return null;
  const deadline=date(event.endDate);
  if(!deadline||deadline<singaporeDay(now)||/EventCancelled|EventPostponed/.test(event.eventStatus||''))return null;
  const text=clean(html),eligibility=text.match(/Who can participate\s+([\s\S]*?)(?:View full rules|View rules|Rules|Requirements|How to|What to build)/i)?.[1];
  if(!eligibility||/professional[s]? only|not open to students/i.test(eligibility))return null;
  const organiser=clean(listing.organization_name||event.organizer?.name||'Devpost hackathon organiser');
  const checked=now.toISOString(),online=listing.displayed_location?.location==='Online';
  // Country exclusions and minimum ages must remain visible; online is not worldwide eligibility.
  return {title:clean(listing.title)+' — '+organiser,organisation:organiser,organizer:organiser,description:clean(event.description||'Build a project for this currently open hackathon. Review organiser rules and participant eligibility before joining.').slice(0,900),category:'Hackathons',categories:['Hackathons'],skills:listing.themes?.map(t=>t.name)||[],minimum_age:null,maximum_age:null,education_levels:[],application_deadline:deadline,deadline,expiry_date:deadline,start_date:null,end_date:null,
    source_url:listing.url,application_url:listing.url,source_type:'ai_fetched',source_name:'Devpost',external_id:'devpost:'+listing.id,location:online?'Online':clean(listing.displayed_location?.location),format:online?'online':'in_person',mode:online?'online':'in_person',host_country:null,eligibility_scope:'unknown',eligible_countries:[],travel_required:!online,application_method:'external',internal_application_enabled:false,eligibility:clean(eligibility).slice(0,1000),status:'published',is_published:true,verification_status:'pending_review',verified_at:null,last_verified_at:null,last_synced_at:checked,
    discovery:{deadline_status:'confirmed',application_closes_at:exactClose(event.endDate),student_eligibility:'unknown',application_access:'login_required',discovered_url:listing.url,official_url:listing.url,last_checked_at:checked,fees:null,parental_consent:null,school_membership:null,restrictions:clean(eligibility).slice(0,1000),notes:'Official Devpost discovery reports open submissions; event end date is the submission closing date. Check organiser rules for age, country, student eligibility and in-person rounds.',evidence_urls:[listing.url,listing.url.replace(/\/$/,'')+'/rules']}};
}
async function pooled(items,fn) {
  let next=0;const result=[];
  await Promise.all(Array.from({length:4},async()=>{while(next<items.length){const item=items[next++];result.push(await fn(item));}}));
  return result;
}
export async function discoverCandidates({rows,needed,now,request,onProgress=()=>{}}) {
  const candidates=[],closed=[],errors=[],stats={};
  const add=item=>{if(item&&!expiredReason(item,now)&&!duplicateOf([...rows,...candidates],item))candidates.push(item);};
  try {
    const projects=await discoverProjects(request);stats.zooniverse_projects=projects.length;
    for(const project of projects.filter(usableProject))add(projectListing(project,now.toISOString()));
    // Only affirmative source evidence closes a listing; missing feed items never do.
    for(const row of rows.filter(r=>r.is_published&&r.status==='published'&&r.source_name==='Zooniverse')) {
      const id=row.external_id?.replace(/^zooniverse:/,'')||row.discovery?.evidence_urls?.map(u=>u.match(/api\/projects\/(\d+)$/)?.[1]).find(Boolean);
      if(!id||!/^\d+$/.test(id))continue;
      const project=projects.find(p=>String(p.id)===id);
      if(project&&project.subjects_count-project.retired_subjects_count===0)closed.push({id:row.id,title:row.title,updated_at:row.updated_at,discovery:row.discovery,reason:'Official project API confirms no unfinished work'});
    }
  } catch(e){errors.push({operation:'discovery',provider:'Zooniverse',error:e.message});}
  if(needed>0)try {
    for(let page=1;page<=10&&candidates.length<needed;page++) {
      const feed=await request('https://devpost.com/api/hackathons?status[]=open&page='+page);
      if(!Array.isArray(feed.hackathons))throw Error('Invalid Devpost response');
      await pooled(feed.hackathons.filter(x=>x.open_state==='open'&&!x.invite_only&&!duplicateOf([...rows,...candidates],{source_url:x.url})),async listing=>{
        try {const html=await request(listing.url,{responseType:'text'});add(hackathon(html,listing,now));}catch(e){errors.push({operation:'source_check',provider:'Devpost',error:e.message});}
      });
      if(feed.hackathons.length===0)break;
    }
    stats.devpost_candidates=candidates.filter(x=>x.source_name==='Devpost').length;
  }catch(e){errors.push({operation:'discovery',provider:'Devpost',error:e.message});}
  // Recheck existing undated internships, including days when no new additions are needed.
  const localRows=rows.filter(r=>r.is_published&&r.status==='published'&&/^(?:www\.)?internsg\.com$/.test(new URL(r.source_url||'https://invalid.example').hostname)&&!expiredReason(r,now));
  await pooled(localRows,async row=>{
    try{const html=await request(row.source_url,{responseType:'text'});if(sourceClosed(html))closed.push({id:row.id,title:row.title,updated_at:row.updated_at,discovery:row.discovery,reason:'Source explicitly reports recruitment closed'});}
    catch(e){errors.push({operation:'source_check',provider:'INTERNSG',error:e.message});}
  });
  try {
    for(let page=1;page<=45&&candidates.length<needed;page++) {
      const directory='https://www.internsg.com/jobs/'+(page===1?'':page+'/');
      const html=await request(directory,{responseType:'text'});
      const links=[...html.matchAll(/<a\b[^>]*href=["'](https:\/\/www\.internsg\.com\/job\/[^"'#?]+)(?:\?[^"']*)?["'][^>]*>([\s\S]*?)<\/a>/g)];
      if(!links.length)throw Error('INTERNSG directory returned no parsable listings');
      const unique=[...new Map(links.map(m=>[m[1],m])).values()].filter(m=>!duplicateOf([...rows,...candidates],{source_url:m[1]}));
      await pooled(unique,async match=>{try{add(internship(await request(match[1],{responseType:'text'}),match[1],clean(match[2]),now));}catch(e){errors.push({operation:'source_check',provider:'INTERNSG',error:e.message});}});
      onProgress({provider:'INTERNSG',page,candidates:candidates.length});
    }
    stats.internsg_candidates=candidates.filter(x=>x.source_name==='INTERNSG').length;
  }catch(e){errors.push({operation:'discovery',provider:'INTERNSG',error:e.message});}
  return {candidates,closed,errors,stats};
}
