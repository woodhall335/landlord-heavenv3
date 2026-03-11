# High-Intent Pages QA Audit

## 1. Overall Verdict
- **Are the pages built correctly enough to scale?** **No (today).** The inventory is broad, but implementation consistency is not at scale-ready QA level.
- **Are they built correctly enough to convert?** **Partly.** Several pages convert well, but a material subset bypasses the intended commercial journey.
- **Overall status:** **AMBER**
- **Launch readiness:** **Scale after fixes**

## 2. QA Scorecard

| Page | Intent Match | Metadata / Indexing | Content Depth | Schema Fit | Funnel Wiring | Internal Linking | Freshness / Trust | UX / Scanability | Overall | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| `/section-21-notice-template` | PASS | PASS | PASS | PASS | AMBER | PASS | AMBER | PASS | AMBER | P1 |
| `/section-8-notice-template` | PASS | PASS | PASS | PASS | AMBER | PASS | AMBER | PASS | AMBER | P1 |
| `/eviction-notice-template` | PASS | PASS | **FAIL** | AMBER | AMBER | AMBER | AMBER | AMBER | **FAIL** | P0 |
| `/how-to-evict-tenant` | PASS | PASS | AMBER | AMBER | AMBER | AMBER | AMBER | PASS | AMBER | P1 |
| `/section-21-ban` | PASS | PASS | AMBER | AMBER | AMBER | AMBER | **FAIL** | AMBER | AMBER | P1 |
| `/money-claim-unpaid-rent` | PASS | PASS | AMBER | AMBER | **FAIL** | AMBER | AMBER | PASS | **FAIL** | P0 |
| `/wales-eviction-notices` | PASS | PASS | AMBER | AMBER | AMBER | AMBER | AMBER | PASS | AMBER | P1 |
| `/scotland-eviction-notices` | PASS | PASS | AMBER | AMBER | AMBER | AMBER | AMBER | PASS | AMBER | P1 |
| `/tenant-not-paying-rent` | PASS | PASS | AMBER | PASS | **FAIL** | PASS | AMBER | PASS | AMBER | P0 |
| `/tenant-wont-leave` | PASS | PASS | AMBER | PASS | **FAIL** | PASS | AMBER | PASS | AMBER | P0 |
| `/possession-claim-guide` | PASS | PASS | AMBER | AMBER | **FAIL** | PASS | AMBER | PASS | AMBER | P0 |
| `/eviction-cost-uk` | PASS | PASS | PASS | AMBER | **FAIL** | PASS | AMBER | PASS | AMBER | P0 |
| `/tools/free-section-21-notice-generator` | PASS | PASS (layout) | AMBER | PASS | **FAIL** | AMBER | AMBER | PASS | **FAIL** | P0 |
| `/tools/free-section-8-notice-generator` | PASS | PASS (layout) | AMBER | PASS | **FAIL** | AMBER | AMBER | PASS | **FAIL** | P0 |
| `/tools/rent-arrears-calculator` | PASS | PASS (layout) | PASS | PASS | AMBER | AMBER | AMBER | PASS | AMBER | P1 |
| `/tools/free-rent-demand-letter` | PASS | PASS (layout) | PASS | PASS | AMBER | AMBER | AMBER | PASS | AMBER | P1 |
| `/tools/validators/section-21` | PASS | PASS | PASS | PASS | AMBER | PASS | PASS | PASS | PASS | P2 |
| `/tools/validators/section-8` | PASS | PASS | PASS | PASS | AMBER | PASS | PASS | PASS | PASS | P2 |
| `/how-to-evict-a-tenant-england` (newer) | PASS | PASS (shared metadata helper) | PASS | PASS | **FAIL** | AMBER | PASS | PASS | AMBER | P1 |
| `/eviction-notice-england` (newer) | PASS | PASS (shared metadata helper) | PASS | PASS | **FAIL** | AMBER | PASS | PASS | AMBER | P1 |
| `/evict-tenant-not-paying-rent` (newer) | PASS | PASS (shared metadata helper) | PASS | PASS | **FAIL** | AMBER | PASS | PASS | AMBER | P1 |
| `/tenant-refuses-to-leave-after-notice` (newer) | PASS | PASS (shared metadata helper) | PASS | PASS | **FAIL** | AMBER | PASS | PASS | AMBER | P1 |

