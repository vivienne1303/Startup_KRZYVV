// Reviewed official-source facts, checked 29 September 2026. No inferred eligibility.
const fs = require('node:fs');
const path = require('node:path');
const base = 'https://www.volunteer.gov.sg/volunteer/opportunity/details/?id=';
const additions = [];
function add(id, title, organisation, description, deadline, location, restrictions, extra = {}) {
  const { discovery = {}, ...fields } = extra;
  additions.push({ title, organisation, category: 'Volunteering', categories: ['Volunteering'], description,
    eligibility: restrictions + ' Citizenship/residency eligibility not specified.', minimum_age: null, maximum_age: null,
    education_levels: [], application_deadline: deadline, start_date: null, end_date: null,
    source_url: base + id, application_url: base + id, host_country: 'SG', location, format: 'in_person',
    eligibility_scope: 'unknown', eligible_countries: [], travel_required: null,
    source_type: 'ai_fetched', source_name: 'Volunteer.gov.sg', application_method: 'external', internal_application_enabled: false,
    ...fields, discovery: { deadline_status: 'confirmed', student_eligibility: 'unknown', application_access: 'unknown',
      discovered_url: base + id, official_url: base + id, last_checked_at: '2026-09-29',
      fees: null, parental_consent: null, school_membership: null, restrictions,
      notes: 'Official listing and Apply controls loaded; authenticated registration flow not verified. Fees and unspecified eligibility requirements remain unknown.',
      evidence_urls: [base + id], ...discovery } });
}
add('ecb1bfdc-1680-f111-ac88-027d80ecb760', 'KidSTART HWK Delivery Squad — October 2026', 'KidSTART Singapore Ltd',
  'Deliver fresh food to families. Visible shifts run 20–22 October. Registration closes 30 September: 5pm for 20 October and 8pm for 21–22 October.',
  '2026-09-30', 'Boys’ Brigade HQ, 10 Kwong Avenue, Singapore',
  'Own transport required; driver/passenger pairs encouraged. Under-18s can accompany parents, who take responsibility for them.',
  { start_date: '2026-10-20', end_date: '2026-10-22', discovery: { student_eligibility: 'confirmed', parental_consent: 'Under-18s may accompany parents, who take full responsibility; independent participation is not confirmed.' } });
add('bb0df9f3-3565-f111-ac86-027d80ecb760', 'Community Nursing Event — Montfort GoodLife Studio (October 2026)', 'Singapore General Hospital',
  'Help with event logistics, queues and booths. Registration closes 11 October at 11:45pm. Event date needs confirmation: the role text says 31 October, but its shift table says 22 October.',
  '2026-10-11', '15 Marine Terrace, Singapore', 'Age 17+. Attend at least one session and the required briefing.',
  { minimum_age: 17, discovery: { student_eligibility: 'confirmed', notes: 'Conflicting event dates: 31 October in role text versus 22 October in shift table. Event dates stored as unknown. Apply controls loaded; authenticated registration not tested.' } });
add('ce875041-cb5f-f111-ac86-027d80ecb760', 'School Sports Fiesta 2026 — Team Nila Sport Photographer', 'Team Nila',
  'Photograph the 11 November school sports event, 8:30am–noon. Registration closes 15 October at 00:00 Singapore time. No meals provided.',
  '2026-10-15', 'Kent Ridge Secondary School, 147 West Coast Road, Singapore',
  'Own camera required; phone cameras are not accepted. Team Nila attire and pre-event briefing required. Age and school membership requirements not specified.',
  { start_date: '2026-11-11', end_date: '2026-11-11' });
add('5afc7c0b-2180-f111-ac88-027d80ecb760', 'Active Health Ambassador @ Bukit Canberra — November 2026', 'Team Nila',
  'Assist with lab administration, enquiries and exercise activities. Registration opens 1 October at noon. Early November shifts close 29 October at 00:00; later shifts close 12 November at 00:00.',
  '2026-11-12', 'Active Health Lab, 21 Canberra Link, Singapore', 'Completed Active Health Online Certification required. Age and student eligibility not specified.',
  { start_date: '2026-11-03', end_date: '2026-11-28', discovery: { deadline_status: 'upcoming', registration_opens_at: '2026-10-01T12:00:00+08:00' } });
