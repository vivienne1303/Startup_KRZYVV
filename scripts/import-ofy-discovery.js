// Dry-run by default. --apply reads all live rows, merges provenance on duplicates,
// and inserts new reviewed leads. It never overwrites existing verified facts.
const fs = require('node:fs');
const path = require('node:path');
const normalizer = require('../backend/services/opportunitySources/manualSource');
const normalizeGeography = require('../backend/utils/opportunityGeography');
const { statusLabels, expired } = require('../js/opportunity-filters');
const volunteerBatch = process.argv.includes('--volunteer-sg');
const youthBatch = process.argv.includes('--youth-volunteering');
const communityBatch = process.argv.includes('--community-youth');
const cordyBatch = process.argv.includes('--cordy');
const customFile = process.argv.find(arg => arg.startsWith('--manifest='))?.slice('--manifest='.length);
if (customFile && !/^opportunities-[a-z0-9-]+\.json$/.test(customFile)) throw Error('Expected an opportunities manifest filename in data/');
const manifest = customFile ? require('../data/' + customFile) : cordyBatch ? require('../data/opportunities-cordy-2026-09-30.json') : communityBatch ? require('../data/opportunities-community-youth-2026-09-30.json') : youthBatch ? require('../data/opportunities-youth-volunteering-2026-09-30.json') : volunteerBatch ? require('../data/opportunities-volunteer-sg-2026-09-29.json') : require('../data/opportunities-ofy-2026-09-29.json');
const canonicalUrl = value => {
  if (!value) return null;
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw Error('Only HTTP(S) sources are supported');
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) if (/^utm_|^(fbclid|gclid)$/.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return `${url.hostname.toLowerCase().replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}${url.search}`;
};
const textKey = value => String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function duplicateOf(rows, item) {
  const urls = [item.source_url, item.application_url].filter(Boolean).map(canonicalUrl);
  return rows.find(row => [row.source_url, row.application_url].filter(Boolean).some(url => urls.includes(canonicalUrl(url)))
    || (textKey(row.title) === textKey(item.title) && textKey(row.organisation || row.organizer) === textKey(item.organisation)));
}
function prepare(item) {
  if (!item.title || !item.source_url || !item.discovery?.discovered_url) throw Error('Missing title or provenance');
  canonicalUrl(item.source_url);
  if (item.application_url) canonicalUrl(item.application_url);
  if (item.discovery.deadline_status === 'unknown' && item.application_deadline != null) throw Error('Unknown deadlines must be null');
  if (item.discovery.deadline_status === 'confirmed' && !item.application_deadline) throw Error('Confirmed deadline needs a date');
  if (['available','login_required'].includes(item.discovery.application_access) && !item.application_url) throw Error('Confirmed access requires a route');
  if (expired(item, manifest.as_of)) throw Error('Expired entry cannot be imported');
  const payload = normalizer.normaliseOpportunity({ ...item, status: 'published', is_published: true,
    discovery_sources: [item.discovery.discovered_url], last_synced_at: item.discovery.last_checked_at }, null);
  // Verification timestamps record research, not the date a file was replayed.
  if (payload.verification_status === 'verified') payload.verified_at = payload.last_verified_at = item.discovery.last_checked_at;
  normalizeGeography(payload);
  return payload;
}
async function importRows(client, items, rows, onProgress = () => {}) {
  const report = { added: [], merged: [] };
  for (const item of items) {
    const payload = prepare(item), duplicate = duplicateOf(rows, payload);
    if (duplicate) {
      const sources = [...new Set([...(duplicate.discovery_sources || []), ...payload.discovery_sources])];
      if (client) {
        // Optimistic lock: do not overwrite a concurrent provenance update.
        let query = client.from('opportunities').update({ discovery_sources: sources }).eq('id', duplicate.id);
        if (duplicate.updated_at) query = query.eq('updated_at', duplicate.updated_at);
        const { data, error } = await query.select('id,updated_at');
        if (error) throw error;
        if (data.length !== 1) throw Error(`Concurrent update: ${duplicate.title}`);
        duplicate.updated_at = data[0].updated_at;
      }
      duplicate.discovery_sources = sources;
      report.merged.push({ title: payload.title, existing_id: duplicate.id, discovery_sources: sources });
    } else {
      let saved = payload;
      if (client) {
        const { data, error } = await client.from('opportunities').insert(payload).select('*').single();
        if (error) throw error;
        saved = data;
      }
      rows.push(saved);
      report.added.push({ id: saved.id || null, title: saved.title, labels: statusLabels(saved, manifest.as_of) });
    }
    onProgress(report);
  }
  return report;
}
async function main() {
  const apply = process.argv.includes('--apply');
  let rows, client = null;
  const dir = path.join(__dirname, customFile ? '../output/' + customFile.replace(/^opportunities-/, '').replace(/\.json$/, '') : cordyBatch ? '../output/cordy-2026-09-30' : communityBatch ? '../output/community-youth-2026-09-30' : youthBatch ? '../output/youth-volunteering-2026-09-30' : volunteerBatch ? '../output/volunteer-sg-discovery-2026-09-29' : '../output/ofy-discovery-2026-09-29');
  fs.mkdirSync(dir, { recursive: true });
  // Validate the whole batch before opening a connection or doing any writes.
  manifest.additions.forEach(prepare);
  if (apply) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
    if (today !== manifest.as_of) throw Error('This research batch must be re-verified before applying on another day.');
    client = require('../backend/config/supabase').supabaseAdmin;
    rows = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from('opportunities').select('*').order('id').range(offset,offset+499);
      if (error) throw error;
      rows.push(...data);
      if (data.length < 500) break;
    }
    const { error } = await client.from('opportunities').select('discovery,discovery_sources').limit(1);
    if (error) throw Error('Apply migration 202609290017 before importing: ' + error.message);
    fs.writeFileSync(path.join(dir, `before-${Date.now()}.json`), JSON.stringify(rows, null, 2));
  } else {
    rows = JSON.parse(fs.readFileSync(path.join(__dirname, '../output/opportunity-link-audit/opportunities-before.json'), 'utf8'));
    // Include previously prepared additions when checking the local inventory.
    rows.push(...require('../data/opportunities-global-2026-09-29.json').additions);
    if (volunteerBatch || youthBatch || communityBatch || cordyBatch) rows.push(...require('../data/opportunities-ofy-2026-09-29.json').additions);
    if (youthBatch || communityBatch || cordyBatch) rows.push(...require('../data/opportunities-volunteer-sg-2026-09-29.json').additions);
    if (communityBatch || cordyBatch) rows.push(...require('../data/opportunities-youth-volunteering-2026-09-30.json').additions);
    if (cordyBatch) rows.push(...require('../data/opportunities-community-youth-2026-09-30.json').additions);
    if (customFile) {
      for (const file of fs.readdirSync(path.join(__dirname, '../data'))) {
        if (file !== customFile && /^opportunities-.*\.json$/.test(file)) {
          const batch = JSON.parse(fs.readFileSync(path.join(__dirname, '../data', file), 'utf8'));
          if (Array.isArray(batch.additions)) rows.push(...batch.additions);
        }
      }
    }
  }
  const filename = path.join(dir, apply ? 'applied.json' : 'dry-run.json');
  const save = report => fs.writeFileSync(filename, JSON.stringify({ applied: apply, as_of:manifest.as_of,
    duplicate_check: apply ? 'Live database' : 'Local snapshot only; live check required', ...report }, null, 2)+'\n');
  const report = await importRows(client, manifest.additions, rows, save);
  save(report);
  console.log(JSON.stringify({ applied: apply, additions: report.added.length, merged: report.merged.length,
    duplicate_check: apply ? 'live' : 'local snapshot only', report: filename }));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { prepare, duplicateOf, importRows, canonicalUrl };
