// Reviewed corrections from the 2026-09-28 link audit; dry-run unless --apply.
const fs = require('node:fs');
const { supabaseAdmin } = require('../backend/config/supabase');
const baseline = require('../output/opportunity-link-audit/opportunities-before.json');
const changes = [
  { id: '5869935c-0aff-4a0c-98e2-f1bf61e68241', payload: { application_url: 'https://nipponpaint.com.sg/ayda/registration' }, reason: 'Official AYDA 2026 entry form verified in browser; previous URL was a shopping account.' },
  { id: 'eb82ffef-3ae3-4b3c-b86e-9b11616c1c8f', payload: { is_published: false, status: 'pending_review', verification_status: 'pending_review' }, reason: 'Official page returns 404 and displays Page Not Found in browser; keep archived for re-review.' },
];
(async () => {
  const report = [];
  for (const change of changes) {
    const before = baseline.find(row => row.id === change.id);
    if (!before) throw Error('Missing baseline');
    if (process.argv.includes('--apply')) {
      const result = await supabaseAdmin.from('opportunities').update(change.payload).eq('id', change.id).eq('updated_at', before.updated_at).select('id,title,status,application_url');
      if (result.error || result.data.length !== 1) throw Error(result.error?.message || 'Record changed; re-review needed');
      report.push({ ...change, result: result.data[0] });
      fs.writeFileSync('output/opportunity-link-audit/corrections.json', JSON.stringify(report, null, 2));
    } else report.push(change);
  }
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
