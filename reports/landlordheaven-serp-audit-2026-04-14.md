# Landlord Heaven SERP Audit

Date: 14 April 2026

## Scope

This audit combines:

- 7-day Google Search Console export from `C:\Users\t_moh\Downloads\landlordheaven.co.uk-Performance-on-Search-2026-04-14`
- Current repo content in `C:\Users\t_moh\Documents\GitHub\landlord-heavenv3`
- Live indexed page checks against `landlordheaven.co.uk`
- Competitor/authority checks against NRLA and GOV.UK

## Executive Summary

Landlord Heaven is not mainly losing because the site is invisible. It is losing because Google sees mixed signals:

1. Many pages are written for internal SEO architecture, not the landlord task behind the query.
2. Head-term clusters are fragmented across multiple pages, so Google has no single obvious owner.
3. The live indexed site and this repo are not fully aligned.
4. Several England pages are date-inconsistent around the 1 May 2026 changeover.
5. CTR is far too low for the rankings you already have.

The 7-day GSC export totals are:

- Clicks: 341
- Impressions: 26,222
- CTR: 1.3%
- Average position: 9.26

That means the biggest short-term win is not “make more pages”. It is:

- make the right page own each head term
- rewrite above-the-fold copy so it matches landlord intent
- remove cluster contradictions
- deploy one consistent legal position and request reindexing

## What GSC Is Actually Saying

### Cluster-level takeaways

- `section 8` is fragmented. `/section-8-notice-template` gets 195 impressions at position 12.58, but `/section-8-notice` only gets 2 impressions at position 48.
- `periodic tenancy` does not have a convincing owner page. `/assured-periodic-tenancy-agreement` gets 36 impressions at position 25.47 and `/tenancy-agreement-template` gets 369 impressions at position 21.34.
- `rent increase` has visibility but no clicks. `/rent-increase/rent-increase-rules-uk` gets 30 impressions at position 8.53 with 0 clicks.
- `section 21` exact-form terms still drive traffic, but CTR is extremely weak despite decent positions.

### High-value missed queries

- `section 8`: 18 impressions, average position 3.0, 0 clicks
- `section 8 notice template`: 47 impressions, average position 12.77, 0 clicks
- `section 8 notice template free`: 23 impressions, average position 8.22, 0 clicks
- `form 4a rent increase`: 19 impressions, average position 7.95, 0 clicks
- `form 4a`: 7 impressions, average position 9.14, 0 clicks
- `periodic tenancy agreement template uk`: 16 impressions, average position 26.19, 0 clicks
- `rolling tenancy agreement template uk`: 7 impressions, average position 31.0, 0 clicks
- `section 21 notice`: 145 impressions, average position 1.06, 0 clicks
- `section 21 notice template`: 292 impressions, average position 6.93, 0 clicks

## Main Findings

### 1. The pages often describe the content strategy instead of solving the landlord task

This is the biggest content problem.

Examples from the repo:

- [src/app/rent-increase/config/rent-increase-rules-uk.ts](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/rent-increase/config/rent-increase-rules-uk.ts:8) leads with `Rent Increase Rules UK: England Process Explained`.
- The same file labels the page intent as `rules overview / jurisdiction clarification` at [line 20](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/rent-increase/config/rent-increase-rules-uk.ts:20).
- [src/lib/seo/england-current-framework-pages.ts](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/lib/seo/england-current-framework-pages.ts:235) frames `/section-8-notice` as the “live England notice route”.
- [src/app/periodic-tenancy-agreement/page.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/periodic-tenancy-agreement/page.tsx:73) leads with `What Is a Periodic Tenancy?`, which is definition intent, not template/action intent.

That is why your rent increase example feels wrong in Google. The page is accurate about scope, but it does not say the thing the landlord wants: “how a landlord increases rent in England using Section 13 / Form 4A”.

NRLA pages do this better. They tend to say exactly what the page is, who it is for, what form/process applies, and what changes on which date.

### 2. Some of your pages are intentionally refusing to rank for the term you want

The periodic cluster is the clearest example.

