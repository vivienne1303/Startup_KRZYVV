const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { supabaseAdmin } = require("../config/supabase");
const sourceBase = require("../services/opportunitySources/apiSourceBase");
const { opportunityColumns } = require("../services/opportunityService");

const detector = new sourceBase();
const fail = (error) => { if (error) throw new HttpError(400, error.message, error.details); };

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
  const result = await supabaseAdmin.from("opportunities").select(`${opportunityColumns}, partner_organisations(organisation_name,website_url,logo_url)`).in("verification_status", ["draft", "pending_review", "rejected"]).order("created_at", { ascending: false }); fail(result.error);
  const opportunities = await Promise.all((result.data || []).map(async (item) => { const duplicate = await detector.detectDuplicates(supabaseAdmin, item); return { ...item, duplicate_warnings: (duplicate.data || []).filter((candidate) => candidate.id !== item.id) }; }));
  res.json({ opportunities });
});

const reviewOpportunity = asyncHandler(async (req, res) => {
  const action = req.body.action;
  if (!["approve", "reject", "expire", "return_to_review"].includes(action)) throw new HttpError(400, "Invalid review action");
  const updates = action === "approve" ? { verification_status: "verified", verified_by: req.user.id, verified_at: new Date().toISOString(), status: "active", is_published: true }
    : action === "reject" ? { verification_status: "rejected", verified_by: req.user.id, verified_at: new Date().toISOString(), status: "inactive", is_published: false }
      : action === "expire" ? { verification_status: "expired", status: "inactive", is_published: false }
        : { verification_status: "pending_review", verified_by: null, verified_at: null, status: "draft", is_published: false };
  const result = await supabaseAdmin.from("opportunities").update(updates).eq("id", req.params.id).select(opportunityColumns).single(); fail(result.error); res.json({ opportunity: result.data });
});

module.exports = { listPartners, reviewPartner, reviewQueue, reviewOpportunity };
