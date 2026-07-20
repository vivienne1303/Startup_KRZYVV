const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const itemColumns = "id, user_id, registration_id, is_published, position, user_description, reflection, skills_learned, evidence_urls, created_at, updated_at, registrations(id, status, completion_date, completion_verified, certificate_url, completion_badge, verified_skills, admin_remarks, opportunities(id, title, organizer, description, category, image_url))";
const projectColumns = "id, user_id, title, description, skills, evidence_urls, is_published, position, created_at, updated_at";
const cleanArray = (value, limit = 30) => (Array.isArray(value) ? value : String(value || "").split(",")).map((item) => String(item).trim()).filter(Boolean).slice(0, limit);
const cleanUrls = (value) => cleanArray(value, 12).filter((url) => { try { return ["http:", "https:"].includes(new URL(url).protocol); } catch { return false; } });
const cleanContactLink = (value) => { const link = String(value || "").trim(); if (!link) return ""; try { return ["http:", "https:", "mailto:"].includes(new URL(link).protocol) ? link : ""; } catch { return ""; } };
const fail = (error, status = 400) => { if (error) throw new HttpError(status, error.message, error.details); };
const slugify = (value) => String(value || "portfolio").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42);

const ensureProfile = async (req) => {
  const { data: existing, error } = await req.supabase.from("portfolio_profiles").select("*").eq("user_id", req.user.id).maybeSingle();
  fail(error);
  if (existing) return existing;
  const base = slugify(req.profile.username || req.profile.full_name) || "portfolio";
  const { data, error: createError } = await req.supabase.from("portfolio_profiles").insert({ user_id: req.user.id, slug: `${base}-${req.user.id.slice(0, 6)}` }).select("*").single();
  fail(createError); return data;
};

const getMine = asyncHandler(async (req, res) => {
  const portfolio = await ensureProfile(req);
  const [verified, items, projects, dna] = await Promise.all([
    req.supabase.from("registrations").select("id, status, completion_date, completion_verified, certificate_url, completion_badge, verified_skills, admin_remarks, opportunities(id, title, organizer, description, category, image_url)").eq("status", "completed").eq("completion_verified", true).order("completion_date", { ascending: false }),
    req.supabase.from("portfolio_items").select(itemColumns).order("position", { ascending: true }),
    req.supabase.from("portfolio_projects").select(projectColumns).order("position", { ascending: true }),
    req.supabase.from("career_dna_results").select("result_title, summary, strengths, score").order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  [verified, items, projects, dna].forEach((result) => fail(result.error));
  res.json({ portfolio, profile: req.profile, career_dna: dna.data || null, verified_achievements: verified.data || [], items: items.data || [], projects: projects.data || [] });
});

const updateProfile = asyncHandler(async (req, res) => {
  await ensureProfile(req);
  const updates = {};
  ["introduction", "personal_description", "is_public"].forEach((key) => { if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key]; });
  if (req.body.slug) updates.slug = slugify(req.body.slug);
  if (req.body.contact_links) updates.contact_links = { contact: cleanContactLink(req.body.contact_links.contact), social: cleanContactLink(req.body.contact_links.social) };
  if (updates.slug && updates.slug.length < 3) throw new HttpError(400, "Public link must be at least 3 characters");
  const { data, error } = await req.supabase.from("portfolio_profiles").update(updates).eq("user_id", req.user.id).select("*").single();
  fail(error); res.json({ portfolio: data });
});

const addAchievement = asyncHandler(async (req, res) => {
  const registrationId = req.body.registration_id;
  const { data: registration, error: registrationError } = await req.supabase.from("registrations").select("id, user_id, status, completion_verified").eq("id", registrationId).maybeSingle();
  fail(registrationError);
  if (!registration || registration.user_id !== req.user.id || registration.status !== "completed" || !registration.completion_verified) throw new HttpError(403, "Only your verified completed activities can be added");
  const payload = { user_id: req.user.id, registration_id: registrationId, is_published: Boolean(req.body.is_published), position: Number(req.body.position || 0), user_description: req.body.user_description || null, reflection: req.body.reflection || null, skills_learned: cleanArray(req.body.skills_learned), evidence_urls: cleanUrls(req.body.evidence_urls) };
  const { data, error } = await req.supabase.from("portfolio_items").upsert(payload, { onConflict: "user_id,registration_id" }).select(itemColumns).single();
  fail(error); res.status(201).json({ item: data });
});

const updateAchievement = asyncHandler(async (req, res) => {
  const updates = {};
  ["is_published", "position", "user_description", "reflection"].forEach((key) => { if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key]; });
  if (Object.prototype.hasOwnProperty.call(req.body, "skills_learned")) updates.skills_learned = cleanArray(req.body.skills_learned);
  if (Object.prototype.hasOwnProperty.call(req.body, "evidence_urls")) updates.evidence_urls = cleanUrls(req.body.evidence_urls);
  const { data, error } = await req.supabase.from("portfolio_items").update(updates).eq("id", req.params.id).select(itemColumns).single();
  fail(error); res.json({ item: data });
});

