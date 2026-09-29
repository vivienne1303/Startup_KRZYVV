# Opportunity location and eligibility

The Opportunities page shows 25 listings per page. Location, keyword, category and existing detail filters are combined before pagination. Country options come from the published opportunity data, with translated country names.

## Entering a listing

In **Admin dashboard → Add/Edit opportunity**, enter:

| Field | What to enter |
| --- | --- |
| Location | Venue, city or event location, if verified. |
| Host country | Two-letter ISO country code such as `SG`, `US` or `GB`. Leave blank for unknown or fully online events without a relevant venue. This is not applicant eligibility. |
| Applicant eligibility | **Open worldwide** only when the organiser explicitly accepts worldwide applicants; **Specific countries** for an explicit country list; otherwise **Eligibility not specified**. |
| Eligible country codes | Comma-separated two-letter codes, such as `SG, MY`. Required for Specific countries; leave blank for the other scopes. |
| Mode | Online, Physical (in person), or Hybrid. Leave unspecified if unverified. |
| Travel required | Yes/No only when verified; otherwise Not specified. Describe finalist-only travel or optional ceremonies in the description. |
| Eligibility details | Preserve age, education, school membership, citizenship/residency rules and other restrictions, plus the official evidence. Country eligibility alone never guarantees acceptance. |
| Official source / Application URL | The organiser's current eligibility page and functioning application page. External applications remain on the organiser's site. |

Examples:

- Singapore event accepting worldwide teams: host `SG`, Worldwide, no country codes, Physical/Hybrid as documented. Card: **Singapore · Open worldwide**.
- Online Singapore-only programme: Online, Specific countries, `SG`; card: **Online · Singapore applicants**.
- Programme explicitly accepting Singapore and Malaysia: Specific countries, `SG, MY`. It appears under Global and either country, but is not labelled Open worldwide.
- Online event with no verified country rules: Unspecified, no country codes. It appears under All opportunities with **Eligibility not specified**, and is excluded from country/global results.

Worldwide listings are included when any available country is selected. The dropdown derives codes from explicit eligible countries and known host countries on worldwide listings; it does not fabricate a fixed country list. Country search accepts English, Chinese and country codes.

## Data and deployment

New columns: `host_country` (nullable code), `eligibility_scope` (`unknown`, `worldwide`, `countries`), `eligible_countries` (array), `travel_required` (nullable boolean). Existing `mode`/`format`, `location`, and prose `eligibility` are retained. Existing records default to unknown, without inferred eligibility.

Apply `supabase/migrations/202609290016_opportunity_geography.sql` before deploying the backend. It adds columns, validation constraints and a published deadline/ID index without replacing listing IDs or saved/applied records.

`GET /api/opportunities?paged=true&page=1&country=SG&search=robotics&category=competitions` returns 25 items, total/page counts and data-derived facets. The server reads the full public dataset in batches of 500 and caches it for 30 seconds; writes through the opportunity controller invalidate the cache. Filtering happens on the server before slicing. This avoids the default 1,000-row response limit. The legacy response shape is preserved for other pages. Direct database changes appear after the cache expires.

Run `npm.cmd test`. For isolated mobile/browser testing, run `node scripts/preview-opportunity-filters.js` and open `http://127.0.0.1:3101/pages/opportunities.html`. Its sample records never enter the database.

Tested with 1,001 synthetic records (41 pages) and actual public data. This is not a concurrent-user load test or a guarantee against all failures.
