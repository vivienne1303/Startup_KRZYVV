import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import dotenv from 'dotenv';
import {jsonRequest,databaseHeaders,duplicateOf,expiredReason,singaporeDay} from '../opportunity-automation/refresh.mjs';
dotenv.config({quiet:true});
const require=createRequire(import.meta.url),{prepare}=require('./import-ofy-discovery');
const manifest=JSON.parse(await fs.readFile('data/opportunities-expansion-2026-10-20.json','utf8'));
const dir='output/expansion-2026-10-20',apply=process.argv.includes('--apply');
await fs.mkdir(dir,{recursive:true});
assert.equal(singaporeDay(),manifest.as_of,'Research must be rechecked on a later day');
assert.equal(manifest.additions.length,50);
const base=process.env.SUPABASE_URL+'/rest/v1/opportunities',headers=databaseHeaders(process.env.SUPABASE_SECRET_KEY);
async function readAll(){const rows=[];for(let offset=0;;offset+=500){const part=await jsonRequest(base+'?select=*&order=id&limit=500&offset='+offset,{headers});assert(Array.isArray(part));rows.push(...part);if(part.length<500)return rows;}}
const rows=await readAll(),known=[...rows],pending=[],existing=[];
for(const item of manifest.additions){
 assert(!expiredReason(item));const duplicate=duplicateOf(known,item);
 if(duplicate){assert.equal(duplicate.discovery?.research_batch,'expansion-2026-10-20','Pre-existing duplicate: '+item.title);existing.push(duplicate);continue;}
 const payload=prepare({...item,discovery_sources:item.discovery.evidence_urls,last_synced_at:item.discovery.last_checked_at});
 pending.push(payload);known.push(payload);
}
console.log(JSON.stringify({apply,pending:pending.length,already_added:existing.length}));
if(!apply)process.exit(0);
await fs.writeFile(dir+'/before-import.json',JSON.stringify(rows));
const receipt={as_of:manifest.as_of,applied:true,added:[],previously_added:existing.map(r=>({id:r.id,title:r.title})),errors:[]};
const save=()=>fs.writeFile(dir+'/applied.json',JSON.stringify(receipt,null,2)+'\n');
for(const payload of pending){
 try{const saved=await jsonRequest(base,{method:'POST',headers,body:JSON.stringify(payload)});assert.equal(saved.length,1);assert(saved[0].is_published&&saved[0].status==='published');receipt.added.push({id:saved[0].id,title:saved[0].title});}
 catch(e){receipt.errors.push({title:payload.title,error:e.message});await save();throw e;}
 await save();
}
const final=await readAll(),batch=final.filter(r=>r.discovery?.research_batch==='expansion-2026-10-20');
assert.equal(batch.length,50);assert.equal(new Set(batch.map(r=>r.id)).size,50);
assert(batch.every(r=>r.is_published&&r.status==='published'&&!expiredReason(r)));
let next=0;const visible=[];
await Promise.all(Array.from({length:4},async()=>{while(next<batch.length){const row=batch[next++];const body=await jsonRequest('https://teenlaunch-production.up.railway.app/api/opportunities/'+row.id);const item=body.opportunity||body;assert.equal(item.id,row.id);visible.push(row.id);}}));
const verification={checked_at:new Date().toISOString(),added_this_run:receipt.added.length,batch_total:batch.length,public_api_verified:visible.length,singapore:batch.filter(r=>r.host_country==='SG').length,online:batch.filter(r=>r.format==='online').length,worldwide:batch.filter(r=>r.eligibility_scope==='worldwide').length,unknown_deadlines:batch.filter(r=>r.discovery.deadline_status==='unknown').length,errors:receipt.errors.length};
await fs.writeFile(dir+'/verification.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify(verification,null,2));
