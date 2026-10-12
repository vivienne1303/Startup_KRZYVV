// Publication and evidence are independent: a reviewed lead can be public
// without claiming that its deadline, eligibility or application was verified.
const choices = {
  deadline_status: ['unknown', 'confirmed', 'rolling', 'upcoming', 'closed'],
  student_eligibility: ['unknown', 'confirmed', 'ineligible'],
  application_access: ['unknown', 'available', 'login_required', 'unavailable'],
};
function normalizeDiscovery(value) {
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) throw Error('Invalid discovery evidence');
  const result = { ...value };
  for (const [key, allowed] of Object.entries(choices)) {
    result[key] ??= 'unknown';
    if (!allowed.includes(result[key])) throw Error(`Invalid discovery ${key}`);
  }
  for (const key of ['discovered_url', 'official_url']) {
    result[key] ??= null;
    if (result[key] && !/^https?:\/\//i.test(result[key])) throw Error(`Invalid discovery ${key}`);
  }
  if (!result.last_checked_at || !Number.isFinite(Date.parse(result.last_checked_at))) throw Error('Discovery requires a last-checked date');
  for (const key of ['fees', 'parental_consent', 'school_membership', 'restrictions', 'notes']) result[key] ??= null;
  return result;
}
function isConfirmed(value) {
  return value && ['confirmed', 'rolling'].includes(value.deadline_status)
    && value.student_eligibility === 'confirmed'
    && ['available', 'login_required'].includes(value.application_access);
}
module.exports = { normalizeDiscovery, isConfirmed };
