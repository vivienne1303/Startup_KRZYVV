# Cordy discovery — 30 September 2026

Five new entries are prepared in `data/opportunities-cordy-2026-09-30.json`, each retaining Cordy discovery provenance, official evidence and the check date. They cover Art Outreach volunteer applications, WWF volunteer registration, Greatest Build Together, SHG Joint Youth Dialogue and attendance at the youth photography exhibition.

Cordy's dates and “No deadline” labels were not copied into application deadlines. All five deadlines remain unknown. WWF age/residency/consent claims remain separately unverified because the official Typeform rendered no readable fields. Art Outreach's volunteer form loaded, but its closed 2027 Art Week internship was excluded. Greatest Build Together costs from SGD 15 and its booking link failed. SHG and exhibition details were supported by official indexed results, but direct pages failed; application access is flagged accordingly. The photography exhibition is not an open competition call.

Cross-posts already present in the inventory (Zooniverse, Buddy on Deck, Impact IRL, Click & Connect, Health in Check) were held out. Dry-run checks cover the original inventory and all previous prepared batches. No existing facts or live rows were changed; no applications were submitted.

Run `npm run import:cordy` for a dry run. Live application requires configured credentials, the discovery migration, a fresh research date and a new live duplicate check; it has not been performed. The combined preview contains 42 additions with all 37 earlier entries retained. Serve with `PREVIEW_PORT=3106` and `node scripts/preview-ofy-discovery.js`.
