# Community and youth additions — 30 September 2026

Nine new entries cover Lions Befrienders, Heartware Youthbank, University YMCA, Be My Eyes, Science Centre Singapore, NHB Heritage Champions, UNV Online Volunteering, Harvard CS50x and Hack Club. Facts and official evidence URLs are retained in `data/opportunities-community-youth-2026-09-30.json`.

These are programme/community entry points, not invented event slots. Unknown deadlines stay null. Lions Befrienders explicitly states ongoing recruitment; its one-year commitment and inconsistent weekly/fortnightly visit descriptions are disclosed. Be My Eyes requires age 18 under its 2026 terms. Science Centre's official consent PDF confirms age 14+ and parental consent below 18 despite its recruitment page being blocked. NHB age and country rules remain unknown because the page/FAQ could not be inspected.

UNV explicitly accepts applicants worldwide; individual assignments have separate requirements and deadlines. Hack Club explicitly welcomes teens worldwide. Singapore venue and online delivery are not treated as proof of nationality eligibility. CS50's course-completion date is stored as an end date, not an application deadline. Free OpenCourseWare access is distinguished from assessed submissions and optional paid edX certification.

Application access: No applications or personal data were submitted. CS50 learning materials and instructions and Hack Club's homepage join form loaded. Be My Eyes download instructions loaded but in-app registration was not tested. Heartware/UNV portals returned JavaScript shells. Lions/Uni-Y linked routes failed to load; Science Centre/NHB showed verification screens. Each limitation is stored on its listing.

Run `npm run import:community-youth` to validate and dry-run against the inventory snapshot and all earlier prepared batches. Live `-- --apply` requires credentials and the discovery migration, checks the live inventory, preserves existing facts on duplicates and refuses a stale research date. No live import was performed.

The preview combines 37 researched additions, retaining all 28 previous entries and their original last-checked dates. Existing live listings were not changed. Preview can be served with `PREVIEW_PORT=3105` and `node scripts/preview-ofy-discovery.js`.
