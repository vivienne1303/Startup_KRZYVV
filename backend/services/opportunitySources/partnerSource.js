const OpportunitySource = require("./apiSourceBase");

class PartnerSource extends OpportunitySource {
  normaliseOpportunity(payload, partner) {
    return {
      ...payload,
      organisation: partner.organisation_name,
      organizer: partner.organisation_name,
      source_type: "partner",
      source_name: partner.organisation_name,
      partner_id: partner.id,
      verification_status: "pending_review",
      verified_by: null,
      verified_at: null,
      is_published: false,
      status: "pending_review",
      minimum_age: payload.minimum_age ?? payload.age_min ?? null,
      maximum_age: payload.maximum_age ?? payload.age_max ?? null,
      education_level: payload.education_level || (payload.education_levels || []).join(", ") || null,
      format: payload.format || payload.mode || null,
      application_deadline: payload.application_deadline || payload.deadline || null,
      expiry_date: payload.expiry_date || payload.deadline || null,
      application_method: payload.application_method || (payload.application_url ? "external" : "internal"),
      internal_application_enabled: Boolean(payload.internal_application_enabled),
    };
  }
}

module.exports = new PartnerSource();
