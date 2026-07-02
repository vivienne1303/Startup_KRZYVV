const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { getProfileById, updateOwnProfile } = require("../services/profileService");

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

module.exports = {
  getProfile,
  updateProfile,
};
