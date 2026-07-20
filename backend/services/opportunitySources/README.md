# Opportunity source adapters

`apiSourceBase.js` defines the future provider contract:

- `fetchOpportunities()`
- `normaliseOpportunity()`
- `detectDuplicates()`
- `saveOrUpdateOpportunity()`
- `markExpiredOpportunities()`

`manualSource.js` and `partnerSource.js` are active MVP adapters. No external API or scraper is connected.

`mockProvider.js` is documentation and local-development test code only. Its records contain `[MOCK]`, production returns no records, and no route imports or publishes it.
