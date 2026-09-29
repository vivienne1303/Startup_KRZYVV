(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OpportunityFilters = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const PAGE_SIZE = 25;
  const categoryKey = value => String(value || 'Other').trim().toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'other';
  const countries = item => item.eligibility_scope === 'countries' && Array.isArray(item.eligible_countries)
    ? [...new Set(item.eligible_countries.filter(code => /^[A-Z]{2}$/.test(code)))] : [];
  const isGlobal = item => item.eligibility_scope === 'worldwide' || countries(item).length > 1;
  const matchesCountry = (item, country) => !country || country === 'all' || (country === 'global' ? isGlobal(item) : item.eligibility_scope === 'worldwide' || countries(item).includes(country));
  const regionNames = {};
  const countryName = (code, lang = 'en') => {
    try {
      regionNames[lang] ||= new Intl.DisplayNames([lang === 'zh' ? 'zh-Hans' : 'en'], { type: 'region' });
      return regionNames[lang].of(code);
    } catch { return code; }
  };
  function locationLabel(item, lang = 'en') {
    const zh = lang === 'zh', codes = countries(item);
    const host = item.format === 'online' || item.mode === 'online' ? (zh ? '线上' : 'Online')
      : item.host_country ? countryName(item.host_country, lang) : item.location || (zh ? '地点未注明' : 'Location not specified');
    const eligibility = item.eligibility_scope === 'worldwide' ? (zh ? '全球均可申请' : 'Open worldwide')
      : codes.length ? (zh ? `面向${codes.map(code => countryName(code, lang)).join('、')}申请者` : `${codes.map(code => countryName(code, lang)).join(', ')} applicants`)
      : (zh ? '申请资格未注明' : 'Eligibility not specified');
    return `${host} · ${eligibility}`;
  }
  function detailTokens(item, now = new Date()) {
    const tokens = [], format = item.format || item.mode;
    if (['online','hybrid'].includes(format)) tokens.push('online');
    if (['in_person','physical','hybrid'].includes(format)) tokens.push('physical');
    const low = item.minimum_age ?? item.age_min, high = item.maximum_age ?? item.age_max;
    if (low != null || high != null) for (const [a,b] of [[10,13],[14,16],[17,19]]) if ((low ?? 0) <= b && (high ?? 999) >= a) tokens.push(`${a}-${b}`);
    const level = `${item.level || ''} ${item.difficulty || ''} ${item.eligibility || ''}`.toLowerCase();
    if (/beginner|introductory|no experience/.test(level)) tokens.push('beginner');
    if (/advanced|experienced|intermediate/.test(level)) tokens.push('advanced');
    const deadline = item.application_deadline || item.deadline;
    const days = deadline ? (new Date(`${deadline}T23:59:59+08:00`) - now) / 86400000 : -1;
    if (days >= 0 && days <= 30) tokens.push('soon');
    return tokens;
  }
  function browse(rows, filters = {}) {
    const query = String(filters.search || '').trim().toLowerCase();
    const filtered = rows.filter(item => {
      if (!matchesCountry(item, filters.country)) return false;
      if (filters.category && filters.category !== 'all' && ![item.category, ...(item.categories || [])].some(x => categoryKey(x) === categoryKey(filters.category))) return false;
      if (filters.detail && filters.detail !== 'all' && !detailTokens(item).includes(filters.detail)) return false;
      if (filters.mode && (item.format || item.mode) !== filters.mode) return false;
      if (!query) return true;
      const text = [item.title,item.description,item.eligibility,item.organisation,item.organizer,item.category,...(item.categories || []),...(item.skills || []),item.location,locationLabel(item,'en'),locationLabel(item,'zh')].join(' ').toLowerCase();
      return !query || text.includes(query);
    });
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const page = Math.min(pages, Math.max(1, Math.floor(Number(filters.page) || 1)));
    const codes = new Set(rows.flatMap(countries));
    for (const item of rows) if (item.host_country && item.eligibility_scope === 'worldwide') codes.add(item.host_country);
    return { opportunities: filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), page, page_size: PAGE_SIZE, total: filtered.length, pages,
      facets: { countries: [...codes].sort(), categories: [...new Set(rows.flatMap(item => [item.category,...(item.categories || [])]).filter(Boolean))].sort() } };
  }
  return { PAGE_SIZE, categoryKey, countries, isGlobal, matchesCountry, countryName, locationLabel, detailTokens, browse };
});
