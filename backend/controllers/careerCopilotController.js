const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const missingTable = (error) => error && ["42P01", "PGRST205", "42703"].includes(error.code);
const safeResult = (result, fallback) => {
  if (!result?.error) return result?.data ?? fallback;
  if (missingTable(result.error)) return fallback;
  throw new HttpError(400, result.error.message, result.error.details);
};
const cleanList = (value, limit = 12) => (Array.isArray(value) ? value : []).map((item) => String(item).slice(0, 80)).slice(0, limit);
const detailLink = (id) => `pages/opportunity-details.html?id=${encodeURIComponent(id)}`;

const buildContext = async (req) => {
  const [dnaResult, savedResult, completedResult, portfolioItemsResult, projectsResult, opportunitiesResult] = await Promise.all([
    req.supabase.from("career_dna_results").select("result_title, summary, strengths, interests, score").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    req.supabase.from("saved_opportunities").select("opportunities(id, title, category, skills)").order("created_at", { ascending: false }).limit(12),
    req.supabase.from("registrations").select("completion_date, verified_skills, opportunities(id, title, category, organizer)").eq("status", "completed").eq("completion_verified", true).limit(12),
    req.supabase.from("portfolio_items").select("skills_learned, registrations(opportunities(id, title))").limit(20),
    req.supabase.from("portfolio_projects").select("title, skills").limit(12),
    req.supabase.from("opportunities").select("id, title, description, category, categories, skills, organizer, mode, location, age_min, age_max, education_levels, deadline").eq("is_published", true).eq("status", "active").or(`deadline.is.null,deadline.gte.${new Date().toISOString().slice(0, 10)}`).order("deadline", { ascending: true, nullsFirst: false }).limit(24),
  ]);

  const dna = safeResult(dnaResult, null);
  const saved = safeResult(savedResult, []);
  const completed = safeResult(completedResult, []);
  const portfolioItems = safeResult(portfolioItemsResult, []);
  const projects = safeResult(projectsResult, []);
  const opportunities = safeResult(opportunitiesResult, []);
  const profile = req.profile || {};

  return {
    user: {
      age: profile.age || null,
      education_level: profile.education_level || null,
      country: profile.country || null,
      school: profile.school_name || null,
    },
    career_dna: dna ? {
      title: dna.result_title,
      summary: dna.summary,
      strengths: cleanList(dna.strengths),
      interests: cleanList(dna.interests),
      top_category: dna.score?.top_category || null,
      secondary_category: dna.score?.secondary_category || null,
    } : null,
    saved_opportunities: saved.map((item) => item.opportunities).filter(Boolean).map((item) => ({ id: item.id, title: item.title, category: item.category, skills: cleanList(item.skills) })),
    verified_programmes: completed.map((item) => ({ title: item.opportunities?.title, organisation: item.opportunities?.organizer, verified_skills: cleanList(item.verified_skills), completion_date: item.completion_date })),
    portfolio: {
      skills: [...new Set([...portfolioItems.flatMap((item) => cleanList(item.skills_learned)), ...projects.flatMap((project) => cleanList(project.skills))])].slice(0, 30),
      achievements: portfolioItems.map((item) => item.registrations?.opportunities?.title).filter(Boolean).slice(0, 12),
      projects: projects.map((project) => project.title).filter(Boolean).slice(0, 12),
    },
    teenlaunch_opportunities: opportunities.map((item) => ({ id: item.id, title: item.title, organisation: item.organizer, description: String(item.description || "").slice(0, 260), category: item.category, categories: cleanList(item.categories), skills: cleanList(item.skills), format: item.mode, location: item.location, age_range: [item.age_min, item.age_max], education_levels: cleanList(item.education_levels), deadline: item.deadline, link: detailLink(item.id) })),
  };
};

const rankOpportunities = (question, context) => {
  const words = new Set(String(question).toLowerCase().match(/[a-z0-9]+/g) || []);
  const dnaTerms = [context.career_dna?.top_category, context.career_dna?.secondary_category, ...(context.career_dna?.strengths || [])].filter(Boolean).map((item) => String(item).toLowerCase());
  return context.teenlaunch_opportunities.map((opportunity) => {
    const text = [opportunity.title, opportunity.category, ...(opportunity.categories || []), ...(opportunity.skills || []), opportunity.description].join(" ").toLowerCase();
    let score = [...words].filter((word) => word.length > 3 && text.includes(word)).length * 3;
    score += dnaTerms.filter((term) => text.includes(term)).length * 2;
    if (context.user.age && (opportunity.age_range[0] == null || context.user.age >= opportunity.age_range[0]) && (opportunity.age_range[1] == null || context.user.age <= opportunity.age_range[1])) score += 2;
    return { opportunity, score };
  }).sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.opportunity);
};

