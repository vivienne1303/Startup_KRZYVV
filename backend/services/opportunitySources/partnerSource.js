const OpportunitySource = require("./apiSourceBase");

class PartnerSource extends OpportunitySource {
  normaliseOpportunity(payload, partner) {
    return {
      ...payload,
      organizer: partner.organisation_name,
      source_type: "partner",
      source_name: partner.organisation_name,
      partner_id: partner.id,
      verification_status: "pending_review",
      verified_by: null,
      verified_at: null,
      is_published: false,
      status: "draft",
      expiry_date: payload.expiry_date || payload.deadline || null,
      application_method: payload.application_method || (payload.application_url ? "external" : "internal"),
      internal_application_enabled: Boolean(payload.internal_application_enabled),
    };
  }
}

module.exports = new PartnerSource();
