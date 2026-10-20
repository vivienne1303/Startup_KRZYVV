import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {duplicateOf,expiredReason,singaporeDay} from '../opportunity-automation/refresh.mjs';
import {clean} from '../opportunity-automation/providers.mjs';
const require=createRequire(import.meta.url),{prepare}=require('./import-ofy-discovery');
const dir='output/expansion-2026-10-20';
const pool=JSON.parse(await fs.readFile(dir+'/reviewed-pool.json','utf8')).additions;
const baseline=JSON.parse(await fs.readFile(dir+'/baseline.json','utf8'));
// Individually reviewed: exclude country-limited events, physical finals,
// incomplete rules, conflicting schedules, and the duplicate Mitsubishi HR role.
const online=[2,3,4,5,10,11,17,18,20,21,22,25,26,27,29,31,32,35,36,37,39,42,43,48,50,54,55,56,57,58,60,61,79,82,0,69,72,81,75,76,9,49,59];
const local=[83,84,85,86,88,89,90];
assert.equal(online.length,43);assert.equal(local.length,7);
const additions=[];
for(const index of [...local,...online]){
 const item=structuredClone(pool[index]);assert(item);
 if(item.source_name==='Unstop'){
  const c=JSON.parse(await fs.readFile(dir+'/unstop-'+item.external_id.split(':')[1]+'.json','utf8')).data.competition;
  const text=clean(c.details),rounds=(c.rounds||[]).flatMap(r=>r.details||[]);
  const terms=text.split(/(?<=[.!?])\s+/).filter(s=>/eligib|student|college|school|particip|teams?|must|only|parent|guardian|country|countries/i.test(s));
  item.eligibility=(c.filters||[]).filter(f=>f.type==='eligible').map(f=>f.name).join(', ')+'. '+terms.join(' ').slice(0,3000);
  item.discovery.restrictions=item.eligibility;
  item.description=text.slice(0,1300);
  // Earlier required round deadlines take precedence over a later registration window.
  const closes=[c.regnRequirements.end_regn_dt,...rounds.map(r=>r.end_date)].filter(t=>Number.isFinite(Date.parse(t))).map(t=>Date.parse(t));
  const exact=new Date(Math.min(...closes));assert(exact>new Date());
  item.application_deadline=singaporeDay(exact);
  item.discovery.application_closes_at=exact.toISOString();
  if(exact.getTime()!==Date.parse(c.regnRequirements.end_regn_dt))item.discovery.notes+=' Earlier required round closes '+exact.toISOString()+'; complete that round before this time.';
  if(index===39){item.eligibility_scope='worldwide';item.discovery.notes+=' Organiser explicitly welcomes participants from any country.';}
  if(index===82){item.eligibility_scope='worldwide';item.discovery.notes+=' Organiser explicitly opens entry to all regions and confirms Google Meet for the final.';}
  if([54,55,57,58,60,61].includes(index))item.discovery.notes+=' Organiser explicitly keeps new online registrations and uploads open after the September physical festival.';
  if(index===32)item.education_levels=['Undergraduate'];
  if(index===49)item.discovery.parental_consent='Participants aged 17 require parent or guardian confirmation by email.';
 }
 item.discovery.research_batch='expansion-2026-10-20';
 assert(!expiredReason(item));assert(!duplicateOf([...baseline,...additions],item));
 additions.push(item);
}
assert.equal(additions.length,50);additions.forEach(prepare);
await fs.writeFile('data/opportunities-expansion-2026-10-20.json',JSON.stringify({as_of:'2026-10-20',additions},null,2)+'\n');
await fs.writeFile(dir+'/selection.json',JSON.stringify({selected_indices:[...local,...online],excluded_duplicate:'Human Resources Intern — Mitsubishi Corporation RtM International Pte Ltd',singapore:7,online:43},null,2));
console.log(JSON.stringify({prepared:50,singapore:7,online:43,worldwide:additions.filter(x=>x.eligibility_scope==='worldwide').length}));
