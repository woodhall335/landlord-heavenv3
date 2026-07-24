# SALES-003B validation

Overall result: **FAIL**

No official measurement window has started. No sales improvement is claimed.

| Acceptance area | Executed evidence | Result |
|---|---:|---|
| Deployed commit identified | Commit `68347e32`, Vercel `AmN6Wg…` | PASS |
| Production build | Next.js build, 517/517 generated routes | PASS |
| Full ESLint | 2,045 files, 0 errors, 764 warnings | PASS |
| TypeScript | `tsc --noEmit` and build type phase | PASS |
| Focused tests | 18/18 plus 10/10 on the exact final CTA change | PASS |
| Git whitespace validation | `git diff --check` | PASS |
| Canonical malformed copy | 2/2 routes | PASS |
| Route/viewport matrix | 39/39 | PASS |
| Screenshots | 78/78 | PASS |
| Intended media | 470/470 | PASS |
| Critical network requests | 0 critical failures in route matrix | PASS |
| Browser console errors | 0 | PASS |
| Hydration | 39/39 | PASS |
| Accessibility and keyboard | 39/39 | PASS |
| Duplicate CTA/browser destinations | 5/5 | PASS |
| Product hero measurements | 5/5 | PASS |
| HMO states | 4/4 | PASS |
| Rent-arrears states | 7/7 | PASS |
| Contextual modules | 24/24 | PASS |
| Experiment baseline | 2/2, forced control | PASS |
| Indexability regression | 13/13 | PASS |
| Mobile gap ceiling | 0/13; measured 145–234px against 120px ceiling | **FAIL** |
| Event-store ingestion | 2/6 event probes persisted | **FAIL** |
| Admin aggregate verification | HTTP 401 | **FAIL** |

## Blocking findings

### Mobile gaps

`excessive-gap-live.csv` contains an executed FAIL row for every mobile route.
The smallest measured vertical gap is 145px and the largest is 234px. These
values are measured between painted text/media blocks after correcting the
harness to include absolutely positioned Next.js images.

### Analytics

QA marker:
`qa-sales003b-2026-07-24T21-19-05-853Z-ingestion`

- `contextual_offer_view`: HTTP 202, `persisted: false`
- `contextual_offer_click`: HTTP 202, `persisted: false`
- `product_view`: HTTP 202, `persisted: false`
- `product_primary_cta_click`: HTTP 202, `persisted: false`
- HMO `result_viewed`: HTTP 200, `persisted: true`
- Arrears `result_viewed`: HTTP 200, `persisted: true`
- `/api/admin/growth?days=7`: HTTP 401

The repository migration expands the database event-name allow-list, but the
live results show that production persistence is not yet aligned. An
authenticated admin session was not available, so aggregate visibility cannot
be certified.

## Non-blocking network record

`network-failures.csv` records 1,570 browser requests aborted by navigation or
prefetch cancellation (`net::ERR_ABORTED`). The route matrix independently
classifies visible/critical request failures and reports zero. No HTTP 4xx/5xx
or user-visible media failure was observed in the final matrix.

## Required next actions

1. Reduce or explicitly redesign the measured mobile vertical gaps to 120px or
   less, then rerun all 13 mobile gap checks.
2. Apply and verify migration `025_expand_marketing_growth_event_names.sql` in
   production.
3. Re-trigger all six QA-tagged events and confirm `persisted: true`.
4. Repeat the admin aggregate check with an authenticated production admin
   session.
5. Only after every row passes, record a new certification timestamp and start
   the 30-day measurement window.
