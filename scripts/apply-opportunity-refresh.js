// Reviewed content refresh. Dry run by default; --apply publishes the manifest.
const fs = require('node:fs');
const path = require('node:path');
const {supabaseAdmin} = require('../backend/config/supabase');
const normaliser = require('../backend/services/opportunitySources/manualSource');
const Source = require('../backend/services/opportunitySources/apiSourceBase');
const dir = path.join(__dirname, '../output/opportunity-refresh-2026-09-28');
const manifest = JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));
const apply = process.argv.includes('--apply');
const now = new Date().toISOString();
const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const detector = new Source();
async function main() {
  if(today !== manifest.as_of) throw Error('Re-verify this dated manifest before applying it on another day.');
  const current = await supabaseAdmin.from('opportunities').select('*');
  if(current.error) throw current.error;
  const rows = new Map(current.data.map(r=>[r.id,r]));
  const baseline = new Map(JSON.parse(fs.readFileSync(path.join(dir,'before.json'))).map(r=>[r.id,r]));
  const report = {as_of:today,applied:apply,updated:[],inserted:[],duplicates:[],errors:[]};
  if(apply) fs.writeFileSync(path.join(dir,`pre-apply-${Date.now()}.json`),JSON.stringify(current.data,null,2));
  function log() {fs.writeFileSync(path.join(dir,apply?'result.json':'dry-run.json'),JSON.stringify(report,null,2));}
  for(const change of manifest.updates) {
    const row=rows.get(change.id);
    if(!row) {report.errors.push({title:change.title,error:'Existing record missing'});continue;}
    const same=Object.entries(change.payload).every(([k,v])=>JSON.stringify(row[k])===JSON.stringify(v));
    if(same) continue;
    if(row.updated_at !== baseline.get(row.id)?.updated_at) {report.errors.push({title:change.title,error:'Record changed since review; re-review needed'});continue;}
    if(apply) {
      const payload={...change.payload,last_verified_at:now};
      if(payload.status==='published') Object.assign(payload,{verified_at:now,verified_by:null});
      const result=await supabaseAdmin.from('opportunities').update(payload).eq('id',row.id).eq('updated_at',row.updated_at).select('id,title,status,is_published');
      if(result.error || result.data.length!==1) {report.errors.push({title:change.title,error:result.error?.message||'Concurrent update'});log();continue;}
    }
    report.updated.push({id:row.id,title:change.payload.title||row.title,status:change.payload.status||row.status,reason:change.reason});log();
  }
  for(const item of manifest.additions) {
    if(item.application_deadline && item.application_deadline<today || item.end_date && item.end_date<today) throw Error('Expired addition: '+item.title);
    const payload=normaliser.normaliseOpportunity({...item,source_type:'ai_fetched',source_name:item.organisation,status:'published',is_published:true,last_synced_at:now},null);
    payload.expiry_date=[item.application_deadline,item.expiry_date,item.end_date].filter(Boolean).sort()[0]||null;
    const duplicate=await detector.detectDuplicates(supabaseAdmin,payload);
    if(duplicate.error) {report.errors.push({title:item.title,error:duplicate.error.message});continue;}
    if(duplicate.data.length) {report.duplicates.push({title:item.title,ids:duplicate.data.map(r=>r.id)});continue;}
    if(apply) {
      const result=await supabaseAdmin.from('opportunities').insert(payload).select('id,title,status,is_published').single();
      if(result.error) {report.errors.push({title:item.title,error:result.error.message});log();continue;}
      if(result.data.status!=='published'||!result.data.is_published) {report.errors.push({title:item.title,error:'Database did not publish the row'});log();continue;}
      report.inserted.push(result.data);
    } else report.inserted.push({title:item.title,status:payload.status});
    log();
  }
  log();
  console.log(JSON.stringify({applied:apply,updated:report.updated.length,expired:report.updated.filter(r=>r.status==='expired').length,inserted:report.inserted.length,duplicates:report.duplicates.length,errors:report.errors},null,2));
  if(report.errors.length) process.exitCode=1;
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