## 3. Red Flags
1. **Funnel bypass on high-intent pages**: many pages and tool routes send users directly into wizard flows instead of first routing to the relevant product page.
2. **Direct wizard embedding on generator pages** (`WizardFlowPage` embedded in SEO pages) fragments product narrative and pricing/value framing before conversion.
3. **Thin implementation risk on `/eviction-notice-template`** relative to intent difficulty; this is too light for a core template query.
4. **Cluster cannibalization risk** remains high across Section 21/8 route pages, template pages, generator pages, and validator pages.
5. **Freshness confidence weak** on many pages (no clear legal review/update stamp), despite legal-sensitive intent.

## 4. What Passes QA
- Canonical + metadata coverage is generally strong on audited core pages.
- Tool layouts provide route-level metadata and schema even where page components are client-heavy.
- Structured data implementation is present on most priority pages (FAQ/HowTo/WebPage/Service patterns).
- Validators are comparatively strongest: rich content, clear legal basis blocks, and trust scaffolding.
- Scanability is strong on most pages (hero, jump links, sectioned components).

## 5. What Fails QA
- **Journey non-compliance** with intended flow (`SEO page/tool -> product -> wizard -> checkout`) is the most repeated blocker.
- **Commercial handoff inconsistency**: several pages jump from information directly to wizard, reducing product qualification.
- **Content depth inconsistency** inside the same intent cluster (some pages are robust, others sparse).
- **Internal-link role discipline** is uneven; not all pages reinforce one clear cluster hierarchy.
- **Freshness/legal confidence** indicators are inconsistent; high-stakes legal pages need visible review recency.

## 6. Page-by-Page QA Notes

### `/section-21-notice-template`
- **Target intent:** Landlord wants Form 6A template + next step.
- **Overall status:** AMBER
- **Passes:** strong metadata/canonical/schema, strong depth, good internal linking.
- **Amber:** sends directly to wizard in multiple CTAs rather than product-first routing.
- **Fails:** none hard-blocking.
- **Exact fix required:** make primary CTA route to `/products/notice-only` with explicit “then start wizard” sequence; keep wizard as secondary.
- **Severity:** P1

### `/section-8-notice-template`
- **Target intent:** Form 3 template and arrears/grounds workflow.
- **Overall status:** AMBER
- **Passes:** strong depth, good schema and canonical.
- **Amber:** funnel path still allows direct wizard bypass.
- **Fails:** none hard-blocking.
- **Exact fix required:** primary CTA to product page, wizard as downstream action.
- **Severity:** P1

### `/eviction-notice-template`
- **Target intent:** generic eviction template and route selection.
- **Overall status:** FAIL
- **Passes:** page exists and is index-ready.
- **Amber:** some product links present.
- **Fails:** content depth appears thin for a high-volume, high-competition query; weak differentiation vs nearby routes.
- **Exact fix required:** expand into route-decision + jurisdiction + compliance + court-stage handoff sections; define clear role vs section-specific pages.
- **Severity:** P0

### `/how-to-evict-tenant`
- **Target intent:** process guide with practical execution path.
- **Overall status:** AMBER
- **Passes:** metadata/canonical and broad instructional structure.
- **Amber:** internal link support weaker than best-in-class pages; mixed CTA hierarchy.
- **Fails:** none.
- **Exact fix required:** tighten “problem-aware -> product page -> wizard” sequence and strengthen cluster links.
- **Severity:** P1

### `/section-21-ban`
- **Target intent:** policy-change awareness + contingency action.
- **Overall status:** AMBER
- **Passes:** intent match and technical indexing readiness.
- **Amber:** conversion handoff not as strong as templates/tools.
- **Fails:** freshness/legal confidence is under-signaled for policy-sensitive content.
- **Exact fix required:** add explicit legal review stamp and “what changed / effective from” block with update governance.
- **Severity:** P1

### `/money-claim-unpaid-rent`
- **Target intent:** recover arrears via claim route.
- **Overall status:** FAIL
- **Passes:** indexing readiness and decent base depth.
- **Amber:** some related links.
- **Fails:** CTA path frequently routes straight to wizard; skips product qualification for paid claim pack.
- **Exact fix required:** enforce product-first CTA (`/products/money-claim`) then wizard.
- **Severity:** P0

### `/wales-eviction-notices`
- **Target intent:** Wales-specific notice guidance.
- **Overall status:** AMBER
- **Passes:** jurisdiction intent match and canonical readiness.
- **Amber:** cluster support and product handoff need tightening.
- **Fails:** none.
- **Exact fix required:** stronger internal link spine to Wales product pathways + court-stage pages.
- **Severity:** P1

