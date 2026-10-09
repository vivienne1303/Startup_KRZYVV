// Reversible archive of listings with confirmed past dates. Dry run by default.
const fs = require('node:fs');
const path = require('node:path');
const { supabaseAdmin: client } = require('../backend/config/supabase');
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const apply = process.argv.includes('--apply');
function reason(row) {
  if (row.status === 'expired') return null;
  if (row.discovery?.deadline_status === 'closed') return 'Recorded recruitment status is closed';
  if (row.end_date && row.end_date.slice(0, 10) < today) return `Event ended ${row.end_date}`;
  const confirmed = row.discovery?.deadline_status === 'confirmed' || (!row.discovery && row.verification_status === 'verified');
  const deadline = row.application_deadline || row.deadline;
  if (confirmed && deadline && deadline.slice(0, 10) < today) return `Confirmed application deadline passed: ${deadline}`;
  return null;
}
async function main() {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from('opportunities').select('*').order('id').range(offset, offset + 499);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 500) break;
  }
  const candidates = rows.filter(row => reason(row));
  const dir = path.join(__dirname, '../output/archive-' + today);
  fs.mkdirSync(dir, { recursive: true });
  const report = { as_of: today, applied: apply, archived: [] };
  const save = () => fs.writeFileSync(path.join(dir, apply ? 'applied.json' : 'dry-run.json'), JSON.stringify(report, null, 2) + '\n');
  if (apply) fs.writeFileSync(path.join(dir, `before-${Date.now()}.json`), JSON.stringify(candidates, null, 2));
  for (const row of candidates) {
    if (apply) {
      let query = client.from('opportunities').update({ status: 'expired', is_published: false, verification_status: 'expired' }).eq('id', row.id);
      if (row.updated_at) query = query.eq('updated_at', row.updated_at);
      const { data, error } = await query.select('id,status,is_published');
      if (error) throw error;
      if (data.length !== 1) throw Error('Concurrent update: ' + row.title);
      if (data[0].status !== 'expired' || data[0].is_published) throw Error('Archive verification failed: ' + row.title);
    }
    report.archived.push({ id: row.id, title: row.title, reason: reason(row), source_url: row.source_url });
    save();
  }
  save();
  console.log(JSON.stringify({ applied: apply, as_of: today, archived: report.archived.length }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
