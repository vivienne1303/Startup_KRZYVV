const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { supabaseAdmin } = require("../config/supabase");
const sourceBase = require("../services/opportunitySources/apiSourceBase");
const { opportunityColumns } = require("../services/opportunityService");
const { categoryFrom, fallbackTitleFromUrl, fetchAndExtract } = require("../services/opportunityImportService");
const manualSource = require("../services/opportunitySources/manualSource");

const detector = new sourceBase();
const fail = (error) => { if (error) throw new HttpError(400, error.message, error.details); };

const previewImport = asyncHandler(async (req, res) => {
  const opportunity = await fetchAndExtract(req.body.url);
  const duplicate = await detector.detectDuplicates(supabaseAdmin, opportunity); fail(duplicate.error);
  res.json({ opportunity, duplicate_warnings: duplicate.data || [] });
});

const saveImport = asyncHandler(async (req, res) => {
  const sourceUrl = req.body.source_url || req.body.application_url || req.body.url;
  let url;
  try { url = new URL(sourceUrl); } catch { throw new HttpError(400, "Enter a valid external opportunity URL"); }
  if (!["http:", "https:"].includes(url.protocol)) throw new HttpError(400, "Only http(s) links are supported");
  const slug = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() || "")
    .replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  const fallbackTitle = slug && !/^\d+$/.test(slug) ? slug : fallbackTitleFromUrl(url.href);
  let extracted = {};
  try { extracted = await fetchAndExtract(url.href); } catch (_) {
    extracted = { title: fallbackTitle, organisation: url.hostname.replace(/^www\./, ""), description: "Open the official website for full opportunity details, eligibility, dates, and application requirements.", category: categoryFrom(fallbackTitle, url.href), source_url: url.href, application_url: url.href };
  }
  const { url: _submittedUrl, ...submittedFields } = req.body;
  const payload = manualSource.normaliseOpportunity({
    ...extracted,
    title: req.body.title || extracted.title || fallbackTitle,
    organisation: req.body.organisation || extracted.organisation || url.hostname.replace(/^www\./, ""),
    description: req.body.description || extracted.description || "Open the official website for full opportunity details, eligibility, dates, and application requirements.",
    category: req.body.category || extracted.category || categoryFrom(fallbackTitle, url.href),
    ...submittedFields,
    source_url: url.href,
    application_url: req.body.application_url || extracted.application_url || url.href,
    source_type: "ai_fetched",
    status: "pending_review",
    is_published: false,
  }, req.user.id);
  payload.title = String(payload.title || fallbackTitle || `Opportunity from ${url.hostname}`).trim();
  payload.description = String(payload.description || "Open the official website for full opportunity details, eligibility, dates, and application requirements.").trim();
  payload.category = String(payload.category || categoryFrom(payload.title, payload.description, url.href) || "External opportunity").trim();
  payload.categories = Array.isArray(payload.categories) && payload.categories.length ? payload.categories : [payload.category];
  if (!payload.title || !payload.description || !payload.category) throw new HttpError(422, "The official link could not be prepared for review. Please try again.");
  const duplicate = await detector.detectDuplicates(supabaseAdmin, payload); fail(duplicate.error);
  if (duplicate.data?.length) throw new HttpError(409, "This opportunity appears to have already been imported", duplicate.data);
  const result = await supabaseAdmin.from("opportunities").insert(payload).select(opportunityColumns).single(); fail(result.error);
  res.status(201).json({ opportunity: result.data });
});

const bulkImport = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.opportunities) || !req.body.opportunities.length || req.body.opportunities.length > 200) throw new HttpError(400, "Provide 1 to 200 opportunities");
  const imported = [], duplicates = [], errors = [];
  for (const [index, item] of req.body.opportunities.entries()) {
    const payload = manualSource.normaliseOpportunity({ ...item, source_type: item.source_type || "manual", status: "pending_review", is_published: false }, req.user.id);
    if (!payload.title || !payload.description || !payload.category) { errors.push({ index, message: "title, description, and category are required" }); continue; }
    const duplicate = await detector.detectDuplicates(supabaseAdmin, payload);
    if (duplicate.error) { errors.push({ index, message: duplicate.error.message }); continue; }
    if (duplicate.data?.length) { duplicates.push({ index, title: payload.title, matches: duplicate.data }); continue; }
    const result = await supabaseAdmin.from("opportunities").insert(payload).select(opportunityColumns).single();
    if (result.error) errors.push({ index, message: result.error.message }); else imported.push(result.data);
  }
  res.status(imported.length ? 201 : 200).json({ imported, duplicates, errors });
});

const listPartners = asyncHandler(async (_req, res) => {
  const result = await supabaseAdmin.from("partner_organisations").select("*").order("created_at", { ascending: false }); fail(result.error); res.json({ partners: result.data || [] });
});

const reviewPartner = asyncHandler(async (req, res) => {
  const status = req.body.verification_status;
  if (!["pending_review", "verified", "rejected"].includes(status)) throw new HttpError(400, "Invalid partner verification status");
  const updates = { verification_status: status, verified_by: status === "verified" ? req.user.id : null, verified_at: status === "verified" ? new Date().toISOString() : null };
  const result = await supabaseAdmin.from("partner_organisations").update(updates).eq("id", req.params.id).select("*").single(); fail(result.error); res.json({ partner: result.data });
});

const reviewQueue = asyncHandler(async (_req, res) => {
  const result = await supabaseAdmin.from("opportunities").select(`${opportunityColumns}, partner_organisations(organisation_name,website_url,logo_url)`).in("verification_status", ["draft", "pending_review"]).order("created_at", { ascending: false }); fail(result.error);
  const opportunities = await Promise.all((result.data || []).map(async (item) => { const duplicate = await detector.detectDuplicates(supabaseAdmin, item); return { ...item, duplicate_warnings: (duplicate.data || []).filter((candidate) => candidate.id !== item.id) }; }));
  res.json({ opportunities });
});

const reviewOpportunity = asyncHandler(async (req, res) => {
  const action = req.body.action;
  if (!["approve", "reject", "expire", "return_to_review"].includes(action)) throw new HttpError(400, "Invalid review action");
  if (action === "approve") {
    const current = await supabaseAdmin.from("opportunities").select("application_deadline").eq("id", req.params.id).single(); fail(current.error);
    if (current.data.application_deadline && current.data.application_deadline < new Date().toISOString().slice(0, 10)) throw new HttpError(400, "An opportunity with a past deadline cannot be published");
  }
  const updates = action === "approve" ? { verification_status: "verified", verified_by: req.user.id, verified_at: new Date().toISOString(), last_verified_at: new Date().toISOString(), status: "published", is_published: true }
    : action === "reject" ? { verification_status: "rejected", verified_by: req.user.id, verified_at: new Date().toISOString(), status: "draft", is_published: false }
      : action === "expire" ? { verification_status: "expired", status: "expired", is_published: false }
        : { verification_status: "pending_review", verified_by: null, verified_at: null, status: "draft", is_published: false };
  const result = await supabaseAdmin.from("opportunities").update(updates).eq("id", req.params.id).select(opportunityColumns).single(); fail(result.error); res.json({ opportunity: result.data });
});

module.exports = { bulkImport, listPartners, previewImport, reviewPartner, reviewQueue, reviewOpportunity, saveImport };
