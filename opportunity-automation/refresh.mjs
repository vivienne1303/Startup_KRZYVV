import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {discoverCandidates} from './providers.mjs';
import {fallbackBatches} from './fallbacks.mjs';

export const singaporeDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function expiredReason(row, now = new Date()) {
  if (row.status === 'expired') return 'Already archived';
  if (row.discovery?.deadline_status === 'closed') return 'Organiser recruitment recorded as closed';
  const exactClosing=Date.parse(row.discovery?.application_closes_at);
  if(Number.isFinite(exactClosing)&&exactClosing<now.getTime())return 'Source application closing timestamp passed';
  for (const field of ['application_deadline','deadline','expiry_date','end_date']) {
    const value = row[field];
    if (!value) continue;
    const timestamp = /^\d{4}-\d{2}-\d{2}$/.test(value) ? Date.parse(value+'T23:59:59.999+08:00') : Date.parse(value);
    if (Number.isFinite(timestamp) && timestamp < now.getTime()) return `${field} passed: ${value}`;
  }
  return null;
}
export function canonicalUrl(value) {
  if (!value) return null;
  try {
    const u = new URL(value);
    if (!['https:','http:'].includes(u.protocol)) return null;
    u.hash = '';
    for (const key of [...u.searchParams.keys()]) if (/^utm_|^(fbclid|gclid)$/i.test(key)) u.searchParams.delete(key);
    u.searchParams.sort();
    // A Zooniverse classification URL and its project homepage are one opportunity.
    let pathname = u.pathname.replace(/\/+$/, '');
    if (u.hostname.replace(/^www\./,'') === 'zooniverse.org') pathname = pathname.replace(/\/(classify|about(?:\/.*)?|talk(?:\/.*)?)$/, '');
    return u.hostname.toLowerCase().replace(/^www\./,'')+pathname+u.search;
  } catch { return null; }
}
const textKey = value => String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function duplicateOf(rows, candidate) {
  const urls = new Set([candidate.source_url,candidate.application_url].map(canonicalUrl).filter(Boolean));
  return rows.find(row => [row.source_url,row.application_url].map(canonicalUrl).some(url => url && urls.has(url))
    || (candidate.external_id && candidate.external_id === row.external_id && candidate.source_name === row.source_name)
    || (textKey(candidate.title) === textKey(row.title) && textKey(candidate.organisation) === textKey(row.organisation || row.organizer)));
}
export function usableProject(p) {
  return p.live === true && p.launch_approved === true && typeof p.slug === 'string' && /^[^/]+\/[^/]+$/.test(p.slug)
    && Number.isFinite(p.subjects_count) && Number.isFinite(p.retired_subjects_count)
    && p.subjects_count - p.retired_subjects_count >= 100 && p.links?.active_workflows?.length > 0
    && !/\b(adults? only|18\+|over 18|not suitable for children)\b/i.test(p.description || '');
}
export function projectListing(p, checkedAt = new Date().toISOString()) {
  if (!usableProject(p)) throw new Error('Project is not accepting sufficient active volunteer work');
  const url = 'https://www.zooniverse.org/projects/'+p.slug;
  return {
    title:p.display_name+' - Online Citizen Science', organisation:'Zooniverse / '+p.display_name,
    organizer:'Zooniverse / '+p.display_name, description:p.description || 'Contribute classifications to an active research project. Read the project tutorial and participation rules.',
    category:'Volunteering',categories:['Volunteering'],minimum_age:null,maximum_age:null,age_min:null,age_max:null,
    education_levels:[],application_deadline:null,deadline:null,start_date:null,end_date:null,expiry_date:null,
    source_url:url,application_url:url+'/classify',source_name:'Zooniverse',source_type:'ai_fetched',external_id:'zooniverse:'+p.id,
    location:'Global (online)',format:'online',mode:'online',host_country:null,eligibility_scope:'worldwide',eligible_countries:[],travel_required:false,
    application_method:'external',internal_application_enabled:false,
    eligibility:'Online research volunteering. Follow the individual project tutorial and rules. Under-16 account registration requires parent or guardian sign-off. Check school acceptance before claiming service credit.',
    skills:['Citizen science','Research','Attention to detail'],status:'published',is_published:true,verification_status:'verified',
    verified_at:checkedAt,last_verified_at:checkedAt,last_synced_at:checkedAt,
    discovery:{deadline_status:'rolling',student_eligibility:'confirmed',application_access:'available',discovered_url:url,official_url:url,last_checked_at:checkedAt,
      fees:'Free voluntary participation.',parental_consent:'Parent/guardian sign-off for account registration under 16.',school_membership:null,
      restrictions:'Follow individual project rules; service credit is not guaranteed.',
      notes:'Official API confirms live, launch-approved status, active workflows, and at least 100 unfinished subjects. Availability changes as volunteer work is completed.',
      evidence_urls:[url,'https://panoptes.zooniverse.org/api/projects/'+p.id,'https://www.zooniverse.org/get-involved/volunteer']}
  };
}
export async function jsonRequest(url, options = {}) {
  const {responseType,...fetchOptions}=options;
  const attempts = !options.method || options.method === 'GET' ? 3 : 1;
  for (let attempt=0; attempt<attempts; attempt++) {
    try {
      const r = await fetch(url,{...fetchOptions,signal:AbortSignal.timeout(25000)});
      if (!r.ok) {
        if ((r.status===429 || r.status>=500) && attempt<attempts-1) {await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));continue;}
        const hint=r.status===401?' (authentication rejected; check the project URL and configured API key)':r.status===403?' (access denied; check database permissions)':'';
        throw new Error(`HTTP ${r.status} from ${new URL(url).hostname}${hint}`);
      }
      return r.status===204 ? null : responseType==='text'?await r.text():await r.json();
    } catch(e) {if (attempt===attempts-1 || /^HTTP /.test(e.message)) throw e;}
  }
}
export async function discoverProjects(request = jsonRequest) {
  const projects=[];const ids=new Set();
  for(let page=1; page<=30; page++) {
    const data=await request('https://panoptes.zooniverse.org/api/projects?live=true&launch_approved=true&page_size=100&page='+page,{headers:{Accept:'application/vnd.api+json; version=1'}});
    if(!Array.isArray(data.projects)) throw new Error('Invalid discovery response');
    for(const p of data.projects) if(!ids.has(String(p.id))){ids.add(String(p.id));projects.push(p);}
    const meta=data.meta?.projects;
    if(meta && 'next_page' in meta) { if(meta.next_page == null) return projects; }
    else if(data.projects.length<100) return projects;
  }
  throw new Error('Discovery pagination limit reached; refusing to treat an incomplete feed as complete');
}
export function confirmedActive(row, now = new Date()) {
  if (!row.is_published || row.status !== 'published' || expiredReason(row,now) || row.verification_status !== 'verified') return false;
  const d=row.discovery;
  if (d) return ['confirmed','rolling'].includes(d.deadline_status) && d.student_eligibility==='confirmed' && ['available','login_required'].includes(d.application_access);
  return Boolean((row.application_deadline || row.deadline) && (row.application_url || row.application_method==='internal'));
}
export function dailyAdditions(rows,now=new Date()) {
  const day=singaporeDay(now);
  return rows.filter(row=>row.discovery?.automation_added_day===day&&row.created_at&&singaporeDay(new Date(row.created_at))===day&&row.is_published&&row.status==='published'&&!expiredReason(row,now)).length;
}
export function eligibleAddition(row,now=new Date()) {
  const d=row.discovery;
  return Boolean(row.title&&row.organisation&&canonicalUrl(row.source_url)&&canonicalUrl(row.application_url)&&row.is_published&&row.status==='published'&&!expiredReason(row,now)&&d&&d.student_eligibility!=='ineligible'&&['confirmed','rolling','unknown'].includes(d.deadline_status)&&['available','login_required'].includes(d.application_access)&&d.evidence_urls?.length&&d.last_checked_at&&Number.isFinite(Date.parse(d.last_checked_at))&&singaporeDay(new Date(d.last_checked_at))===singaporeDay(now));
}
export function makePlan(rows, additions, {now = new Date(), minimumAdditions=50, reserve=10} = {}) {
  const archive=rows.filter(row=>row.status!=='expired' && expiredReason(row,now)).map(row=>({id:row.id,title:row.title,updated_at:row.updated_at,discovery:row.discovery,reason:expiredReason(row,now)}));
  const published=rows.filter(row=>row.is_published===true && row.status==='published' && !expiredReason(row,now) && row.discovery?.student_eligibility!=='ineligible');
  const active=rows.filter(row=>confirmedActive(row,now));
  const known=[...rows];const insert=[];const duplicates=[];
  const daily_before=dailyAdditions(rows,now),remaining=Math.max(0,minimumAdditions-daily_before);
  for(const item of additions){
    if(!eligibleAddition(item,now)) continue;
    const duplicate=duplicateOf(known,item);
    if(duplicate){duplicates.push({title:item.title,existing_id:duplicate.id});continue;}
    if(!remaining||insert.length>=remaining+reserve) break;
    insert.push(item);known.push(item);
  }
  return {as_of:singaporeDay(now),minimum_additions:minimumAdditions,daily_before,remaining,published_before:published.length,projected_published:published.length+Math.min(remaining,insert.length),active_before:active.length,projected_active:active.length+insert.filter(x=>confirmedActive(x,now)).length,archive,insert,duplicates};
}
export function databaseHeaders(key) {
  const headers={apikey:key,'Content-Type':'application/json',Prefer:'return=representation'};
  if (!key.startsWith('sb_secret_')) headers.Authorization='Bearer '+key;
  return headers;
}
function databaseClient() {
  const origin=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SECRET_KEY;
  if(!origin||!key) throw new Error('Apply needs SUPABASE_URL and SUPABASE_SECRET_KEY in the environment. Do not put secrets into files or chat.');
  const base=new URL('/rest/v1/opportunities',origin);
  const headers=databaseHeaders(key);
  return {
    async readAll(){const all=[];for(let offset=0;;offset+=500){const u=new URL(base);u.searchParams.set('select','*');u.searchParams.set('order','id');u.searchParams.set('offset',offset);u.searchParams.set('limit','500');const rows=await jsonRequest(u,{headers});if(!Array.isArray(rows))throw new Error('Invalid database response');all.push(...rows);if(rows.length<500)return all;}},
    async archive(row){const u=new URL(base);u.searchParams.set('id','eq.'+row.id);if(row.updated_at)u.searchParams.set('updated_at','eq.'+row.updated_at);const discovery={deadline_status:'closed',student_eligibility:'unknown',application_access:'unknown',last_checked_at:new Date().toISOString(),...row.discovery,automation_archived_day:singaporeDay(),automation_archive_reason:row.reason};const data=await jsonRequest(u,{method:'PATCH',headers,body:JSON.stringify({status:'expired',is_published:false,verification_status:'expired',discovery})});if(data?.length!==1)throw new Error('Concurrent change while archiving '+row.id);return data[0];},
    async insert(item){const data=await jsonRequest(base,{method:'POST',headers,body:JSON.stringify(item)});if(data?.length!==1 || data[0].is_published!==true || data[0].status!=='published')throw new Error('Insert verification failed');return data[0];}
  };
}
export async function run(options={}) {
  const {now=new Date(),output}=options;
  const dir=output || path.join(path.dirname(fileURLToPath(import.meta.url)),'reports',singaporeDay(now));
  await fs.mkdir(dir,{recursive:true});
  try { return await runRefresh({...options,now,output:dir}); }
  catch(error) {
    await fs.writeFile(path.join(dir,'summary.json'),JSON.stringify({as_of:singaporeDay(now),applied:options.apply===true,execution_status:'failed',counts_verified:false,error_count:1,error:error.message},null,2)+'\n');
    throw error;
  }
}
async function runRefresh({apply=false,output,now=new Date(),minimumAdditions=50,reserve=10,database,request=jsonRequest,discover=discoverCandidates,fallback=discover===discoverCandidates?fallbackBatches:null}={}) {
  if(!Number.isInteger(minimumAdditions)||minimumAdditions<1||minimumAdditions>500)throw Error('Minimum additions must be an integer from 1 to 500');
  const dir=output || path.join(path.dirname(fileURLToPath(import.meta.url)),'reports',singaporeDay(now));
  await fs.mkdir(dir,{recursive:true});
  const db=database || (apply || process.env.SUPABASE_URL&&process.env.SUPABASE_SECRET_KEY ? databaseClient() : null);
  const baseline=db?await db.readAll():(await request('https://teenlaunch-production.up.railway.app/api/opportunities')).opportunities;
  if(!Array.isArray(baseline))throw new Error('Invalid baseline data');
  const initial=makePlan(baseline,[],{now,minimumAdditions,reserve});
  const report={...initial,applied:apply,baseline_scope:db?'complete database':'public API response (hidden/archived rows unavailable)',archived:[],added:[],errors:[],warnings:[]};
  const save=()=>fs.writeFile(path.join(dir,apply?'applied.json':'dry-run.json'),JSON.stringify(report,null,2)+'\n');
  await save();
  const archivedIds=new Set();
  const archive=async items=>{
    for(const row of items) {
      if(archivedIds.has(row.id))continue;
      try{await db.archive(row);report.archived.push(row.id);archivedIds.add(row.id);}
      catch(e){report.errors.push({operation:'archive',id:row.id,error:e.message});}
      await save();
    }
  };
  if(apply){
    await fs.writeFile(path.join(dir,'archive-backup.json'),JSON.stringify(baseline.filter(r=>initial.archive.some(a=>a.id===r.id)),null,2)+'\n');
    // Expiry does not depend on discovery being reachable or returning enough additions.
    await archive(initial.archive);
  }
  let discovery={candidates:[],closed:[],errors:[],stats:{}};
  try {
    discovery=await discover({rows:baseline,needed:initial.remaining?initial.remaining+reserve:0,now,request,onProgress:p=>console.log(JSON.stringify(p))});
    if(Array.isArray(discovery))discovery={candidates:discovery.filter(usableProject).map(p=>projectListing(p,now.toISOString())),closed:[],errors:[],stats:{}};
  }catch(e){report.errors.push({operation:'discovery',error:e.message});}
  report.errors.push(...(discovery.errors||[]).filter(e=>e.operation!=='source_check'));
  report.warnings.push(...(discovery.errors||[]).filter(e=>e.operation==='source_check'));
  report.providers=discovery.stats||{};
  let plan=makePlan(baseline,discovery.candidates||[],{now,minimumAdditions,reserve});
  if(!apply&&plan.insert.length<plan.remaining&&fallback){
    const candidates=[...(discovery.candidates||[])];
    report.fallback_pages=[];
    for await(const batch of fallback({rows:[...baseline,...candidates],now,request,onProgress:p=>console.log(JSON.stringify(p))})){
      candidates.push(...(batch.candidates||[]));
      report.warnings.push(...(batch.errors||[]));
      report.fallback_pages.push(batch.stats||{});
      plan=makePlan(baseline,candidates,{now,minimumAdditions,reserve});
      if(plan.insert.length>=plan.remaining+reserve)break;
    }
  }
  Object.assign(report,plan);
  report.archive=[...new Map([...plan.archive,...(discovery.closed||[])].map(r=>[r.id,r])).values()];
  await fs.writeFile(path.join(dir,'new-opportunities.json'),JSON.stringify({as_of:plan.as_of,additions:plan.insert},null,2)+'\n');
  await save();
  if(apply){
    await fs.writeFile(path.join(dir,'archive-backup.json'),JSON.stringify(baseline.filter(r=>report.archive.some(a=>a.id===r.id)),null,2)+'\n');
    await archive(report.archive.filter(r=>!archivedIds.has(r.id)));
    const current=await db.readAll();
    let today=dailyAdditions(current,now);
    for(const item of plan.insert){
      if(today>=minimumAdditions)break;
      try{
      if(duplicateOf(current,item))continue;
      const saved=await db.insert({...item,discovery:{...item.discovery,automation_added_day:singaporeDay(now)}});
      current.push(saved);report.added.push({id:saved.id,title:saved.title});today++;
    }catch(e){report.errors.push({operation:'insert',title:item.title,error:e.message});}await save();}
    // Reserves can fail too. Pull additional sources until actual published daily
    // additions meet quota, or all configured feeds have been exhausted.
    report.fallback_pages=[];
    if(today<minimumAdditions&&fallback){
      const attempted=[...plan.insert];
      for await(const batch of fallback({rows:[...current,...attempted],now,request,onProgress:p=>console.log(JSON.stringify(p))})){
        report.fallback_pages.push(batch.stats||{});
        report.warnings.push(...(batch.errors||[]));
        const fresh=await db.readAll();
        current.splice(0,current.length,...fresh);
        today=dailyAdditions(current,now);
        for(const item of batch.candidates||[]){
          if(today>=minimumAdditions)break;
          if(!eligibleAddition(item,now)||duplicateOf([...current,...attempted],item))continue;
          attempted.push(item);
          try{
            const saved=await db.insert({...item,discovery:{...item.discovery,automation_added_day:singaporeDay(now)}});
            current.push(saved);report.added.push({id:saved.id,title:saved.title});
            today=dailyAdditions(current,now);
          }catch(e){report.errors.push({operation:'insert',title:item.title,error:e.message});}
          await save();
        }
        await save();
        if(today>=minimumAdditions)break;
      }
    }
    const final=await db.readAll();
    report.active_after=final.filter(row=>confirmedActive(row,now)).length;
    report.daily_after=dailyAdditions(final,now);
    report.daily_archived=final.filter(row=>row.discovery?.automation_archived_day===singaporeDay(now)&&row.status==='expired'&&!row.is_published).length;
    const failedArchives=report.archived.filter(id=>final.some(row=>row.id===id&&(row.status!=='expired'||row.is_published)));
    const missing=report.added.filter(item=>!final.some(row=>row.id===item.id&&row.is_published&&row.status==='published'&&!expiredReason(row,now)));
    if(failedArchives.length||missing.length)report.errors.push({operation:'verification',error:'Archive or insertion visibility did not match the final database state'});
  }
  report.shortfall=Math.max(0,minimumAdditions-(report.daily_after??(plan.daily_before+Math.min(plan.remaining,plan.insert.length))));
  // A source outage recovered by another source is a warning, not a failed quota.
  if(apply&&!report.shortfall){
    report.warnings.push(...report.errors.filter(e=>e.operation==='discovery'));
    report.errors=report.errors.filter(e=>e.operation!=='discovery');
  }
  const summary={as_of:plan.as_of,applied:apply,execution_status:report.errors.length?'failed':report.shortfall?'shortfall':'completed',counts_verified:apply,minimum_additions:minimumAdditions,daily_before:plan.daily_before,daily_after:report.daily_after??null,daily_archived:report.daily_archived??null,added:report.added.length,archived:report.archived.length,planned_additions:Math.min(plan.remaining,plan.insert.length),planned_archives:report.archive.length,shortfall:report.shortfall,active_before:plan.active_before,active_after:report.active_after??null,error_count:report.errors.length,warning_count:report.warnings.length,providers:report.providers,fallback_pages:report.fallback_pages||[]};
  await fs.writeFile(path.join(dir,'summary.json'),JSON.stringify(summary,null,2)+'\n');
  await save();
  console.log(JSON.stringify(summary,null,2));
  return report;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  // GitHub supplies environment variables directly; local runs can use the ignored .env.
  if(typeof process.loadEnvFile==='function') {
    try { process.loadEnvFile(); } catch(error) { if(error.code!=='ENOENT') throw error; }
  } else {
    const {createRequire}=await import('node:module');
    try{createRequire(import.meta.url)('dotenv').config({quiet:true});}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
  }
  const minimumArg=process.argv.find(arg=>arg.startsWith('--minimum-additions='));
  run({apply:process.argv.includes('--apply'),minimumAdditions:minimumArg?Number(minimumArg.split('=')[1]):50}).then(r=>{if(r.errors.length||r.shortfall)process.exitCode=2;}).catch(e=>{console.error(e.message);process.exitCode=1;});
}
