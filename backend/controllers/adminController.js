const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sanitizeAuthUser } = require("../utils/sanitize");
const { supabaseAdmin } = require("../config/supabase");
const { getProfileById, listProfiles, profileColumns, updateProfileById } = require("../services/profileService");
const { listRegistrations, updateRegistration, deleteRegistration } = require("../services/registrationService");
const { listCareerDnaResults } = require("../services/careerDnaService");
const { getOpportunityByIdForAdmin } = require("../services/opportunityService");

const validateRole = (role) => {
  if (role && !["user", "admin"].includes(role)) {
    throw new HttpError(400, "role must be either 'user' or 'admin'");
  }
};

const normalizeRegistrationPayload = (payload) => {
  const nextPayload = { ...(payload || {}) };
  const statusMap = {
    approved: "accepted",
    approve: "accepted",
    reject: "rejected",
    canceled: "cancelled",
    verified: "completed",
    attended: "completed",
    attendance_verified: "completed",
  };

  if (nextPayload.status) {
    nextPayload.status = statusMap[nextPayload.status] || nextPayload.status;
  }

  return nextPayload;
};

const createDevelopmentAdmin = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    throw new HttpError(404, "Endpoint not found");
  }

  const body = req.body || {};
  const name = String(body.name || body.full_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name || !email || !password) {
    throw new HttpError(400, "name, email, and password are required");
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name,
    },
  });

  if (authError || !authData.user) {
    throw new HttpError(400, authError?.message || "Admin user could not be created");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .insert({
      id: authData.user.id,
      full_name: name,
      role: "admin",
      avatar_url: body.profile?.avatar_url || null,
      bio: body.profile?.bio || null,
      school_name: body.profile?.school_name || null,
      age: body.profile?.age || null,
      education_level: body.profile?.education_level || null,
      country: body.profile?.country || null,
    })
    .select(profileColumns)
    .single();

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new HttpError(400, profileError.message, profileError.details);
  }

  res.status(201).json({
    message: "Development admin created. Disable this endpoint before production.",
    user: sanitizeAuthUser(authData.user),
    profile,
    role: profile.role,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const perPage = Number(req.query.perPage || 100);
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page,
    perPage: Math.min(Math.max(perPage, 1), 1000),
  });

  if (error) throw new HttpError(400, error.message);

  res.json({
    users: data.users.map(sanitizeAuthUser),
  });
});

const listUserProfiles = asyncHandler(async (req, res) => {
  const { data, error } = await listProfiles(supabaseAdmin);

  if (error) throw new HttpError(400, error.message, error.details);

  res.json({ profiles: data });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { data, error } = await getProfileById(supabaseAdmin, req.params.id);

  if (error || !data) throw new HttpError(404, "Profile not found", error?.message);

  res.json({ profile: data });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  validateRole(req.body?.role);

  const { data, error } = await updateProfileById(supabaseAdmin, req.params.id, req.body || {}, {
    allowRole: true,
  });

  if (error) throw new HttpError(400, error.message, error.details);

  res.json({ profile: data });
});

const listAllRegistrations = asyncHandler(async (req, res) => {
  const { data, error } = await listRegistrations(supabaseAdmin);

  if (error) throw new HttpError(400, error.message, error.details);

  res.json({ registrations: data });
});

const updateAnyRegistration = asyncHandler(async (req, res) => {
  const { data, error } = await updateRegistration(
    supabaseAdmin,
    req.params.id,
    normalizeRegistrationPayload(req.body)
  );

  if (error) throw new HttpError(400, error.message, error.details);

  res.json({ registration: data });
});

const deleteAnyRegistration = asyncHandler(async (req, res) => {
  const { error } = await deleteRegistration(supabaseAdmin, req.params.id);

  if (error) throw new HttpError(400, error.message, error.details);

  res.status(204).send();
});

const listAllCareerDnaResults = asyncHandler(async (req, res) => {
  const { data, error } = await listCareerDnaResults(supabaseAdmin);

  if (error) throw new HttpError(400, error.message, error.details);

  res.json({ results: data });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const [profiles, opportunities, registrations, careerDnaResults] = await Promise.all([
    supabaseAdmin.from("user_profiles").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("opportunities").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("registrations").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("career_dna_results").select("id", { count: "exact", head: true }),
  ]);

  const firstError = [profiles, opportunities, registrations, careerDnaResults].find((result) => result.error);
  if (firstError) throw new HttpError(400, firstError.error.message, firstError.error.details);

  res.json({
    stats: {
      totalUsers: profiles.count || 0,
      totalOpportunities: opportunities.count || 0,
      totalRegistrations: registrations.count || 0,
      totalCareerDnaResults: careerDnaResults.count || 0,
    },
  });
});

const getOpportunity = asyncHandler(async (req, res) => {
  const { data, error } = await getOpportunityByIdForAdmin(supabaseAdmin, req.params.id);
  if (error || !data) throw new HttpError(404, "Opportunity not found", error?.message);
  res.json({ opportunity: data });
});

module.exports = {
  createDevelopmentAdmin,
  deleteAnyRegistration,
  getDashboardStats,
  getOpportunity,
  getUserProfile,
  listAllCareerDnaResults,
  listAllRegistrations,
  listUserProfiles,
  listUsers,
  updateAnyRegistration,
  updateUserProfile,
};
