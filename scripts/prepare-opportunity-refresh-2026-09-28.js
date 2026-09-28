const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '../output/opportunity-refresh-2026-09-28');
const before = JSON.parse(fs.readFileSync(path.join(dir, 'before.json')));
const research = JSON.parse(fs.readFileSync(path.join(dir, 'nyc-research.json')));
const evidence = JSON.parse(fs.readFileSync(path.join(dir, 'youth-corps-evidence.json')));
const today = '2026-09-28';
const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
function date(text) {
  const m = String(text).match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  const month = months.indexOf(m[2].slice(0,3).toLowerCase()) + 1;
  if (!month) throw Error('Unknown month: ' + text);
  return `${m[3]}-${String(month).padStart(2,'0')}-${m[1].padStart(2,'0')}`;
}
const updates = new Map();
function patch(n, payload, reason) {
  const row = before[n];
  const old = updates.get(row.id);
  updates.set(row.id, {id:row.id, title:row.title, source_url:row.source_url, payload:{...old?.payload,...payload}, reason});
}
function expire(n, payload, reason) { patch(n, {...payload,status:'expired',is_published:false,verification_status:'expired'}, reason); }
function deadline(d) {return {application_deadline:d,deadline:d,expiry_date:d};}
for (const x of evidence) {
  const closing = x.data.code.map(r=>date(r.closingdate)).filter(Boolean).sort().at(-1);
  const [start,end] = x.data.code[0].schedule.split(' - ').map(date);
  if (closing < today) expire(x.n, {...deadline(closing),start_date:start,end_date:end}, 'All roles closed; verified against the official public roles endpoint.');
}
for (const [n,row] of before.entries()) {
  if(row.is_published && [row.application_deadline,row.deadline,row.expiry_date,row.end_date].some(d=>d && d < today)) {
    expire(n, {}, 'Recorded application deadline or event end is in the past.');
  }
}
for(const [n,payload,reason] of [
  [11,{},'Official Devpost page explicitly says the hackathon has ended.'],
  [18,{},'Official Devpost page explicitly says the hackathon has ended.'],
  [16,{start_date:'2026-09-12',end_date:'2026-09-13'},'Official page metadata confirms 12–13 September 2026.'],
  [34,{...deadline('2026-09-01'),start_date:'2026-09-18',end_date:'2026-09-20'},'Official HopHacks application deadline and event dates have passed.'],
  [45,deadline('2026-09-25'),'Official film invitational final registration closed 25 September.'],
  [52,deadline('2026-09-22'),'Official NRF 2026–27 submission deadline was 22 September.'],
  [54,{end_date:'2026-09-01'},'National Robotics Competition 2026 ended with the 1 September awards.'],
  [20,deadline('2026-08-07'),'Youth Corps official page says both current internship cycles are closed.'],
]) expire(n,payload,reason);
patch(9,{...deadline('2026-10-18'),status:'published',is_published:true,verification_status:'verified',description:'Submit a recorded speech on the theme The Singapore We Want. The extended deadline is 30 September 2026 for all levels except Primary 6; Primary 6 students may submit until 18 October 2026.',eligibility:'Primary to university students. After 30 September, only Primary 6 submissions remain eligible.'},'Organiser extended deadlines; restored with the later Primary 6 deadline and explicit category restrictions.');
patch(24,{title:'SCUDEM XI 2026 — Differential Equations Modeling',...deadline('2026-10-16'),start_date:'2026-10-16',end_date:'2026-11-10',category:'Competitions',description:'Work in a team of three students with a coach to model a real problem using differential equations and present the result in a ten-minute video. Register by 16 October; final submissions are due 10 November 2026.'},'Official COMAP schedule.');
patch(25,{title:'AYDA Awards 2026/2027 — Singapore',...deadline('2026-12-31')},'Official Nippon Paint submission date.');
patch(47,{...deadline('2026-09-30'),end_date:'2026-11-20',description:'University teams analyse economic conditions and present a monetary policy recommendation. Registration closes 30 September 2026 at 5pm EDT; videos are due 5 October.',eligibility:'Eligible US undergraduate college teams; check the Federal Reserve rules.'},'Official Federal Reserve registration schedule.');
patch(48,{title:'STN Challenge 2026',...deadline('2026-11-11'),start_date:'2026-11-12',end_date:'2026-11-17'},'Official Student Television Network schedule.');
patch(53,{title:'S. Mercadante International Clarinet Competition 2026 — Young and Junior Soloists',...deadline('2026-10-03'),start_date:'2026-10-15',end_date:'2026-10-16',maximum_age:20,age_max:20,location:'Noci, Italy',description:'Compete in the young soloist (up to 15) or junior soloist (up to 20) clarinet categories in Noci. These categories accept applications until 3 October 2026. The senior category has already closed.'},'Official category-specific deadlines.');
patch(37,{description:'Teams of two to four high school students develop an original business or social venture concept. The 2027 submission window is open; entries close 14 January 2027 at 5pm EST.',eligibility:'High school students aged 14–18 at the deadline; each team needs an adult advisor aged at least 21.'},'Official 2027 submission window is now open.');
patch(49,{category:'Competitions'},'Writing competition was incorrectly categorised as entrepreneurship.');

