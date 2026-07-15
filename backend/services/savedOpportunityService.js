const savedColumns = "id, user_id, opportunity_id, created_at, opportunities(id, title, description, category, organizer, location, deadline, mode, image_url)";

const listSaved = (client) => client.from("saved_opportunities").select(savedColumns).order("created_at", { ascending: false });
const save = (client, userId, opportunityId) => client.from("saved_opportunities").insert({ user_id: userId, opportunity_id: opportunityId }).select(savedColumns).single();
const remove = (client, opportunityId) => client.from("saved_opportunities").delete().eq("opportunity_id", opportunityId);

module.exports = { listSaved, remove, save };
