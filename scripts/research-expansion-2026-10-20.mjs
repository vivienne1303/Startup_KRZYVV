import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import {jsonRequest,databaseHeaders,duplicateOf,expiredReason} from '../opportunity-automation/refresh.mjs';
import {clean,internship,hackathon} from '../opportunity-automation/providers.mjs';
dotenv.config({quiet:true});
const dir='output/expansion-2026-10-20';await fs.mkdir(dir,{recursive:true});
const now=new Date(),day='2026-10-20';
const rows=[];
for(let offset=0;;offset+=500){const part=await jsonRequest(process.env.SUPABASE_URL+'/rest/v1/opportunities?select=*&order=id&limit=500&offset='+offset,{headers:databaseHeaders(process.env.SUPABASE_SECRET_KEY)});rows.push(...part);if(part.length<500)break;}
await fs.writeFile(dir+'/baseline.json',JSON.stringify(rows));
const pool=[],rejected=[],errors=[];
async function pooled(items,fn){let next=0;await Promise.all(Array.from({length:4},async()=>{while(next<items.length){const x=items[next++];try{await fn(x);}catch(e){errors.push({item:x.id||x.url||x,error:e.message});}}}));}
async function evidence(url,name,text=false){const value=await jsonRequest(url,text?{responseType:'text'}:{});await fs.writeFile(dir+'/'+name,text?value:JSON.stringify(value));return value;}
function add(item){if(item&&!expiredReason(item,now)&&!duplicateOf([...rows,...pool],item))pool.push(item);}
const listings=[];
await pooled(Array.from({length:20},(_,i)=>i+1),async p=>{const d=await evidence('https://unstop.com/api/public/opportunity/search?opportunity=competitions&page='+p,'unstop-page-'+p+'.json');listings.push(...(d.data?.data||[]));});
const candidates=[...new Map(listings.map(x=>[x.id,x])).values()].filter(c=>c.visibility==='public'&&c.regn_open===1&&!c.paid&&c.regnRequirements?.end_regn_dt>=day&&!duplicateOf(rows,{source_url:'https://unstop.com/'+c.public_url}));
candidates.sort((a,b)=>Number(b.region==='online')-Number(a.region==='online'));
console.log(JSON.stringify({baseline:rows.length,unstop_candidates:candidates.length}));
await pooled(candidates.slice(0,160),async listing=>{
 const raw=await evidence('https://unstop.com/api/public/competition/'+listing.id,'unstop-'+listing.id+'.json');
 const c=raw.data?.competition,r=c?.regnRequirements,text=clean(c?.details),url='https://unstop.com/'+(c?.public_url||listing.public_url);
 const reject=reason=>rejected.push({id:listing.id,title:listing.title,reason});
 if(!r||c.visibility!=='public'||c.regn_open!==1||r.reg_status!=='STARTED'||!Number.isFinite(Date.parse(r.end_regn_dt))||Date.parse(r.end_regn_dt)<+now)return reject('Registration not currently open');
 if(c.paid||r.enable_payment||r.reg_restricted||r.same_organisation||r.only_official_domains)return reject('Paid or restricted registration');
 if(/(?:registration|entry|participation) fee[^.!]{0,80}(?:[1-9][0-9]{1,}|paid|payable)|(?:INR|Rs\.?|₹)\s*[1-9][0-9]+/i.test(text))return reject('Fee needs individual review');
 if(/intra.college|intra.university|exclusive(?:ly)? (?:for|to)|only (?:for|to) (?:our|the host)|open only to students of|restricted to students of|internal (?:hackathon|competition|event)/i.test(text))return reject('Institution restriction needs review');
 const groups=(c.filters||[]).filter(f=>f.type==='eligible').map(f=>f.name);
 if(!groups.some(s=>/student|undergraduate|postgraduate|school|everyone|all/i.test(s)))return reject('Student suitability not established');
 let format=c.region==='online'?'online':c.region==='hybrid'?'hybrid':'in_person';
 if(format==='online'&&/offline (?:final|round|presentation)|on.campus|physically present|in.person (?:final|round)/i.test(text))format='hybrid';
 // This batch prioritises remote opportunities; don't infer worldwide eligibility.
 if(format!=='online')return reject('Keep this batch online or Singapore-based');
 const restrictions=[...text.matchAll(/[^.!?]{0,100}(?:eligible|eligibility|open to|must be|only|citizen|resident|India|country|countries|international|worldwide|fee)[^.!?]{0,200}/gi)].map(m=>m[0]).slice(0,12).join('. ');
 const worldwide=/open (?:to|for)[^.!]{0,80}(?:worldwide|international|all countries)|students[^.!]{0,60}(?:across the globe|worldwide)/i.test(text);
 const india=/India.only|Indian (?:students|citizens|nationals)|colleges (?:in|across) India|pan.India/i.test(text);
 const deadline=r.end_regn_dt.slice(0,10),category=c.type==='hackathons'?'Hackathons':'Competitions';
 add({title:clean(c.title)+' — '+clean(c.organisation.name),organisation:clean(c.organisation.name),category,categories:[category],description:text.slice(0,1500),eligibility:groups.join(', ')+'. Team size '+r.min_team_size+'–'+r.max_team_size+'. '+restrictions,
 minimum_age:null,maximum_age:null,education_levels:groups.filter(s=>/undergraduate|postgraduate|school/i.test(s)),application_deadline:deadline,start_date:null,end_date:null,source_url:url,application_url:url,source_name:'Unstop',source_type:'ai_fetched',external_id:'unstop:'+c.id,
 host_country:null,location:'Online; organised by '+clean(c.organisation.name),format,mode:format,eligibility_scope:india?'countries':worldwide?'worldwide':'unknown',eligible_countries:india?['IN']:[],travel_required:false,skills:[],status:'published',is_published:true,verification_status:'pending_review',application_method:'external',internal_application_enabled:false,
 discovery:{deadline_status:'confirmed',application_closes_at:new Date(r.end_regn_dt).toISOString(),student_eligibility:'confirmed',application_access:'login_required',last_checked_at:now.toISOString(),discovered_url:url,official_url:url,evidence_urls:[url,'https://unstop.com/api/public/competition/'+c.id],fees:'Platform marks registration free; check organiser terms.',restrictions:groups.join(', ')+'. '+restrictions,notes:'Registration verified open through the organiser platform. Online participation does not establish worldwide eligibility. Registration closes '+r.end_regn_dt+'.'}});
});
console.log(JSON.stringify({unstop_accepted:pool.length,rejected:rejected.length,errors:errors.length}));
await pooled([1,2,3],async p=>{
 const html=await evidence('https://www.internsg.com/jobs/'+(p===1?'':p+'/'),'internsg-page-'+p+'.html',true);
 const urls=[...new Set([...html.matchAll(/href=["'](https:\/\/www\.internsg\.com\/job\/[^"'#?]+)/g)].map(m=>m[1]))].filter(url=>!duplicateOf(rows,{source_url:url}));
 await pooled(urls,async url=>add(internship(await evidence(url,'internsg-'+new URL(url).pathname.replace(/[^a-z0-9]/gi,'')+'.html',true),url,'',now)));
});
await fs.writeFile(dir+'/reviewed-pool.json',JSON.stringify({as_of:day,additions:pool},null,2));
await fs.writeFile(dir+'/research-report.json',JSON.stringify({rejected,errors},null,2));
console.log(JSON.stringify({accepted:pool.length,local:pool.filter(x=>x.host_country==='SG').length,online:pool.filter(x=>x.format==='online').length,errors:errors.length}));
