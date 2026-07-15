const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { getProfileById, updateOwnProfile } = require("../services/profileService");
const { listRegistrations } = require("../services/registrationService");
const { listSaved, remove: removeSaved, save: saveOpportunity } = require("../services/savedOpportunityService");

const getProfile = asyncHandler(async (req, res) => {
  const { data, error } = await getProfileById(req.supabase, req.user.id);

  if (error) {
    throw new HttpError(404, "Profile not found", error.message);
  }

  res.json({ profile: data });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (Object.prototype.hasOwnProperty.call(req.body, "role")) {
    throw new HttpError(403, "Role cannot be updated through this endpoint");
  }

  const { data, error } = await updateOwnProfile(req.supabase, req.user.id, req.body);

  if (error) {
    throw new HttpError(400, error.message, error.details);
  }

  res.json({ profile: data });
});

const getApplications = asyncHandler(async (req, res) => {
  const { data, error } = await listRegistrations(req.supabase);
  if (error) throw new HttpError(400, error.message, error.details);
  res.json({ applications: data || [] });
});

const getCounts = asyncHandler(async (req, res) => {
  const [followers, following, applications] = await Promise.all([
    req.supabase.from("user_follows").select("id", { count: "exact", head: true }).eq("following_id", req.user.id),
    req.supabase.from("user_follows").select("id", { count: "exact", head: true }).eq("follower_id", req.user.id),
    req.supabase.from("registrations").select("id", { count: "exact", head: true }),
  ]);
  const failure = [followers, following, applications].find((result) => result.error);
  if (failure) throw new HttpError(400, failure.error.message, failure.error.details);
  res.json({ counts: { followers: followers.count || 0, following: following.count || 0, applications: applications.count || 0 } });
});

const getSaved = asyncHandler(async (req, res) => {
  const { data, error } = await listSaved(req.supabase);
  if (error && ["42P01", "PGRST205"].includes(error.code)) {
    res.json({ saved: [], available: false });
    return;
  }
  if (error) throw new HttpError(400, error.message, error.details);
  res.json({ saved: data || [] });
});

const addSaved = asyncHandler(async (req, res) => {
  if (!req.body.opportunity_id) throw new HttpError(400, "opportunity_id is required");
  const { data, error } = await saveOpportunity(req.supabase, req.user.id, req.body.opportunity_id);
  if (error) throw new HttpError(error.code === "23505" ? 409 : 400, error.code === "23505" ? "Opportunity is already saved" : error.message, error.details);
  res.status(201).json({ saved: data });
});

const deleteSaved = asyncHandler(async (req, res) => {
  const { error } = await removeSaved(req.supabase, req.params.opportunityId);
  if (error) throw new HttpError(400, error.message, error.details);
  res.status(204).send();
});

module.exports = {
  getApplications,
  getSaved,
  addSaved,
  deleteSaved,
  getCounts,
  getProfile,
  updateProfile,
};
