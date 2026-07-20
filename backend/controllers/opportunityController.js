const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { supabase } = require("../config/supabase");
const { ensureDemoOpportunities } = require("../services/demoOpportunityService");
const { getMatchedOpportunities } = require("../services/opportunityMatchingService");
const manualSource = require("../services/opportunitySources/manualSource");
const {
  createOpportunity,
  deleteOpportunity,
  getOpportunityById,
  listOpportunities,
  updateOpportunity,
} = require("../services/opportunityService");

const list = asyncHandler(async (req, res) => {
  let { data, error } = await listOpportunities(supabase, req.query);

  if (error) throw new HttpError(400, error.message, error.details);

  if (!data?.length && !Object.keys(req.query).length) {
    const seeded = await ensureDemoOpportunities();
    if (seeded.error) throw new HttpError(400, seeded.error.message, seeded.error.details);
    ({ data, error } = await listOpportunities(supabase, req.query));
    if (error) throw new HttpError(400, error.message, error.details);
  }

  res.json({ opportunities: data });
});

const getById = asyncHandler(async (req, res) => {
  const { data, error } = await getOpportunityById(supabase, req.params.id);

  if (error) throw new HttpError(404, "Opportunity not found", error.message);

  res.json({ opportunity: data });
});

const recommended = asyncHandler(async (req, res) => {
  const { data, error } = await getMatchedOpportunities(req.supabase, req.user.id);
  if (error) throw new HttpError(400, error.message, error.details);
  res.json(data);
});

const create = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;

  if (!title || !description || !category) {
    throw new HttpError(400, "title, description, and category are required");
  }

  const payload = manualSource.normaliseOpportunity(req.body, req.user.id);
  const duplicates = await manualSource.detectDuplicates(req.supabase, payload);
  if (duplicates.error) throw new HttpError(400, duplicates.error.message, duplicates.error.details);
  if (duplicates.data.length) throw new HttpError(409, "A similar opportunity already exists", duplicates.data);
  const { data, error } = await createOpportunity(req.supabase, payload, req.user.id);

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
  recommended,
  remove,
  update,
};
