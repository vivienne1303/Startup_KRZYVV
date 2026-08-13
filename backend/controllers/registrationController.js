const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const {
  cancelOwnRegistration,
  checkRegistration,
  createRegistration,
  deleteRegistration,
  getRegistrationById,
  listRegistrations,
  updateRegistration,
} = require("../services/registrationService");

const list = asyncHandler(async (req, res) => {
  const { data, error } = await listRegistrations(req.supabase);

  if (error) throw new HttpError(400, error.message, error.details);

  res.json({ registrations: data });
});

const getById = asyncHandler(async (req, res) => {
  const { data, error } = await getRegistrationById(req.supabase, req.params.id);

  if (error) throw new HttpError(404, "Registration not found", error.message);

  res.json({ registration: data });
});

const create = asyncHandler(async (req, res) => {
  if (!req.body.opportunity_id) {
    throw new HttpError(400, "opportunity_id is required");
  }

  const required = ["full_name","email","phone_number","date_of_birth","school_name","education_level","motivation","relevant_experience"];
  const missing = required.filter((field) => !String(req.body[field] || "").trim());
  if (missing.length) throw new HttpError(400, `Missing required fields: ${missing.join(", ")}`);

  const [opportunityResult, existing] = await Promise.all([
    req.supabase.from("opportunities").select("id,title,deadline,age_min,age_max").eq("id", req.body.opportunity_id).single(),
    checkRegistration(req.supabase, req.body.opportunity_id),
  ]);
  const { data: opportunity, error: opportunityError } = opportunityResult;
  if (opportunityError || !opportunity) throw new HttpError(404, "Opportunity not found");
  if (existing.error) throw new HttpError(400, existing.error.message, existing.error.details);
  if (existing.data) throw new HttpError(409, "You have already applied for this opportunity");
  if (opportunity.deadline && new Date(`${opportunity.deadline}T23:59:59`).getTime() < Date.now()) throw new HttpError(400, "This opportunity's deadline has passed");

  const dateOfBirth = new Date(`${req.body.date_of_birth}T00:00:00Z`);
  if (Number.isNaN(dateOfBirth.getTime()) || dateOfBirth.getTime() > Date.now()) {
    throw new HttpError(400, "Enter a valid date of birth");
  }
  const today = new Date();
  let applicantAge = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const birthdayHasPassed = today.getUTCMonth() > dateOfBirth.getUTCMonth()
    || (today.getUTCMonth() === dateOfBirth.getUTCMonth() && today.getUTCDate() >= dateOfBirth.getUTCDate());
  if (!birthdayHasPassed) applicantAge -= 1;
  if (opportunity.age_min !== null && applicantAge < opportunity.age_min) {
    throw new HttpError(403, `This opportunity is only available to applicants aged ${opportunity.age_min} or older`);
  }
  if (opportunity.age_max !== null && applicantAge > opportunity.age_max) {
    throw new HttpError(403, `This opportunity is only available to applicants aged ${opportunity.age_max} or younger`);
  }
  const { data, error } = await createRegistration(req.supabase, req.body, req.user.id);

  if (error) throw new HttpError(403, error.message, error.details);

  res.status(201).json({ registration: data });
});

const check = asyncHandler(async (req, res) => {
  const { data, error } = await checkRegistration(req.supabase, req.params.opportunityId);
  if (error) throw new HttpError(400, error.message, error.details);
  res.json({ applied: Boolean(data), registration: data || null });
});

const update = asyncHandler(async (req, res) => {
  const isAdmin = req.profile?.role === "admin";
  const requestedStatus = req.body?.status;

  if (!isAdmin && requestedStatus && !["cancelled", "canceled"].includes(requestedStatus)) {
    throw new HttpError(403, "Users can only cancel their own registrations");
  }

  const result = isAdmin
    ? await updateRegistration(req.supabase, req.params.id, req.body)
    : await cancelOwnRegistration(req.supabase, req.params.id);

  const { data, error } = result;

  if (error) throw new HttpError(403, error.message, error.details);

  res.json({ registration: data });
});

const remove = asyncHandler(async (req, res) => {
  if (req.profile?.role !== "admin") {
    throw new HttpError(403, "Admin access required");
  }

  const { error } = await deleteRegistration(req.supabase, req.params.id);

  if (error) throw new HttpError(403, error.message, error.details);

  res.status(204).send();
});

module.exports = {
  check,
  create,
  getById,
  list,
  remove,
  update,
};
