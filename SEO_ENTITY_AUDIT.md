# SEO Entity Consistency Audit (Phase 3)

## Scope audited
- High-intent page templates:
  - `EvictionIntentLandingPage` (cluster/page template)
  - `HighIntentPageShell` (long-form/pass pages)
- Entity source-of-truth: `src/lib/seo/eviction-authority.ts`

## Target entities
- Section 21 Notice
- Section 8 Notice
- Possession Claim
- Accelerated Possession
- Rent Arrears
- Eviction Process
- Possession Order
- Warrant of Possession
- Bailiff Eviction

## Findings and hardening actions
1. **Headings and section coverage**
   - Added reusable “Entity map across this guide cluster” and “Core entities reinforced” sections in both high-intent templates.
   - Added quick-answer section emphasizing notice → claim → enforcement flow language.

2. **Intro paragraph consistency**
   - Added concise above-the-fold intro block in `EvictionIntentLandingPage` that explicitly includes Section 21 Notice, Section 8 Notice, and possession claim terminology.

3. **Schema consistency**
   - FAQ schema now uses concise answer variants for rich-result eligibility.
   - Continued WebPage + Article + FAQ + Breadcrumb coverage; hub page adds ItemList/WebPage/Breadcrumb.

4. **FAQ answer format**
   - FAQ schema answers normalized to short first-sentence answers to improve snippet extraction compatibility.

5. **Internal anchor/link consistency**
   - Added authority-link section per page with canonical parent, two supporting pages, one tool page, and one product page.

## Residual notes
- Existing page-specific copy still varies by user intent, but entity reinforcement is now centralized and repeated consistently across templates.
