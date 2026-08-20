const { supabaseAdmin } = require("../backend/config/supabase");
const manualSource = require("../backend/services/opportunitySources/manualSource");
const OpportunitySource = require("../backend/services/opportunitySources/apiSourceBase");

const detector = new OpportunitySource();

// Official pages verified on 20 August 2026. Records intentionally enter the
// admin review queue instead of being published automatically.
const opportunities = [
  {
    title: "Behind the Switch: Powering Singapore's Future with EMA",
    organisation: "Energy Market Authority",
    description: "Visit Singapore's Power System Control Centre and explore energy, engineering, cybersecurity, economics and policy careers with EMA professionals.",
    category: "Career Exploration",
    education_levels: ["Junior College", "Polytechnic"],
    location: "Labrador Tower, Singapore",
    mode: "in_person",
    start_date: "2026-09-11",
    end_date: "2026-09-11",
    application_deadline: "2026-08-28",
    skills: ["Engineering", "Cybersecurity", "Career exploration"],
    source_url: "https://discover.nyc.gov.sg/events/behind-the-switch-powering-singapores-future-with-ema-mrvdt7lv",
  },
  {
    title: "Beyond the Lobby: Opening Doors to Hospitality",
    organisation: "Discover NYC",
    description: "An in person career exploration experience introducing young people to work and pathways in hotel and accommodation services.",
    category: "Career Exploration",
    location: "Orchard, Singapore",
    mode: "in_person",
    start_date: "2026-09-18",
    end_date: "2026-09-18",
    skills: ["Hospitality", "Customer experience", "Career exploration"],
    source_url: "https://discover.nyc.gov.sg/events/beyond-the-lobby-opening-doors-to-hospitality-mscpldfk",
  },
  {
    title: "Adult CCA Fair",
    organisation: "Our Playces",
    description: "Meet community leaders, explore hobbies and activity groups, watch demonstrations and try new interests at this free community fair.",
    category: "Community Events",
    location: "Downtown Core, Singapore",
    mode: "in_person",
    start_date: "2026-10-25",
    end_date: "2026-10-25",
    skills: ["Community building", "Networking", "Personal development"],
    source_url: "https://discover.nyc.gov.sg/events/adult-cca-fair-mrt809ge",
  },
  ...[
    ["Kampong Chai Chee", "Bedok"],
    ["Jurong East", "Jurong East"],
    ["Ang Mo Kio", "Ang Mo Kio"],
    ["Woodlands", "Woodlands"],
    ["Queenstown", "Queenstown"],
  ].map(([area, location]) => ({
    title: `KidsLearn ${area}, Term 4 2026`,
    organisation: "Youth Corps Singapore",
    description: "Support young children through literacy activities, phonics practice and befriending in a regular Youth Corps volunteering programme.",
    category: "Volunteering",
    minimum_age: 17,
    maximum_age: 35,
    location: `${location}, Singapore`,
    mode: "in_person",
    start_date: "2026-09-19",
    skills: ["Befriending", "Literacy", "Facilitation"],
    source_url: `https://discover.nyc.gov.sg/civicaction/Join-Opportunities/Individual/2026/09/KidsLearn--${area.replaceAll(" ", "-")}-Term-4-2026`,
  })),
  ...[
    ["Woodlands", "Woodlands", "2026-09-18", "2026-11-20"],
    ["Marsiling", "Kranji", "2026-09-18", "2026-11-21"],
    ["Bedok", "Bedok", "2026-09-19", "2026-11-21"],
  ].map(([area, location, startDate, endDate]) => ({
    title: `KidsCount ${area}, Term 4 2026`,
    organisation: "Care Corner Singapore and Youth Corps Singapore",
    description: "Help lower primary children strengthen mathematics foundations and confidence through engaging numeracy activities.",
    category: "Volunteering",
    minimum_age: 15,
    maximum_age: 35,
    location: `${location}, Singapore`,
    mode: "in_person",
    start_date: startDate,
    end_date: endDate,
    skills: ["Numeracy", "Mentoring", "Facilitation"],
    source_url: `https://discover.nyc.gov.sg/civicaction/Join-Opportunities/Individual/2026/09/KidsCount--${area}-${startDate.slice(8)}-Sep--${endDate.slice(8)}-Nov-2026`,
  })),
  {
    title: "ARThematics Simei, September 2026",
    organisation: "Care Corner Singapore and Youth Corps Singapore",
    description: "Use arts and crafts to help primary school children enjoy mathematics in this short volunteering programme.",
    category: "Volunteering",
    minimum_age: 15,
    maximum_age: 35,
    location: "Simei, Singapore",
    mode: "in_person",
    start_date: "2026-09-07",
    end_date: "2026-09-11",
    skills: ["Art", "Numeracy", "Facilitation"],
    source_url: "https://discover.nyc.gov.sg/civicaction/Join-Opportunities/Individual/2026/09/ARThematics--Simei-7-Sep-to-11-Sep-2026",
  },
  {
    title: "National Youth Orator Championships 2026",
    organisation: "National Youth Orator Championships",
    description: "A Singapore public speaking competition for students from Primary school through university, focused on confident communication and critical thinking.",
    category: "Competitions",
    location: "Singapore",
    mode: "online",
    application_deadline: "2026-09-13",
    skills: ["Public speaking", "Communication", "Critical thinking"],
    source_url: "https://www.nyoc.sg/",
  },
  {
    title: "Samsung Solve for Tomorrow 2026",
    organisation: "Samsung Singapore",
    description: "Teams of students develop STEM and AI ideas that address real community challenges in sustainability, wellbeing, inclusion, security or privacy.",
    category: "Competitions",
    minimum_age: 12,
    maximum_age: 18,
    education_levels: ["Secondary School", "International School equivalent"],
    location: "Singapore",
    mode: "hybrid",
    application_deadline: "2026-09-18",
    skills: ["STEM", "Artificial intelligence", "Innovation", "Teamwork"],
    source_url: "https://www.samsung.com/sg/solvefortomorrow/",
    application_url: "https://solvefortomorrow.sgsamsungcampaign.com/",
  },
  {
    title: "HTX Internship Programme, August 2026 Cycle",
    organisation: "Home Team Science and Technology Agency",
    description: "Apply STEM, data, engineering, cybersecurity and related skills to real projects supporting Singapore's safety and security.",
    category: "Internships",
    education_levels: ["College", "Polytechnic", "University"],
    location: "Singapore",
    mode: "in_person",
    application_deadline: "2026-08-31",
    skills: ["STEM", "Cybersecurity", "Engineering", "Data science"],
    source_url: "https://www.htx.gov.sg/join-us/internships",
  },
  {
    title: "Case Writing Competition 2025/26",
    organisation: "Lee Kuan Yew School of Public Policy, NUS",
    description: "University students research and write an original public policy case individually or in teams of up to three members.",
    category: "Competitions",
    education_levels: ["University"],
    location: "Singapore",
    mode: "hybrid",
    application_deadline: "2026-09-18",
    skills: ["Research", "Policy analysis", "Writing"],
    source_url: "https://lkyspp.nus.edu.sg/research/case-insights-unit/case-writing-competition/case-writing-competition-2026",
  },
  {
    title: "CPF Board Internship",
    organisation: "Central Provident Fund Board",
    description: "Students studying in Singapore can gain purposeful work experience through full time credit bearing or eligible non credit bearing internships.",
    category: "Internships",
    education_levels: ["Post-secondary", "Polytechnic", "University"],
    location: "Singapore",
    mode: "in_person",
    skills: ["Professional skills", "Project work", "Public service"],
    source_url: "https://www.cpf.gov.sg/member/who-we-are/careers/internship",
  },
  {
    title: "Enterprise Singapore Internships",
    organisation: "Enterprise Singapore",
    description: "Pre-university and university students contribute to enterprise development work while gaining exposure to international markets and industry development.",
    category: "Internships",
    education_levels: ["Junior College", "Polytechnic", "University"],
    location: "Singapore",
    mode: "in_person",
    skills: ["Business", "Market research", "Enterprise development"],
    source_url: "https://www.enterprisesg.gov.sg/about-us/careers/for-students-and-graduates/internships",
  },
  {
    title: "Youth Corps Singapore Internship",
    organisation: "Youth Corps Singapore",
    description: "Year round internships offering coaching, relevant workshops and hands on experience planning community programmes and youth engagement activities.",
    category: "Internships",
    location: "Singapore",
    mode: "hybrid",
    skills: ["Community engagement", "Programme planning", "Communications"],
    source_url: "https://www.youthcorps.gov.sg/about-us/apply-for-youth-corps-internship",
  },
  {
    title: "Youth Corps Community Internship",
    organisation: "Youth Corps Singapore",
    description: "A five to six month developmental internship with community and social sector partners, including skills training, career exploration and service.",
    category: "Internships",
    education_levels: ["Polytechnic", "Post-secondary"],
    location: "Singapore",
    mode: "hybrid",
    skills: ["Community engagement", "Leadership", "Project management"],
    source_url: "https://www.youthcorps.gov.sg/whats-new/youth-corps-community-internship",
  },
  {
    title: "NExus Internship Programme",
    organisation: "North East Community Development Council",
    description: "Work with community leaders, build professional networks and contribute to innovative projects serving Singapore's North East community.",
    category: "Internships",
    minimum_age: 17,
    maximum_age: 25,
    education_levels: ["Post-secondary", "Tertiary"],
    location: "North East Singapore",
    mode: "in_person",
    skills: ["Community development", "Project management", "Networking"],
    source_url: "https://northeast.cdc.gov.sg/programmes/employment-opportunities/nexus-internship/",
  },
  {
    title: "NParks Volunteer Opportunities",
    organisation: "National Parks Board",
    description: "Join official conservation, nature education, habitat enhancement, citizen science and visitor engagement opportunities available throughout the year.",
    category: "Volunteering",
    location: "Singapore",
    mode: "in_person",
    skills: ["Conservation", "Nature education", "Citizen science"],
    source_url: "https://www.nparks.gov.sg/get-involved/volunteer",
  },
  {
    title: "Youth Corps Volunteering Programmes",
    organisation: "Youth Corps Singapore",
    description: "Browse bite sized, regular, service based, event based and skills based volunteering opportunities for young people across Singapore.",
    category: "Volunteering",
    location: "Singapore",
    mode: "hybrid",
    skills: ["Community service", "Teamwork", "Leadership"],
    source_url: "https://www.youthcorps.gov.sg/volunteer/volunteering-programmes",
  },
  {
    title: "GRIT@Gov Traineeships",
    organisation: "Public Service Division",
    description: "Paid public sector traineeships for eligible Singapore citizen or permanent resident fresh graduates completing studies between 2024 and 2026.",
    category: "Internships",
    education_levels: ["ITE", "Polytechnic", "University", "Recent graduate"],
    location: "Singapore",
    mode: "in_person",
    skills: ["Public service", "Professional skills", "Career development"],
    source_url: "https://www.careers.gov.sg/join-us/grit-gov/",
  },
];

async function importOpportunities() {
  const imported = [];
  const duplicates = [];
  const errors = [];

  for (const opportunity of opportunities) {
    const payload = manualSource.normaliseOpportunity({
      ...opportunity,
      application_url: opportunity.application_url || opportunity.source_url,
      source_type: "ai_fetched",
      source_name: opportunity.organisation,
      external_id: new URL(opportunity.source_url).pathname.toLowerCase(),
      status: "pending_review",
      is_published: false,
    }, null);

    const duplicate = await detector.detectDuplicates(supabaseAdmin, payload);
    if (duplicate.error) {
      errors.push({ title: payload.title, message: duplicate.error.message });
      continue;
    }
    if (duplicate.data.length) {
      duplicates.push(payload.title);
      continue;
    }

    const result = await supabaseAdmin.from("opportunities").insert(payload).select("id,title,verification_status").single();
    if (result.error) errors.push({ title: payload.title, message: result.error.message });
    else imported.push(result.data);
  }

  console.log(JSON.stringify({ imported, duplicates, errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

importOpportunities().catch((error) => {
  console.error("Opportunity import failed:", error.message);
  process.exitCode = 1;
});
