# SALES-003B deployed browser certification

Status: **FAIL — certification incomplete**

Production URL: https://landlordheaven.co.uk  
Certified candidate commit: `68347e32e96bf28a1d626164f3e999865265839c`  
Vercel deployment: `AmN6WgT7umUU3bFEsG7qfzmMFZjm`  
Evidence completed: 24 July 2026

The deployed application passed the 39 route/viewport render matrix, hydration,
critical network, media, CTA, product-height, HMO, rent-arrears, contextual
module, accessibility, experiment, malformed-copy, and indexability checks.

Certification remains failed for two acceptance areas:

1. Every audited mobile route has a measured content gap above the required
   120px ceiling. The measured range is 145–234px.
2. Live analytics ingestion is not fully verified. Four newer event names return
   HTTP 202 with `persisted: false`, while the authenticated admin aggregate
   endpoint returns HTTP 401. HMO and arrears `result_viewed` events do persist.

The repository includes migration
`supabase/migrations/025_expand_marketing_growth_event_names.sql`, but this audit
does not have evidence that it was applied to the production database.

No official 30-day measurement window has started, and no sales improvement is
claimed.

See [validation.md](validation.md) for the acceptance matrix,
[deployed-release-evidence.md](deployed-release-evidence.md) for release proof,
and [production-build-validation.md](production-build-validation.md) for local
validation.
