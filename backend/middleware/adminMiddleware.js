const { getProfileById } = require("../services/profileService");
const HttpError = require("../utils/httpError");

const adminMiddleware = async (req, res, next) => {
  try {
    const { data: profile, error } = await getProfileById(req.supabase, req.user.id);

    if (error || !profile) {
      throw new HttpError(403, "Admin profile could not be verified");
    }

    if (profile.role !== "admin") {
      throw new HttpError(403, "Admin access required");
    }

    req.profile = profile;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminMiddleware;
