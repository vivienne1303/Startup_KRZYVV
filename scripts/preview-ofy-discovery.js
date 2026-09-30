// Read-only preview using the real opportunity page and reviewed manifest.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { browse } = require('../js/opportunity-filters');
const { prepare } = require('./import-ofy-discovery');
const manifest = require('../data/opportunities-ofy-2026-09-29.json');
const volunteerManifest = require('../data/opportunities-volunteer-sg-2026-09-29.json');
const youthManifest = require('../data/opportunities-youth-volunteering-2026-09-30.json');
const communityManifest = require('../data/opportunities-community-youth-2026-09-30.json');
const cordyManifest = require('../data/opportunities-cordy-2026-09-30.json');
const tjcManifest = require('../data/opportunities-tjc-2026-09-30.json');
const root = path.resolve(__dirname, '..');
const rows = [...manifest.additions, ...volunteerManifest.additions, ...youthManifest.additions, ...communityManifest.additions, ...cordyManifest.additions, ...tjcManifest.additions].map((item, index) => ({ ...prepare(item), id: `preview-${index + 1}` }));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.ico':'image/x-icon' };
const server = http.createServer((req, res) => {
  const send = (status, body, type='application/json; charset=utf-8') => {
    res.writeHead(status, { 'Content-Type':type, 'Cache-Control':'no-store' }); res.end(body);
  };
  if (!['GET','HEAD'].includes(req.method)) return send(405, JSON.stringify({message:'This preview is read-only.'}));
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname === '/api/opportunities') return send(200, JSON.stringify(url.searchParams.get('paged') === 'true'
    ? browse(rows, Object.fromEntries(url.searchParams)) : {opportunities:rows}));
  if (url.pathname.startsWith('/api/opportunities/preview-')) {
    const opportunity = rows.find(row => row.id === url.pathname.split('/').pop());
    return send(opportunity ? 200 : 404, JSON.stringify({opportunity}));
  }
  if (url.pathname.startsWith('/api/')) return send(401, JSON.stringify({message:'Account actions are unavailable in this preview.'}));
  if (url.pathname === '/js/api-config.js') return send(200, 'window.TEENLAUNCH_API_BASE = location.origin + "/api"; window.TEENLAUNCH_API_ORIGIN = location.origin;', types['.js']);
  let relative;
  try { relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'pages/opportunities.html'; }
  catch { return send(400, '{}'); }
  if (!/^(pages|js|css|assets|components)\//.test(relative) && !['script.js','style.css','index.html','favicon.ico'].includes(relative)) return send(404, '{}');
  const filename = path.resolve(root, relative);
  if (!filename.startsWith(root + path.sep)) return send(403, '{}');
  fs.readFile(filename, (error, data) => {
    if (error) return send(404, '{}');
    if (relative === 'pages/opportunities.html') {
      data = data.toString().replace('<body>', `<body><aside style="position:relative;z-index:1000;padding:14px 24px;background:#16374a;color:#fff;text-align:center;font:600 14px system-ui">Preview · ${rows.length} researched additions · Existing live listings unchanged · Not published · Account actions disabled</aside>`);
    }
    send(200, data, types[path.extname(filename)] || 'application/octet-stream');
  });
});
const port = Number(process.env.PREVIEW_PORT || 3102);
server.listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}/pages/opportunities.html`));
