# Premium access

Personalised opportunity recommendations require a verified Supabase Auth user's app_metadata.subscription with:

- plan: "premium"
- status: "active"
- expires_at: an ISO timestamp strictly in the future

Only trusted administrator or server code may set this metadata. Profile fields, user_metadata and browser storage never grant access. No database migration is required. There is no checkout or subscription activation endpoint yet; the homepage intentionally displays Coming soon without a price.

When billing is implemented, verify payment-provider webhook signatures and update this metadata through trusted server code. Expired or inactive subscriptions fail closed. The recommendation route returns 403 with code PREMIUM_REQUIRED; clients render the plan prompt instead of treating it as an expired login. Public opportunity browsing remains free. Career Copilot also omits personalised opportunity lists for free accounts.

Run npm test for syntax checks and Premium access regression coverage.
