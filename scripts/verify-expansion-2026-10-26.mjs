import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import {jsonRequest,databaseHeaders,duplicateOf,expiredReason} from '../opportunity-automation/refresh.mjs';
dotenv.config({quiet:true});
const dir='output/expansion-2026-10-26';
const report=JSON.parse(await fs.readFile('opportunity-automation/reports/2026-10-26/applied.json','utf8'));
assert.equal(report.added.length,50);
const baseline=JSON.parse(await fs.readFile(dir+'/baseline.json','utf8'));
const rows=[];for(let offset=0;;offset+=500){const part=await jsonRequest(process.env.SUPABASE_URL+'/rest/v1/opportunities?select=*&order=id&limit=500&offset='+offset,{headers:databaseHeaders(process.env.SUPABASE_SECRET_KEY)});rows.push(...part);if(part.length<500)break;}
const added=report.added.map(x=>rows.find(r=>r.id===x.id));
assert(added.every(x=>x&&x.is_published&&x.status==='published'&&!expiredReason(x)));
const known=[...baseline];for(const r of added){assert(!duplicateOf(known,r),'Duplicate '+r.title);known.push(r);}
let next=0;const visible=[];await Promise.all(Array.from({length:4},async()=>{while(next<added.length){const r=added[next++];const body=await jsonRequest('https://teenlaunch-production.up.railway.app/api/opportunities/'+r.id);assert.equal((body.opportunity||body).id,r.id);visible.push(r.id);}}));
const summary={checked_at:new Date().toISOString(),added:added.length,public_api_verified:visible.length,duplicates:0,online:added.filter(r=>r.format==='online').length,singapore:added.filter(r=>r.host_country==='SG').length,sources:[...new Set(added.map(r=>r.source_name))],archived:report.archived.length,errors:report.errors,warnings:report.warnings.length};
await fs.writeFile(dir+'/verification.json',JSON.stringify(summary,null,2));
await fs.writeFile('data/opportunities-expansion-2026-10-26.json',JSON.stringify({as_of:'2026-10-26',additions:added.map(({id,created_at,updated_at,...r})=>r)},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
