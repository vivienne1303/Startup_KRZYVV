const opportunityColumns =
  "id, title, organisation, organizer, description, category, categories, eligibility, minimum_age, maximum_age, age_min, age_max, education_level, education_levels, location, format, mode, application_deadline, deadline, start_date, end_date, source_url, application_url, source_type, status, created_at, last_verified_at, updated_at, skills, image_url, is_published, created_by, source_name, partner_id, external_id, last_synced_at, verification_status, verified_by, verified_at, expiry_date, application_method, internal_application_enabled";

const listOpportunities = async (client, filters = {}) => {
  let query = client
    .from("opportunities")
    .select(opportunityColumns)
    .eq("is_published", true)
    .eq("status", "published")
    .or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString().slice(0, 10)}`)
    .order("application_deadline", { ascending: true, nullsFirst: false });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.mode) query = query.eq("mode", filters.mode);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;
  return { data, error };
};

const getOpportunityById = async (client, id) => {
  const { data, error } = await client
    .from("opportunities")
    .select(opportunityColumns)
    .eq("id", id)
    .eq("is_published", true)
    .eq("status", "published")
    .or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString().slice(0, 10)}`)
    .single();

  return { data, error };
};

const getOpportunityByIdForAdmin = async (client, id) => {
  const { data, error } = await client
    .from("opportunities")
    .select(opportunityColumns)
    .eq("id", id)
    .single();
  return { data, error };
};

const createOpportunity = async (client, payload, userId) => {
  const { data, error } = await client
    .from("opportunities")
    .insert({ ...payload, created_by: userId })
    .select(opportunityColumns)
    .single();

  return { data, error };
};

const updateOpportunity = async (client, id, payload) => {
  const { data, error } = await client
    .from("opportunities")
    .update(payload)
    .eq("id", id)
    .select(opportunityColumns)
    .single();

  return { data, error };
};

const deleteOpportunity = async (client, id) => {
  const { error } = await client.from("opportunities").delete().eq("id", id);
  return { error };
};

module.exports = {
  createOpportunity,
  deleteOpportunity,
  getOpportunityById,
  getOpportunityByIdForAdmin,
  listOpportunities,
  updateOpportunity,
  opportunityColumns,
};
