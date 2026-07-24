# Deployed release evidence

## Production release

- Production URL: https://landlordheaven.co.uk
- Git repository: `woodhall335/landlord-heavenv3`
- Branch: `main`
- Deployed commit: `68347e32e96bf28a1d626164f3e999865265839c`
- Commit subject: `Remove duplicate product hero actions`
- Vercel deployment ID: `AmN6WgT7umUU3bFEsG7qfzmMFZjm`
- Vercel status: `success`
- Pending status first observed: `2026-07-24T20:52:10Z`
- Successful status: `2026-07-24T20:56:37Z`
- Observed deployment duration: approximately 4 minutes 27 seconds
- Vercel evidence URL:
  https://vercel.com/woodhall335-gmailcoms-projects/landlord-heavenv6/AmN6WgT7umUU3bFEsG7qfzmMFZjm

The production alias was audited after the successful Vercel status. The browser
matrix contains 39 executed route/viewport rows and 78 screenshots.

## Included deployed corrections

- Hydration-safe desktop blog table-of-contents state.
- Ground 1A PDF prefetch disabled to prevent an app-route 404.
- Section 13 product heading order corrected.
- Bailiff article description changed to a complete 160-character sentence.
- Canonical bailiff route and old-route redirect.
- Malformed-title normalization.
- Stable experiment control assignment for the baseline candidate.
- Heading, link-nesting, and form-identifier corrections from the first release.
- Duplicate product hero action groups removed while retaining analytics tracking.

## Database caveat

Migration `025_expand_marketing_growth_event_names.sql` is committed, but a
successful Vercel application deployment does not prove that a Supabase schema
migration ran. Live responses confirm that four newer event names still return
HTTP 202 with `persisted: false`. Production database application therefore
remains unverified and is treated as failed.

Result: **PASS for deployed application identification; FAIL for overall
certification.**
