const opportunityColumns =
  "id, title, description, category, organizer, location, mode, age_min, age_max, deadline, start_date, end_date, application_url, image_url, is_published, created_by, created_at, updated_at";

const listOpportunities = async (client, filters = {}) => {
  let query = client
    .from("opportunities")
    .select(opportunityColumns)
    .order("deadline", { ascending: true, nullsFirst: false });

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
  listOpportunities,
  updateOpportunity,
};
