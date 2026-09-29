// Reviewed official-source manifest. Dry run by default; --apply publishes verified entries.
const fs = require('node:fs');
const path = require('node:path');
const { supabaseAdmin } = require('../backend/config/supabase');
const normaliser = require('../backend/services/opportunitySources/manualSource');
const normalizeGeography = require('../backend/utils/opportunityGeography');
const Source = require('../backend/services/opportunitySources/apiSourceBase');
const manifest = require('../data/opportunities-global-2026-09-29.json');
const dir = path.join(__dirname, '../output/global-opportunities-2026-09-29');
const apply = process.argv.includes('--apply');
const day = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
async function main() {
  if (day !== manifest.as_of) throw Error('Re-verify the dated manifest before applying on a later day.');
  fs.mkdirSync(dir,{recursive:true});
  const rows=[];
  for(let offset=0;;offset+=500){const {data,error}=await supabaseAdmin.from('opportunities').select('*').order('id').range(offset,offset+499);if(error)throw error;rows.push(...data);if(data.length<500)break;}
  if(apply) fs.writeFileSync(path.join(dir,`before-${Date.now()}.json`),JSON.stringify(rows,null,2));
  // Verify source and application HTTP endpoints before any writes. Forms requiring
  // login are valid handoffs; no applications or payments are submitted by this script.
  const urls=[...new Set(manifest.additions.flatMap(x=>[x.source_url,x.application_url,x.eligibility_evidence_url].filter(Boolean)))];
  const links=[];
  for(const url of urls){const response=await fetch(url,{signal:AbortSignal.timeout(25000)});links.push({url,status:response.status,final_url:response.url,browser_verified:manifest.browser_verified_links?.[url]||null});await response.body?.cancel();}
  fs.writeFileSync(path.join(dir,'links.json'),JSON.stringify(links,null,2));
  if(links.some(x=>(x.status<200||x.status>=400)&&!x.browser_verified)) throw Error('A new source/application link failed. Review output link audit before publishing.');
  const now=new Date().toISOString(), report={as_of:day,applied:apply,added:[],updated:[],duplicates:[]};
  const save=()=>fs.writeFileSync(path.join(dir,apply?'result.json':'dry-run.json'),JSON.stringify(report,null,2));
  for(const change of manifest.updates){
    const row=rows.find(x=>x.id===change.id);if(!row)throw Error('Update target missing: '+change.id);
    normalizeGeography(change.payload);
    if(apply){const {data,error}=await supabaseAdmin.from('opportunities').update({...change.payload,last_verified_at:now}).eq('id',row.id).eq('updated_at',row.updated_at).select('id');if(error)throw error;if(data.length!==1)throw Error('Concurrent update: '+row.title);}
    report.updated.push({id:row.id,title:row.title});save();
  }
  const detector=new Source();
  for(const entry of manifest.additions){
    const {eligibility_evidence_url,...item}=entry;
    if(item.application_deadline<day) throw Error('Expired addition: '+item.title);
    const payload=normaliser.normaliseOpportunity({...item,host_country:null,eligibility_scope:'worldwide',eligible_countries:[],format:'online',location:'Online',category:'Competitions',categories:['Competitions'],source_type:'ai_fetched',source_name:item.organisation,status:'published',is_published:true,last_synced_at:now,application_method:'external',internal_application_enabled:false},null);
    normalizeGeography(payload);
    const duplicate=await detector.detectDuplicates(supabaseAdmin,payload);if(duplicate.error)throw duplicate.error;
    if(duplicate.data.length){report.duplicates.push({title:item.title,ids:duplicate.data.map(x=>x.id)});save();continue;}
    let result={title:item.title};
    if(apply){const {data,error}=await supabaseAdmin.from('opportunities').insert(payload).select('id,title,status,is_published').single();if(error)throw error;if(!data.is_published||data.status!=='published')throw Error('Not published: '+item.title);result=data;}
    report.added.push(result);save();
  }
  save();console.log(JSON.stringify({applied:apply,added:report.added.length,updated:report.updated.length,duplicates:report.duplicates.length,checked_links:links.length}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
