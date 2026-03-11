# High-Intent Pages QA One-Pager

## Executive Summary
The high-intent SEO program is **not a full stop**, but it is **not clean enough to scale safely yet**. Technical indexability is mostly solid, and some pages are strong, but funnel execution is inconsistent: several high-intent entry pages and free generators bypass the intended product step and send users directly into wizard flows. That creates conversion leakage and weakens commercial qualification.

## Overall Verdict
- **QA Verdict:** **AMBER**
- **Go/No-Go:** **Scale after fixes**

## Top Red Flags
1. Direct wizard embedding on free generator pages bypasses product pages.
2. Multiple high-intent pages use direct wizard CTAs as primary action.
3. `/eviction-notice-template` is underpowered for intent competitiveness.
4. Cannibalization risk remains in Section 21/8 and generic eviction clusters.
5. Freshness/legal review signaling is inconsistent across legal-sensitive pages.

## Top Wins
1. Canonical + metadata implementation is broadly present.
2. Schema coverage is materially better than average (FAQ/HowTo/WebPage/Service).
3. Validator pages are high quality and commercially useful.
4. UX scanability is generally good (clear sections, jump links, structured layouts).
5. Internal linking infrastructure exists and can be tightened rather than rebuilt.

## Top 5 Fixes (Before Scaling)
1. **P0:** Make product page the mandatory primary CTA on all high-intent pages.
2. **P0:** Remove wizard embed from `/tools/free-section-21-notice-generator` and `/tools/free-section-8-notice-generator`.
3. **P0:** Rebuild `/eviction-notice-template` with deeper, differentiated intent coverage.
4. **P1:** Consolidate/canonicalize overlapping generic eviction pages.
5. **P1:** Add visible legal-review freshness module to court/policy-sensitive pages.

## Launch Readiness
**Not ready to scale new high-intent page production immediately.**

Ship the funnel and role-separation fixes first, then expand.

---

## Slack Summary (copy-ready)
- QA verdict on high-intent pages: **AMBER** (scale after fixes, not scale now).
- Technical indexing is mostly fine; conversion wiring is the weak point.
- Biggest issue: too many pages/tools jump straight to wizard instead of product page.
- This breaks our intended journey: SEO page/tool -> product -> wizard -> checkout.
- Two generator pages are the clearest funnel break: they embed wizard directly.
- `/eviction-notice-template` is too thin for a core competitive keyword.
- Validators (`section-21`, `section-8`) are strongest and should be reference models.
- Cannibalization risk still high in Section 21/8 + generic eviction page clusters.
- Fix priority: CTA hierarchy + generator flow first (P0), then page-role consolidation (P1).
- Recommendation: **pause new high-intent page expansion until these fixes are shipped.**