- [src/app/assured-periodic-tenancy-agreement/page.tsx](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/assured-periodic-tenancy-agreement/page.tsx:18) says the page should not become a second template hub.
- The same file says the page is `support-only` at [line 113](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/assured-periodic-tenancy-agreement/page.tsx:113).
- It explicitly says there should be “no attempt to outrank the main template page for broad head terms” at [line 116](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/assured-periodic-tenancy-agreement/page.tsx:116).

That strategy can be valid, but it means you should not expect that page to win `periodic tenancy agreement` or `assured periodic tenancy agreement template`.

Right now the cluster is caught in the middle:

- support pages do not want to own the head term
- the template hub is too broad
- Google splits impressions across several pages

### 3. Section 8 is heavily cannibalised

You currently have overlapping Section 8 intent spread across:

- `/section-8-notice`
- `/section-8-notice-template`
- `/section-8-notice-guide`
- `/section-8-grounds-explained`
- `/section-8-eviction-process`
- `/serve-section-8-notice`
- Section 8 tools
- Section 8 ground blog posts

Repo evidence:

- `/section-8-notice-guide` redirects to `/section-8-notice` in [next.config.mjs](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/next.config.mjs:139).
- But `/section-8-notice-guide` is still present in the sitemap at [src/app/sitemap.ts](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/sitemap.ts:143).
- `/section-8-notice` appears twice in the sitemap at [lines 147 and 164](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/sitemap.ts:147) and [164](C:/Users/t_moh/Documents/GitHub/landlord-heavenv3/src/app/sitemap.ts:164).

GSC supports the cannibalisation diagnosis:

- `/section-8-notice-template`: 195 impressions, position 12.58
- `/blog/england-section-8-ground-14`: 103 impressions, position 11.08
- `/section-8-notice`: 2 impressions, position 48

Google is not treating `/section-8-notice` as the owner. It is scattering relevance across the template page and ground pages.

### 4. The live site and the repo are not fully aligned

This is now a serious indexing problem.

Examples:

- The live page at `/rolling-tenancy-agreement` still shows old-style content about Section 21 and fixed-term expiry, while the repo page is a newer England periodic explainer.
- The live `/section-21-notice-template` currently redirects to `/section-21-notice`, but GSC still reports impressions and clicks for `/section-21-notice-template`.
- Older indexed snippets still show legacy AST / Section 21 / older pricing language on some pages, while the repo has moved to newer “assured periodic / current framework” positioning.

This means Google is not seeing one clean version of the truth.

If the repo is the intended version, deployment and recrawl are behind.
If the live version is intended, the repo strategy is not what Google is ranking yet.

Either way, until those versions match, rankings will be unstable and trust signals will stay muddy.

### 5. There are date-accuracy problems around 1 May 2026

Today is 14 April 2026.

Official / authority sources:

- GOV.UK says existing assured or assured shorthold tenancies created before 1 May 2026 must receive the official Information Sheet by 31 May 2026.
- NRLA explicitly says that until 1 May 2026, existing rules still apply and Section 21 can still be served before that date.

But some Landlord Heaven live pages already speak as if the change has happened.

Example:

- Live `/section-21-notice` says “Section 21 ended in England on 1 May 2026” and treats the route as already historical-only.

That creates a trust problem because on 14 April 2026, 1 May 2026 is still in the future.

At the same time, the live `/rolling-tenancy-agreement` page still teaches Section 21 as the landlord route for periodic tenancies.

So Google and users can see both of these at once:

- “Section 21 has already ended”
- “Use Section 21 on a rolling tenancy”

That is exactly the kind of contradiction that hurts YMYL-style trust.

### 6. Some high-impression pages are losing almost entirely on CTR

Examples:

- `/products/notice-only`: 480 impressions, position 3.19, 0 clicks
- `/form-6a-section-21`: 1,536 impressions, position 5.56, CTR 0.72%
- `/section-21-notice-template`: 1,103 impressions, position 4.46, CTR 0.45%
- `/how-to-rent-guide`: 448 impressions, position 9.84, CTR 1.56%
- `/rent-increase/rent-increase-rules-uk`: 30 impressions, position 8.53, 0 clicks

That is not an authority-only problem. It means the search listing is not giving users the answer they expect.

