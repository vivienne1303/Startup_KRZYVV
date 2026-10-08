const fs = require('node:fs');
const assert = require('node:assert/strict');
const { duplicateOf, prepare } = require('./import-ofy-discovery');
const file = 'data/opportunities-expansion-2026-10-08.json';
const dir = 'output/expansion-2026-10-08/';
const manifest = JSON.parse(fs.readFileSync(file));
const baseline = JSON.parse(fs.readFileSync(dir + 'baseline.json'));
fs.writeFileSync(dir + 'reviewed-pool.json', JSON.stringify(manifest, null, 2));
const selectedIds = new Set([1767410, 1766265, 1764253, 1767504, 1767435, 1764903, 1767406,
  1767593, 1767594, 1767553, 1767342, 1767402, 1766977, 1767294]);
const local = manifest.additions.filter(x => x.host_country === 'SG').slice(0, 25);
const overseas = manifest.additions.filter(x => selectedIds.has(Number(x.source_url.match(/-(\d+)$/)?.[1])));
const global = manifest.additions.filter(x => x.eligibility_scope === 'worldwide');
assert.equal(local.length, 25);
assert.equal(overseas.length, 14);
assert.equal(global.length, 11);
manifest.additions = [...local, ...overseas, ...global];
for (const item of manifest.additions) {
  if (/Procon Jr/.test(item.title)) {
    item.format = 'hybrid';
    item.discovery.notes += ' Online qualifying round followed by an on-campus final at IIIT Delhi; school ID required.';
  }
  if (/NEXAURA/.test(item.title)) item.start_date = item.end_date = '2026-10-31';
  if (/Foss Forge/.test(item.title)) { item.start_date = '2026-10-21'; item.end_date = '2026-10-22'; }
  if (/Equity Research Challenge/.test(item.title)) {
    item.eligibility = 'Full-time undergraduate or postgraduate students across India; teams of 1–3 from the same institution. Free entry. Online quiz followed by an equity research report.';
    item.eligibility_scope = 'countries'; item.eligible_countries = ['IN'];
    item.discovery.restrictions = item.eligibility;
  }
  if (/Kronos 2026/.test(item.title)) {
    item.eligibility = 'Eligible student groups listed by the organiser; teams of 1–3 must belong to the same institution. Each participant may join only one team. Quiz followed by a 4–5 slide case submission.';
    item.discovery.restrictions = item.eligibility;
  }
  if (/EcoKnocks/.test(item.title)) {
    item.discovery.notes += ' Submit original 700–800 word articles by email to ecoknocks@bsssbhopal.edu.in; consult the attached guidelines. AI-generated, plagiarised or previously published entries are excluded.';
  }
  assert(!duplicateOf(baseline, item), 'Duplicate: ' + item.title);
  prepare(item);
}
assert.equal(manifest.additions.length, 50);
fs.writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({selected: 50, singapore: local.length, overseas: overseas.length, worldwide_online: global.length}));
