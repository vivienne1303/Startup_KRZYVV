const fs = require('node:fs');
const dir = 'output/opportunity-refresh-2026-09-29';
const before = require('../' + dir + '/before.json');
const nyc = require('../' + dir + '/nyc-research.json');
const kids = require('../' + dir + '/kidslearn-research.json');
const additions = [];
function add(title, organisation, category, deadline, source, description, eligibility, extras = {}) {
  additions.push({ title, organisation, category, categories: [category], application_deadline: deadline,
    source_url: source, application_url: source, description, eligibility, location: 'Global', format: 'online',
    skills: [], education_levels: [], ...extras });
}
for (const x of kids) {
  const age = Number(x.text.match(/open to volunteers aged (\d+)/)[1]);
  const title = x.text.match(/About (KidsLearn.*?) Join us/)[1];
  if (x.status !== 200 || x.roles.some(r => r.closingdate !== '02 November 2026 23:59')) throw Error('Re-review KidsLearn dates');
  add(title, 'Youth Corps Singapore', 'Volunteering', '2026-11-02', x.url,
    `Help preschool children practise reading and phonics through games and befriending at the ${x.label} placement. The programme schedule runs from 5 December 2026 to 6 March 2027, including preparation; check the required training and session commitment before registering.`,
    `Volunteers aged ${age}-35. Check the organiser's training, attendance and role requirements.`,
    { minimum_age: age, maximum_age: 35, location: x.label + ', Singapore', format: 'in_person', start_date: '2026-12-05', end_date: '2027-03-06', external_id: x.id, skills: ['Education', 'Communication', 'Community service'] });
}
const garden = nyc.find(x => x.label === 'Garden Keepers - Gardens by the Bay (17 Oct 2026)');
add(garden.label, 'Youth Corps Singapore', 'Volunteering', '2026-10-10', garden.url,
  'Maintain outdoor gardens through hands-on gardening on 17 October. This is a fully outdoor, physical activity involving plants, thorns and sap; review the organiser\'s suitability guidance before signing up.',
  'Volunteers aged 15-35 who can participate in outdoor gardening.',
  { minimum_age: 15, maximum_age: 35, location: 'Gardens by the Bay, Singapore', format: 'in_person', start_date: '2026-10-17', end_date: '2026-10-17', skills: ['Sustainability', 'Teamwork'] });
add('Sentinel Programme - 2027 Secondary 3 Intake', 'Digital and Intelligence Service', 'Career Exploration', '2026-10-18',
  'https://www.dis.gov.sg/sentinel-programme/apply/',
  'Apply for the digital and cybersecurity development programme starting 9 January 2027. This open intake is for students in Secondary 2 in 2026; selection testing is scheduled for October. Other 2027 intakes do not open until 19 October.',
  'Singapore citizens and permanent residents in Secondary 2 in 2026. Selection applies.',
  { application_url: 'https://form.gov.sg/69225e62df34994b9f3e73f4', location: 'Singapore', format: 'hybrid', start_date: '2027-01-09', skills: ['Cybersecurity', 'Technology'] });
add('Sentinel Online Taster Workshops - October and November 2026', 'Digital and Intelligence Service', 'Workshops', '2026-11-07',
  'https://go.gov.sg/sentinel-online-taster',
  'Preview the Sentinel Programme online. Secondary 4-5 students: 31 October, 2-4pm, register by 17 October. Primary 6 students: 21 November, 2-4pm, register by 7 November. After 17 October, only the Primary 6 workshop remains open. Workshop registration is separate from programme admission.',
  'Eligible Singapore citizen or permanent resident students in the stated school cohorts.',
  { application_url: 'https://form.gov.sg/6a71987459d81b051e4c706d', location: 'Online, Singapore', start_date: '2026-10-31', end_date: '2026-11-21', skills: ['Cybersecurity', 'Technology'] });
add('Lumiere Junior Scholars Essay Contest 2026', 'Lumiere Education', 'Competitions', '2026-12-20',
  'https://www.lumiere-education.com/junior-scholars-essay-contest',
  'Write an original English argumentative essay of up to 1,000 words. Free registration closes 30 November; late registration costs US$5. Final essays are due 20 December at 11:59pm Eastern Time. Prizes are tuition reductions for Lumiere programmes, subject to admission, rather than cash awards.',
  'Students worldwide in grades 6-8 as of 31 May 2026. An academic referee is required.',
  { application_url: 'https://jsec.lumiere-education.com/registration', skills: ['Writing', 'Research', 'Critical thinking'] });
add('Duke-UNC CLS Essay Competition 2026', 'Duke-UNC China Leadership Summit', 'Competitions', '2026-11-09',
  'https://www.dukechinaessay.com/',
  'Submit an English essay of up to 1,500 words on US-China relations by email using the official instructions. Standard deadline: 15 October, US$15 fee. Late deadline: 9 November, US$30 total fee. Fee waivers are available. Recognition at the 2027 summit does not include travel or accommodation.',
  'High school and undergraduate students worldwide; category-specific prompts apply.',
  { skills: ['Writing', 'Policy', 'Research'] });
add('Planet+ Climate Solutions Challenge 2026-27', 'Planet+', 'Competitions', '2026-10-31',
  'https://www.planetpluschallenge.com/how-it-works',
  'Teams develop climate solutions through online deliverables, with a Singapore final in March 2027. Registration closes 31 October. Phase 1 costs US$1,500 per team; advancing teams pay an additional US$3,000 for Phase 2. Review travel and other costs before applying.',
  'High school and undergraduate students worldwide in teams of 6-10; high school teams need an advisor.',
  { application_url: 'https://42qlxj.share-na2.hsforms.com/2wPQzgMCpSr-O0pyLjAtzcQ', format: 'hybrid', location: 'Online and Singapore', skills: ['Sustainability', 'Research', 'Teamwork'] });
