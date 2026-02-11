# Ultra-Deep Platform Audit (SEO, Product, UX, Wizard, Document Gen)

**Date:** 2026-02-11  
**Scope:** Full repository-level audit of SEO architecture, content strategy, conversion UX, wizard mechanics, pricing/product strategy, and document generation maturity.

---

## 1) Executive Summary (Candid)

Landlord Heaven has strong foundations: clear product pricing centralization, broad jurisdiction support, robust metadata tooling, structured data coverage, and a meaningful long-tail SEO footprint. However, growth is likely being constrained by **channel fragmentation**, **funnel fragmentation**, and **operational debt in high-value flows**.

Top opportunities:

**Positioning update to implement immediately:**
- Shift headline promise from **"Generate compliant notices"** to **"Reduce possession failure risk"** across hero copy, metadata, paid ads, and product pages.

1. **Consolidate SEO and conversion funnels** (reduce competing page clusters and route duplication).
2. **Upgrade wizard completion mechanics** (save/resume clarity, friction-reduction, dynamic confidence and ETA).
3. **Treat Ask Heaven as a topical authority engine** with strict quality governance and controlled indexation.
4. **Introduce new monetizable products around compliance continuity** (calendarized obligations, monitoring, and auto-refresh docs).
5. **Harden legal/content update pipeline** (law-monitor is still partially scaffolded).

---

## 2) Current Product + Pricing Snapshot

Canonical pricing in codebase:

- Eviction Notice Pack: **£49.99**
- Complete Eviction Pack: **£199.99**
- Money Claim Pack: **£99.99**
- Standard AST: **£14.99**
- Premium AST: **£24.99**

Source of truth is centralized in `SEO_PRICES` and consumed by `PRODUCTS`, which is good architecture. Checkout route maps product types to Stripe price IDs with env-based validation and idempotency safeguards. 

**Observed strategic mismatch:** pricing page still routes most CTAs directly to `/wizard?...` rather than canonical SEO landing/product pages, which likely weakens tracking consistency and can limit pre-conversion persuasion depth.

---

## 3) SEO Technical Audit (Ultra-Deep)

## 3.1 What is already strong

- Production robots config allows crawl and blocks private areas (`/dashboard`, `/auth`, `/wizard`, `/checkout`) while keeping `/_next/` accessible for JS rendering.
- Sitemap strategy includes stable `lastModified` behavior and explicit retired path suppression.
- Metadata helper guarantees canonical + OG + Twitter cards by design.
- Structured data implementation contains strong caution rails for ratings misuse and historical snippet contamination.
- Ask Heaven prefill states correctly switch to `noindex, follow`, avoiding query-param index bloat.

## 3.2 High-impact SEO weaknesses

### A) Route/funnel fragmentation

You currently maintain both:

- legacy product routes (`/products/*`)
- newer SEO landing routes (`/eviction-notice`, `/eviction-pack-england`, `/money-claim`)

Both are in sitemap. This can split authority, internal links, and conversion telemetry if canonicals/internal-link policy is not rigorously enforced. 

### B) CTA destination inconsistency

Pricing page drives directly to wizard query URLs for core products. For ranking pages, this bypasses education/proof pages that should absorb and qualify traffic before wizard start. Better pattern:

**SEO page → product landing with proof/risk handling → wizard**

### C) Potential stale-freshness signaling

`STABLE_PRODUCT_DATE = 2026-01-01` is a practical anti-noise choice, but eventually needs automated rotation or content-linked updates; otherwise search engines can infer staleness for commercially critical pages.

### D) Incomplete crawl automation for legal updates

Law monitor contains explicit scaffold/TODO language. For legal SEO, this is a strategic risk: inability to quickly publish law-change updates can reduce topical freshness and trust.

## 3.3 Rank-better recommendations (priority order)

1. **Canonical consolidation project (P0)**
   - Declare one canonical per product intent family.
   - 301 non-canonicals with strict mapping rules.
   - Enforce internal linking to canonical only.

2. **Programmatic topical clusters by jurisdiction + intent (P0/P1)**
   - Build content hubs around: notice validity, possession timelines, arrears recovery, service proof, court form prep.
   - Interlink: guide ↔ tool ↔ product ↔ FAQ ↔ case examples.

3. **Entity SEO + legal source transparency (P1)**
   - Add "last legally reviewed" + cited source links per high-risk page.
   - Expand Organization trust signals (editorial policy + legal QA process pages).

4. **SERP packaging upgrades (P1)**
   - Add richer FAQ blocks where useful (without overusing FAQ schema).
   - Add comparison snippets (self-serve vs solicitor cost/time/risk matrix).
   - Publish "updated for law change" release notes page with changelog RSS.

5. **Ask Heaven indexation governance (P1)**
   - Keep strict quality gates for individual Q&A indexing.
   - Build canonicalized topic pages from approved Q&A clusters to avoid thin/duplicate variants.

---

## 4) Conversion + UX + Design Audit

## 4.1 Strengths

- Clear pricing matrix and transparent one-time fee messaging.
- Feature differentiation between packs is present.
- FAQ-driven objection handling exists on pricing page.

## 4.2 Friction points

1. **Over-direct CTAs to wizard** on pricing page reduce pre-wizard qualification.
2. **Large comparison table complexity** can create scan fatigue; mobile cards are better but still dense.
3. **No visible ROI calculator on pricing surface** despite explicit cost-saving claims.
4. **HMO Pro appears parked**, which can create perceived roadmap ambiguity for portfolio landlords.

