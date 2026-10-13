const fs=require('node:fs');
const {supabaseAdmin:client}=require('../backend/config/supabase');
const dir='output/expansion-2026-10-13/';
const file='data/opportunities-expansion-2026-10-13.json';
async function main(){
  const manifest=JSON.parse(fs.readFileSync(file));
  const report=JSON.parse(fs.readFileSync(dir+'applied.json'));
  const locations=new Map();
  for(const file of fs.readdirSync(dir).filter(f=>/^internsg-directory-\d+\.html$/.test(f))){
    const html=fs.readFileSync(dir+file,'utf8');
    for(const m of html.matchAll(/<a\b[^>]*href=["'](https:\/\/www\.internsg\.com\/job\/[^"'#?]+)(?:\?[^"']*)?["'][^>]*>([\s\S]*?)<\/a>/g))locations.set(m[1],m[2].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
  }
  const changes=[];
  for(let i=0;i<manifest.additions.length;i++){
    const item=manifest.additions[i];
    const page=fs.readFileSync(dir+'internsg-'+(i+1)+'.html','utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
    const location=(page.match(/Location Name\s+([\s\S]*?)(?:Company Profile|Address\s)/i)?.[1]||'')+' '+(locations.get(item.source_url)||'');
    if(item.format!=='in_person'||!/work from home/i.test(location))continue;
    const saved=report.added.find(r=>r.title===item.title);
    if(!saved)throw Error('Missing newly added ID');
    const {data,error}=await client.from('opportunities').update({format:'online',mode:'online',travel_required:false}).eq('id',saved.id).eq('format','in_person').select('id');
    if(error)throw error;if(data.length!==1)throw Error('Concurrent change');
    item.format='online';item.travel_required=false;changes.push({id:saved.id,title:item.title,evidence:location});
  }
  fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(dir+'mode-corrections.json',JSON.stringify(changes,null,2)+'\n');console.log(JSON.stringify({corrected:changes.length}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
