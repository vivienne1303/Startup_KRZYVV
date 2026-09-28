const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const opportunity = { id: 'sample', title: 'Open opportunity', application_method: 'external', application_url: 'https://example.org/apply' };
async function run({ token = 'test', status = 200, data = {}, failure = false, savedFailure = false }) {
  const elements = new Map(), redirects = [], requests = [];
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, { hidden: true, innerHTML: '', textContent: '', addEventListener() {}, querySelectorAll: () => [] });
    return elements.get(selector);
  };
  vm.runInNewContext(fs.readFileSync('js/recommended-opportunities.js', 'utf8'), {
    window: { TEENLAUNCH_API_BASE: '/api', alert() {}, location: { replace: url => redirects.push(url) } },
    location: {}, AbortSignal, URL, Date, encodeURIComponent, Number, Set,
    localStorage: { getItem: () => token }, document: { querySelector: element },
    fetch: async (url, options) => {
      requests.push(url); assert.ok(options.signal, 'Every request has a timeout');
      if (url.endsWith('/saved')) { if (savedFailure) throw Error('Saved unavailable'); return { ok: true, json: async () => ({ saved: [] }) }; }
      if (url.endsWith('/recommended')) {
        if (failure) { const error = new Error('Timed out'); error.name = 'TimeoutError'; throw error; }
        return { ok: status === 200, status, json: async () => data };
      }
      return { ok: true, json: async () => ({ opportunities: [opportunity] }) };
    },
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(redirects.length, 0, 'Recommendations must never auto-redirect to login');
  assert.equal(element('[data-recommendation-loading]').hidden, true);
  assert.equal(element('[data-recommendation-grid]').hidden, false);
  assert.match(element('[data-recommendation-grid]').innerHTML, /Open opportunity/);
  return { element, requests };
}
(async () => {
  const gated = await run({ status: 403, data: { code: 'PREMIUM_REQUIRED' } });
  assert.equal(gated.element('[data-recommendation-premium]').hidden, false);
  assert.doesNotMatch(gated.element('[data-recommendation-grid]').innerHTML, /% match/);
  const guest = await run({ token: null });
  assert.equal(guest.requests.some(url => url.endsWith('/recommended')), false);
  await run({ status: 401 });
  await run({ failure: true });
  await run({ data: { completed: false } });
  await run({ data: { completed: true, recommendations: [] } });
  const success = await run({ savedFailure: true, data: { completed: true, recommendations: [{ opportunity, match_percentage: 85, explanation: 'Test match' }] } });
  assert.match(success.element('[data-recommendation-grid]').innerHTML, /85% match/);
  assert.equal(success.element('[data-recommendation-error]').hidden, true);

  const { getMatchedOpportunities } = require('../backend/services/opportunityMatchingService');
  const client = { from(table) {
    const result = { data: table === 'user_profiles' ? { age: null } : table === 'career_dna_results' ? { score: {} } : [{ ...opportunity, age_min: 15 }] };
    const query = { select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; }, or() { return this; }, single: async () => result, maybeSingle: async () => result, then: resolve => Promise.resolve(result).then(resolve) };
    return query;
  } };
  const matches = await getMatchedOpportunities(client, 'test');
  assert.equal(matches.data.recommendations.length, 1, 'Missing age must not be interpreted as age zero');
  console.log('Recommendations passed: Premium denial, guest, expired session, timeout, missing DNA, empty matches, saved failure, successful matches and unknown age.');
})().catch(error => { console.error(error); process.exitCode = 1; });
