import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const singaporeDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function expiredReason(row, now = new Date()) {
  if (row.status === 'expired') return 'Already archived';
  if (row.discovery?.deadline_status === 'closed') return 'Organiser recruitment recorded as closed';
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
async function jsonRequest(url, options = {}) {
  const attempts = !options.method || options.method === 'GET' ? 3 : 1;
  for (let attempt=0; attempt<attempts; attempt++) {
    try {
      const r = await fetch(url,{...options,signal:AbortSignal.timeout(25000)});
      if (!r.ok) {
        if ((r.status===429 || r.status>=500) && attempt<attempts-1) {await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)));continue;}
        throw new Error(`HTTP ${r.status} from ${new URL(url).hostname}`);
      }
      return r.status===204 ? null : await r.json();
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
export function makePlan(rows, additions, {now = new Date(), target = 1000, buffer = 100} = {}) {
  const archive=rows.filter(row=>row.status!=='expired' && expiredReason(row,now)).map(row=>({id:row.id,title:row.title,updated_at:row.updated_at,reason:expiredReason(row,now)}));
  const published=rows.filter(row=>row.is_published===true && row.status==='published' && !expiredReason(row,now) && row.discovery?.student_eligibility!=='ineligible');
  const active=rows.filter(row=>confirmedActive(row,now));
  const known=[...rows];const insert=[];const duplicates=[];
  for(const item of additions){
    if(!confirmedActive(item,now)) continue;
    const duplicate=duplicateOf(known,item);
    if(duplicate){duplicates.push({title:item.title,existing_id:duplicate.id});continue;}
    if(active.length+insert.length>=target+buffer) break;
    insert.push(item);known.push(item);
  }
  return {as_of:singaporeDay(now),target,buffer,published_before:published.length,projected_published:published.length+insert.length,active_before:active.length,projected_active:active.length+insert.length,archive,insert,duplicates};
}
function databaseClient() {
  const origin=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SECRET_KEY;
  if(!origin||!key) throw new Error('Apply needs SUPABASE_URL and SUPABASE_SECRET_KEY in the environment. Do not put secrets into files or chat.');
  const base=new URL('/rest/v1/opportunities',origin);
  const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'};
  return {
    async readAll(){const all=[];for(let offset=0;;offset+=500){const u=new URL(base);u.searchParams.set('select','*');u.searchParams.set('order','id');u.searchParams.set('offset',offset);u.searchParams.set('limit','500');const rows=await jsonRequest(u,{headers});if(!Array.isArray(rows))throw new Error('Invalid database response');all.push(...rows);if(rows.length<500)return all;}},
    async archive(row){const u=new URL(base);u.searchParams.set('id','eq.'+row.id);if(row.updated_at)u.searchParams.set('updated_at','eq.'+row.updated_at);const data=await jsonRequest(u,{method:'PATCH',headers,body:JSON.stringify({status:'expired',is_published:false,verification_status:'expired'})});if(data?.length!==1)throw new Error('Concurrent change while archiving '+row.id);return data[0];},
    async insert(item){const data=await jsonRequest(base,{method:'POST',headers,body:JSON.stringify(item)});if(data?.length!==1 || data[0].is_published!==true || data[0].status!=='published')throw new Error('Insert verification failed');return data[0];}
  };
}
export async function run({apply=false,output,now=new Date(),target=1000,buffer=100}={}) {
  const dir=output || path.join(path.dirname(fileURLToPath(import.meta.url)),'reports',singaporeDay(now));
  await fs.mkdir(dir,{recursive:true});
  const db=apply?databaseClient():null;
  const baseline=db?await db.readAll():(await jsonRequest('https://teenlaunch-production.up.railway.app/api/opportunities')).opportunities;
  if(!Array.isArray(baseline))throw new Error('Invalid baseline data');
  const providerErrors=[];
  let projects=[];
  try {projects=await discoverProjects();} catch(e) {providerErrors.push({operation:'discovery',error:e.message});}
  const candidates=projects.filter(usableProject).map(p=>projectListing(p,now.toISOString()));
  const plan=makePlan(baseline,candidates,{now,target,buffer});
  const report={...plan,applied:apply,baseline_scope:apply?'complete database':'public API response (hidden/archived rows unavailable)',provider:'Zooniverse official API',provider_projects:projects.length,provider_candidates:candidates.length,archived:[],added:[],errors:providerErrors};
  const save=()=>fs.writeFile(path.join(dir,apply?'applied.json':'dry-run.json'),JSON.stringify(report,null,2)+'\n');
  await fs.writeFile(path.join(dir,'new-opportunities.json'),JSON.stringify({as_of:plan.as_of,additions:plan.insert},null,2)+'\n');
  await save();
  if(apply){
    // Never delete records: preserve references held by applications and portfolios.
    await fs.writeFile(path.join(dir,'archive-backup.json'),JSON.stringify(baseline.filter(r=>plan.archive.some(a=>a.id===r.id)),null,2)+'\n');
    for(const row of plan.archive){try{await db.archive(row);report.archived.push(row.id);}catch(e){report.errors.push({operation:'archive',id:row.id,error:e.message});}await save();}
    for(const item of plan.insert){try{
      // Recheck against the live DB for idempotency if another run inserted records.
      const current=await db.readAll();
      if(duplicateOf(current,item))continue;
      const saved=await db.insert(item);report.added.push({id:saved.id,title:saved.title});
    }catch(e){report.errors.push({operation:'insert',title:item.title,error:e.message});}await save();}
    const final=await db.readAll();
    report.active_after=final.filter(row=>confirmedActive(row,now)).length;
  }
  report.projected_below_target=report.projected_active<target;
  report.below_target=(report.active_after??report.active_before)<target;
  await fs.writeFile(path.join(dir,'summary.json'),JSON.stringify({as_of:plan.as_of,applied:apply,published_before:plan.published_before,projected_published:plan.projected_published,active_before:plan.active_before,active_after:report.active_after??null,projected_active:plan.projected_active,planned_additions:plan.insert.length,planned_archives:plan.archive.length,below_target:report.below_target,error_count:report.errors.length},null,2));
  await save();
  console.log(JSON.stringify({applied:apply,published_before:plan.published_before,projected_published:plan.projected_published,active_before:plan.active_before,planned_additions:plan.insert.length,planned_archives:plan.archive.length,added:report.added.length,archived:report.archived.length,active_after:report.active_after??null,projected_active:plan.projected_active,below_target:report.below_target,errors:report.errors.length,report:path.join(dir,apply?'applied.json':'dry-run.json')},null,2));
  return report;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  run({apply:process.argv.includes('--apply')}).then(r=>{if(r.errors.length||r.below_target)process.exitCode=2;}).catch(e=>{console.error(e.message);process.exitCode=1;});
}
