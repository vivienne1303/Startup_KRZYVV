const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// No live writes: exercise controller branches with a database stub.
const controllerModule = { exports: {} };
let inserts = 0;
vm.runInNewContext(fs.readFileSync('backend/controllers/registrationController.js', 'utf8'), {
  module: controllerModule, Date, Intl,
  require(name) {
    if (name.endsWith('asyncHandler')) return fn => fn;
    if (name.endsWith('httpError')) return class extends Error { constructor(status, message) { super(message); this.status = status; } };
    return {
      checkRegistration: async () => ({ data: null }),
      createRegistration: async () => { inserts++; return { data: { id: 'test-only' } }; },
    };
  },
});
const internal = { id: 'test', title: 'Test', application_method: 'internal', internal_application_enabled: true, is_published: true, status: 'published', age_min: null, age_max: null };
const body = Object.fromEntries(['full_name','email','phone_number','school_name','education_level','motivation','relevant_experience'].map(key => [key, 'test']));
body.opportunity_id = 'test'; body.date_of_birth = '2005-01-01';
function request(opportunity) {
  const query = { select() { return this; }, eq() { return this; }, async single() { return { data: opportunity }; } };
  return { body, user: { id: 'test-user' }, supabase: { from: () => query } };
}
const response = { status() { return this; }, json() {} };
async function frontend(opportunity, token = null) {
  const elements = new Map(); const redirects = []; const requests = [];
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, { hidden: true, addEventListener() {}, textContent: '' });
    return elements.get(selector);
  };
  vm.runInNewContext(fs.readFileSync('js/apply.js', 'utf8'), {
    window: { TEENLAUNCH_API_BASE: '/api' },
    localStorage: { getItem: () => token, setItem() {} },
    location: { search: '?id=test', replace: url => redirects.push(url) },
    URLSearchParams, URL, Date, encodeURIComponent,
    document: { querySelector: element },
    fetch: async url => { requests.push(url); return { ok: true, json: async () => ({ opportunity }) }; },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { redirects, requests, elements };
}
(async () => {
  const create = controllerModule.exports.create;
  for (const patch of [
    { application_method: 'external' }, { internal_application_enabled: false },
    { status: 'expired' }, { is_published: false },
    { application_deadline: '2020-01-01' }, { end_date: '2020-01-01' }, { expiry_date: '2020-01-01' },
  ]) await assert.rejects(create(request({ ...internal, ...patch }), response));
  assert.equal(inserts, 0);
  await create(request(internal), response);
  assert.equal(inserts, 1);
  const external = await frontend({ application_method: 'external', application_url: 'https://example.org/apply' });
  assert.deepEqual(external.redirects, ['https://example.org/apply']);
  assert.equal(external.requests.length, 1, 'External applicants should not need an account or internal registration request');
  const guest = await frontend(internal);
  assert.match(guest.redirects[0], /^auth.html\?mode=login/);
  const invalid = await frontend({ application_method: 'external', application_url: 'javascript:alert(1)' });
  assert.equal(invalid.redirects.length, 0);
  assert.match(invalid.elements.get('[data-apply-error-message]').textContent, /unavailable/);
  console.log('Application routing passed: external handoff, internal login, unsafe URL rejection, closed/disabled rejection, internal submission. No live applications submitted.');
})().catch(error => { console.error(error); process.exitCode = 1; });
