const HttpError = require('./httpError');
function normalizeGeography(payload) {
  const result = {};
  const code = value => {
    const c = String(value).trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(c) || new Intl.DisplayNames(['en'], { type: 'region' }).of(c) === c) throw new HttpError(400, 'Use valid two-letter country codes, for example SG or US.');
    return c;
  };
  if ('host_country' in payload) result.host_country = payload.host_country ? code(payload.host_country) : null;
  if ('travel_required' in payload) {
    if (payload.travel_required !== null && typeof payload.travel_required !== 'boolean') throw new HttpError(400, 'Travel required must be true, false or null.');
    result.travel_required = payload.travel_required;
  }
  if ('eligibility_scope' in payload || 'eligible_countries' in payload) {
    if (!['unknown','worldwide','countries'].includes(payload.eligibility_scope)) throw new HttpError(400, 'Choose an eligibility scope.');
    result.eligibility_scope = payload.eligibility_scope;
    if (!Array.isArray(payload.eligible_countries)) throw new HttpError(400, 'Eligible countries must be an array.');
    result.eligible_countries = [...new Set(payload.eligible_countries.map(code))];
    if ((result.eligibility_scope === 'countries') !== (result.eligible_countries.length > 0)) throw new HttpError(400, 'List countries only for country-specific eligibility; select at least one.');
  }
  return result;
}
module.exports = normalizeGeography;
