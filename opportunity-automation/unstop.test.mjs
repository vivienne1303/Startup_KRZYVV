import test from 'node:test';
import assert from 'node:assert/strict';
import {competition} from './providers.mjs';
const now=new Date('2026-10-26T04:00:00Z');
const base={id:123,title:'Online challenge',organisation:{name:'Host'},visibility:'public',regn_open:1,region:'online',public_url:'competitions/challenge-123',details:'Students may participate. Country restrictions apply.',filters:[{type:'eligible',name:'Undergraduate'}],regnRequirements:{reg_status:'STARTED',end_regn_dt:'2026-11-10T12:00:00Z',min_team_size:1,max_team_size:3},rounds:[{details:[{end_date:'2026-11-01T12:00:00Z'}]}]};
test('Unstop preserves restrictions and uses earliest required round deadline',()=>{const item=competition(base,now);assert(item);assert.equal(item.discovery.application_closes_at,'2026-11-01T12:00:00.000Z');assert.equal(item.eligibility_scope,'unknown');assert.match(item.eligibility,/Country restrictions/);assert.equal(item.verification_status,'pending_review');});
test('Unstop rejects closed, paid, restricted, physical and expired required rounds',()=>{for(const patch of [{regn_open:0},{paid:true},{region:'offline'},{details:'Offline final required'},{regnRequirements:{...base.regnRequirements,reg_restricted:true}},{rounds:[{details:[{end_date:'2026-10-25T00:00:00Z'}]}]},{regnRequirements:{...base.regnRequirements,end_regn_dt:'bad-date'}}])assert.equal(competition({...base,...patch},now),null);});

test('Unstop fallback paginates, checks details and excludes database duplicates',async()=>{
  const {discoverCandidates}=await import('./providers.mjs');
  const pages=[];
  const result=await discoverCandidates({rows:[{title:'Existing',organisation:'Host',source_url:'https://unstop.com/competitions/challenge-1',external_id:'unstop:1'}],needed:2,now,request:async url=>{
    if(url.includes('panoptes'))return {projects:[],meta:{projects:{next_page:null}}};
    if(url.includes('devpost.com/api'))return {hackathons:[]};
    if(url.includes('/opportunity/search')){const page=Number(new URL(url).searchParams.get('page'));pages.push(page);return {data:{data:[{...base,id:page,public_url:'competitions/challenge-'+page}]}};}
    if(url.includes('/competition/')){const id=Number(url.split('/').pop());return {data:{competition:{...base,id,title:'Challenge '+id,public_url:'competitions/challenge-'+id}}};}
    assert.fail('Unexpected request '+url);
  }});
  assert.deepEqual(pages,[1,2,3]);assert.equal(result.candidates.length,2);assert.equal(result.stats.unstop_candidates,2);assert.equal(result.errors.length,0);
});


test('INTERNSG stops scheduling checks after a rate limit without closing listings',async()=>{
 const {discoverCandidates}=await import('./providers.mjs');let calls=0;
 const rows=Array.from({length:20},(_,i)=>({id:String(i),title:'Intern '+i,organisation:'Host',source_name:'INTERNSG',source_url:'https://www.internsg.com/job/'+i,is_published:true,status:'published'}));
 const result=await discoverCandidates({rows,needed:0,now,request:async url=>{if(url.includes('panoptes'))return {projects:[],meta:{projects:{next_page:null}}};calls++;throw Error('HTTP 429 from www.internsg.com');}});
 assert(calls<=4);assert.equal(result.closed.length,0);assert.equal(result.stats.internsg_rate_limited,true);assert(result.stats.internsg_checks_skipped>=16);
});
