const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sanitizeAuthUser } = require("../utils/sanitize");
const { registerUser, loginUser } = require("../services/authService");
const { getProfileById, updateOwnProfile } = require("../services/profileService");

const register = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || body.full_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const { role, profile } = body;
  const missingFields = [];

  if (!name) missingFields.push("name");
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");

  if (missingFields.length > 0) {
    throw new HttpError(400, `${missingFields.join(", ")} required`);
  }

  if (role && role !== "user") {
    throw new HttpError(403, "Admin accounts cannot be created through public registration");
  }

  const result = await registerUser({
    name,
    email,
    password,
    profile,
  });

  res.status(201).json({
    message: "Registration successful. You can now log in.",
    user: sanitizeAuthUser(result.user),
    profile: result.profile,
    role: result.profile.role,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new HttpError(400, "email and password are required");
  }

  const data = await loginUser({
    email: email.trim().toLowerCase(),
    password,
  });

  const { data: profile, error } = await getProfileById(req.app.locals.supabaseAdmin, data.user.id);

  if (error) {
    throw new HttpError(404, "User profile not found", error.message);
  }

  res.json({
    token: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: sanitizeAuthUser(data.user),
    profile,
    role: profile.role,
  });
});

const me = asyncHandler(async (req, res) => {
  const { data: profile, error } = await getProfileById(req.supabase, req.user.id);

  if (error) {
    throw new HttpError(404, "User profile not found", error.message);
  }

  res.json({
    user: sanitizeAuthUser(req.user),
    profile,
    role: profile.role,
  });
});

const logout = asyncHandler(async (req, res) => {
  const { error } = await req.app.locals.supabaseAdmin.auth.admin.signOut(req.accessToken);

  if (error) {
    throw new HttpError(400, error.message);
  }

  res.json({ message: "Logout successful" });
});

const updateMe = asyncHandler(async (req, res) => {
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
  login,
  logout,
  me,
  register,
  updateMe,
};
