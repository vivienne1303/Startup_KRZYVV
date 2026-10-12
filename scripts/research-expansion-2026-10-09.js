const fs = require('node:fs');
const { supabaseAdmin: client } = require('../backend/config/supabase');
const { duplicateOf } = require('./import-ofy-discovery');
const dir = 'output/expansion-2026-10-09';
async function main() {
  fs.mkdirSync(dir, { recursive: true });
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const result = await client.from('opportunities').select('*').order('id').range(offset, offset + 499);
    if (result.error) throw result.error;
    rows.push(...result.data);
    if (result.data.length < 500) break;
  }
  fs.writeFileSync(dir + '/baseline.json', JSON.stringify(rows, null, 2));
  const pool = JSON.parse(fs.readFileSync('output/expansion-2026-10-08/reviewed-pool.json'));
  const candidates = pool.additions.filter(item => !duplicateOf(rows, item));
  fs.writeFileSync(dir + '/candidates.json', JSON.stringify(candidates, null, 2));
  console.log(JSON.stringify({ inventory: rows.length, candidates: candidates.length,
    local: candidates.filter(x => x.host_country === 'SG').length,
    worldwide: candidates.filter(x => x.eligibility_scope === 'worldwide').length,
    online: candidates.filter(x => x.format === 'online').length }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