## 4.3 Design/usability improvements

- Introduce a **decision helper card**: "Which product do I need?" (3 questions max).
- Add **journey-based CTA labels**: "Get notice in 8 minutes" vs "Start Wizard".
- Add **confidence modules** near CTAs: legal checks passed count, average completion times, support SLA.
- Introduce **sticky summary rail** on desktop pricing pages for quick comparison and conversion.

---

## 5) Wizard Component Audit + Upgrade Blueprint

## 5.1 Observed state

- New section-based flows are enabled via feature flags for several product lines.
- Flow initialization includes product normalization, paid-order downgrade prevention, and attribution dedupe.
- There is still meaningful legacy compatibility and branching complexity (expected in migration phases).

## 5.2 Major wizard upgrades to prioritize

### P0: Completion-rate improvements

1. **Adaptive question load**
   - Skip irrelevant sections earlier based on jurisdiction/product confidence.
   - Show dynamic "questions remaining" based on branching outcomes.

2. **Friction telemetry instrumentation**
   - Track drop-off at question/section granularity.
   - Flag high-abandonment questions weekly with auto-report.

3. **Return-safe resume UX**
   - Stronger autosave + visible "last saved at" + restart warnings.

### P1: Trust + legal confidence UX

1. **Inline legal rationale snippets** for critical questions.
2. **Risk score preview** before checkout (e.g., likely blockers, recommended evidence completeness).
3. **Smart evidence checklist generation in-flow** instead of only downstream.

### P1: Architecture

- Move remaining URL-param parsing/normalization logic into dedicated service hooks to slim page-level orchestration.

---

## 6) Document Generation Audit

## 6.1 Strengths

- Checkout path includes validation hooks and compliance timing checks.
- Court-ready validator exists with explicit placeholder detection rules.

## 6.2 Gaps / risks

1. **Northern Ireland mapper has many TODO-backed fields** still reading from flat WizardFacts because CaseFacts model is not fully extended.
2. **Law monitor still partly scaffolded**, raising risk for late legal-change propagation.
3. **Large lint debt footprint** indicates maintainability drag and risk of regressions in scripts/tests.

## 6.3 Upgrades

### P0

- Complete CaseFacts schema expansion for NI-specific fields to remove fallback TODO paths.
- Implement deterministic "document quality score" gate before final download.

### P1

- Add automated "legal delta impact" CI job: when law snapshot changes, surface affected templates + wizard questions + warnings.
- Add document traceability footer: template version, rule bundle version, snapshot date.

---

## 7) New Product Opportunities (Revenue Expansion)

High-fit products adjacent to your existing capabilities:

1. **Compliance Calendar Pro (subscription)**
   - EPC, gas safety, EICR, deposit deadlines, prescribed info reminders.

2. **Service-Proof Kit**
   - Postal proof workflow, affidavit templates, timeline log export for court bundles.

3. **Court Bundle Builder Pro**
   - Evidence indexing, pagination, exhibit references, hearing pack auto-assembly.

4. **Arrears Recovery Intelligence**
   - Payment plan templates, default escalation sequences, enforcement decision wizard.

5. **Portfolio Health Dashboard**
   - Property-level risk scoring + upcoming legal actions + compliance status.

6. **Law Change Alert + Auto-Update Pack**
   - Subscription tier with "updated template set" and impact summaries.

---

## 8) Pricing Strategy Recommendations

Current one-time pricing is attractive and likely strong for acquisition, but monetization depth can improve with value ladders:

- Keep current entry points (great for conversion intent capture).
- Add **add-ons** (evidence pack, service-proof docs, expedited review checklist).
- Introduce **light subscription** for ongoing compliance and legal update assurance.
- Offer **portfolio bundles** (3-pack, 10-pack credits) for repeat landlords/agents.

---

## 9) 30/60/90-Day Action Plan

## Day 0–30 (P0)

- Canonical + redirect consolidation across product/landing route families.
- Pricing page CTA rewire to canonical conversion landers (with controlled A/B).
- Wizard friction telemetry at section/question depth.
- NI CaseFacts expansion planning + migration spec.

## Day 31–60 (P1)

- Launch 6 jurisdiction-intent pillar pages with strict internal linking model.
- Add in-flow confidence/risk feedback before checkout.
- Ship "Which product do I need?" decision helper.
- Implement law-monitor robust fetch/retry + source fingerprinting.

## Day 61–90 (P1/P2)

- Roll out Compliance Calendar Pro MVP.
- Launch Court Bundle Builder upsell for complete pack + money claim users.
- Add legal update changelog center and structured trust pages.

---

## 10) KPI Framework for This Audit

Track these weekly:

- Organic sessions by intent cluster and jurisdiction.
- Landing page → wizard start conversion rate.
- Wizard start → completion rate by product/jurisdiction.
- Checkout initiation → paid conversion.
- % documents passing quality gate on first generation.
- Revenue split: one-time vs subscription/add-ons.

---

## 11) Risk Register

1. **SEO cannibalization risk** from parallel route families if not canonicalized.
2. **Legal freshness risk** if law-monitor implementation remains partial.
3. **Operational drag** from lint debt and script-level inconsistencies.
4. **Conversion leakage** from sending cold traffic directly into wizard without qualification layer.

---

## 12) Final Verdict

You have a strong platform with credible legal-product architecture and excellent building blocks. The next growth step is less about "new features" and more about **funnel coherence + authority consolidation + recurring-value products**. If you execute the P0/P1 roadmap above, ranking, conversion, and ARPU should all improve materially.
