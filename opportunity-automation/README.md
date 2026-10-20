# Daily opportunity refresh

The production workflow archives outdated opportunities and targets at least **50 genuinely new published opportunities per Singapore calendar day**. The primary schedule is 09:00 Asia/Singapore; a recovery run at 17:00 fills any remaining shortfall. Manual runs use the same daily quota. Repeated runs do not add another 50 after the target has been met.

## Sources and checks

- INTERNSG: Singapore internships, including online and hybrid roles. Individual pages must contain an internship JobPosting, Singapore location, a posting within 45 days and application instructions. Explicitly closed recruitment is excluded. Unstated deadlines, ages and eligibility stay unknown; these remain reviewed leads, not falsely verified opportunities.
- Devpost: local, overseas and online hackathons with officially open submissions, individual event data, a current closing date and participant rules. Invitation-only and cancelled events are excluded. Online participation does not imply worldwide eligibility; restrictions remain visible.
- Zooniverse: live, launch-approved projects with active workflows and at least 100 unfinished subjects. Registration conditions and school-credit limitations remain visible.

All additions are deduplicated against the complete database, including archived rows, by canonical URL, source identifier and title/organiser. Expired duplicates are not resurrected. The former 1,000 confirmed-active inventory target does not control whether 50 new listings are added each day.

Past stored deadlines, expiry dates, event end dates and explicitly closed recruitment are archived before discovery begins. Existing INTERNSG sources are checked for affirmative closure evidence; explicitly exhausted Zooniverse work is also archived. Source outages, HTTP errors and absent feed entries never imply closure. Other organisers receive stored-date and closed-status checks, not universal website re-verification.

Date-only deadlines remain open through the end of their Singapore day. Exact source closing timestamps retain their time zone. Archiving preserves database IDs, applications and portfolio references. Private backups stay on the runner.

## Daily quota and verification

New inserts receive `discovery.automation_added_day`. The quota counts only records actually created that Singapore day that remain published and unexpired. Updates to existing rows do not count. Partial runs resume the remaining quota; checked reserve candidates can replace failed inserts without retrying ambiguous writes.

Final database reads verify inserted visibility and archived status. Summaries separately report this run's additions/archives, today's automation additions/archives, source errors, warnings and the shortfall. Discovery/write failures and fewer than 50 daily additions fail the job visibly. External sources cannot guarantee 50 genuine openings every future day; insufficient supply is reported rather than padded with duplicates, closed entries or invented opportunities. The recovery run provides another attempt when sources recover.

## Running

GitHub uses Node 22. Local Node 20 also works with the repository's dotenv dependency installed. Environment variables take priority over the ignored `.env`.

```sh
node --test opportunity-automation/*.test.mjs
node opportunity-automation/refresh.mjs
node opportunity-automation/refresh.mjs --apply --minimum-additions=50
```

With credentials, both read-only and production modes read all database rows in pages of 500. Without credentials, read-only mode falls back to the public API, which may cap results and omits hidden/archived rows. Production requires `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. Secret API keys are sent as API keys; legacy JWT service keys also receive bearer authentication. Configure credentials securely in GitHub Actions secrets. Never publish them or database backups.

The workflow publishes an Actions job summary and only `summary.json` artifacts, retained for 30 days. Detailed reports are ignored by Git. GitHub serialises scheduled/manual jobs, but schedules can be delayed. Enable failure notifications to receive shortfall/error alerts.

## Verification on 13 October 2026

The corrected production refresh added 50 new records with zero duplicates, errors or source warnings. No expired records required archival. Tests cover quota behaviour above 1,000 inventory, retries, partial-day recovery, Singapore midnight, insufficient supply, write failures, expiry during discovery outages, invalid dates, remote labels and restricted hackathons. Expiry tests do not create artificial production listings.

## Audit on 20 October 2026

The hosted workflow remains active, but recent scheduled runs have failed the daily quota. Database records show 50 automation additions on 16 October, 42 on 17 October, 24 on 18 October, 5 on 19 October and 13 so far on 20 October (Singapore dates). Updates are still inserting records; a failed run does not mean nothing was added.

Removed the discovery ceiling of 15 Devpost candidates so that this source can continue toward the full remaining daily quota when other sources cannot fill it. A regression test verifies discovery across six feed pages. All 24 automation tests and the application test suite pass locally. This correction does not guarantee sufficient genuinely new source listings, and must be deployed before hosted runs use it. The live read-only discovery check was stopped before completing all internship pages; a successful production refresh has not been verified by this audit.