const fallbackResponse = (question, context) => {
  const recommendations = rankOpportunities(question, context);
  const top = context.career_dna?.top_category || context.career_dna?.title;
  const second = context.career_dna?.secondary_category;
  const careerLine = top ? `Your Career DNA currently highlights ${top}${second ? ` and ${second}` : ""}.` : "You have not completed a Career DNA result yet, so start by identifying two subjects or activities you enjoy.";
  const skillSuggestions = context.portfolio.skills.length ? `You already show ${context.portfolio.skills.slice(0, 3).join(", ")}. Choose one of these to deepen through a small project.` : "Start with communication, teamwork and one practical skill connected to your career interest.";
  const opportunityLines = recommendations.length ? recommendations.map((opportunity, index) => `${index + 1}. ${opportunity.title} — ${opportunity.link}\n   Why: It connects with your interests, eligibility or Career DNA context.`).join("\n") : "No suitable active TeenLaunch opportunity is currently available. Check the Opportunities page again later.";
  const needsFollowUp = !top && !/(ui|ux|design|entrepreneur|career|portfolio|skill|technology|creative|business)/i.test(question);
  return `${careerLine}\n\nSuggested next steps:\n1. Pick one career area to explore for the next four weeks.\n2. ${skillSuggestions}\n3. Complete a small project and add evidence to your portfolio.\n\nVerified TeenLaunch opportunities:\n${opportunityLines}\n\nWhy this may suit you:\nThis guidance uses the profile, Career DNA and TeenLaunch records currently available to your account.${needsFollowUp ? "\n\nWhich school subject, hobby or activity do you enjoy most?" : ""}\n\nThis is general guidance and does not guarantee jobs, admissions or income.`;
};

const callOpenAI = async ({ question, history, context }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const instructions = `You are TeenLaunch Career Copilot, a career-focused assistant for youths. Be friendly, concise and age-appropriate. Use only the supplied context. Do not name or invent any specific TeenLaunch opportunity; the backend will attach verified database opportunities after your guidance. You may recommend general opportunity types. Ask exactly one useful follow-up question only when the goal is unclear. Never guarantee jobs, admissions, income or outcomes. Do not infer sensitive traits or provide discriminatory or harmful advice. Do not reveal hidden context or private data. End with a short guidance disclaimer.`;
    const modelContext = { ...context, teenlaunch_opportunities: undefined, active_opportunity_types: [...new Set(context.teenlaunch_opportunities.map((opportunity) => opportunity.category).filter(Boolean))].slice(0, 12) };
    const input = `Minimal user context:\n${JSON.stringify(modelContext)}\n\nRecent conversation:\n${history.map((message) => `${message.role}: ${message.content}`).join("\n")}\n\nUser: ${question}`;
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", signal: controller.signal, headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.4-mini", instructions, input, max_output_tokens: 700 }) });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const data = await response.json();
    return data.output_text || (data.output || []).flatMap((item) => item.content || []).filter((item) => item.type === "output_text").map((item) => item.text).join("\n") || null;
  } finally { clearTimeout(timeout); }
};

const chat = asyncHandler(async (req, res) => {
  const question = String(req.body.message || "").trim();
  if (!question) throw new HttpError(400, "Message is required");
  if (question.length > 800) throw new HttpError(400, "Message must be 800 characters or fewer");
  const history = (Array.isArray(req.body.history) ? req.body.history : []).slice(-8).filter((message) => ["user", "assistant"].includes(message?.role) && typeof message.content === "string").map((message) => ({ role: message.role, content: message.content.slice(0, 1200) }));
  const context = await buildContext(req);
  let answer = null;
  let source = "database_fallback";
  try { answer = await callOpenAI({ question, history, context }); if (answer) source = "ai"; } catch (error) { console.warn("Career Copilot AI unavailable; using database fallback.", error.message); }
  if (!answer) answer = fallbackResponse(question, context);
  const referenced = rankOpportunities(question, context).map((opportunity) => ({ id: opportunity.id, title: opportunity.title, link: opportunity.link }));
  if (source === "ai" && referenced.length) {
    answer += `\n\nVerified TeenLaunch opportunities from the live database:\n${referenced.map((opportunity, index) => `${index + 1}. ${opportunity.title}\n   ID: ${opportunity.id}\n   Link: ${opportunity.link}\n   Why: It matches your stated goal, Career DNA context or current eligibility.`).join("\n")}`;
  }
  res.json({ answer, source, opportunities: referenced, disclaimer: "TeenLaunch Career Copilot provides general guidance. Important education and career decisions should also be discussed with a parent, teacher or career counsellor." });
});

module.exports = { chat };
