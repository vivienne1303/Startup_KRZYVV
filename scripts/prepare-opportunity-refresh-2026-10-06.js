// Official programme pages reviewed on 6 October 2026. Prepare a dated import.
const fs = require('node:fs');
const path = require('node:path');
const asOf = '2026-10-06';
const care = 'https://www.carecorner.org.sg/post_volunteer/';
const entries = [
  {
    title: 'Beyond the Label - LASALLE Booth Facilitators (21 October 2026)', organisation: 'Care Corner Singapore',
    source_url: care + 'central-insight-beyond-the-label-booth-facilitators/',
    description: 'Support a mental health awareness booth at LASALLE on 21 October, 10am-3pm. Facilitate activities and talk with visitors; briefing is provided before the shift.',
    minimum_age: 18, start_date: '2026-10-21', end_date: '2026-10-21', location: 'LASALLE, Singapore',
    eligibility: 'Age 18+. Confident English communication and willingness to engage strangers. Commit to the full shift; long trousers and covered shoes required.',
    skills: ['Communication', 'Event facilitation', 'Mental health awareness'],
  },
  {
    title: 'Deepavali Home Cleaning - Marsiling Home Refreshers 2026', organisation: 'Care Corner Singapore',
    source_url: care + 'marsiling-deepavali-home-cleaning-2026-home-refreshers/',
    description: 'Help seniors clean their homes ahead of Deepavali on 24 October, 9am-1pm. Attend compulsory online onboarding on 22 October at 7pm and bring the listed cleaning supplies.',
    minimum_age: 18, start_date: '2026-10-24', end_date: '2026-10-24', location: 'Marsiling, Singapore',
    eligibility: 'Age 18+. Comfortable doing household chores. Compulsory onboarding and one cleaning session. Bring rags, detergent, disposable gloves and a pail.',
    skills: ['Community service', 'Teamwork', 'Eldercare'],
  },
  {
    title: 'Beyond the Label - Marina Bay Sands Booth Facilitators 2026', organisation: 'Care Corner Singapore',
    source_url: care + 'south-insight-beyond-the-label-booth-facilitators/',
    description: 'Facilitate mental health awareness activities and conversations at Marina Bay Sands from 23-25 October. Choose at least one shift; on-site briefing is provided.',
    minimum_age: 18, start_date: '2026-10-23', end_date: '2026-10-25', location: 'Marina Bay Sands Bayfront Event Space, Singapore',
    eligibility: 'Age 18+. Confident English communication and willingness to engage strangers. Commit to at least one shift. Long trousers and covered shoes required.',
    skills: ['Communication', 'Event facilitation', 'Mental health awareness'],
  },
  {
    title: 'Woodlands Christmas Carnival 2026 - Operational Volunteers', organisation: 'Care Corner Singapore',
    source_url: care + 'woodlands-christmas-carnival-2026-operational-volunteers/',
    description: 'Assist with games, ushering, food distribution and crowd management at a family carnival on 5 December, 3.30pm-9pm, at Fuchun Primary School.',
    minimum_age: 15, start_date: '2026-12-05', end_date: '2026-12-05', location: 'Fuchun Primary School, Woodlands, Singapore',
    eligibility: 'Age 15+. Able to stand for extended periods. Attend online briefing on 30 November or 2 December, 7pm-8pm, and the full event shift.',
    skills: ['Event operations', 'Teamwork', 'Community service'],
  },
  {
    title: 'Young Hearts - Tutor Aide, Buddy Mentor and Event Befriender', organisation: 'Singapore Red Cross',
    source_url: 'https://www.redcross.sg/our-causes/families-youth-children/young-hearts/', application_url: 'https://vp.redcross.sg/',
    description: 'Support children through academic coaching, weekly mentoring or activities at occasional events. Register through the SRC volunteer portal to explore roles and training.',
    eligibility: 'Role-specific age and suitability requirements must be confirmed with the organiser. Weekly tutor and mentor roles require regular commitment.',
    skills: ['Mentoring', 'Tutoring', 'Befriending'], student_status: 'unknown', deadline_status: 'rolling', access: 'login_required',
    notes: 'The beneficiary age range is not a volunteer age requirement. Portal registration does not guarantee placement.',
  },
  {
    title: 'MINDS - Service and Event Volunteering', organisation: 'MINDS',
    source_url: 'https://www.minds.org.sg/volunteer/', application_url: 'https://minds.socialservicesconnect.com/volunteer-form-page',
    description: 'Support people with intellectual disabilities through befriending, community activities and event logistics. Register interest with MINDS for matching to suitable roles.',
    eligibility: 'No prior experience is needed for general volunteering. Student age, screening and commitment requirements depend on the role and should be confirmed with MINDS.',
    skills: ['Befriending', 'Disability inclusion', 'Event support'], student_status: 'unknown', access: 'unknown',
    notes: 'Official page links to registration, but the external form returned an access restriction during research. Deadline is unspecified.',
  },
  {
    title: 'UnLitter Red Dot - School and Community Group Clean-ups', organisation: 'Habitat for Humanity Singapore',
    source_url: 'https://www.habitat.org.sg/unlitter-red-dot',
    description: 'Arrange a group litter-picking session with equipment and briefing provided. School group sessions run on Fridays, 3pm-5pm, in Aljunied; book at least six weeks ahead.',
    eligibility: 'Family and child-friendly programme for groups of 20-200. School and corporate bookings require donation support. Enquire by email with group size and preferred dates.',
    skills: ['Environmental stewardship', 'Teamwork', 'Community service'], deadline_status: 'rolling', access: 'unknown',
    notes: 'Enquiry-based group opportunity. Email info@habitat.org.sg using instructions on the source page. Donation amount is unspecified; individual slots are not confirmed.',
    fees: 'Donation support required for group volunteering; confirm amount with organiser.',
  },
  {
    title: 'NLB - Library and Archives Volunteer Registration', organisation: 'National Library Board',
    source_url: 'https://www.nlb.gov.sg/volunteers/usersignup',
    description: 'Register as an NLB volunteer and select preferred libraries, interests and locations. Student volunteers can supply school details; placements depend on available activities.',
    eligibility: 'Applicants under 13 must be accompanied by a caregiver who is also registered. Role-specific age and participation requirements may apply.',
    skills: ['Community service', 'Literacy', 'Library support'], deadline_status: 'rolling',
    notes: 'Volunteer registration route, not a guaranteed event vacancy. No numeric minimum age was inferred from the caregiver rule.',
  },
  {
    title: 'SOS CareText - Service-based Volunteer', organisation: 'Samaritans of Singapore',
    source_url: 'https://www.sos.org.sg/support-those-in-distress/volunteer-with-us/', application_url: 'https://form.jotform.com/210215321670441',
    description: 'Train to offer confidential emotional support through CareText. Applications are accepted throughout the year; shortlisted applicants attend briefings, interviews and supervised training.',
    minimum_age: 18, location: '10 Cantonment Close, Singapore',
    eligibility: 'CareText applicants must be 18+, proficient in English and text messaging, emotionally mature and willing to maintain confidentiality. Commit 3-4 hours weekly, one overnight monthly and at least one year after training. Hours cannot count towards practicum.',
    skills: ['Active listening', 'Communication', 'Emotional support'], deadline_status: 'rolling',
    notes: 'This listing covers CareText only. Hotline volunteering requires age 23+ and two years of commitment. Training and volunteering take place at the SOS office.',
  },
];
const additions = entries.map(({student_status, deadline_status, access, notes, fees, ...item}) => ({
  category: 'Volunteering', categories: ['Volunteering'], minimum_age: null, maximum_age: null,
  education_levels: [], application_deadline: null, start_date: null, end_date: null,
  host_country: 'SG', location: 'Singapore', format: 'in_person', eligibility_scope: 'unknown',
  eligible_countries: [], travel_required: null, source_type: 'ai_fetched',
  application_method: 'external', internal_application_enabled: false,
  ...item, application_url: item.application_url || item.source_url, source_name: item.organisation,
  discovery: {deadline_status: deadline_status || 'unknown', student_eligibility: student_status || 'confirmed',
    application_access: access || 'available', discovered_url: item.source_url, official_url: item.source_url,
    last_checked_at: asOf, fees: fees || null, parental_consent: null, school_membership: null,
    restrictions: item.eligibility, notes: notes || 'Official page checked. Application deadline is unspecified; event dates are not application deadlines. Availability remains subject to organiser confirmation.',
    evidence_urls: [...new Set([item.source_url, item.application_url].filter(Boolean))]},
}));
fs.writeFileSync(path.join(__dirname, '../data/opportunities-refresh-2026-10-06.json'), JSON.stringify({as_of: asOf, additions}, null, 2) + '\n');
console.log(`Prepared ${additions.length} opportunities from ${new Set(additions.map(r => new URL(r.source_url).hostname)).size} websites.`);
