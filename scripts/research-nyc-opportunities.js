// Read-only research against the same public endpoints used by Discover NYC.
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '../output/opportunity-refresh-2026-09-28');
const clean = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
async function main() {
  const items = JSON.parse(fs.readFileSync(path.join(dir, 'nyc-listing.json'))).code.Item2;
  const results = [];
  let next = 0;
  await Promise.all(Array.from({length: 4}, async () => {
    while (next < items.length) {
      const item = items[next++];
      try {
        const html = await (await fetch(item.url, {signal: AbortSignal.timeout(20000)})).text();
        const rolePath = html.match(/:api-role="'([^']+)/)?.[1];
        const roles = rolePath ? await (await fetch(new URL(rolePath, item.url), {signal: AbortSignal.timeout(20000)})).json() : null;
        const body = clean(html);
        const about = body.indexOf('About ' + item.label);
        const end = body.indexOf('Available Roles', about);
        results.push({...item, description: clean(item.description), about: body.slice(about, end > about ? end : about + 2000), roles: roles?.code || [], roleUrl: rolePath ? new URL(rolePath, item.url).href : null});
      } catch(e) { results.push({...item, error: e.message}); }
    }
  }));
  results.sort((a,b)=>a.label.localeCompare(b.label));
  fs.writeFileSync(path.join(dir, 'nyc-research.json'), JSON.stringify(results, null, 2));
  for (const [i, x] of results.entries()) console.log(JSON.stringify({i,title:x.label,date:x.date,closing:x.roles?.map(r=>r.closingdate),description:x.description,error:x.error}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
