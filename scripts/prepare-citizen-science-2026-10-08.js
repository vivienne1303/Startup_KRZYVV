// Append ten distinct live research projects with unfinished work, preserving evidence.
const fs = require('node:fs');
const dir = 'output/expansion-2026-10-08/';
const file = 'data/opportunities-expansion-2026-10-08.json';
const { duplicateOf } = require('./import-ofy-discovery');
async function main() {
  const manifest = JSON.parse(fs.readFileSync(file));
  const baseline = JSON.parse(fs.readFileSync(dir + 'baseline.json'));
  const projects = JSON.parse(fs.readFileSync(dir + 'zooniverse-live.json')).projects;
  let count = 0;
  for (const p of projects) {
    if (!p.launch_approved || !p.live || p.subjects_count - p.retired_subjects_count < 100 || !p.links.active_workflows.length) continue;
    const url = 'https://www.zooniverse.org/projects/' + p.slug;
    const item = {
      title: p.display_name + ' - Online Citizen Science', organisation: 'Zooniverse / ' + p.display_name,
      category: 'Volunteering', categories: ['Volunteering'], description: p.description,
      minimum_age: null, maximum_age: null, education_levels: [],
      application_deadline: null, start_date: null, end_date: null,
      source_url: url, application_url: url + '/classify', source_name: 'Zooniverse', source_type: 'ai_fetched',
      location: 'Global (online)', format: 'online', host_country: null,
      eligibility_scope: 'worldwide', eligible_countries: [], travel_required: false,
      application_method: 'external', internal_application_enabled: false,
      eligibility: 'Open remote research volunteering; no specialist background required. Under-16 account registration requires parent or guardian sign-off. Follow project tutorials and account terms.',
      skills: ['Citizen science', 'Research', 'Attention to detail'],
      discovery: {
        deadline_status: 'rolling', student_eligibility: 'confirmed', application_access: 'available',
        discovered_url: url, official_url: url, last_checked_at: '2026-10-08',
        fees: 'Free voluntary participation.', parental_consent: 'Parent or guardian sign-off required for account registration under age 16.',
        school_membership: null, restrictions: 'Follow project tutorials and account terms. Check school acceptance before claiming service credit.',
        notes: 'Official API confirms launch approval, live status, active workflows and unfinished subjects. Work availability changes as classifications are completed. This is unpaid research volunteering, with no guaranteed placement.',
        evidence_urls: [url, 'https://panoptes.zooniverse.org/api/projects/' + p.id, 'https://www.zooniverse.org/about', 'https://www.zooniverse.org/get-involved/volunteer']
      }
    };
    if (duplicateOf([...baseline, ...manifest.additions], item)) continue;
    const response = await fetch(url, {signal: AbortSignal.timeout(20000)});
    if (!response.ok) continue;
    fs.writeFileSync(dir + 'zooniverse-project-' + p.id + '.html', await response.text());
    manifest.additions.push(item);
    if (++count === 10) break;
  }
  if (count < 10) throw Error('Insufficient verified new citizen science projects');
  fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({global_online_added: count, total: manifest.additions.length}));
}
main().catch(e => {console.error(e.message); process.exitCode = 1;});
