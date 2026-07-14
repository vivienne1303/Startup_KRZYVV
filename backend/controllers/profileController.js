const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { getProfileById, updateOwnProfile } = require("../services/profileService");
const { listRegistrations } = require("../services/registrationService");

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

module.exports = {
  getApplications,
  getCounts,
  getProfile,
  updateProfile,
};
