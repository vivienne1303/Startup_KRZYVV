import fs from 'node:fs/promises';
import {singaporeDay} from './refresh.mjs';
const filename=new URL('./reports/'+singaporeDay()+'/summary.json',import.meta.url);
let message;
try {
  const s=JSON.parse(await fs.readFile(filename,'utf8'));
  message=`## Opportunity refresh: ${s.as_of}\n\nStatus: **${s.execution_status}**\n\n| Measure | Count |\n|---|---:|\n| Required daily additions | ${s.minimum_additions??50} |\n| Added this run | ${s.added??'Unverified'} |\n| Daily total added by automation | ${s.daily_after??'Unverified'} |\n| Archived this run | ${s.archived??'Unverified'} |\n| Archived today by automation | ${s.daily_archived??'Unverified'} |\n| Daily shortfall | ${s.shortfall??'Unverified'} |\n| Errors | ${s.error_count} |\n| Source-check warnings | ${s.warning_count??0} |\n\nUnknown deadlines and eligibility remain labelled for checking; reviewed leads are not counted as confirmed-active listings.\n`;
} catch(error) {
  if(error.code!=='ENOENT')throw error;
  message='## Opportunity refresh\n\nNo verified summary was produced. Check the failed step; missing results do not imply zero changes.\n';
}
if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,message);
else console.log(message);
