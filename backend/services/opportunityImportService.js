const HttpError = require("../utils/httpError");

const clean = (value) => String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const decode = (value) => clean(value).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const first = (html, patterns) => patterns.map((pattern) => html.match(pattern)?.[1]).find(Boolean);
const isoDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString().slice(0, 10);
};
const humanize = (value) => String(value || "").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
const fallbackTitleFromUrl = (sourceUrl) => {
  const url = new URL(sourceUrl);
  const hostParts = url.hostname.replace(/^www\./, "").split(".");
  if (hostParts.length > 2 && !["app", "events", "discover"].includes(hostParts[0])) return humanize(hostParts[0]);
  const slug = url.pathname.split("/").filter(Boolean).pop();
  return slug && !/^\d+$/.test(slug) ? humanize(decodeURIComponent(slug)) : `Opportunity from ${url.hostname.replace(/^www\./, "")}`;
};
const isBlockedPageTitle = (value) => /javascript is disabled|enable javascript|access denied|just a moment|attention required|checking your browser|page not found|error\s*\d{3}/i.test(String(value || ""));
const safeUrl = async (raw) => {
  let url;
  try { url = new URL(raw); } catch { throw new HttpError(400, "Enter a valid opportunity URL"); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new HttpError(400, "Only http(s) URLs are supported");
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '0.0.0.0' || host === '::1' || host.endsWith('.local') || /^(127|10|192\.168)\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) throw new HttpError(400, "Private network URLs cannot be imported");
  return url;
};
const jsonLd = (html) => {
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      const entries = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];
      const item = entries.find((entry) => /event|jobposting|course|educationaloccupationalprogram/i.test(String(entry?.['@type'])));
      if (item) return item;
    } catch (_) {}
  }
  return {};
};
const categoryFrom = (...values) => {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  if (/volunteer|volunteering|community service|befriend|service project|youth corps|study buddy|tutor|mentoring/.test(text)) return "Volunteering";
  if (/internship|intern\b|work attachment|traineeship/.test(text)) return "Internships";
  if (/hackathon|codefest|code fest|buildathon|devpost\.com/.test(text)) return "Hackathons";
  if (/grant|funding|scholarship|bursary/.test(text)) return "Grants";
  if (/competition|challenge|contest|olympiad|tournament|pitch battle|\bayda\b/.test(text)) return "Competitions";
  if (/workshop|masterclass|bootcamp|training|seminar/.test(text)) return "Innovation Workshops";
  if (/entrepreneur|startup|founder|business/.test(text)) return "Youth Entrepreneurship";
  if (/leadership|camp/.test(text)) return "Leadership Camps";
  return "External opportunity";
};
const extract = (html, sourceUrl) => {
  const schema = jsonLd(html);
  const title = schema.name || first(html, [/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i, /<title[^>]*>([\s\S]*?)<\/title>/i, /<h1[^>]*>([\s\S]*?)<\/h1>/i]);
  const description = schema.description || first(html, [/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)/i]);
  const applicationUrl = schema.url || first(html, [/<a[^>]+href=["']([^"']+)["'][^>]*>\s*(?:apply|register|sign up)/i]);
  const organisation = schema.hiringOrganization?.name || schema.organizer?.name || schema.provider?.name || first(html, [/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)/i]);
  const location = schema.location?.name || schema.location?.address?.addressLocality || null;
  const body = decode(html).slice(0, 15000);
  const ageMatch = body.match(/ages?\s+(\d{1,2})\s*(?:-|–|to)\s*(\d{1,2})/i);
  const deadlineMatch = body.match(/(?:application\s+deadline|deadline|apply\s+by)\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i);
  const sourceHost = new URL(sourceUrl).hostname.replace(/^www\./, '');
  const cleanTitle = decode(title);
  return {
    title: !cleanTitle || isBlockedPageTitle(cleanTitle) ? fallbackTitleFromUrl(sourceUrl) : cleanTitle,
    organisation: decode(organisation) || sourceHost,
    description: decode(description) || "Visit the official opportunity page for complete details and application requirements.",
    category: categoryFrom(title, description, sourceUrl, body.slice(0, 5000)),
    eligibility: null, minimum_age: ageMatch ? Number(ageMatch[1]) : null, maximum_age: ageMatch ? Number(ageMatch[2]) : null,
    education_level: null, location: decode(location), format: schema.eventAttendanceMode?.includes('Online') ? 'online' : null,
    application_deadline: isoDate(schema.validThrough || deadlineMatch?.[1]), start_date: isoDate(schema.startDate), end_date: isoDate(schema.endDate),
    source_url: sourceUrl, application_url: applicationUrl ? new URL(applicationUrl, sourceUrl).href : sourceUrl,
    source_type: 'ai_fetched', status: 'pending_review',
  };
};

const fetchAndExtract = async (rawUrl) => {
  let url = await safeUrl(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    let response;
    for (let redirects = 0; redirects <= 5; redirects += 1) {
      response = await fetch(url, { redirect: 'manual', signal: controller.signal, headers: { 'User-Agent': 'TeenLaunchOpportunityImporter/1.0', Accept: 'text/html,application/xhtml+xml' } });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      if (!location || redirects === 5) throw new HttpError(422, 'The source redirected too many times');
      url = await safeUrl(new URL(location, url).href);
    }
    if (!response.ok) throw new HttpError(422, `Source returned HTTP ${response.status}`);
    if (!String(response.headers.get('content-type') || '').includes('text/html')) throw new HttpError(422, 'The URL did not return an HTML webpage');
    const html = (await response.text()).slice(0, 2_000_000);
    const opportunity = extract(html, url.href);
    return opportunity;
  } catch (error) {
    if (error.name === 'AbortError') throw new HttpError(504, 'The source website took too long to respond');
    throw error;
  } finally { clearTimeout(timer); }
};

module.exports = { categoryFrom, fallbackTitleFromUrl, fetchAndExtract, isBlockedPageTitle };
