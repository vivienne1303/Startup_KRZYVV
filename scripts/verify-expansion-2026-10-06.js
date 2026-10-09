const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { supabaseAdmin } = require('../backend/config/supabase');
const { expired, browse } = require('../js/opportunity-filters');
const dir = path.join(__dirname, '../output/expansion-2026-10-06');
async function main() {
  const report = JSON.parse(fs.readFileSync(path.join(dir, 'applied.json')));
  const baseline = new Set(JSON.parse(fs.readFileSync(path.join(dir, 'baseline.json'))).map(x => x.id));
  const ids = report.added.map(x => x.id);
  assert(ids.length >= 160);
  assert(ids.every(id => !baseline.has(id)));
  const rows = [];
  for (let i = 0; i < ids.length; i += 75) {
    const { data, error } = await supabaseAdmin.from('opportunities').select('*').in('id', ids.slice(i, i + 75));
    if (error) throw error;
    rows.push(...data);
  }
  assert.equal(rows.length, ids.length);
  assert(rows.every(x => x.status === 'published' && x.is_published && !expired(x, '2026-10-06')));
  assert.equal(browse(rows).total, rows.length);
  const result = {
    checked_at: new Date().toISOString(), added: rows.length, merged: report.merged.length,
    published_and_visible: browse(rows).total,
    by_source: rows.reduce((out, x) => { const host = new URL(x.source_url).hostname.replace(/^www\./, ''); out[host] = (out[host] || 0) + 1; return out; }, {}),
    online: browse(rows, {mode: 'online'}).total,
    hybrid: browse(rows, {mode: 'hybrid'}).total,
    worldwide: rows.filter(x => x.eligibility_scope === 'worldwide').length,
    singapore: rows.filter(x => x.host_country === 'SG').length,
    no_past_deadlines: true
  };
  fs.writeFileSync(path.join(dir, 'verification.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
}
main().catch(error => {console.error(error); process.exitCode = 1;});
