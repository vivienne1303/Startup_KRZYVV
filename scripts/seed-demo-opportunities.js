const { supabaseAdmin } = require("../backend/config/supabase");
const { demoOpportunities } = require("../backend/services/demoOpportunityService");

const rows = demoOpportunities.map((opportunity) => ({
  ...opportunity,
  application_url:
    opportunity.application_url ||
    `https://teenlaunch.app/pages/apply.html?id=${opportunity.id}`,
  categories: [opportunity.category],
  status: "active",
  source_type: "teenlaunch",
  source_name: "TeenLaunch demo seed [MOCK]",
  verification_status: "verified",
  verified_at: new Date().toISOString(),
  expiry_date: opportunity.deadline,
  application_method: "internal",
  internal_application_enabled: true,
  is_published: true,
}));

async function seed() {
  const { data, error } = await supabaseAdmin
    .from("opportunities")
    .upsert(rows, { onConflict: "id" })
    .select("id,title,is_published,status,verification_status");

  if (error) throw error;

  console.log(`Seeded ${data.length} demo opportunities.`);
  data.forEach((item) => console.log(`- ${item.title} (${item.id})`));
}

seed().catch((error) => {
  console.error("Unable to seed demo opportunities:", error.message);
  process.exitCode = 1;
});
