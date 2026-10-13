const fs=require('node:fs');
const assert=require('node:assert/strict');
const {supabaseAdmin:client}=require('../backend/config/supabase');
const {browse,expired}=require('../js/opportunity-filters');
const dir='output/expansion-2026-10-13/';
async function main() {
  const report=JSON.parse(fs.readFileSync(dir+'applied.json'));
  const baseline=new Set(JSON.parse(fs.readFileSync(dir+'baseline.json')).map(r=>r.id));
  const ids=report.added.map(r=>r.id);
  assert.equal(ids.length,50);assert.equal(report.merged.length,0);assert.equal(new Set(ids).size,50);assert(ids.every(id=>!baseline.has(id)));
  const {data:rows,error}=await client.from('opportunities').select('*').in('id',ids);
  if(error)throw error;
  assert.equal(rows.length,50);assert(rows.every(r=>r.is_published&&r.status==='published'&&!expired(r,'2026-10-13')));
  assert.equal(browse(rows).total,50);
  let next=0;const publicResults=[];
  await Promise.all(Array.from({length:4},async()=>{
    while(next<ids.length) {
      const id=ids[next++];
      const response=await fetch('https://teenlaunch-production.up.railway.app/api/opportunities/'+id,{signal:AbortSignal.timeout(25000)});
      assert.equal(response.status,200,'Public opportunity '+id);
      const body=await response.json();const item=body.opportunity||body;
      assert.equal(item.id,id);publicResults.push(id);
    }
  }));
  const verification={checked_at:new Date().toISOString(),added:rows.length,merged:0,published_and_visible:browse(rows).total,public_api_verified:publicResults.length,
    singapore:rows.filter(r=>r.host_country==='SG').length,online:rows.filter(r=>(r.format||r.mode)==='online').length,hybrid:rows.filter(r=>(r.format||r.mode)==='hybrid').length,
    worldwide:rows.filter(r=>r.eligibility_scope==='worldwide').length,confirmed_active:rows.filter(r=>r.verification_status==='verified').length,deadline_unknown:rows.filter(r=>r.discovery?.deadline_status==='unknown').length,no_past_deadlines:true};
  fs.writeFileSync(dir+'verification.json',JSON.stringify(verification,null,2)+'\n');console.log(JSON.stringify(verification,null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
