const OpportunitySource = require("./apiSourceBase");

// Development-only contract example. It is never registered, imported by routes,
// or saved automatically. Production always returns an empty list.
class MockDevelopmentProvider extends OpportunitySource {
  async fetchOpportunities() {
    if (process.env.NODE_ENV === "production") return [];
    return [{ external_id: "MOCK-LOCAL-001", title: "[MOCK] Local provider test opportunity", organisation: "[MOCK] Example Provider" }];
  }
  normaliseOpportunity(item) {
    return { title: item.title, organizer: item.organisation, external_id: item.external_id, source_type: "api", source_name: "mock-development-provider", verification_status: "draft", status: "draft", is_published: false };
  }
}

module.exports = MockDevelopmentProvider;
