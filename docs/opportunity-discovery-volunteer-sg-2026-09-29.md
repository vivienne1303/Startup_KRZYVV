# Volunteer.gov.sg additions — 29 September 2026

Nine reviewed additions are in `data/opportunities-volunteer-sg-2026-09-29.json`. Run `node scripts/prepare-volunteer-sg-discovery.js` to reproduce the manifest, and `npm run import:volunteer-sg` for a dry run. Live import uses `npm run import:volunteer-sg -- --apply`, requires configured database credentials and migration 202609290017, and refuses research from a different date.

The local preview now includes all ten previous OFY additions plus these nine. Existing live records were not deleted or changed. This batch has not been published to the live database.

Each entry retains its official listing URL, last-checked date, known registration deadline, restrictions and unknown fields. Apply controls loaded, but the authenticated registration flow was not verified, so application access remains unknown. No applications were submitted. Fees and unlisted consent requirements remain unknown.

Two registration windows are upcoming: Active Health (1 October noon) and Butterfly Habitat (30 September 1pm). The nursing event has conflicting October dates, so event dates remain null and the conflict is visible in its description. NParks entries describe the next member session, not the separate leader role. Frame Running requires two sessions per month; applicants should confirm additional December availability. MENDAKI's administrative shift dates are not treated as actual programme dates.

All venues are in Singapore, but citizenship/residency eligibility is unspecified. These entries appear under All locations and Singapore text searches, not country-eligibility filters. This preserves the rule against inferring applicant eligibility from a venue.

Local duplicate checking includes the original inventory snapshot, prepared global additions and OFY additions. Health in Check cross-postings were excluded manually because the same programmes already have Youth Corps listings. Confirmed closed Nursing Care Buddies and Rapid Screening entries were excluded despite future event dates. Exclusion source URLs are retained in the manifest. Live import rechecks duplicates and only merges provenance on matches.