add('ce7a2bf8-24a8-f111-ac8c-027d80ecb760', 'Para Sport Academy — Frame Running (November–December 2026)', 'Team Nila',
  'Support participants and prepare sports equipment at Sunday morning sessions. Listed future shifts include 8 and 29 November and 6 December, 8:30–10:30am. Registration closes 26 October at 00:00.',
  '2026-10-26', 'Hougang Stadium, 93 Hougang Avenue 4, Singapore',
  'Minimum two sessions per month; maximum one shift weekly. Comfortable interacting with participants with disabilities. Team Nila shirt and covered shoes required. Confirm sufficient December shifts with organiser.',
  { start_date: '2026-11-08', end_date: '2026-12-06' });
add('e02561eb-17e2-f011-ac7f-027d80ecb760', 'Horticulture Maintenance @ Bishan–Ang Mo Kio Park — 3 October', 'NParks',
  'Volunteer Member gardening session on 3 October, 9–11am. Registration closes 30 September at 2pm. Later sessions have separate registration windows on the same source page.',
  '2026-09-30', 'Bishan–Ang Mo Kio Park, Singapore',
  'Individual registration required; no walk-ins or group bookings. Covered shoes and long trousers required. Subject to weather. Age not specified; this entry is for the member role.',
  { start_date: '2026-10-03', end_date: '2026-10-03' });
add('28d84258-2fe3-f011-ac7f-027d80ecb760', 'Butterfly Habitat Enhancement @ Bishan–Ang Mo Kio Park — 7 October', 'NParks',
  'Volunteer Member habitat gardening session on 7 October, 9–11am. Registration opens 30 September at 1pm and closes 6 October at 9am. Later sessions have separate windows.',
  '2026-10-06', 'Bishan–Ang Mo Kio Park, Singapore',
  'Individual registration required; no walk-ins or group bookings. Covered shoes and long trousers required. Age not specified. Leader prerequisites do not apply to this member listing.',
  { start_date: '2026-10-07', end_date: '2026-10-07', discovery: { deadline_status: 'upcoming', registration_opens_at: '2026-09-30T13:00:00+08:00' } });
add('161d5c1d-77f7-f011-ac80-027d80ecb760', 'MENDAKI Befrienders', 'MENDAKI',
  'Support families through monthly home visits. Registration closes 30 November at 00:00. The portal’s administrative shift dates do not replace the one-year commitment.',
  '2026-11-30', 'Family homes in Singapore; deployment confirmed by MENDAKI',
  'Age 21+. English and Malay required; comfortable supporting families and young parents. Minimum one year, monthly visits, training and selection chat. Personal details may be shared with partner agencies.',
  { minimum_age: 21, discovery: { student_eligibility: 'confirmed' } });
add('35b97528-22db-f011-ac7f-027d80ecb760', 'Ready, Set, Learn! Math Explorer — Facilitator', 'MENDAKI',
  'Facilitate four weekly parent-and-preschooler sessions of 2–3 hours. Registration closes 24 December at 00:00. Deployed facilitators receive an unspecified honorarium; actual session dates are arranged separately.',
  '2026-12-24', 'Singapore; deployment confirmed by MENDAKI',
  'Age 18+, GCE O-Level or above, fluent English and basic Malay. Weekend commitment, two core training modules, on-the-job training and selection chat required.',
  { minimum_age: 18, discovery: { student_eligibility: 'confirmed' } });
const excluded = [
  { id: 'db582b08-8e6f-f111-ac86-027d80ecb760', reason: 'Health in Check — Radin Mas: existing Youth Corps cross-post; do not duplicate.' },
  { id: '0e39a449-9776-f111-ac88-027d80ecb760', reason: 'Health in Check facilitators: cohorts already present under Youth Corps sources.' },
  { id: 'fbf44388-159d-f111-ac8a-027d80ecb760', reason: 'Nursing Care Buddies: registration closed by 28 September despite future event dates.' },
  { id: '05e724a3-8560-f111-ac86-027d80ecb760', reason: 'Rapid Screening: latest registration closed 28 September.' }
].map(({id,reason}) => ({ source_url: base + id, reason }));
fs.writeFileSync(path.join(__dirname, '../data/opportunities-volunteer-sg-2026-09-29.json'), JSON.stringify({ as_of: '2026-09-29', discovery_source: 'https://www.volunteer.gov.sg/', additions, excluded }, null, 2) + '\n');
