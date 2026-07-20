class OpportunitySource {
  async fetchOpportunities() { throw new Error("fetchOpportunities() must be implemented by a configured provider"); }
  normaliseOpportunity() { throw new Error("normaliseOpportunity() must be implemented"); }

  async detectDuplicates(client, opportunity) {
    if (opportunity.external_id) {
      const external = await client.from("opportunities").select("id,title,organizer,start_date,external_id").eq("source_type", opportunity.source_type).eq("source_name", opportunity.source_name).eq("external_id", opportunity.external_id).limit(5);
      if (external.error) return { data: [], error: external.error };
      if (external.data.length) return { data: external.data.map((item) => ({ ...item, reason: "Same external ID" })), error: null };
    }
    let query = client.from("opportunities").select("id,title,organizer,start_date,external_id").ilike("title", opportunity.title).ilike("organizer", opportunity.organizer || "");
    if (opportunity.start_date) query = query.eq("start_date", opportunity.start_date);
    const result = await query.limit(5);
    return { data: (result.data || []).map((item) => ({ ...item, reason: "Same title, organisation and start date" })), error: result.error };
  }

  async saveOrUpdateOpportunity(client, opportunity, existingId = null) {
    const query = existingId ? client.from("opportunities").update(opportunity).eq("id", existingId) : client.from("opportunities").insert(opportunity);
    return query.select("*").single();
  }

  async markExpiredOpportunities(client) {
    return client.from("opportunities").update({ verification_status: "expired", status: "inactive", is_published: false }).lt("expiry_date", new Date().toISOString().slice(0, 10)).neq("verification_status", "expired").select("id");
  }
}

module.exports = OpportunitySource;