const cobis = 'https://www.cobis.org.uk/student-engagement/student-engagement-calendar/';
const form = 'https://www.cobis.org.uk/fs/form-manager/view/';
add('COBIS Poetry Competition 2026-27', 'COBIS', 'Competitions', '2026-10-09', cobis + 'poetry-competition',
  'Write a poem exploring the theme If Walls Could Speak. School staff submit selected student entries by midday BST on 9 October. Free for eligible COBIS schools; each school may submit one entry per category.',
  'Students at COBIS member and applicant schools worldwide; Key Stage 1-5 categories. School submission required.',
  { application_url: 'https://zealous.co/cobis/opportunity/cobis-poetry-competition-2026-27/', skills: ['Writing', 'Creativity'] });
add('COBIS Generation:Enterprise 2026-27', 'COBIS and Global:Edge', 'Youth Entrepreneurship', '2026-10-16', cobis + 'generationenterprise',
  'Develop and pitch a solution to a school, community or global challenge in teams of 2-6. School staff register by midday UK time on 16 October. Paid school entry: standard category fees are GBP180-300, with small-school discounts; review the fee schedule.',
  'Students aged 9-18 in participating schools. Registration must be made by school staff, not students or parents.',
  { application_url: form + '3adb727a-9741-4dde-917d-46ee48afb49f', minimum_age: 9, maximum_age: 18, skills: ['Entrepreneurship', 'Pitching', 'Teamwork'] });
add('COBIS x DAIGON Esports Competition 2026-27', 'COBIS and DAIGON Esports', 'Competitions', '2026-10-30', cobis + 'cobis-x-daigon-esports-competition',
  'Represent your school in Minecraft Capture the Flag or Rocket League. School registration closes at midday GMT on 30 October. Entry costs US$35 per student. Group matches run November-January; qualified teams reach the February final.',
  'COBIS school squads; game-specific year-group brackets apply. Suggested minimum age is 8. School-led registration.',
  { application_url: form + 'ae85104b-4c99-4c48-b9ac-dc977667d131', start_date: '2026-11-24', end_date: '2027-02-06', skills: ['Teamwork', 'Strategy', 'Communication'] });
add('COBIS Research Skills Competition 2026-27', 'COBIS and GEC Academy', 'Competitions', '2026-11-19', cobis + 'research-competition',
  'Develop research skills and submit an independent report on an appropriate topic of your choice. Registration closes at midday GMT on 19 November; reports are submitted from 11 January to 22 February 2027. Entry costs GBP70 per student.',
  'Students in Years 10-13 at participating schools; school registration and programme requirements apply.',
  { application_url: form + 'ac611a66-33bf-4676-b398-b3bf8aabaccf', skills: ['Research', 'Writing', 'Analysis'] });
add('Debate Mate x COBIS Virtual Debating Competition 2027', 'COBIS and Debate Mate', 'Competitions', '2026-09-30', cobis + 'virtual-debate-competition',
  'Compete in online school-team debates from 29-31 January 2027. Register by midday GMT on 30 September; places are limited. Entry costs GBP325 per team including VAT, invoiced to schools. Beginners are welcome.',
  'COBIS member and applicant school students aged 14+, Years 9-12 or equivalent. Schools enter their teams.',
  { application_url: form + '645c5111-4d67-4213-afe6-a44970c405ed', minimum_age: 14, start_date: '2027-01-29', end_date: '2027-01-31', skills: ['Public speaking', 'Critical thinking', 'Teamwork'] });
add('COBIS Changemakers Competition 2026-27', 'COBIS', 'Competitions', '2026-12-14', cobis + 'changemakers-competition',
  'Plan and deliver a community or environmental project, then share its impact in a five-minute video. School registration is open until midday GMT on 14 December; video submissions run 26 February-12 March 2027. Free for eligible COBIS schools.',
  'Years 1-13 at COBIS member and applicant schools. Teams of up to 10; one selected entry per school.',
  { skills: ['Leadership', 'Community service', 'Sustainability'] });
const reopened = before.find(x => x.title === 'Play For All - APSN (9 Oct 2026)');
const evidence = nyc.find(x => x.label === reopened.title);
if (evidence.roles[0].closingdate !== '30 September 2026 23:59') throw Error('Re-review extended deadline');
const updates = [{ id: reopened.id, title: reopened.title, reason: 'Official role deadline extended to 30 September; restore listing.',
  payload: { application_deadline: '2026-09-30', deadline: '2026-09-30', expiry_date: '2026-09-30', status: 'published', is_published: true, verification_status: 'verified' } }];
for (const row of before) if (row.is_published && [row.application_deadline, row.deadline, row.end_date, row.expiry_date].some(d => d && d.slice(0, 10) < '2026-09-29')) {
  updates.push({ id: row.id, title: row.title, reason: 'Recorded deadline or event end has passed.', payload: { status: 'expired', is_published: false, verification_status: 'expired' } });
}
fs.writeFileSync(dir + '/manifest.json', JSON.stringify({ as_of: '2026-09-29', updates, additions }, null, 2));
console.log({ additions: additions.length, updates: updates.length });
