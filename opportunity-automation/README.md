# TeenLaunch opportunity refresh

## Verification update — 13 October 2026

The workflow on GitHub runs daily at 09:00 Singapore time and uses `--apply`. The latest observed run (12 October, three attempts) failed. The historical activation notes below describe the earlier preparation session, not current deployment status.

The local refresh now loads the ignored `.env` for CLI runs, supports secret API keys without treating them as JWT bearer tokens, records actual added/archived counts in the summary, and saves a failure summary when database access fails. Private reports and database backups are ignored by Git. These corrections must be deployed before GitHub uses them.

A live read-only run on 13 October completed discovery with no provider errors: the public response contained 1,000 published listings, 584 confirmed-active listings, zero planned archives, and 48 proposed additions. Public API results exclude hidden rows and may be capped; these figures do not establish complete database totals. The projected confirmed-active count was 632, so the monitoring target remains unmet. No production writes were performed. Database reads with the local secret key were rejected with HTTP 401, including API-key-only authentication. A valid key for the configured project is required before production changes can be verified. GitHub secrets must be checked separately; local authentication failure does not prove the GitHub key is identical.

The test suite covers successful archive/insert flows, duplicate-free repeated runs, provider failure with continued expiry archiving, and authentication failure reporting. An inventory shortfall deliberately produces a nonzero process exit status even when execution has no provider/write errors; inspect `execution_status`, `error_count`, `below_target`, `added`, and `archived` separately.

Prepared 12 October 2026. This is a tested implementation and reviewed refresh plan. It has not been pushed to GitHub or applied to the live database.

## Current result

The public API returned 990 listings. 629 were marked verified; 614 met the stricter confirmed-active checks (verified, not expired, confirmed/rolling deadline and confirmed eligibility/application route). None had a past stored deadline, expiry date, end date, or recorded closed recruitment status. This does not prove all source organisers still accept applications, and the public API excludes archived/private rows.

The Zooniverse official API returned 563 projects. 80 met the strict live/launch-approved/active-workflow/unfinished-work checks. Deduplication against TeenLaunch found 38 new projects; the other 42 were already listed. Publishing these additions would bring the observed public total to 1,028 and the stricter confirmed-active count to 652. This is still below the requested 1,000 confirmed-active target; it requires at least 348 further qualifying opportunities or re-verification of existing leads. The reviewed additions are in reports/2026-10-12/new-opportunities.json. Each includes its official project URL, live API evidence, check timestamp, rolling participation status, and under-16 registration conditions.

These additions are online citizen-science volunteering opportunities. They are not internships, scholarships, or paid placements. Source: https://www.zooniverse.org/get-involved/volunteer . Other existing source providers are not automatically refreshed by this first adapter.

## Behaviour

- Reads all database rows in pages of 500 when run with --apply; read-only mode reads the public API.
- Archives past application deadlines, expiry dates, event end dates, and explicitly recorded closed recruitment. It retains IDs and applications; it never deletes rows.
- Date-only deadlines remain open until the end of the day in Singapore. Exact timestamps retain their supplied time zone.
- Discovers eligible live Zooniverse projects, canonicalises URLs, and rejects duplicate links, duplicate source IDs, and duplicate title/organiser pairs. It does not resurrect an expired duplicate automatically.
- Targets 1,000 confirmed-active listings (excluding unknown, upcoming, unverified, unpublished, and ineligible entries) with a 100-listing buffer where the source provides enough real additions. It never creates fake entries to reach a quota.
- Archives expired dates even if discovery fails. A provider failure is recorded and fails the job; missing feed entries never imply closure.
- Current count below 1,000 fails the read-only monitoring job, even if the proposed additions would fix the shortfall.
- Does not repeatedly write the database after ambiguous failed write requests. Production writes require explicit --apply and backend credentials in environment variables.
- Writes a public summary and detailed local report. Expiry backups stay local and are not uploaded by the read-only workflow.

There is no unconditional guarantee of 1,000 genuine active opportunities every day. Source outages, closures, eligibility constraints, and GitHub schedule delays can cause shortfalls. The workflow detects shortfalls. More approved source adapters and a larger diverse reserve are needed for a dependable service-level target. This means 1,000 active listings in total, not 1,000 new listings per day.

## Test and review

Requires Node 22 or newer. No npm dependencies are needed.

    node --test opportunity-automation/refresh.test.mjs
    node opportunity-automation/refresh.mjs

The portable Node runtime downloaded for this session is ignored by Git. It was obtained from nodejs.org and checked against the official SHA-256 manifest before extraction.

## Live database access

Set SUPABASE_URL and SUPABASE_SECRET_KEY securely in the execution environment. Do not commit keys, paste them into chat, or embed them in frontend code. Local backend configuration could not be read because the OneDrive cloud provider was unavailable. The script deliberately does not extract browser login tokens or write through unauthenticated endpoints.

After reviewing the plan and providing the environment through a trusted connection, the one-time production update command is:

    node opportunity-automation/refresh.mjs --apply

An apply run re-reads the complete live database, refreshes source evidence, checks duplicates again, backs up rows selected for expiry, archives them reversibly, inserts verified new records, and verifies the final count. Existing applications and portfolio references are preserved. Details recorded by an organiser without structured, trustworthy status still need source review; this first version is not a universal source-link crawler.

## Scheduling and activation

The user explicitly approved a daily production refresh at 04:17 Asia/Singapore on 12 October 2026. .github/workflows/opportunity-inventory.yml now contains that approved production job, replacing the previous read-only schedule. The cron expression is `17 20 * * *` (20:17 UTC on the preceding day). Manual Run workflow performs the same production refresh.

The workflow is prepared locally and is NOT active until pushed to the default branch. No production changes have been applied in this session. Repository write access and backend credentials are not yet connected.

Activation steps:
1. Connect GitHub and grant access to vivienne1303/Startup_KRZYVV, then commit the workflow, refresh.mjs, refresh.test.mjs, .gitignore, and README.md. Do not commit the runtime, downloaded source, or private reports.
2. Add SUPABASE_URL and SUPABASE_SECRET_KEY through GitHub Settings > Secrets and variables > Actions. Use existing backend values through a secure connection; do not paste secrets in chat or commit them.
3. Run Daily opportunity refresh once from the repository Actions tab and check its saved summary before relying on the daily schedule.
4. Enable GitHub Actions failure notifications. The run fails visibly if discovery fails or the confirmed-active inventory remains below 1,000, even when valid additions were successfully applied. Review the summary to distinguish a count shortfall from an execution failure.

Jobs are serialised to avoid overlapping scheduled/manual refreshes. Tests run before writes. Missing secret values stop the job without printing credentials. Only summary.json is uploaded as a workflow artifact; detailed database backups are not published. The workflow retains read-only GitHub repository permissions; its production database permission comes only from the configured Supabase secret.

GitHub scheduled jobs may be delayed and only run from the default branch. A 1,000-opportunity minimum is a monitored target, not a guarantee; the latest plan still requires more verified source coverage. Reference: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule .
