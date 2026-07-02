const { getProfileById } = require("../services/profileService");
const HttpError = require("../utils/httpError");

const adminMiddleware = async (req, res, next) => {
  try {
    let profile = req.profile;

    if (!profile) {
      const { data, error } = await getProfileById(req.supabase, req.user.id);

      if (error || !data) {
        throw new HttpError(403, "Admin profile could not be verified");
      }

      profile = data;
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
