const OpportunitySource = require("./apiSourceBase");

class ManualSource extends OpportunitySource {
  normaliseOpportunity(payload, adminId) {
    const sourceType = ["partner", "ai_fetched"].includes(payload.source_type) ? payload.source_type : "manual";
    const publish = payload.status === "published" || payload.is_published === true;
    return {
      ...payload,
      organisation: payload.organisation || payload.organizer || null, organizer: payload.organisation || payload.organizer || null,
      minimum_age: payload.minimum_age ?? payload.age_min ?? null, age_min: payload.minimum_age ?? payload.age_min ?? null,
      maximum_age: payload.maximum_age ?? payload.age_max ?? null, age_max: payload.maximum_age ?? payload.age_max ?? null,
      format: payload.format || payload.mode || null, mode: payload.format || payload.mode || null,
      application_deadline: payload.application_deadline || payload.deadline || null, deadline: payload.application_deadline || payload.deadline || null,
      education_levels: payload.education_levels || (payload.education_level ? String(payload.education_level).split(',').map((x) => x.trim()).filter(Boolean) : []),
      source_type: sourceType, source_name: payload.source_name || payload.organisation || payload.organizer || "TeenLaunch",
      status: publish ? "published" : (payload.status === "draft" ? "draft" : "pending_review"), is_published: publish,
      verification_status: publish ? "verified" : "pending_review", verified_by: publish ? adminId : null,
      verified_at: publish ? new Date().toISOString() : null, last_verified_at: publish ? new Date().toISOString() : null,
      expiry_date: payload.application_deadline || payload.deadline || null,
      application_method: payload.application_method || (payload.application_url ? "external" : "internal"),
      internal_application_enabled: payload.application_url ? false : payload.internal_application_enabled !== false,
    };
  }
}

module.exports = new ManualSource();
