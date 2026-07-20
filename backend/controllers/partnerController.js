const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { supabaseAdmin } = require("../config/supabase");
const partnerSource = require("../services/opportunitySources/partnerSource");
const { opportunityColumns } = require("../services/opportunityService");

const text = (value, limit = 500) => String(value || "").trim().slice(0, limit);
const url = (value) => { const clean = text(value, 1000); if (!clean) return null; try { return ["http:", "https:"].includes(new URL(clean).protocol) ? clean : null; } catch { return null; } };
const email = (value) => /^\S+@\S+\.\S+$/.test(text(value, 320)) ? text(value, 320).toLowerCase() : null;
const list = (value) => (Array.isArray(value) ? value : String(value || "").split(",")).map((item) => text(item, 80)).filter(Boolean).slice(0, 30);
const fail = (error, status = 400) => { if (error) throw new HttpError(status, error.message, error.details); };

const requireMembership = async (userId, partnerId) => {
  const result = await supabaseAdmin.from("partner_members").select("partner_id,user_id,member_role,partner_organisations(*)").eq("user_id", userId).eq("partner_id", partnerId).maybeSingle();
  fail(result.error); if (!result.data) throw new HttpError(403, "You do not belong to this partner organisation"); return result.data;
};

const cleanOpportunity = (body) => ({
  title: text(body.title, 120), description: text(body.description, 5000), category: text(body.category, 100),
  categories: list(body.categories || body.category), skills: list(body.skills), education_levels: list(body.education_levels),
  location: text(body.location, 200) || null, mode: ["online", "in_person", "hybrid"].includes(body.mode) ? body.mode : null,
  age_min: body.age_min === "" || body.age_min == null ? null : Number(body.age_min), age_max: body.age_max === "" || body.age_max == null ? null : Number(body.age_max),
  deadline: body.deadline || null, start_date: body.start_date || null, end_date: body.end_date || null,
  application_url: url(body.application_url), image_url: url(body.image_url), source_url: url(body.source_url), external_id: text(body.external_id, 200) || null,
  expiry_date: body.expiry_date || body.deadline || null, application_method: ["internal", "external", "both"].includes(body.application_method) ? body.application_method : "internal",
  internal_application_enabled: Boolean(body.internal_application_enabled),
});

const getMine = asyncHandler(async (req, res) => {
  const memberships = await supabaseAdmin.from("partner_members").select("partner_id,member_role,partner_organisations(*)").eq("user_id", req.user.id).order("created_at");
  fail(memberships.error);
  const partnerIds = (memberships.data || []).map((item) => item.partner_id);
  let submissions = { data: [], error: null };
  if (partnerIds.length) submissions = await supabaseAdmin.from("opportunities").select(opportunityColumns).in("partner_id", partnerIds).order("updated_at", { ascending: false });
  fail(submissions.error); res.json({ memberships: memberships.data || [], submissions: submissions.data || [] });
});

const createOrganisation = asyncHandler(async (req, res) => {
  const payload = { organisation_name: text(req.body.organisation_name, 160), organisation_description: text(req.body.organisation_description, 3000) || null, logo_url: url(req.body.logo_url), website_url: url(req.body.website_url), contact_name: text(req.body.contact_name, 160), contact_email: email(req.body.contact_email), created_by: req.user.id, verification_status: "pending_review" };
  if (!payload.organisation_name || !payload.contact_name || !payload.contact_email) throw new HttpError(400, "Organisation name, contact name and a valid contact email are required");
  const created = await supabaseAdmin.from("partner_organisations").insert(payload).select("*").single(); fail(created.error);
  const member = await supabaseAdmin.from("partner_members").insert({ partner_id: created.data.id, user_id: req.user.id, member_role: "owner" });
  if (member.error) { await supabaseAdmin.from("partner_organisations").delete().eq("id", created.data.id); fail(member.error); }
  res.status(201).json({ organisation: created.data });
});

const updateOrganisation = asyncHandler(async (req, res) => {
  const membership = await requireMembership(req.user.id, req.params.id);
  if (membership.member_role !== "owner") throw new HttpError(403, "Only the partner owner can edit organisation details");
  if (membership.partner_organisations.verification_status === "verified") throw new HttpError(403, "Contact TeenLaunch to change a verified organisation");
  const updates = { organisation_name: text(req.body.organisation_name, 160), organisation_description: text(req.body.organisation_description, 3000) || null, logo_url: url(req.body.logo_url), website_url: url(req.body.website_url), contact_name: text(req.body.contact_name, 160), contact_email: email(req.body.contact_email) };
  const result = await supabaseAdmin.from("partner_organisations").update(updates).eq("id", req.params.id).select("*").single(); fail(result.error); res.json({ organisation: result.data });
});

const createSubmission = asyncHandler(async (req, res) => {
  const membership = await requireMembership(req.user.id, req.body.partner_id);
  const clean = cleanOpportunity(req.body);
  if (!clean.title || !clean.description || !clean.category) throw new HttpError(400, "Title, description and category are required");
  const payload = partnerSource.normaliseOpportunity(clean, membership.partner_organisations);
  const duplicates = await partnerSource.detectDuplicates(supabaseAdmin, payload); fail(duplicates.error);
  if (duplicates.data.length) throw new HttpError(409, "A similar opportunity already exists", duplicates.data);
  const result = await supabaseAdmin.from("opportunities").insert({ ...payload, created_by: req.user.id }).select(opportunityColumns).single(); fail(result.error); res.status(201).json({ opportunity: result.data, duplicate_warnings: [] });
});

const updateSubmission = asyncHandler(async (req, res) => {
  const existing = await supabaseAdmin.from("opportunities").select("*").eq("id", req.params.id).maybeSingle(); fail(existing.error);
  if (!existing.data?.partner_id) throw new HttpError(404, "Partner submission not found");
  const membership = await requireMembership(req.user.id, existing.data.partner_id);
  if (!["draft", "pending_review", "rejected"].includes(existing.data.verification_status)) throw new HttpError(403, "Verified opportunities must be changed by a TeenLaunch admin");
  const payload = partnerSource.normaliseOpportunity(cleanOpportunity(req.body), membership.partner_organisations);
  const duplicates = await partnerSource.detectDuplicates(supabaseAdmin, { ...payload, external_id: payload.external_id || existing.data.external_id }); fail(duplicates.error);
  const otherDuplicates = duplicates.data.filter((item) => item.id !== req.params.id);
  if (otherDuplicates.length) throw new HttpError(409, "A similar opportunity already exists", otherDuplicates);
  const result = await supabaseAdmin.from("opportunities").update(payload).eq("id", req.params.id).select(opportunityColumns).single(); fail(result.error); res.json({ opportunity: result.data });
});

module.exports = { getMine, createOrganisation, updateOrganisation, createSubmission, updateSubmission };
