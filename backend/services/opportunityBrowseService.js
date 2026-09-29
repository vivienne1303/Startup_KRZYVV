const { browse } = require('../../js/opportunity-filters');
const { opportunityColumns } = require('./opportunityService');
let cached = null, pending = null;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const invalidate = () => { cached = null; };
async function readAll(client) {
  const day = today();
  if (cached && cached.day === day && Date.now() - cached.at < 30000) return cached.rows;
  if (pending) return pending;
  pending = (async () => {
    const rows = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from('opportunities').select(opportunityColumns)
        .eq('is_published', true).eq('status','published')
        .or(`application_deadline.is.null,application_deadline.gte.${day}`)
        .order('application_deadline', { ascending: true, nullsFirst: false }).order('id', { ascending: true })
        .range(offset, offset + 499);
      if (error) throw error;
      rows.push(...data);
      if (data.length < 500) break;
    }
    const current = rows.filter(row => ![row.deadline,row.expiry_date,row.end_date].some(d => d && d.slice(0,10) < day));
    cached = { rows: current, day, at: Date.now() };
    return current;
  })();
  try { return await pending; } finally { pending = null; }
}
module.exports = { invalidate, readAll, browseOpportunities: async (client, filters) => browse(await readAll(client), filters) };
