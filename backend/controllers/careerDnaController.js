const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const {
  createCareerDnaResult,
  deleteCareerDnaResult,
  getCareerDnaResultById,
  listCareerDnaResults,
  updateCareerDnaResult,
} = require("../services/careerDnaService");

const list = asyncHandler(async (req, res) => {
  const { data, error } = await listCareerDnaResults(req.supabase);

  if (error) throw new HttpError(400, error.message, error.details);

  res.json({ results: data });
});

const getById = asyncHandler(async (req, res) => {
  const { data, error } = await getCareerDnaResultById(req.supabase, req.params.id);

  if (error) throw new HttpError(404, "Career DNA result not found", error.message);

  res.json({ result: data });
});

const create = asyncHandler(async (req, res) => {
  if (!req.body.result_title) {
    throw new HttpError(400, "result_title is required");
  }

  const { data, error } = await createCareerDnaResult(req.supabase, req.body, req.user.id);

  if (error) throw new HttpError(403, error.message, error.details);

  res.status(201).json({ result: data });
});

const update = asyncHandler(async (req, res) => {
  const { data, error } = await updateCareerDnaResult(req.supabase, req.params.id, req.body);

  if (error) throw new HttpError(403, error.message, error.details);

  res.json({ result: data });
});

const remove = asyncHandler(async (req, res) => {
  const { error } = await deleteCareerDnaResult(req.supabase, req.params.id);

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
