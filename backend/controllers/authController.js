const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sanitizeAuthUser } = require("../utils/sanitize");
const { registerUser, loginUser } = require("../services/authService");
const { createProfileForUser, getProfileById, updateOwnProfile } = require("../services/profileService");

const register = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || body.full_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const schoolName = String(body.school_name || "").trim();
  const educationLevel = String(body.education_level || "").trim();
  const age = body.age === undefined || body.age === null || body.age === "" ? null : Number(body.age);
  const missingFields = [];

  if (!name) missingFields.push("name");
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");
  if (age === null) missingFields.push("age");
  if (!educationLevel) missingFields.push("education_level");

  if (missingFields.length > 0) {
    throw new HttpError(400, `${missingFields.join(", ")} required`);
  }

  if (Object.prototype.hasOwnProperty.call(body, "role")) {
    throw new HttpError(403, "Role cannot be set through public registration");
  }

  if (!Number.isInteger(age) || age < 1 || age > 120) {
    throw new HttpError(400, "age must be a valid whole number");
  }

  const allowedEducationLevels = [
    "Secondary School",
    "Junior College",
    "Polytechnic",
    "ITE",
    "University",
    "Other",
  ];

  if (!allowedEducationLevels.includes(educationLevel)) {
    throw new HttpError(400, "education_level is invalid");
  }

  const result = await registerUser({
    name,
    email,
    password,
    profile: {
      age,
      school_name: schoolName,
      education_level: educationLevel,
    },
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

  let { data: profile, error } = await getProfileById(req.app.locals.supabaseAdmin, data.user.id);

  // Repair legacy Supabase users whose auth account exists without a profile row.
  if (!profile && error?.code === "PGRST116") {
    const created = await createProfileForUser({
      userId: data.user.id,
      fullName: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "TeenLaunch user",
      profile: {},
    });
    profile = created.data;
    error = created.error;
  }

  if (error || !profile) {
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

  const { data, error } = await updateOwnProfile(req.app.locals.supabaseAdmin, req.user.id, req.body);

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
