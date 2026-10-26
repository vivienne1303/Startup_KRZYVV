import {clean,competition,sourceClosed} from './providers.mjs';
import {duplicateOf,expiredReason,singaporeDay,canonicalUrl} from './refresh.mjs';

// Feed listings without explicit closing dates remain reviewed leads, never verified openings.
export function studentJob(job,source,now=new Date()) {
  const himalayas=source==='Himalayas';
  const title=clean(job.title),description=clean(job.description);
  const volunteer=himalayas&&job.employmentType==='Volunteer';
  if(!volunteer&&!/\bintern(?:ship)?\b|\bworking student\b|\bwerkstudent\b|\bpraktik(?:ant|um)\b/i.test(title+' '+(job.employmentType||'')+' '+(job.job_types||[]).join(' ')))return null;
  if(/\bsenior\b|\bdirector\b|\bhead of\b/i.test(title)||sourceClosed(description))return null;
  const posted=Number(himalayas?job.pubDate:job.created_at)*1000;
  if(!Number.isFinite(posted)||posted>+now+86400000||+now-posted>45*86400000)return null;
  const expiry=himalayas?Number(job.expiryDate)*1000:null;
  if(himalayas&&(!Number.isFinite(expiry)||expiry<=+now))return null;
  const url=himalayas?job.guid:job.url,apply=himalayas?job.applicationLink:job.url;
  const organisation=clean(himalayas?job.companyName:job.company_name);
  if(!title||!organisation||!description||!canonicalUrl(url)||!canonicalUrl(apply))return null;
  const remote=himalayas||job.remote===true;
  const restrictions=himalayas?'Location restrictions: '+JSON.stringify(job.locationRestrictions||[])+'; required UTC offsets: '+JSON.stringify(job.timezoneRestrictions||[])+'. ':'';
  const eligibility=restrictions+'Employer age, student, residence, language and work-authorisation requirements apply. '+description;
  return {title:title+' - '+organisation,organisation,category:volunteer?'Volunteering':'Internships',categories:[volunteer?'Volunteering':'Internships'],description:description.slice(0,1500),eligibility:eligibility.slice(0,4000),minimum_age:null,maximum_age:null,education_levels:[],application_deadline:null,expiry_date:expiry?singaporeDay(new Date(expiry)):null,source_url:url,application_url:apply,source_name:source,source_type:'ai_fetched',external_id:source.toLowerCase()+':'+(himalayas?job.guid:job.slug),host_country:null,location:himalayas?'Online; '+restrictions:clean(job.location)||'Location not specified',format:remote?'online':'in_person',mode:remote?'online':'in_person',eligibility_scope:'unknown',eligible_countries:[],travel_required:!remote,skills:[],status:'published',is_published:true,verification_status:'pending_review',application_method:'external',internal_application_enabled:false,
    discovery:{deadline_status:'unknown',student_eligibility:volunteer?'unknown':'confirmed',application_access:'available',last_checked_at:now.toISOString(),discovered_url:url,official_url:url,evidence_urls:[url],restrictions:eligibility.slice(0,4000),notes:'Active '+source+' feed listing. Posting updated '+new Date(posted).toISOString()+'. Application deadline is unstated; feed expiry is not an employer application deadline. Online does not imply worldwide eligibility.'}};
}

// Each yield is followed by real database writes. The caller stops pulling pages
// only once the verified daily quota is met, not when enough candidates were found.
export async function* fallbackBatches({rows,now,request,onProgress=()=>{}}) {
  const known=[...rows],seen=new Set();
  const accept=items=>items.filter(item=>{
    if(!item||expiredReason(item,now)||duplicateOf(known,item))return false;
    known.push(item);return true;
  });
  const feeds=[
    ...['Intern','Volunteer'].map(type=>({name:'Himalayas',url:page=>'https://himalayas.app/jobs/api/search?employment_type='+type+'&sort=recent&page='+page,parse:d=>d.jobs,convert:j=>studentJob(j,'Himalayas',now)})),
    {name:'Arbeitnow',url:page=>'https://www.arbeitnow.com/api/job-board-api?page='+page,parse:d=>d.data,convert:j=>studentJob(j,'Arbeitnow',now)},
    ...['hackathons','quizzes'].map(kind=>({name:'Unstop '+kind,url:page=>'https://unstop.com/api/public/opportunity/search?opportunity='+kind+'&page='+page,parse:d=>d.data?.data,convert:async j=>{
      if(j.regn_open!==1||j.paid||j.region!=='online'||duplicateOf(known,{source_url:'https://unstop.com/'+j.public_url}))return null;
      const detail=await request('https://unstop.com/api/public/competition/'+j.id);
      const item=competition(detail.data?.competition,now);
      if(item&&kind==='hackathons'){item.category='Hackathons';item.categories=['Hackathons'];}
      return item;
    }})),
  ];
  for(const feed of feeds){
    let stopped=false;
    for(let page=1;page<=100;page++){
      try{
        const data=await request(feed.url(page)),list=feed.parse(data);
        if(!Array.isArray(list))throw Error('Invalid feed response');
        if(!list.length){stopped=true;break;}
        const items=[],warnings=[];let limited=false,newEntries=0;
        for(const entry of list){
          const id=feed.name+':'+(entry.guid||entry.slug||entry.id);
          if(seen.has(id))continue;seen.add(id);newEntries++;
          try{items.push(await feed.convert(entry));}catch(e){warnings.push({operation:'source_check',provider:feed.name,error:e.message});if(/HTTP 429/.test(e.message)){limited=true;break;}}
        }
        const candidates=accept(items);
        onProgress({provider:feed.name,page,candidates:candidates.length});
        yield {candidates,closed:[],errors:warnings,stats:{provider:feed.name,page}};
        if(limited||!newEntries||data.links?.next===null){stopped=true;break;}
      }catch(e){yield {candidates:[],closed:[],errors:[{operation:'source_check',provider:feed.name,error:e.message}],stats:{provider:feed.name,page}};stopped=true;break;}
    }
    if(!stopped)yield {candidates:[],closed:[],errors:[{operation:'source_check',provider:feed.name,error:'Pagination safety budget reached; remaining source pages deferred to recovery run'}],stats:{provider:feed.name}};
  }
}