### `/scotland-eviction-notices`
- **Target intent:** Scotland notice-to-leave journey.
- **Overall status:** AMBER
- **Passes:** clear jurisdiction intent and metadata coverage.
- **Amber:** handoff and role separation from other Scotland eviction pages not strict enough.
- **Fails:** none.
- **Exact fix required:** clarify role vs Scotland process pages and strengthen product+wizard sequence.
- **Severity:** P1

### `/tenant-not-paying-rent`
- **Target intent:** arrears problem page to action path.
- **Overall status:** AMBER
- **Passes:** good structure and linking.
- **Amber:** content depth not weak, but can better separate notice vs debt claim pathways.
- **Fails:** direct wizard jumps fragment intended product-first funnel.
- **Exact fix required:** gate primary CTA via money-claim or notice product page based on scenario.
- **Severity:** P0

### `/tenant-wont-leave`
- **Target intent:** possession escalation after non-vacation.
- **Overall status:** AMBER
- **Passes:** clear structure + FAQ + related links.
- **Amber:** no strong product-link emphasis despite high purchase intent.
- **Fails:** direct wizard CTA behavior bypasses product layer.
- **Exact fix required:** introduce explicit product decision card before wizard links.
- **Severity:** P0

### `/possession-claim-guide`
- **Target intent:** court-stage possession guidance.
- **Overall status:** AMBER
- **Passes:** good page architecture and schema.
- **Amber:** internal links exist but product bridge is not dominant.
- **Fails:** high-intent court-stage page should not primarily short-circuit to wizard.
- **Exact fix required:** add court-stage product handoff block and restrict direct wizard as secondary.
- **Severity:** P0

### `/eviction-cost-uk`
- **Target intent:** cost comparison and value framing.
- **Overall status:** AMBER
- **Passes:** commercially strong framing + content depth.
- **Amber:** some schema choices are weaker than page sophistication.
- **Fails:** direct wizard entry is over-prominent vs product qualification.
- **Exact fix required:** make “See product fit + pricing” the first CTA.
- **Severity:** P0

### `/tools/free-section-21-notice-generator`
- **Target intent:** free tool entry for Section 21.
- **Overall status:** FAIL
- **Passes:** route-level metadata/schema via layout; usable UX.
- **Amber:** related links present.
- **Fails:** embeds wizard directly; effectively bypasses product page by design.
- **Exact fix required:** convert to true tool page with explicit upgrade/product step before wizard start.
- **Severity:** P0

### `/tools/free-section-8-notice-generator`
- **Target intent:** free tool entry for Section 8.
- **Overall status:** FAIL
- **Passes:** metadata/schema present via layout.
- **Amber:** structure is serviceable.
- **Fails:** same direct wizard embedding and product bypass issue.
- **Exact fix required:** product-first progression and clearer paid-value handoff.
- **Severity:** P0

### `/tools/rent-arrears-calculator`
- **Target intent:** arrears calculation utility with paid upsell.
- **Overall status:** AMBER
- **Passes:** robust metadata/schema, strong utility depth, explicit paid upgrade options.
- **Amber:** still allows informational loop and mixed CTA hierarchy.
- **Fails:** none.
- **Exact fix required:** tighten primary path from calculation result -> product page -> wizard.
- **Severity:** P1

### `/tools/free-rent-demand-letter`
- **Target intent:** free demand-letter generation leading to paid legal pack.
- **Overall status:** AMBER
- **Passes:** strong depth and schema via layout.
- **Amber:** CTA hierarchy mixes notice-only and money-claim paths without hard routing logic.
- **Fails:** none hard-blocking.
- **Exact fix required:** conditional next-step routing by intent (arrears-only vs possession goal).
- **Severity:** P1

### `/tools/validators/section-21`
- **Target intent:** compliance check before serving Section 21.
- **Overall status:** PASS
- **Passes:** strong depth, schema, trust blocks, and legal confidence cues.
- **Amber:** direct wizard upgrades still present (not product-first).
- **Fails:** none.
- **Exact fix required:** adjust CTA hierarchy to go validator -> product page -> wizard.
- **Severity:** P2

### `/tools/validators/section-8`
- **Target intent:** grounds/validity validation for Section 8.
- **Overall status:** PASS
- **Passes:** strongest technical and content implementation in audited set.
- **Amber:** same funnel sequencing caveat as section-21 validator.
- **Fails:** none.
- **Exact fix required:** product-first primary CTA.
- **Severity:** P2

