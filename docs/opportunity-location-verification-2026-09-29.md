# Verification: country filters and pagination

Feature commit: `d67d87e`. Migration applied successfully through the Supabase SQL editor on 29 September 2026. Railway and GitHub Pages deployment verified: the production API returns `page`, `pages`, `total`, country/category facets and 25 records, including the new geography columns.

Data refresh completed: **7 new listings, 7 existing listings updated, 0 duplicates**. The public catalogue now has **122 listings**, including **12 verified global opportunities** and **14 eligible for Singapore applicants**. The other 108 listings retain unspecified country eligibility. All published recorded application deadlines are current as of this review. Country + `Sentinel` + `Workshops` returns exactly the online taster workshop.

## Checks completed

| Case | Result |
| --- | --- |
| Global only | Worldwide plus explicitly multi-country listings; excludes online-only listings with unknown or single-country eligibility. |
| Singapore | Singapore-specific, multi-country including SG, and worldwide listings. |
| Country + keyword | Singapore + robotics returned only the two matching fixtures. |
| Country + keyword + category | Adding Competitions narrowed the result to one; tested with keyboard Enter in Chinese. |
| Country + existing format/detail filters | Shared filtering tests passed for online, in-person/hybrid and category intersections. |
| Missing eligibility | Visible under All with Eligibility not specified; excluded under country/global filters. |
| Pagination | 31 browser fixtures split into 25 + 6; 1,001 synthetic records split across 41 pages with no missing/duplicate IDs. Production pages 1 and 2 each returned 25 of the initial 115 listings. |
| Database response limit | Stubbed batch reads covered 0–499, 500–999 and 1000–1499; all 1,001 rows reached filtering. |
| English / Chinese | Controls, country names, card labels, counts, page controls and empty states switched correctly. Chinese country-name search narrowed the dropdown. |
| Mobile / keyboard | Tested with a 390×844 viewport request. No horizontal document overflow; location controls stacked and measured at least 46px high. Native select and Enter activation worked. |
| Existing behavior | Premium, recommendation and application-routing regression suites passed. Listing IDs and saved/applied tables are unchanged. No real student applications submitted. |

Run `npm.cmd test` for automated regression checks. This verification covers 1,001 listings, not 1,001 concurrent users; no software test guarantees freedom from every possible crash.

## Reviewed global additions

The dated manifest is `data/opportunities-global-2026-09-29.json`; its application script is dry-run by default. Descriptions preserve age, school, fee, guardian and organiser conditions. Official evidence:

- [Bow Seat Blue Planet Awareness Contest](https://bowseat.org/programs/blue-planet-awareness-contest/faqs/) — worldwide ages 11–18; online entry.
- [TSL International Student Competition](https://trustforsustainableliving.org/take-part/international-schools-essay-competition-and-debate) — 2027 cycle open; [eligibility FAQ](https://trustforsustainableliving.org/take-part/international-schools-essay-competition-and-debate/faqs-essay-competition) confirms worldwide students aged 7–18.
- [Sony Youth](https://www.worldphoto.org/sony-world-photography-awards/youth) and [Sony Student](https://www.worldphoto.org/sony-world-photography-awards/student) — separate contests and application routes. The Student page contains conflicting deadline times, disclosed in the listing with the earlier time advised.
- [Sister Cities YAAS](https://sistercities.org/what-we-do/programs/yaas/) — worldwide, but Sister Cities membership/partner affiliation is required. Automated source fetch returned 403 and form fetch 404; both loaded correctly in Chrome, and Start opened the 2027 application criteria. These explicit browser checks are recorded in the manifest.
- [Intellectaa iChallenge](https://ichallenge.intellectaa.com/) — worldwide grades 8–12; paid entry, with fees disclosed.
- [Oxford Agora](https://oxfordglobaleducation.com/oxford-agora) — worldwide ages 11–18; free, remote participation. Browser verified the embedded registration form. The independent organiser's university non-affiliation is disclosed.

Five existing entries were reviewed for worldwide eligibility: Diamond Challenge, Planet+, Duke-UNC CLS, Lumiere Junior Scholars and Zooniverse. Two Sentinel entries were verified as Singapore-specific from the [official eligibility page](https://www.dis.gov.sg/sentinel-programme/apply/). Other existing eligibility remains unspecified unless verified.

iF Design was held back after automated official-page access failed; Science Without Borders was held back because the retrieved official theme page still described the previous cycle. Neither was published based solely on an aggregator.

New links were checked for successful HTTP responses or a documented successful browser flow. Sign-in at an organiser's portal is an expected application step. Final submission, fee payment and acceptance were not tested.
