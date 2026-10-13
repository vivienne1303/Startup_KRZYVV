import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {run,databaseHeaders} from './refresh.mjs';
import {singaporeDay,expiredReason,canonicalUrl,duplicateOf,usableProject,projectListing,makePlan,discoverProjects,confirmedActive} from './refresh.mjs';
const now=new Date('2026-10-12T04:00:00Z');
const row={id:'one',title:'Example',organisation:'Host',is_published:true,status:'published',verification_status:'verified',application_deadline:'2027-01-01',application_url:'https://example.org/item',source_url:'https://example.org/item'};
const p={id:'123',slug:'host/research',display_name:'Research',description:'Help classify research data.',live:true,launch_approved:true,subjects_count:1000,retired_subjects_count:100,links:{active_workflows:['1']}};
test('Singapore date and inclusive date-only deadlines',()=>{assert.equal(singaporeDay(new Date('2026-10-11T17:00:00Z')),'2026-10-12');assert.equal(expiredReason({...row,application_deadline:'2026-10-12'},now),null);assert.ok(expiredReason({...row,application_deadline:'2026-10-11'},now));assert.equal(expiredReason({...row,application_deadline:'2026-10-12T05:00:00Z'},now),null);assert.ok(expiredReason({...row,application_deadline:'2026-10-12T03:00:00Z'},now));});
test('expiry aliases and closed status; null and invalid dates are not guessed',()=>{for(const field of ['deadline','expiry_date','end_date'])assert.ok(expiredReason({...row,[field]:'2026-10-11'},now));assert.ok(expiredReason({...row,discovery:{deadline_status:'closed'}},now));assert.equal(expiredReason({...row,application_deadline:null},now),null);assert.equal(expiredReason({...row,application_deadline:'not a date'},now),null);});
test('deduplication recognises tracking and project classification URLs',()=>{assert.equal(canonicalUrl('https://www.example.org/item/?utm_source=test#top'),'example.org/item');assert.equal(canonicalUrl('https://www.zooniverse.org/projects/host/research/classify'),'zooniverse.org/projects/host/research');assert.ok(duplicateOf([row],{...row,source_url:'https://example.org/item?fbclid=1'}));assert.equal(canonicalUrl('javascript:alert(1)'),null);});
test('only approved live projects with unfinished work qualify',()=>{assert.equal(usableProject(p),true);for(const patch of [{live:false},{launch_approved:false},{subjects_count:100},{links:{active_workflows:[]}},{slug:'../unsafe/name'}])assert.equal(usableProject({...p,...patch}),false);assert.throws(()=>projectListing({...p,live:false}));const item=projectListing(p,now.toISOString());assert.equal(item.application_deadline,null);assert.equal(item.discovery.deadline_status,'rolling');assert.equal(item.discovery.last_checked_at,now.toISOString());assert.ok(item.discovery.evidence_urls.length>=3);});
test('archives retain IDs; expired duplicates are not reinserted',()=>{const old={...row,application_deadline:'2026-10-11'};const plan=makePlan([old],[{...row,application_deadline:'2027-01-01'},projectListing(p)],{now});assert.equal(plan.archive.length,1);assert.equal(plan.duplicates.length,1);assert.equal(plan.insert.length,1);assert.equal(plan.active_before,0);assert.equal(old.status,'published');});
test('target buffer does not count drafts or ineligible entries',()=>{const items=Array.from({length:10},(_,i)=>({...row,title:'New '+i,source_url:'https://example.org/new/'+i,application_url:'https://example.org/new/'+i}));const plan=makePlan([row,{...row,id:'draft',is_published:false},{...row,id:'bad',discovery:{student_eligibility:'ineligible'}}],items,{now,target:3,buffer:2});assert.equal(plan.active_before,1);assert.equal(plan.insert.length,4);assert.equal(plan.projected_active,5);});
test('pagination follows official next-page metadata and deduplicates IDs',async()=>{let calls=0;const all=await discoverProjects(async()=>{calls++;return calls===1?{projects:[p],meta:{projects:{next_page:2}}}:{projects:[p,{...p,id:'124'}],meta:{projects:{next_page:null}}};});assert.equal(calls,2);assert.equal(all.length,2);});
test('invalid provider responses fail instead of implying projects are closed',async()=>{await assert.rejects(()=>discoverProjects(async()=>({projects:'bad'})),/Invalid discovery/);});

test('unknown, upcoming, unpublished and unverified listings never pad active target',()=>{for(const status of ['unknown','upcoming','closed'])assert.equal(confirmedActive({...row,discovery:{deadline_status:status,student_eligibility:'confirmed',application_access:'available'}},now),false);assert.equal(confirmedActive({...row,verification_status:'pending_review'},now),false);assert.equal(confirmedActive(row,now),true);});

test('database authentication supports secret API keys and legacy JWTs',()=>{
  assert.equal(databaseHeaders('sb_secret_example').Authorization,undefined);
  assert.equal(databaseHeaders('legacy-jwt').Authorization,'Bearer legacy-jwt');
});
async function temporaryReport(t) {
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'opportunity-refresh-test-'));
  t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  return dir;
}
test('apply archives, inserts, verifies, and reruns without duplicates',async t=>{
  const output=await temporaryReport(t);
  const rows=[{...row,application_deadline:'2026-10-11'}];
  const database={readAll:async()=>rows.map(r=>({...r})),archive:async r=>{Object.assign(rows.find(x=>x.id===r.id),{status:'expired',is_published:false});},insert:async item=>{const saved={...item,id:'new'};rows.push(saved);return saved;}};
  const options={apply:true,output,now,target:1,buffer:0,database,discover:async()=>[p]};
  const first=await run(options);
  assert.equal(first.archived.length,1);assert.equal(first.added.length,1);assert.equal(first.active_after,1);
  const summary=JSON.parse(await fs.readFile(path.join(output,'summary.json'),'utf8'));
  assert.equal(summary.archived,1);assert.equal(summary.added,1);assert.equal(summary.execution_status,'completed');
  const second=await run(options);assert.equal(second.archived.length,0);assert.equal(second.added.length,0);
});
test('provider outage still archives expired rows and reports failure',async t=>{
  const output=await temporaryReport(t);let archived=false;
  const database={readAll:async()=>archived?[]:[{...row,application_deadline:'2026-10-11'}],archive:async()=>{archived=true;},insert:async()=>assert.fail('No discovery inserts during outage')};
  const result=await run({apply:true,output,now,database,discover:async()=>{throw new Error('Provider unavailable');}});
  assert.equal(archived,true);assert.equal(result.errors.length,1);
  const summary=JSON.parse(await fs.readFile(path.join(output,'summary.json'),'utf8'));assert.equal(summary.execution_status,'failed');assert.equal(summary.archived,1);
});
test('authentication failure saves an explicit failure summary rather than zero counts',async t=>{
  const output=await temporaryReport(t);
  await assert.rejects(run({apply:true,output,now,database:{readAll:async()=>{throw new Error('HTTP 401');}}}),/401/);
  const summary=JSON.parse(await fs.readFile(path.join(output,'summary.json'),'utf8'));assert.equal(summary.execution_status,'failed');assert.equal(summary.counts_verified,false);assert.equal(summary.added,undefined);
});
