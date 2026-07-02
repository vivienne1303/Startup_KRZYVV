const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { supabase } = require("../config/supabase");
const {
  createOpportunity,
  deleteOpportunity,
  getOpportunityById,
  listOpportunities,
  updateOpportunity,
} = require("../services/opportunityService");

const list = asyncHandler(async (req, res) => {
  const { data, error } = await listOpportunities(supabase, req.query);

  if (error) throw new HttpError(400, error.message, error.details);

  res.json({ opportunities: data });
});

const getById = asyncHandler(async (req, res) => {
  const { data, error } = await getOpportunityById(supabase, req.params.id);

  if (error) throw new HttpError(404, "Opportunity not found", error.message);

  res.json({ opportunity: data });
});

const create = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    throw new HttpError(400, "title, description, and category are required");
  }

  const { data, error } = await createOpportunity(req.supabase, req.body, req.user.id);

  if (error) throw new HttpError(403, error.message, error.details);

  res.status(201).json({ opportunity: data });
});

const update = asyncHandler(async (req, res) => {
  const { data, error } = await updateOpportunity(req.supabase, req.params.id, req.body);

  if (error) throw new HttpError(403, error.message, error.details);

  res.json({ opportunity: data });
});

const remove = asyncHandler(async (req, res) => {
  const { error } = await deleteOpportunity(req.supabase, req.params.id);

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
