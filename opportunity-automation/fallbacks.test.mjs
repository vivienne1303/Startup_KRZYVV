import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {studentJob,fallbackBatches} from './fallbacks.mjs';
import {run} from './refresh.mjs';
const now=new Date('2026-10-26T04:00:00Z');
const job={title:'Design Intern',companyName:'Host',employmentType:'Intern',description:'Students welcome. Must reside in Singapore.',pubDate:+now/1000,expiryDate:+now/1000+864000,locationRestrictions:['Singapore'],timezoneRestrictions:[8],guid:'https://himalayas.app/companies/host/jobs/intern',applicationLink:'https://himalayas.app/companies/host/jobs/intern?utm_source=api'};
test('student feed retains application attribution, country and timezone restrictions',()=>{
 const item=studentJob(job,'Himalayas',now);assert(item);assert.equal(item.application_url,job.applicationLink);assert.match(item.eligibility,/Singapore/);assert.match(item.eligibility,/\[8\]/);assert.equal(item.eligibility_scope,'unknown');assert.equal(item.application_deadline,null);assert.equal(item.verification_status,'pending_review');
 for(const patch of [{title:'Senior Engineer',employmentType:'Full Time'},{expiryDate:0},{pubDate:0},{description:'This position is closed.'},{guid:'javascript:bad'}])assert.equal(studentJob({...job,...patch},'Himalayas',now),null);
});
test('fallback paginates past duplicates and advances after source failure',async()=>{
 const pages=[];const batches=[];
 for await(const batch of fallbackBatches({rows:[studentJob(job,'Himalayas',now)],now,request:async url=>{
   const u=new URL(url),page=Number(u.searchParams.get('page'));pages.push(url);
   if(u.hostname==='himalayas.app'){
     if(u.searchParams.get('employment_type')==='Volunteer')throw Error('HTTP 429');
     return {jobs:page===1?[job]:page===2?[{...job,title:'Another Intern',guid:job.guid+'-2',applicationLink:job.guid+'-2?utm_source=api'}]:[]};
   }
   if(u.hostname==='www.arbeitnow.com')return {data:[{title:'Marketing Intern',company_name:'Other',description:'Student internship',created_at:+now/1000,slug:'intern',url:'https://www.arbeitnow.com/jobs/intern',location:'Berlin',remote:false}],links:{next:null}};
   if(u.hostname==='www.arbeitnow.co.uk')return {data:[]};
   return {data:{data:[]}};
 }}))batches.push(batch);
 assert.equal(batches.flatMap(x=>x.candidates).length,2);assert(batches.some(x=>x.errors.some(e=>/429/.test(e.error))));assert(pages.some(x=>x.includes('page=3')));assert(pages.some(x=>x.includes('arbeitnow.com')));
});
async function setup(t){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'fallback-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const rows=[];return {dir,rows,db:{readAll:async()=>structuredClone(rows),archive:async()=>{},insert:async item=>{const row={...item,id:String(rows.length),created_at:now.toISOString()};rows.push(row);return row;}}};}
const candidate=i=>({...studentJob(job,'Himalayas',now),title:'Intern '+i,source_url:'https://example.org/'+i,application_url:'https://example.org/'+i,external_id:'item:'+i});
test('actual insert shortfall consumes more sources and stops pulling at quota',async t=>{
 const {dir,rows,db}=await setup(t);const insert=db.insert;let failed=false,pulled=0;
 db.insert=async item=>{if(!failed){failed=true;throw Error('Rejected first insert');}return insert(item);};
 const result=await run({apply:true,output:dir,now,minimumAdditions:3,reserve:0,database:db,discover:async()=>({candidates:[candidate(0),candidate(1)],errors:[]}),fallback:async function*(){pulled++;yield {candidates:[candidate(2)],errors:[]};pulled++;yield {candidates:[candidate(3),candidate(4)],errors:[]};assert.fail('Quota fulfilled; later source must not run');}});
 assert.equal(rows.length,3);assert.equal(result.daily_after,3);assert.equal(result.shortfall,0);assert.equal(pulled,2);assert.equal(result.errors[0].operation,'insert');
});
test('source outage recovered through fallback is a warning; repeat run adds nothing',async t=>{
 const {dir,db}=await setup(t);let calls=0;
 const options={apply:true,output:dir,now,minimumAdditions:2,database:db,discover:async()=>({candidates:[],errors:[{operation:'discovery',provider:'Broken',error:'Unavailable'}]}),fallback:async function*(){calls++;yield {candidates:[candidate(1),candidate(2)],errors:[]};}};
 const first=await run(options);assert.equal(first.daily_after,2);assert.equal(first.errors.length,0);assert.equal(first.warnings.length,1);
 const second=await run(options);assert.equal(second.added.length,0);assert.equal(calls,1);
});
test('exhausted sources report honest shortfall instead of looping or padding',async t=>{
 const {dir,db}=await setup(t);const result=await run({apply:true,output:dir,now,minimumAdditions:2,database:db,discover:async()=>[],fallback:async function*(){yield {candidates:[candidate(1)],errors:[]};}});
 assert.equal(result.daily_after,1);assert.equal(result.shortfall,1);
});
test('read-only mode previews fallback supply without inserting',async t=>{
 const {dir,db}=await setup(t);db.insert=async()=>assert.fail('Read-only must not write');
 const result=await run({apply:false,output:dir,now,minimumAdditions:2,reserve:0,database:db,discover:async()=>[],fallback:async function*(){yield {candidates:[candidate(1)],errors:[]};yield {candidates:[candidate(2)],errors:[]};assert.fail('Enough preview candidates');}});
 assert.equal(result.insert.length,2);assert.equal(result.shortfall,0);assert.equal(result.added.length,0);assert.equal(result.fallback_pages.length,2);
});
