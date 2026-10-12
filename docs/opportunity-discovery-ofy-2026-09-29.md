# Opportunities for Youth discovery batch — 29 September 2026

Ten student/youth-relevant records are prepared in `data/opportunities-ofy-2026-09-29.json`. This is a reviewed batch, not a continuous scraper or a claim to have imported every OFY article.

**Not published to the live database in this workspace.** No Supabase environment credentials are configured. The dry run checked the repository's existing listing snapshot and previous global additions: ten additions, zero local duplicates. It cannot establish the current live duplicate count. `--apply` always checks the entire live table again before writing.

| Listing | Evidence and remaining checks |
| --- | --- |
| Yale Young Global Scholars 2027 | Official eligibility, deadlines, fees and login portal checked. Worldwide, ages 16–18 with grade/graduation restrictions. |
| Hansen Leadership Institute 2027 | Official age/education, dates and funding checked. Application JavaScript shell did not establish working form access. International and US deadlines differ. |
| OFC Breaking Barriers 2027 | UK residency, closing date and form checked. Conflicting upper-age wording needs clarification. Keep distinct from the paid standard Scholars route. |
| Girl Up Rise to Lead | OFY lead retained; linked Zoom page unavailable to the checking tool. Article claims remain separate from verified fields. |
| Introduction to Sports for Climate Action | Course and enrolment login checked; closing date, exact age/country eligibility unknown. Paid certificate disclosed. |
| Women Leadership in Climate Action | Course targets women and girls. Login checked; deadline/country eligibility unknown. Paid certificate disclosed. |
| Mastering International Climate Negotiations | Youth-focused course. Login checked; deadline/country eligibility unknown. Paid certificate disclosed. |
| UNICEF Internship Programme | Programme directory, not a verified individual placement. Vacancy-specific deadlines and applications need checking. |
| FAO Asia and Pacific internship call | General programme eligibility checked. Specific vacancy could not be loaded. Deadline remains null. |
| beVisioneers 2027 lead | Official portal shows older 2026/27 round; do not transfer its age/country/funding rules to the advertised new cohort. |

Each record contains the OFY discovery URL, a source URL, last-checked date, explicit uncertainty states and nullable restrictions/fees/consent. Individual official links and verification notes are in the manifest. All summaries are original, concise descriptions. No forms were submitted, accounts created or fees paid.

## Deploy and import

1. Apply `supabase/migrations/202609290017_opportunity_discovery.sql` before deploying the updated API. It adds nullable `discovery` evidence and `discovery_sources` without changing existing listings.
2. Configure the existing Supabase environment variables on the trusted server; do not commit credentials.
3. Run `npm run import:ofy` to review the local dry run. Run `npm run import:ofy -- --apply` to publish the dated batch after the migration. Applying on another day fails until the batch has been re-verified and dated accordingly.
4. Deploy the API and frontend changes together. Verify public cards and filters after deployment. This workspace did not perform a live migration or deployment.

The apply command snapshots live rows first, validates the batch, reads all live listings in 500-row pages, and matches canonical URLs or normalized title/organisation. A duplicate retains its ID and all existing facts/status; only the additional discovery source is merged, with optimistic concurrency checks. This preserves saved opportunities and verified listings. New records with incomplete evidence are published as `pending_review` verification, independent of editorial `published` status. Interrupted runs can be retried: rows already inserted are merged, not duplicated.

## Discovery contract

- `deadline_status`: `unknown`, `confirmed`, `rolling`, `upcoming`, `closed`. Missing dates never mean rolling. Upcoming means applications are not yet open, not merely that an event is in the future.
- `student_eligibility`: `unknown`, `confirmed`, `ineligible`. Confirmation means relevant to a stated student/youth group, not guaranteed eligibility for every user.
- `application_access`: `unknown`, `available`, `login_required`, `unavailable`. Tool access failures describe the check; they do not prove the website is permanently broken.
- `last_checked_at`: date of evidence review. `last_verified_at` is only set for fully confirmed entries.
- `fees`, `parental_consent`, `school_membership`, `restrictions`: nullable, with explicit text only when supported.
- `claims`: optional unverified extraction hints. These never populate confirmed age, dates or country filters automatically.

Automatic URL extraction now keeps suspected dates, ages and application links as claims for review. Publishing a lead does not mark those claims verified or enable internal TeenLaunch applications. Confirmed open/eligible/access-checked records rank first, upcoming records next, other leads below. Closed, expired and confirmed ineligible records are excluded from default results. Existing country filtering remains evidence-based: unknown country rules appear only under All locations, including online leads. Online / worldwide retains the existing global eligibility filter; an online venue alone is insufficient.

Run `npm test` for the existing suite plus discovery validation, expiry, geography, confidence ordering, idempotent imports and preservation of verified facts when merging duplicates. No test writes to the live database.
