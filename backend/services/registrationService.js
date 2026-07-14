const registrationColumns =
  "id, user_id, opportunity_id, status, notes, full_name, email, phone_number, date_of_birth, school_name, education_level, portfolio_url, resume_url, motivation, relevant_experience, additional_comments, registered_at, created_at, updated_at, opportunities(id, title, description, category, organizer, location, deadline, start_date, end_date, mode, image_url)";

const listRegistrations = async (client) => {
  const { data, error } = await client
    .from("registrations")
    .select(registrationColumns)
    .order("created_at", { ascending: false });

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
      status: "pending",
      notes: payload.notes || null,
      registered_at: new Date().toISOString(),
      ...application,
    })
    .select(registrationColumns)
    .single();

  return { data, error };
};

const checkRegistration = async (client, opportunityId) => {
  const { data, error } = await client.from("registrations").select(registrationColumns).eq("opportunity_id", opportunityId).maybeSingle();
  return { data, error };
};

const updateRegistration = async (client, id, payload) => {
  const allowedFields = ["status", "notes", "registered_at"];
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
  checkRegistration,
  createRegistration,
  deleteRegistration,
  getRegistrationById,
  listRegistrations,
  updateRegistration,
};
