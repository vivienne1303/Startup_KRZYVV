const TRAIT_SIGNALS = {
  Creator: ["creative", "design", "media", "content", "storytelling", "art", "communication", "presentation"],
  Builder: ["technology", "engineering", "coding", "software", "product", "maker", "innovation", "technical"],
  Explorer: ["research", "science", "analysis", "data", "strategy", "discovery", "policy", "problem solving"],
  Connector: ["social impact", "community", "education", "mentoring", "people", "communication", "volunteering", "collaboration"],
  Leader: ["leadership", "entrepreneurship", "business", "startup", "advocacy", "public speaking", "management", "pitching"],
};

const normalize = (value) => String(value || "").trim().toLowerCase();
const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const words = (value) => normalize(value).split(/[^a-z0-9]+/).filter((word) => word.length > 2);

const overlaps = (left, right) => {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  const bWords = new Set(words(b));
  return words(a).some((word) => bWords.has(word));
};

const traitPercentages = (result) => {
  const percentages = result?.score?.percentages || {};
  return Object.keys(TRAIT_SIGNALS)
    .map((trait) => ({ trait, percentage: Math.max(0, Number(percentages[trait]) || 0) }))
    .sort((a, b) => b.percentage - a.percentage);
};

const opportunityLabels = (opportunity) => [
  opportunity.category,
  ...list(opportunity.categories),
  ...list(opportunity.skills),
];

const matchingTraits = (rankedTraits, opportunity) => {
  const labels = opportunityLabels(opportunity);
  return rankedTraits.filter(({ trait }) =>
    TRAIT_SIGNALS[trait].some((signal) => labels.some((label) => overlaps(signal, label)))
  );
};

const profileIsEligible = (profile, opportunity) => {
  const age = Number(profile?.age);
  if (Number.isFinite(age)) {
    if (opportunity.age_min != null && age < Number(opportunity.age_min)) return false;
    if (opportunity.age_max != null && age > Number(opportunity.age_max)) return false;
  }

  const levels = list(opportunity.education_levels).map(normalize);
  if (levels.length && profile?.education_level && !levels.includes(normalize(profile.education_level))) return false;
  return true;
};

const scoreOpportunity = ({ result, profile, opportunity }) => {
  const ranked = traitPercentages(result);
  const matchedTraits = matchingTraits(ranked, opportunity);
  let earned = 0;
  let available = 0;

  const labels = opportunityLabels(opportunity);
  if (labels.length && ranked.length) {
    available += 50;
    const topPercentage = Math.max(1, ranked[0]?.percentage || 1);
    const bestMatch = matchedTraits[0]?.percentage || 0;
    earned += Math.min(50, (bestMatch / topPercentage) * 50);
  }

  const skills = list(opportunity.skills);
  if (skills.length) {
    available += 25;
    const recommended = result?.recommended_paths || {};
    const userSignals = [
      ...ranked.slice(0, 3).flatMap(({ trait }) => TRAIT_SIGNALS[trait]),
      ...list(recommended.job_families),
      ...list(recommended.opportunity_types),
    ];
    const matchedSkills = skills.filter((skill) => userSignals.some((signal) => overlaps(skill, signal)));
    earned += (matchedSkills.length / skills.length) * 25;
  }

  const age = Number(profile?.age);
  if (Number.isFinite(age) && (opportunity.age_min != null || opportunity.age_max != null)) {
    available += 7.5;
    const ageEligible = (opportunity.age_min == null || age >= Number(opportunity.age_min))
      && (opportunity.age_max == null || age <= Number(opportunity.age_max));
    if (ageEligible) earned += 7.5;
  }

  const educationLevels = list(opportunity.education_levels).map(normalize);
  if (profile?.education_level && educationLevels.length) {
    available += 7.5;
    if (educationLevels.includes(normalize(profile.education_level))) earned += 7.5;
  }

  const mode = normalize(opportunity.mode);
  if (["online", "hybrid"].includes(mode)) {
    available += 10;
    earned += 10;
  } else if (profile?.country && opportunity.location) {
    available += 10;
    if (overlaps(profile.country, opportunity.location)) earned += 10;
  }

  const percentage = available ? Math.round((earned / available) * 100) : 0;
  const traitNames = matchedTraits.slice(0, 2).map(({ trait }) => trait);
  const explanation = traitNames.length
    ? `This opportunity matches your strong ${traitNames.join(" and ")} Career DNA traits.`
    : "This opportunity matches the profile and eligibility information currently available.";

  return {
    opportunity,
    match_percentage: Math.max(0, Math.min(100, percentage)),
    explanation,
    matched_traits: traitNames,
    score_breakdown: {
      earned: Number(earned.toFixed(2)),
      available: Number(available.toFixed(2)),
    },
  };
};

const getMatchedOpportunities = async (client, userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const [careerResult, profileResult, opportunityResult] = await Promise.all([
    client.from("career_dna_results").select("id, score, interests, recommended_paths").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    client.from("user_profiles").select("age, education_level, country").eq("id", userId).single(),
    client.from("opportunities")
      .select("id, title, description, category, categories, skills, education_levels, organizer, location, mode, age_min, age_max, deadline, start_date, end_date, application_url, image_url, status, is_published, created_at")
      .eq("is_published", true)
      .eq("status", "active")
      .or(`deadline.is.null,deadline.gte.${today}`)
      .order("deadline", { ascending: true, nullsFirst: false }),
  ]);

  const error = careerResult.error || profileResult.error || opportunityResult.error;
  if (error) return { data: null, error };
  if (!careerResult.data) return { data: { completed: false, recommendations: [] }, error: null };

  const recommendations = (opportunityResult.data || [])
    .filter((opportunity) => profileIsEligible(profileResult.data, opportunity))
    .map((opportunity) => scoreOpportunity({ result: careerResult.data, profile: profileResult.data, opportunity }))
    .sort((a, b) => b.match_percentage - a.match_percentage || String(a.opportunity.deadline || "9999").localeCompare(String(b.opportunity.deadline || "9999")));

  return { data: { completed: true, recommendations }, error: null };
};

module.exports = { getMatchedOpportunities, scoreOpportunity, TRAIT_SIGNALS };
