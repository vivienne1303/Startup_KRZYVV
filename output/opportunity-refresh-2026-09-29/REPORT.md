# TeenLaunch opportunity refresh — 29 September 2026

Published 18 new opportunities and restored one existing listing after an official deadline extension. The live public API now returns 115 listings, with no past recorded application deadlines, expiry dates or event-end dates, no duplicate titles and no missing additions.

Seven listings had automatically expired since yesterday's audit. Play For All - APSN (9 Oct 2026) was restored because the official Youth Corps role endpoint now gives a 30 September deadline. The other six remain hidden. Today's run did not need to expire any additional published records. Archived records were retained.

## Additions

- Six KidsLearn Term 1 2027 placements: Ang Mo Kio, Kampong Chai Chee, Boon Lay, Jurong East, Queenstown and Woodlands.
- Garden Keepers at Gardens by the Bay, 17 October.
- Sentinel 2027 Secondary 3 intake and the October/November online taster workshops.
- Lumiere Junior Scholars Essay Contest, Duke-UNC CLS Essay Competition and Planet+ Climate Solutions Challenge.
- Six COBIS competitions: poetry, Generation:Enterprise, esports, research skills, virtual debating and Changemakers.

Each listing links to its official source and application route. Descriptions identify school-entry restrictions, paid participation, different cohort deadlines and other important eligibility conditions. Personalised school-level filters were not guessed from overseas year-group labels.

## Verification and exclusions

- All 27 distinct source/application URLs for additions returned HTTP 200. This checks reachability, not successful submission of personal applications; no real applications were submitted.
- Rechecked all 101 distinct URLs attached to the 96 initially public listings. NASA's local certificate-chain error and RSIS's automated-access challenge remain exceptions to HTTP checking; both loaded successfully in the browser during yesterday's audit. Neither is evidence of expiry.
- Rechecked current NYC role deadlines against existing published records; no deadline discrepancies were found. Compared the extended Play For All deadline with the archived record before restoring it.
- Excluded Samsung Solve for Tomorrow and Singapore Model Parliament because their application periods had closed. Excluded two NYC events with past event dates despite future-looking registration fields. Held Care Beyond Memory because its registration deadline falls after the stated programme end and participation requirements need clarification.
- Avoided duplicating Active Mind Active Life under its alternate official URL. Did not add future Sentinel intakes that open on 19 October. GAIN was held because its page contains conflicting geographic eligibility statements.

## Audit files

- `before.json`: database snapshot before edits.
- `manifest.json`: exact additions and update.
- `nyc-research.json`, `kidslearn-research.json`: official opportunity and role evidence.
- `links.json`, `new-link-checks.json`: HTTP audit results.
- `result.json`: successful writes, duplicate checks and errors.
- `public-after.json`, `verification.json`: live public verification.

Useful official sources: [Youth Corps](https://discover.nyc.gov.sg/civicaction/Join-Opportunities), [Sentinel](https://www.dis.gov.sg/sentinel-programme/apply/), [Lumiere](https://www.lumiere-education.com/junior-scholars-essay-contest), [Duke-UNC CLS](https://www.dukechinaessay.com/), [Planet+](https://www.planetpluschallenge.com/how-it-works), [COBIS calendar](https://www.cobis.org.uk/student-engagement/student-engagement-calendar).
