# Youth and volunteering discovery — 30 September 2026

Added nine records in `data/opportunities-youth-volunteering-2026-09-30.json`: four Discover NYC career/mentoring events; Red Cross Youth @ Community; Food Bank individual volunteering; Habitat campus chapters and Project HomeWorks; and an uncertain Girl Up summit lead found through the OFY website.

The user-supplied Youth Plan page links to the existing Youth Corps directory, so no duplicate directory listing was added. Facebook returned a blocked page; no Facebook posts were represented as read or verified. OFY's public website was used instead. The Girl Up official event page returned 403 and official search/open results differed, so its dates, age and country eligibility remain unknown; aggregator claims are retained separately. The Habitat individual application form failed to load. Food Bank's individual interest form loaded, but no submission was made.

Known fees, ages, school membership restrictions and registration windows are retained. Unknown deadlines are null, not rolling. Singapore venues do not imply country eligibility. These uncertain-country entries appear under All locations and text search, not country/global eligibility filters. No consent or fee exemption was inferred.

`npm run import:youth-volunteering` validates and dry-runs against the original snapshot plus all three earlier prepared batches. It found nine new records and zero duplicate merges. Live import (`-- --apply`) checks the live database, preserves existing facts when merging provenance, requires the discovery migration and configured credentials, and refuses a stale research date. This batch has not been applied live.

The combined local preview retains all 19 earlier additions and adds these nine, for 28 total. Run `scripts/preview-ofy-discovery.js` with `PREVIEW_PORT=3104` to serve the preview. Earlier listings retain their original last-checked dates; they were not reverified as part of this batch. Existing live records were not changed or removed.
