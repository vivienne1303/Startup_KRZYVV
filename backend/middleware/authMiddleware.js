const { supabase, createUserClient } = require("../config/supabase");
const { getProfileById } = require("../services/profileService");
const HttpError = require("../utils/httpError");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "Missing or invalid Authorization header");
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new HttpError(401, "Invalid or expired access token");
    }

    req.accessToken = token;
    req.user = data.user;
    req.supabase = createUserClient(token);

    const { data: profile, error: profileError } = await getProfileById(req.supabase, data.user.id);

    if (profileError || !profile) {
      throw new HttpError(403, "Authenticated profile could not be verified");
    }

    req.profile = profile;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