### 7. There are live-page quality issues that weaken trust even when the topic is right

Examples from the live site:

- `/section-8-notice-template` contains mojibake characters like `â€œ` and `â€`
- The same page mixes “Form 3”, “Section 21 comparison”, and “Works after May 2026?” in a confusing way
- `/rolling-tenancy-agreement` still reads like an old generic landlord explainer rather than a current landlord action page

These are small on their own, but in aggregate they make the pages look less authoritative than NRLA or GOV.UK.

## Why NRLA Beats You On These Terms

NRLA is stronger because its pages usually do four things better:

1. They state the page purpose immediately.
2. They name the real form/process a landlord needs.
3. They use exact legal dates.
4. They distinguish current rules from transition rules cleanly.

Landlord Heaven pages are often trying to do SEO clustering, route-shaping, product handoff, transition guidance, and legal explanation all in one page. That makes the content feel more abstract than the query.

## Priority Fixes

### Priority 1: Clean up the legal/date layer

- Pick one exact England legal position for 14 April 2026.
- Update every live page so pre-1 May 2026 and post-1 May 2026 states are clearly distinguished.
- Remove contradictions between Section 21 transition pages, Section 8 pages, and periodic tenancy pages.

### Priority 2: Assign one owner page per head term

Recommended owners:

- `section 8 notice template`: `/section-8-notice-template`
- `section 8` / `section 8 notice`: either `/section-8-notice-template` or `/section-8-notice`, but not both
- `periodic tenancy agreement template`: either build a dedicated owner page or make `/tenancy-agreement-template` explicitly own it
- `form 4a rent increase`: `/rent-increase/form-4a-guide`
- `rent increase rules uk`: `/rent-increase/rent-increase-rules-uk`

Then demote the others to support pages with narrower titles and internal links.

### Priority 3: Rewrite titles, H1s, and hero copy for landlord intent

Examples:

- Change “rules overview / jurisdiction clarification” style copy into “How landlords increase rent in England using Section 13 / Form 4A”.
- Change definition-first periodic copy into template/action-first copy where you want the head term.
- Make Section 8 owner pages lead with forms, grounds, notice periods, and service, not “current framework” wording.

### Priority 4: Fix indexing / deployment drift

- Confirm the live site is deploying the current repo.
- Recheck redirects and canonicals for `/section-21-notice-template`, `/section-21-notice`, `/section-8-notice-guide`, `/section-8-notice`, and rolling-tenancy routes.
- Remove stale sitemap entries and duplicate sitemap rows.
- Request reindexing for updated owners once the deployment is stable.

### Priority 5: Improve snippet CTR

- Tighten meta titles around landlord task + form/process.
- Use exact legal nouns users search for: `Form 4A`, `Section 13`, `Section 8 notice`, `periodic tenancy agreement template`.
- Put landlord outcome language in the meta description: `increase rent`, `serve notice`, `create agreement`, `how to fill`, `what notice period applies`.

## Suggested 14-Day Action Plan

1. Freeze legal/date messaging and update every live England transition page.
2. Pick the single owner URL for each head cluster.
3. Remove or demote competing titles/H1s in the same cluster.
4. Fix sitemap, canonical, redirect, and deployment mismatches.
5. Rewrite above-the-fold copy on the owner pages for landlord task intent.
6. Reindex the owner pages in Search Console.
7. Only after that, build more long-tail support pages.

## Sources Used

- GOV.UK: https://www.gov.uk/government/publications/the-renters-rights-act-information-sheet-2026
- NRLA Section 21 resource: https://www.nrla.org.uk/resources/ending-your-tenancy/section-21
- NRLA periodic tenancy transition resource: https://www.nrla.org.uk/resources/renters-rights/ending-a-periodic-assured-tenancy
- Landlord Heaven live pages:
  - https://landlordheaven.co.uk/rent-increase/rent-increase-rules-uk
  - https://landlordheaven.co.uk/section-8-notice
  - https://landlordheaven.co.uk/section-8-notice-template
  - https://landlordheaven.co.uk/periodic-tenancy-agreement
  - https://landlordheaven.co.uk/rolling-tenancy-agreement
  - https://landlordheaven.co.uk/section-21-notice
