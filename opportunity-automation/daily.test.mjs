import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {run,dailyAdditions,eligibleAddition,confirmedActive} from './refresh.mjs';
import {internship,hackathon,sourceClosed,discoverCandidates} from './providers.mjs';
const now=new Date('2026-10-12T04:00:00Z');
const row={id:'one',title:'Example',organisation:'Host',is_published:true,status:'published',verification_status:'verified',application_deadline:'2027-01-01',application_url:'https://example.org/item',source_url:'https://example.org/item',discovery:{deadline_status:'confirmed',student_eligibility:'confirmed',application_access:'available',last_checked_at:now.toISOString(),evidence_urls:['https://example.org/item']}};
async function output(t){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'daily-refresh-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));return dir;}
const newRows=count=>Array.from({length:count},(_,i)=>({...row,id:undefined,title:'Role '+i,source_url:'https://example.org/role/'+i,application_url:'https://example.org/role/'+i}));
function memoryDatabase(rows){return {readAll:async()=>structuredClone(rows),archive:async r=>{Object.assign(rows.find(x=>x.id===r.id),{status:'expired',is_published:false});},insert:async item=>{const saved={...item,id:'saved-'+rows.length,created_at:now.toISOString()};rows.push(saved);return saved;}};}
test('adds 50 above 1000 inventory, resumes a partial day, and stops on repeat',async t=>{
  const dir=await output(t),rows=Array.from({length:1100},(_,i)=>({...row,id:'old-'+i,title:'Old '+i}));
  const database=memoryDatabase(rows),candidates=newRows(70),options={apply:true,output:dir,now,database,discover:async()=>({candidates,closed:[],errors:[]})};
  const first=await run(options);assert.equal(first.added.length,50);assert.equal(first.daily_after,50);assert.equal(first.shortfall,0);
  const second=await run(options);assert.equal(second.added.length,0);assert.equal(second.daily_after,50);
  rows.splice(rows.length-10,10);const resumed=await run(options);assert.equal(resumed.added.length,10);assert.equal(resumed.daily_after,50);
});
test('Singapore quota resets at midnight and counts only genuine published new rows',()=>{
  const item={...row,created_at:'2026-10-11T16:00:00Z',discovery:{...row.discovery,automation_added_day:'2026-10-12'}};
  assert.equal(dailyAdditions([item],now),1);assert.equal(dailyAdditions([item],new Date('2026-10-12T16:00:00Z')),0);
  assert.equal(dailyAdditions([{...item,created_at:'2026-10-10T00:00:00Z'}],now),0);assert.equal(dailyAdditions([{...item,is_published:false}],now),0);
});
test('the following Singapore day adds another 50 distinct records',async t=>{
  const dir=await output(t),rows=[],database=memoryDatabase(rows);
  const first=await run({apply:true,output:dir,now,database,discover:async()=>({candidates:newRows(60),closed:[],errors:[]})});
  assert.equal(first.daily_after,50);
  const tomorrow=new Date('2026-10-12T16:00:01Z'),insert=database.insert;
  database.insert=async item=>{const saved=await insert(item);saved.created_at=tomorrow.toISOString();return saved;};
  const candidates=newRows(120).map(r=>({...r,discovery:{...r.discovery,last_checked_at:tomorrow.toISOString()}}));
  const next=await run({apply:true,output:dir,now:tomorrow,database,discover:async()=>({candidates,closed:[],errors:[]})});
  assert.equal(next.added.length,50);assert.equal(next.daily_after,50);assert.equal(rows.length,100);assert.equal(new Set(rows.map(r=>r.source_url)).size,100);
});
test('insufficient candidates report the shortfall without fabricated entries',async t=>{
  const dir=await output(t),rows=[];
  const result=await run({apply:true,output:dir,now,database:memoryDatabase(rows),discover:async()=>({candidates:newRows(3),errors:[],closed:[]})});
  assert.equal(result.added.length,3);assert.equal(result.shortfall,47);assert.equal(JSON.parse(await fs.readFile(path.join(dir,'summary.json'))).execution_status,'shortfall');
});
test('reserve fills a failed insertion and reports the rejected write',async t=>{
  const dir=await output(t),rows=[],database=memoryDatabase(rows);const insert=database.insert;let attempts=0;
  database.insert=async item=>{if(++attempts===1)throw Error('Rejected write');return insert(item);};
  const result=await run({apply:true,output:dir,now,minimumAdditions:2,database,discover:async()=>({candidates:newRows(3),errors:[],closed:[]})});
  assert.equal(result.added.length,2);assert.equal(result.shortfall,0);assert.equal(result.errors[0].operation,'insert');
});
test('archives before discovery, even when discovery throws completely',async t=>{
  const dir=await output(t),rows=[{...row,application_deadline:'2026-10-11'}],database=memoryDatabase(rows);
  const result=await run({apply:true,output:dir,now,database,discover:async()=>{assert.equal(rows[0].status,'expired');throw Error('Offline');}});
  assert.equal(result.archived.length,1);assert.equal(result.shortfall,50);
});
test('unknown dates are reviewed leads; stale evidence and ineligible entries cannot pad quota',()=>{
  const item={...row,application_deadline:null,verification_status:'pending_review',discovery:{...row.discovery,deadline_status:'unknown'}};
  assert.equal(eligibleAddition(item,now),true);assert.equal(confirmedActive(item,now),false);
  assert.equal(eligibleAddition({...item,discovery:{...item.discovery,last_checked_at:'2026-10-10'}},now),false);
  assert.equal(eligibleAddition({...item,discovery:{...item.discovery,student_eligibility:'ineligible'}},now),false);
});
function jobPage(patch={},suffix=''){
  return '<script type="application/ld+json">'+JSON.stringify({'@type':'JobPosting',title:'Developer Intern',employmentType:'INTERN',datePosted:'2026-10-11',validThrough:'0000-00-00',hiringOrganization:{name:'Employer'},jobLocation:{address:{addressCountry:'SG',streetAddress:'Singapore'}},description:'Students welcome',...patch})+'</script>Location Name Singapore Company Profile Example Job Description Application Instructions Submit your CV. Apply for this position '+suffix;
}
test('INTERNSG handles invalid dates, remote badges, and rejects stale or closed recruitment',()=>{
  const item=internship(jobPage(),'https://www.internsg.com/job/example/','Work from Home',now);
  assert(item);assert.equal(item.application_deadline,null);assert.equal(item.verification_status,'pending_review');assert.equal(item.format,'online');
  assert.equal(internship(jobPage({validThrough:'2026-10-10'}),'https://www.internsg.com/job/example/','',now),null);
  assert.equal(internship(jobPage({datePosted:'2026-08-01'}),'https://www.internsg.com/job/example/','',now),null);
  assert.equal(internship(jobPage({},'This position has been closed'),'https://www.internsg.com/job/example/','',now),null);
  assert.equal(sourceClosed('If applications are closed later, check back.'),false);
});
test('Devpost rejects closed/invitation events and preserves age and country restrictions',()=>{
  const html='<script type="application/ld+json">'+JSON.stringify({'@type':'Event',endDate:'2026-11-01',description:'Build a project'})+'</script>Who can participate Ages 18 and above; excludes some countries View full rules';
  const listing={id:1,title:'Build',url:'https://build.devpost.com/',open_state:'open',organization_name:'Host',displayed_location:{location:'Online'}};
  const item=hackathon(html,listing,now);assert(item);assert.equal(item.eligibility_scope,'unknown');assert.match(item.eligibility,/18/);
  assert.equal(hackathon(html,{...listing,invite_only:true},now),null);assert.equal(hackathon(html,{...listing,open_state:'closed'},now),null);
});
test('missing Zooniverse feed entries and source errors never imply closure',async()=>{
  const rows=[{...row,source_name:'Zooniverse',external_id:'zooniverse:123'}];
  const result=await discoverCandidates({rows,needed:0,now,request:async url=>url.includes('panoptes')?{projects:[],meta:{projects:{next_page:null}}}:assert.fail('No addition discovery needed')});
  assert.equal(result.closed.length,0);assert.equal(result.candidates.length,0);
});
