# TJC portfolio additions — 30 September 2026

Eight additions are in `data/opportunities-tjc-2026-09-30.json`: Singapore Book Council volunteering, RDA therapy volunteering, Pro Bono SG student internship interest, SAMH volunteering, Esplanade volunteering, Youths for Autism internships, Net Zero 101 and Climate Change: From Learning to Action.

The user explicitly accepts opportunities without a stated age or target age group. Six records have null minimum and maximum ages; this does not prevent inclusion. Unknown student eligibility retains Check eligibility. TJC's page is discovery provenance, not proof of TJC-only membership or eligibility. Known restrictions from organiser forms take precedence: RDA is 16+ with parental consent below 21; Pro Bono SG is 18+ and routes students to a separate internship-interest form.

RDA registration, Pro Bono SG interest form and the UN course login page loaded. SBC's form failed to load, SAMH's portal returned a CSS error and Esplanade rendered only a loading component. YFA application instructions loaded but its downstream submission flow remains unverified. All limitations are stored on the listings. Nothing was submitted.

RDA explicitly welcomes volunteers on an ongoing basis; other deadlines remain unknown. YFA's December 2026 intake is described without inventing exact dates or a closing deadline. UN certificate fees are disclosed; the TJC heading “Free Online Courses” was not treated as evidence of free certification. Country eligibility remains unspecified unless explicitly confirmed, so these entries appear in All locations rather than country/global eligibility results.

Run `npm run import:tjc` for validation and a dry run against the original snapshot and all other prepared manifests. The importer now accepts `--manifest=opportunities-NAME.json` for future batches, restricted to filenames inside data/. Live application still requires configured credentials, the discovery migration, current research and live duplicate checks. This batch was not published.

The preview now retains 42 earlier additions and includes these eight (50 total). Use `PREVIEW_PORT=3107` with `node scripts/preview-ofy-discovery.js`. Existing live records and earlier check dates are unchanged.
