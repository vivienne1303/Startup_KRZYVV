const OpportunitySource = require("./apiSourceBase");

class ManualSource extends OpportunitySource {
  normaliseOpportunity(payload, adminId) {
    return {
      ...payload,
      source_type: payload.source_type === "public_manual" ? "public_manual" : "teenlaunch",
      source_name: payload.source_name || (payload.source_type === "public_manual" ? payload.organizer : "TeenLaunch"),
      verification_status: "verified",
      verified_by: adminId,
      verified_at: new Date().toISOString(),
      expiry_date: payload.expiry_date || payload.deadline || null,
      application_method: payload.application_method || (payload.application_url ? "both" : "internal"),
      internal_application_enabled: payload.internal_application_enabled !== false,
    };
  }
}

module.exports = new ManualSource();