const summaries = [
  [/^Active Mind/, 'Engage seniors at Acacia Home through games, movement and creative activities, with patient support for residents who need additional encouragement.'],
  [/^Ask-Me/, 'Explore nature and corporate sustainability careers through a question-and-answer session with people working in the sector.'],
  [/^Bedside/, 'Keep hospital patients company through conversation and simple activities. Volunteers must meet the listed COVID-19, MMR, Tdap and chickenpox vaccination requirements and attend at least six sessions.'],
  [/^Bridging/, 'Spend time with seniors at Our Tampines Hub through walks, tabletop games and conversation.'],
  [/^Buddy on Deck/, 'Accompany seniors on a Singapore Navy Museum visit with gallery activities and crafts. Transport is provided from the organiser’s reporting point.'],
  [/^Click/, 'Practise beginner photography with Nikon School and meet the Youth Corps Media Team through hands-on activities.'],
  [/^Community Connectors/, 'Support an Active Ageing Centre with outreach to older residents and help connect seniors with community support.'],
  [/^Companions/, 'Offer companionship and friendly conversation to seniors at NKF Yishun Community Hospital.'],
  [/^FlowerFolks/, 'Accompany seniors on a Flower Dome outing at Gardens by the Bay and help them enjoy activities and conversation. Dates may include orientation before the outing.'],
  [/^Gen Gala/, 'Support an intergenerational arts and fashion programme where volunteers connect with older adults through shared memories and creative activities.'],
  [/^Happy Hour/, 'Befriend nursing home residents through games, karaoke, conversation and outings. Activities may include non-alcoholic beer and card or mahjong games without gambling.'],
  [/^Health in Check.*Facilitator/, 'Help prepare SGH volunteers through online breakout-room facilitation and practice for community health screening events.'],
  [/^Health in Check/, 'Support a community screening event through ushering, station assistance and trained questionnaire activities with seniors.'],
  [/^Healthcare Youth/, 'Develop leadership skills and healthcare knowledge through a twelve-month youth programme. No prior experience is required. Apply through the designated programme form; the source schedule shows initial sessions only.'],
  [/^Hearts Connect/, 'Befriend residents at the Society for the Aged Sick through tabletop activities and conversation.'],
  [/^Impact, IRL/, 'Meet youth changemakers, community organisations and partners at a day of talks and activities focused on turning ideas into community action. Non-Singpass users can request an alternative registration link from the organiser.'],
  [/^Intergen Evening/, 'Join nursing home residents for games, karaoke, crafts and conversation. Refreshments may include non-alcoholic beer.'],
  [/^Intergen Kopi/, 'Spend time with nursing home residents through crafts, karaoke and relaxed conversation over kopi.'],
  [/^Kampung Birthday/, 'Help older adults celebrate with music, games, conversation and festive activities at their community centre.'],
  [/^Only Mr/, 'Support a social activity group for older men and caregivers through games, movement and friendly interaction.'],
  [/^PICS/, 'Volunteer alongside healthcare professionals to support seniors returning home after hospital stays, through companionship and supervised community care activities. Check the full training and commitment requirements.'],
  [/^Play For All/, 'Engage APSN trainees with special needs through inclusive activities and games. Training and activity materials are provided.'],
  [/^Re:ground.*Scrapbook/, 'Create a personal scrapbook in a guided evening of reflection and creativity. This is a participation event; it does not award volunteering service hours.'],
  [/^Re:ground/, 'Join informal creative and social activities at The Red Box to unwind and connect with peers. This is a participation event; it does not award volunteering service hours.'],
  [/^Silver Crafts/, 'Make art and build friendly connections with seniors at Ren Ci nursing home in Bukit Batok.'],
  [/^SpecialHearts/, 'Engage female residents with special needs at THK Sembawang through inclusive games, activities and exercises.'],
  [/^Study Buddy/, 'Support primary pupils with school subjects and social activities at a regular tutoring programme in Bukit Batok. Check the session schedule and required commitment.'],
  [/^Visually/, 'Accompany people with visual impairments on a Gardens by the Bay sensory tour. Training covers guiding techniques and befriending.'],
  [/^Youth Digital/, 'Help seniors learn to use social media and understand digital trends through a series of practical community sessions.'],
];
const skipped = [];
const additions = [];
const seen = new Set();
for(const [i,x] of research.entries()) {
  const [start,end] = x.date.split(' - ').map(date);
  const closing = x.roles.map(r=>date(r.closingdate)).filter(Boolean).sort().at(-1);
  const key = x.label.toLowerCase().replace(/[^a-z0-9]/g,'');
  let reason = !closing || !start || !end ? 'No verifiable individual schedule/deadline' : closing < today || end < today ? 'Already closed or completed' : seen.has(key) ? 'Duplicate programme and date' : i===8 ? 'Already underway; closing date conflicts with programme end; late entry unconfirmed' : null;
  const summary = summaries.find(([re])=>re.test(x.label))?.[1];
  if (!summary) reason ||= 'Needs individual review';
  if(reason) {skipped.push({title:x.label,url:x.url,reason});continue;}
  seen.add(key);
  const ages = x.description.match(/aged\s+(\d+)\s*(?:to|[-–])\s*(\d+)/i);
  const participant = x.roles.every(r=>r.label==='Participant');
  const category = participant ? (/Ask-Me/.test(x.label) ? 'Career Exploration' : 'Workshops') : 'Volunteering';
  const organisation = /Care Corner/.test(x.description) ? 'Care Corner Singapore' : /Health in Check/.test(x.label) ? 'Singapore General Hospital and Youth Corps Singapore' : /PICS/.test(x.label) ? 'TriGen and Tan Tock Seng Hospital' : 'Youth Corps Singapore';
  additions.push({title:x.label.trim(),organisation,description:summary,category,location:`${x.location}, Singapore`,mode:/online/i.test(x.deliverymode)?'online':/hybrid/i.test(x.deliverymode)?'hybrid':'in_person',start_date:start,end_date:end,application_deadline:closing,minimum_age:ages?Number(ages[1]):null,maximum_age:ages?Number(ages[2]):null,eligibility:ages?`Ages ${ages[1]}–${ages[2]}. Check the organiser’s role, training and attendance requirements.`:'Check the organiser’s role, training and attendance requirements.',skills:participant?['Communication','Personal development']:['Community service','Communication','Teamwork'],source_url:x.url,application_url:/^PICS/.test(x.label)?'https://for.sg/trigen-ttsh-pics':x.url,external_id:x.id});
  if (/^Healthcare Youth/.test(x.label)) Object.assign(additions.at(-1),{application_url:'https://go.gov.sg/hylp-c2',end_date:null});
  if (/^Impact, IRL/.test(x.label)) Object.assign(additions.at(-1),{organisation:'National Youth Council and National Volunteer and Philanthropy Centre',location:'Marina Bay Sands Expo & Convention Centre, Singapore',category:'Community Events'});
}
function add(title,organisation,category,url,description,extra={}) {
  additions.push({title,organisation,category,source_url:url,application_url:url,description,location:'Singapore',...extra});
}
add('National Youth Entrepreneurship Awards 2026','ACE.SG','Youth Entrepreneurship','https://www.nyeawards.com/','Recognition for young founders representing incorporated businesses. Complete the nomination form and email it as instructed by the organiser by 16 October 2026 at 23:59.',{application_deadline:'2026-10-16',minimum_age:17,maximum_age:35,eligibility:'Ages 17–35 in 2026; must represent an incorporated business. Previous winners are not eligible.'});
add('Case Writing Competition 2026/27','Lee Kuan Yew School of Public Policy, NUS','Competitions','https://lkyspp.nus.edu.sg/research/case-insights-unit/case-writing-competition/case-writing-competition-2027','Write a public policy case on a contemporary Asian issue. Registration closes 9 October 2026; the completed case is due 15 January 2027.',{application_deadline:'2026-10-09',end_date:'2027-01-15',education_levels:['University'],eligibility:'Students in degree programmes at Singapore public universities; enter alone or in a team of up to three from the same institution.'});
add('RSIS Policy Pitch Competition 2026','S. Rajaratnam School of International Studies, NTU','Competitions','https://rsis.edu.sg/gpo/gpo-events-calendar/the-2026-rsis-policy-pitch-competition-for-students-in-asean-universities/','Develop a written and video policy pitch addressing a regional development, resilience or international affairs challenge. Submit by 20 November 2026 at 23:59 Singapore time.',{application_deadline:'2026-11-20',mode:'online',location:'ASEAN',education_levels:['University'],eligibility:'Undergraduates at universities in any of the eleven ASEAN countries, regardless of nationality; individuals or teams of up to three.'});
add('Make The Change Youth Competition 2026','Make The Change','Competitions','https://www.makethechange.sg/youthcompetition2025','Create a submission exploring how to balance screen time. Follow the brief and submission format for your school category.',{application_deadline:'2026-09-30',education_levels:['Primary School','Secondary School','Junior College','ITE','Polytechnic']});
add('GovTech Internship — January to April 2027 Starts','Government Technology Agency of Singapore','Internships','https://internships.tech.gov.sg/apply','Contribute to public technology projects in a full-time internship of at least twelve weeks. Apply by 30 September 2026 at 12 noon; start dates fall between January and April 2027.',{application_deadline:'2026-09-30',eligibility:'Singapore citizens or permanent residents; polytechnic students, undergraduates, or A-Level/diploma graduates awaiting university. Minimum twelve-week full-time commitment.',education_levels:['Polytechnic','University','Junior College']});
add('SID Internship — January to March 2027 Intake','Security and Intelligence Division','Internships','https://www.sid.gov.sg/careers/internships-scholarships/internships/','Research geopolitical issues with mentorship from SID officers during an eight-week internship. Applications for the January–March 2027 intake close 31 October 2026.',{application_deadline:'2026-10-31',eligibility:'Singapore citizens: eligible JC2 students, final-year polytechnic students, NSFs awaiting university, and undergraduates from Year 1 to penultimate year. Full eight-week commitment required.'});
add('CAAS Internships — September–October Application Window','Civil Aviation Authority of Singapore','Internships','https://www.caas.gov.sg/careers/scholarships-and-early-career-programmes/internships/','Explore aviation policy, safety, technology or operations through an internship. CAAS lists a September–October application window; consult Careers@Gov for current roles and each role’s exact closing date.',{eligibility:'Singapore citizens or permanent residents in tertiary education, from any discipline.',education_levels:['Polytechnic','University'],expiry_date:'2026-10-31'});
add('Own The Mic — October 2026 Workshop','*SCAPE','Workshops','https://www.scape.sg/whats-on/ownthemic/','Practise emceeing, improvisation and hosting scripts with Joshua Simon over two workshop days. Selected participants must attend both days; prior hosting experience is required.',{application_deadline:'2026-10-10',start_date:'2026-10-24',end_date:'2026-10-25',minimum_age:15,maximum_age:35,mode:'in_person',location:'*SCAPE The TreeTop, Singapore',eligibility:'Ages 15–35 with prior hosting experience. Twenty participants selected; both days required.'});
add('*SCAPE FREQUENCY — Youth Project Open Call','*SCAPE','Grants','https://www.scape.sg/whats-on/scape-frequency/','Propose a series of public arts, culture or community activities for the November–December holidays. Selected projects receive venue support and may receive up to S$1,000 in project funding.',{application_deadline:'2026-10-04',minimum_age:15,maximum_age:35,eligibility:'Singapore-based youth aged 15–35. Individuals or groups; proposals need at least three activations.'});
add('Singapore Hospitality & Tourism Conference 2026','Singapore Tourism Board and partner institutions','Career Exploration','https://discover.nyc.gov.sg/events/singapore-hospitality-tourism-conference-2026-mu0x8rwb','Meet tourism and hospitality employers at a career fair and explore student innovation through a hackathon showcase. The youth visit runs from 10:45am to 3pm.',{start_date:'2026-10-23',end_date:'2026-10-23',mode:'in_person',location:'Begonia Ballroom, Sands Expo & Convention Centre, Singapore'});
add('SLEUTH MODE — Build AI Agents to Crack a Fraud Case','Digital Defence Alliance Singapore and CWG','Hackathons','https://discover.nyc.gov.sg/events/founder-mode-one-day-one-market-one-entire-company-mtttdlkj','Build AI agents to investigate a simulated fraud case in teams of four. This free full-day event welcomes students and young working adults from any discipline; bring a laptop.',{start_date:'2026-10-17',end_date:'2026-10-17',maximum_age:29,mode:'in_person',location:'Suntec Convention Centre, Singapore',eligibility:'Students and working adults under 30; bring a laptop. Join alone or with a team.'});
add('Look the Part. Own the Interview. — 8 October','Movement Asia','Career Exploration','https://discover.nyc.gov.sg/events/look-the-part-own-the-interview-mtsbacd5','Prepare for interviews through styling and colour analysis, then meet industry mentors for practical advice on presenting your strengths.',{start_date:'2026-10-08',end_date:'2026-10-08',mode:'in_person',location:'National Youth Council, Toa Payoh, Singapore'});
add('WITGRITFIT Career Simulation Workshop — 26 October','Avid Adventures','Career Exploration','https://discover.nyc.gov.sg/events/play-your-future-at-the-witgritfit-career-simulation-workshop-26-oct-2026-mtyicdhn','Explore career choices through an interactive simulation and create a personal career canvas. The free online workshop runs from 1pm to 4pm.',{start_date:'2026-10-26',end_date:'2026-10-26',mode:'online'});
add('Intergenerational Book Club — October Meet Up','Growthbeans','Community Events','https://discover.nyc.gov.sg/events/an-intergenerational-book-club-october-meet-up-msa3noc9','Meet readers across generations to share perspectives and connect through books at a free evening gathering.',{start_date:'2026-10-09',end_date:'2026-10-09',mode:'in_person',location:'Dakota Breeze Residents’ Network, Singapore'});
add('World Evaluation Case Competition 2026','World Evaluation Case Competition','Competitions','https://www.worldcasecomp.net/','Student teams from around the world tackle an evaluation case. Register by 23 October for the competition on 7 November 2026.',{application_deadline:'2026-10-23',start_date:'2026-11-07',end_date:'2026-11-07',location:'Global',eligibility:'Student teams; consult the organiser’s team and coach rules.'});
add('World Young Economist Essay Prize 2026','World Young Economist','Competitions','https://worldyoungeconomist.org/','Write an original evidence-based economics essay in English of up to 2,000 words responding to an official prompt. The first essay is free to enter.',{application_deadline:'2026-10-05',mode:'online',location:'Global',eligibility:'High school students, undergraduates and self-taught peers worldwide; consult the entry rules.'});
add('Zooniverse — Online Research Volunteering','Zooniverse','Volunteering','https://www.zooniverse.org/get-involved/volunteer','Help research teams classify data across science, nature, history and other fields. Choose projects and volunteer flexibly with no minimum time commitment.',{mode:'online',location:'Global',eligibility:'Open participation. Under-16s need parent or guardian sign-off when registering.'});
for(const [area,day,closing] of [['Boon Lay','10','03'],['Clementi','24','17']]) {
  add(`LitterLifters — ${area} (${day} October 2026)`,'Youth Corps Singapore','Volunteering',`https://discover.nyc.gov.sg/civicaction/Join-Opportunities/Individual/2026/10/LitterLifters--${area.replaceAll(' ','-')}-${day}-Oct-2026`,'Help remove litter from public spaces and learn how waste affects local communities. Confirm the reporting point with the organiser before attending.',{application_deadline:`2026-10-${closing}`,start_date:`2026-10-${day}`,end_date:`2026-10-${day}`,minimum_age:15,maximum_age:35,mode:'in_person',location:`${area}, Singapore`});
}

// Missing deadlines stay null: event dates are not invented application deadlines.
for(const x of additions) {
  if(!x.description || !x.source_url || !x.title) throw Error('Incomplete listing');
  if(x.application_deadline && x.application_deadline < today) throw Error('Expired addition: '+x.title);
  if(x.end_date && x.end_date < today) throw Error('Completed addition: '+x.title);
  x.categories = [x.category];
}
const manifest={as_of:today,updates:[...updates.values()],additions,skipped};
for(const update of manifest.updates) if(update.payload.category) update.payload.categories=[update.payload.category];
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({updates:updates.size,expired:[...updates.values()].filter(x=>x.payload.status==='expired').length,additions:additions.length,skipped},null,2));
