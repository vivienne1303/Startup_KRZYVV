const registrationColumns =
  "id, user_id, opportunity_id, status, notes, portfolio_reminder, portfolio_reminder_at, full_name, email, phone_number, date_of_birth, school_name, education_level, portfolio_url, resume_url, motivation, relevant_experience, additional_comments, registered_at, completion_date, completion_verified, certificate_url, completion_badge, verified_skills, admin_remarks, created_at, updated_at, opportunities(id, title, description, category, organizer, location, deadline, start_date, end_date, mode, image_url, source_url, application_url, source_type)";

const listRegistrations = async (client, userId = null) => {
  let query = client
    .from("registrations")
    .select(registrationColumns);

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query.order("created_at", { ascending: false });

  return { data, error };
};

const getRegistrationById = async (client, id) => {
  const { data, error } = await client
    .from("registrations")
    .select(registrationColumns)
    .eq("id", id)
    .single();

  return { data, error };
};

const createRegistration = async (client, payload, userId) => {
  const fields = ["full_name","email","phone_number","date_of_birth","school_name","education_level","portfolio_url","resume_url","motivation","relevant_experience","additional_comments"];
  const application = {};
  fields.forEach((field) => { application[field] = payload[field] || null; });
  const { data, error } = await client
    .from("registrations")
    .insert({
      user_id: userId,
      opportunity_id: payload.opportunity_id,
      status: "registered",
      notes: payload.notes || null,
      registered_at: new Date().toISOString(),
      ...application,
    })
    .select(registrationColumns)
    .single();

  return { data, error };
};

const createExternalRegistration = async (client, opportunityId, userId) => {
  return client.from("registrations").insert({
    user_id: userId,
    opportunity_id: opportunityId,
    status: "registered",
    notes: "Self-reported external registration",
    registered_at: new Date().toISOString(),
  }).select(registrationColumns).single();
};

const addPortfolioReminder = async (client, registrationId) => client.from("registrations")
  .update({ portfolio_reminder: true, portfolio_reminder_at: new Date().toISOString() })
  .eq("id", registrationId)
  .select(registrationColumns)
  .single();

const checkRegistration = async (client, opportunityId) => {
  const { data, error } = await client.from("registrations").select(registrationColumns).eq("opportunity_id", opportunityId).maybeSingle();
  return { data, error };
};

const updateRegistration = async (client, id, payload) => {
  const allowedFields = ["status", "notes", "registered_at", "completion_date", "completion_verified", "certificate_url", "completion_badge", "verified_skills", "admin_remarks"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      updates[field] = payload[field];
    }
  });

  const { data, error } = await client
    .from("registrations")
    .update(updates)
    .eq("id", id)
    .select(registrationColumns)
    .single();

  return { data, error };
};

const cancelOwnRegistration = async (client, id) => {
  const { data: registration, error: findError } = await getRegistrationById(client, id);

  if (findError || !registration) {
    return { data: null, error: findError };
  }

  const startDate = registration.opportunities?.start_date;
  if (startDate && new Date(startDate).getTime() <= Date.now()) {
    return {
      data: null,
      error: { message: "Registration cannot be cancelled after the event has started" },
    };
  }

  return updateRegistration(client, id, { status: "cancelled" });
};

const deleteRegistration = async (client, id) => {
  const { error } = await client.from("registrations").delete().eq("id", id);
  return { error };
};

module.exports = {
  cancelOwnRegistration,
  addPortfolioReminder,
  checkRegistration,
  createRegistration,
  createExternalRegistration,
  deleteRegistration,
  getRegistrationById,
  listRegistrations,
  updateRegistration,
};