### Newer high-intent template system pages (`/how-to-evict-a-tenant-england`, `/eviction-notice-england`, `/evict-tenant-not-paying-rent`, `/tenant-refuses-to-leave-after-notice`)
- **Target intent:** high-intent England eviction queries.
- **Overall status:** AMBER (cluster-level)
- **Passes:** standardized metadata + canonical via shared helper; strong reusable structure.
- **Amber:** role separation between these pages still needs clearer SERP intent partitioning.
- **Fails:** shared component wiring still promotes direct wizard starts.
- **Exact fix required:** enforce explicit product middle step and add per-page differentiation blocks.
- **Severity:** P1

## 7. Cannibalization and Route Role Review

| Overlap Cluster | Pages | Recommendation | QA Note |
|---|---|---|---|
| Section 21 template/generator/validator | `/section-21-notice-template`, `/tools/free-section-21-notice-generator`, `/tools/validators/section-21`, `/section-21-notice-generator` | **Differentiate harder** | Keep all, but make template educational, generator utility, validator diagnostic, product commercial. |
| Section 8 template/generator/validator | `/section-8-notice-template`, `/tools/free-section-8-notice-generator`, `/tools/validators/section-8`, `/section-8-notice-generator` | **Differentiate harder** | Current overlap is workable but not strict enough for long-term scale. |
| Generic eviction guidance pages | `/how-to-evict-tenant`, `/how-to-evict-a-tenant-england`, `/eviction-notice-england`, `/eviction-notice-template` | **Canonicalize** (select one primary per intent family) | Same-intent queries risk cannibalization without clearer primary route/page role. |
| Tenant refusal problem pages | `/tenant-wont-leave`, `/tenant-refuses-to-leave-after-notice` | **Merge/redirect** or hard split by stage | If both stay, one must be “post-notice only” and one “pre-notice strategy”. |
| Rent arrears intent pages/tools | `/tenant-not-paying-rent`, `/money-claim-unpaid-rent`, `/tools/rent-arrears-calculator`, `/tools/free-rent-demand-letter` | **Keep separate** | Distinct intents exist, but routing logic must become explicit to avoid looped journeys. |

## 8. Funnel Compliance Audit

### Compliant (mostly)
- Validators are closest to compliant behavior (problem-aware content + clear action CTAs), but still need product-first primacy.
- Rent arrears calculator and demand-letter tool include explicit product upgrade references.

### Non-compliant / partial
- Section 21/8 free generators embed wizard directly, bypassing product page.
- Several high-intent landing pages send users straight to wizard links.
- Some pages provide multiple competing actions with equal visual weight, diluting the intended route.

### Informational loop risks
- Generic guide pages and overlapping intent pages can retain users in content loops (guide-to-guide) without enforced product transition.

### Premium value under-explained (where present)
- Pages with direct wizard starts often under-deliver the “why paid product first” argument before asking for action.

## 9. Top 10 Fixes Before Scaling
1. **P0:** Remove direct wizard embedding from free generator SEO pages; insert mandatory product handoff step.
2. **P0:** Enforce CTA policy: primary CTA on all high-intent pages must be relevant product page, not wizard URL.
3. **P0:** Rebuild `/eviction-notice-template` into a full decision-grade page with clear role boundaries.
4. **P0:** Add stage-based routing logic on arrears pages (`notice route` vs `money claim route`) to prevent funnel leakage.
5. **P1:** Canonical/role consolidation across overlapping generic eviction pages.
6. **P1:** Add visible legal review/update modules on policy- and court-sensitive pages.
7. **P1:** Strengthen internal-link spine from all informational pages to exactly one primary product per intent.
8. **P1:** Reduce CTA competition by demoting secondary actions below fold.
9. **P2:** Standardize schema patterns so equally critical pages have equally strong entity coverage.
10. **P2:** Create reference template for high-intent page QA gates before publishing new pages.

## 10. Final Recommendation
- **Should we scale more high-intent page production right now?** **No, not yet.**
- **What must be fixed first?** Funnel sequence compliance, generator-page bypass, and thin/overlapping intent pages.
- **Which 3 pages should be reference standard?**
  1. `/tools/validators/section-8`
  2. `/tools/validators/section-21`
  3. `/section-21-notice-template` (after CTA hierarchy correction)

## 11. Pass/Fail Summary
- **PASS pages:** 2
- **AMBER pages:** 15
- **FAIL pages:** 5

**Plain-English summary:** The high-intent footprint is large and mostly index-ready, but QA fails on commercial journey discipline. Too many pages still bypass the product layer or overlap in intent without strict role separation. You can scale after fixing funnel wiring and intent consolidation; scaling before that likely increases traffic inefficiency and conversion leakage.