const removeAchievement = asyncHandler(async (req, res) => {
  const { error } = await req.supabase.from("portfolio_items").delete().eq("id", req.params.id); fail(error); res.status(204).send();
});

const createProject = asyncHandler(async (req, res) => {
  if (!String(req.body.title || "").trim()) throw new HttpError(400, "Project title is required");
  const payload = { user_id: req.user.id, title: String(req.body.title).trim(), description: req.body.description || null, skills: cleanArray(req.body.skills), evidence_urls: cleanUrls(req.body.evidence_urls), is_published: Boolean(req.body.is_published), position: Number(req.body.position || 0) };
  const { data, error } = await req.supabase.from("portfolio_projects").insert(payload).select(projectColumns).single(); fail(error); res.status(201).json({ project: data });
});

const updateProject = asyncHandler(async (req, res) => {
  const updates = {};
  ["title", "description", "is_published", "position"].forEach((key) => { if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key]; });
  if (req.body.skills !== undefined) updates.skills = cleanArray(req.body.skills);
  if (req.body.evidence_urls !== undefined) updates.evidence_urls = cleanUrls(req.body.evidence_urls);
  const { data, error } = await req.supabase.from("portfolio_projects").update(updates).eq("id", req.params.id).select(projectColumns).single(); fail(error); res.json({ project: data });
});

const deleteProject = asyncHandler(async (req, res) => { const { error } = await req.supabase.from("portfolio_projects").delete().eq("id", req.params.id); fail(error); res.status(204).send(); });

const improveText = asyncHandler(async (req, res) => {
  const text = String(req.body.text || "").trim().slice(0, 3000);
  if (!text) throw new HttpError(400, "Enter a reflection or description first");
  const formatted = `During this experience, ${text.charAt(0).toLowerCase()}${text.slice(1).replace(/[.!?]?$/, ".")} I strengthened practical skills, reflected on what I learned, and identified how I can apply this experience in future opportunities.`;
  res.json({ text: formatted, method: "template", notice: "Formatted with a writing template. No AI API is configured." });
});

const getPublic = asyncHandler(async (req, res) => {
  const admin = req.app.locals.supabaseAdmin;
  const { data: portfolio, error } = await admin.from("portfolio_profiles").select("*").eq("slug", req.params.slug).eq("is_public", true).maybeSingle();
  fail(error); if (!portfolio) throw new HttpError(404, "Public portfolio not found");
  const [profile, dna, items, projects] = await Promise.all([
    admin.from("user_profiles").select("id, username, full_name, profile_picture_url, avatar_url, bio, school_name, country").eq("id", portfolio.user_id).single(),
    admin.from("career_dna_results").select("result_title, summary, strengths, score").eq("user_id", portfolio.user_id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("portfolio_items").select(itemColumns).eq("user_id", portfolio.user_id).eq("is_published", true).order("position"),
    admin.from("portfolio_projects").select(projectColumns).eq("user_id", portfolio.user_id).eq("is_published", true).order("position"),
  ]);
  [profile, dna, items, projects].forEach((result) => fail(result.error));
  res.json({ portfolio, profile: profile.data, career_dna: dna.data || null, items: items.data || [], projects: projects.data || [] });
});

module.exports = { getMine, updateProfile, addAchievement, updateAchievement, removeAchievement, createProject, updateProject, deleteProject, improveText, getPublic };
