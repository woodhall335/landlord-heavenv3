# SALES-003C root-cause report

## Authentication/configuration failure

The original certification called the protected aggregate without an approved
admin session, so the correct production response was HTTP 401. The endpoint
continues to use normal Supabase cookie authentication plus the
`ADMIN_USER_IDS` allowlist. Final validation used the user's normally
authenticated in-app browser session and returned HTTP 200. No public bypass,
QA-marker authentication, fixture, or hard-coded credential was introduced.

## Aggregate-data correctness

The protected endpoint reads the real `marketing_events` store and filters to
the exact QA marker. The final aggregate contains six persisted events across
six source pages and six product dimensions, all required view/click stages,
and six `sales003c-certification` / `control` experiment rows. The privacy
diagnostic is `false`, confirming that raw rent-arrears values, case data, and
other sensitive payloads were not detected. The runner retains bounded polling
with a 60-second timeout, 2-second interval, final-count diagnostics, and hard
failure behavior.

## Copy regression

`UniversalHero` rendered the plain title and block-level highlighted title
without an intervening text-space node, joining "England" and "tenancy" in H1
`textContent`. The shared heading renderer now preserves the word boundary.
Canonical-source and rendered-H1 regression checks cover all five certified
product routes, and production renders:
"Create the right England tenancy agreement for the let".
