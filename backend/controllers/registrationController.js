const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const {
  cancelOwnRegistration,
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

  const { data, error } = await createRegistration(req.supabase, req.body, req.user.id);

  if (error) throw new HttpError(403, error.message, error.details);

  res.status(201).json({ registration: data });
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
  create,
  getById,
  list,
  remove,
  update,
};
