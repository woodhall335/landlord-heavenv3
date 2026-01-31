# Landlord Heaven Complete Inventory Audit

**Generated**: January 2026
**Purpose**: Authoritative map of all products, content, wizards, and revenue funnels

---

## Executive Summary

This audit provides a complete inventory of:
- **6 active products** (+ 1 deprecated, + 1 feature-flagged)
- **4 wizard flows** covering all product types
- **75+ SEO landing pages** across eviction, money claims, and tenancy
- **115 blog articles** organized by jurisdiction and topic
- **8 free tools** serving as lead generation funnels

**Key Finding**: The product-content-wizard infrastructure is comprehensive, but cross-sell linkages between product categories need strengthening to maximize revenue per visitor.

---

## 1. PRODUCT INVENTORY

### Active Products

| SKU | Display Name | Price | Jurisdictions | Entry Routes | Primary Keywords | Cross-sell Target |
|-----|--------------|-------|---------------|--------------|------------------|-------------------|
| `notice_only` | Eviction Notice Pack | £39.99 | England, Wales, Scotland | `/products/notice-only`, `/wizard?product=notice_only` | section 21 notice, eviction notice template | Complete Pack (upsell) |
| `complete_pack` | Complete Eviction Pack | £149.99 | England only | `/products/complete-pack`, `/wizard?product=complete_pack` | eviction pack, court forms, n5b | Money Claim (cross-sell) |
| `money_claim` | Money Claim Pack | £99.99 | England only | `/products/money-claim`, `/wizard?product=money_claim` | money claim, recover rent, MCOL | Notice Only (if eviction needed) |
| `ast_standard` | Standard Tenancy Agreement | £9.99 | England, Wales, Scotland, NI | `/products/ast`, `/wizard?product=ast_standard` | tenancy agreement template, AST | Premium AST (upsell) |
| `ast_premium` | Premium Tenancy Agreement | £14.99 | England, Wales, Scotland, NI | `/products/ast`, `/wizard?product=ast_premium` | assured shorthold tenancy, premium AST | Eviction products (future need) |
| `hmo_pro` | HMO Pro Subscription | £19.99-34.99/mo | Feature-flagged | `/hmo-pro` (parked) | HMO management, landlord software | N/A (V2 feature) |

### Deprecated Products

| SKU | Display Name | Status | Redirect |
|-----|--------------|--------|----------|
| `sc_money_claim` | Scotland Money Claim Pack | Discontinued | → Notice Only (Scotland) |

### Regional Availability Matrix

| Product | England | Wales | Scotland | N. Ireland |
|---------|:-------:|:-----:|:--------:|:----------:|
| Notice Only | ✅ | ✅ | ✅ | ❌ |
| Complete Pack | ✅ | ❌ | ❌ | ❌ |
| Money Claim | ✅ | ❌ | ❌ | ❌ |
| Standard AST | ✅ | ✅ | ✅ | ✅ |
| Premium AST | ✅ | ✅ | ✅ | ✅ |

### Product Value Propositions

| Product | Original Price (Solicitor) | Our Price | Savings |
|---------|---------------------------|-----------|---------|
| Notice Only | £150+ | £39.99 | £110+ |
| Complete Pack | £2,500+ | £149.99 | £2,350+ |
| Money Claim | £3,000+ | £99.99 | £2,900+ |
| Standard AST | £100+ | £9.99 | £90+ |
| Premium AST | £200+ | £14.99 | £185+ |

---

## 2. WIZARD & FLOW INVENTORY

### Flow Overview

| Flow | Product(s) | Jurisdictions | Sections | Entry Parameters |
|------|-----------|---------------|----------|------------------|
| **NoticeOnlySectionFlow** | `notice_only` | England, Wales, Scotland | 7-8 | `type=eviction&product=notice_only&jurisdiction=` |
| **EvictionSectionFlow** | `complete_pack` | England (Wales/Scotland partial) | 9-10 | `type=eviction&product=complete_pack&jurisdiction=` |
| **MoneyClaimSectionFlow** | `money_claim` | England | 11 | `type=money_claim&product=money_claim&jurisdiction=` |
| **TenancySectionFlow** | `ast_standard`, `ast_premium` | England, Wales | 12 | `type=tenancy_agreement&product=ast_standard&jurisdiction=` |

### Detailed Flow: Notice Only (England)

| Step | Section | Auto-Skip Condition | Validation |
|------|---------|---------------------|------------|
| 1 | Case Basics | Never | Route selection required |
| 2 | Parties | Never | Names + addresses required |
| 3 | Property | Never | Full address required |
| 4 | Tenancy | Never | Dates + rent required |
| 5 | S21 Compliance | If S8 selected | Gas/deposit/EPC checks |
| 6 | Notice Details | Never | Service date required |
| 7 | S8 Arrears | If S21 selected | Arrears schedule if grounds 8/10/11 |
| 8 | Review | Never (always accessible) | All sections complete |

### Detailed Flow: Money Claim (England)

| Step | Section | Auto-Skip Condition | Validation |
|------|---------|---------------------|------------|
| 1 | Claimant | Never | Landlord/company details |
| 2 | Defendant | Never | Tenant details |
| 3 | Tenancy | Never | Start date, rent, frequency |
| 4 | Claim Details | Never | Claim types selection |
| 5 | Arrears | If not claiming rent | Arrears items + total |
| 6 | Damages | If not claiming damage | Damage items + evidence |
| 7 | Pre-Action | Never | Letter Before Claim details |
| 8 | Timeline | Optional section | Pre-action protocol review |
| 9 | Evidence | Optional section | Document uploads |
| 10 | Enforcement | Optional section | Enforcement method preferences |
| 11 | Review | Never | All required sections complete |

### Entry Parameter Reference

| Parameter | Purpose | Example Values |
|-----------|---------|----------------|
| `type` | Case/product type | `eviction`, `money_claim`, `tenancy_agreement` |
| `jurisdiction` | Legal jurisdiction | `england`, `wales`, `scotland`, `northern-ireland` |
| `product` | Product SKU | `notice_only`, `complete_pack`, `money_claim`, `ast_standard` |
| `reason` | Pre-select claim type | `property_damage`, `rent_arrears`, `cleaning` |
| `topic` | Legacy: claim category | `arrears`, `damage` |
| `src` | Attribution source | `seo_unpaid_rent`, `product_page`, `blog_lba` |
| `case_id` | Resume existing case | UUID |

### Analytics Events

| Event | Trigger | Data |
|-------|---------|------|
| `wizard_start` | User reaches /wizard/flow | product, jurisdiction, src, utm_*, landing_url |
| `wizard_step_complete` | Section completed (deduplicated) | step, stepIndex, totalSteps, product |
| `money_claim_section_skipped` | Optional section auto-skipped | section, reasons, jurisdiction |

### Deep-Link Sources (by content type)

| Content Type | Links to Wizard | Example |
|--------------|-----------------|---------|
| Product pages | 3-4 per page | `/wizard?product=money_claim&src=product_page` |
| SEO landing pages | 1-3 per page | `/wizard?product=money_claim&reason=property_damage&src=seo_damage` |
| Blog articles | 1-2 per article | `/wizard?product=complete_pack&src=blog_section21` |
| Tool pages | 1 per tool | `/wizard?product=notice_only&src=tool` |
| Pricing page | 10 total | `/wizard?product=notice_only&src=pricing` |

---

## 3. CONTENT INVENTORY

### A. SEO Landing Pages (47 pages)

#### Eviction & Notice Templates (15 pages)

| Route | Product Intent | Primary Keyword | Source File |
|-------|---------------|-----------------|-------------|
| `/section-21-notice-template` | Notice Only | section 21 notice template | `src/app/section-21-notice-template/page.tsx` |
| `/section-8-notice-template` | Notice Only | section 8 notice template | `src/app/section-8-notice-template/page.tsx` |
| `/eviction-notice-template` | Notice Only | eviction notice template | `src/app/eviction-notice-template/page.tsx` |
| `/how-to-evict-tenant` | Complete Pack | how to evict tenant | `src/app/how-to-evict-tenant/page.tsx` |
| `/tenant-not-paying-rent` | Money Claim/Complete | tenant not paying rent | `src/app/tenant-not-paying-rent/page.tsx` |
| `/tenant-wont-leave` | Complete Pack | tenant won't leave | `src/app/tenant-wont-leave/page.tsx` |
| `/possession-claim-guide` | Complete Pack | possession claim | `src/app/possession-claim-guide/page.tsx` |
| `/warrant-of-possession` | Complete Pack | warrant of possession | `src/app/warrant-of-possession/page.tsx` |
| `/eviction-cost-uk` | Complete Pack | eviction cost uk | `src/app/eviction-cost-uk/page.tsx` |
| `/n5b-form-guide` | Complete Pack | n5b form | `src/app/n5b-form-guide/page.tsx` |
| `/section-21-ban` | Notice Only | section 21 ban | `src/app/section-21-ban/page.tsx` |
| `/scotland-notice-to-leave-template` | Notice Only | notice to leave scotland | `src/app/scotland-notice-to-leave-template/page.tsx` |
| `/scotland-eviction-notices` | Notice Only | scotland eviction | `src/app/scotland-eviction-notices/page.tsx` |
| `/wales-eviction-notice-template` | Notice Only | wales eviction notice | `src/app/wales-eviction-notice-template/page.tsx` |
| `/wales-eviction-notices` | Notice Only | wales eviction | `src/app/wales-eviction-notices/page.tsx` |

#### Money Claim Pages (26 pages)

| Route | Claim Type | Primary Keyword | Source File |
|-------|-----------|-----------------|-------------|
| `/money-claim-unpaid-rent` | Core | recover unpaid rent | `src/app/money-claim-unpaid-rent/page.tsx` |
| `/money-claim-property-damage` | Core | claim for property damage | `src/app/money-claim-property-damage/page.tsx` |
| `/money-claim-cleaning-costs` | Core | cleaning costs landlord | `src/app/money-claim-cleaning-costs/page.tsx` |
| `/money-claim-unpaid-utilities` | Core | unpaid utility bills | `src/app/money-claim-unpaid-utilities/page.tsx` |
| `/money-claim-garden-damage` | Damage | garden damage claim | `src/app/money-claim-garden-damage/page.tsx` |
| `/money-claim-carpet-damage` | Damage | carpet damage claim | `src/app/money-claim-carpet-damage/page.tsx` |
| `/money-claim-appliance-damage` | Damage | appliance damage | `src/app/money-claim-appliance-damage/page.tsx` |
| `/money-claim-wall-damage` | Damage | wall damage claim | `src/app/money-claim-wall-damage/page.tsx` |
| `/money-claim-bathroom-damage` | Damage | bathroom damage | `src/app/money-claim-bathroom-damage/page.tsx` |
| `/money-claim-abandoned-goods` | Damage | abandoned goods tenant | `src/app/money-claim-abandoned-goods/page.tsx` |
| `/money-claim-council-tax` | Debt | council tax arrears | `src/app/money-claim-council-tax/page.tsx` |
| `/money-claim-early-termination` | Debt | break clause claim | `src/app/money-claim-early-termination/page.tsx` |
| `/money-claim-unpaid-bills` | Debt | unpaid bills tenant | `src/app/money-claim-unpaid-bills/page.tsx` |
| `/money-claim-guarantor` | Debt | guarantor claim | `src/app/money-claim-guarantor/page.tsx` |
| `/money-claim-former-tenant` | Debt | claim against former tenant | `src/app/money-claim-former-tenant/page.tsx` |
| `/money-claim-deposit-shortfall` | Debt | deposit shortfall | `src/app/money-claim-deposit-shortfall/page.tsx` |
| `/money-claim-online-mcol` | Process | mcol online | `src/app/money-claim-online-mcol/page.tsx` |
| `/money-claim-ccj-enforcement` | Process | ccj enforcement | `src/app/money-claim-ccj-enforcement/page.tsx` |
| `/money-claim-small-claims-landlord` | Process | small claims court landlord | `src/app/money-claim-small-claims-landlord/page.tsx` |
| `/money-claim-tenant-defends` | Process | defendant response | `src/app/money-claim-tenant-defends/page.tsx` |
| `/money-claim-n1-claim-form` | Form | n1 claim form | `src/app/money-claim-n1-claim-form/page.tsx` |
| `/money-claim-letter-before-action` | Form | letter before action | `src/app/money-claim-letter-before-action/page.tsx` |
| `/money-claim-schedule-of-debt` | Form | schedule of debt | `src/app/money-claim-schedule-of-debt/page.tsx` |
| `/money-claim-pap-financial-statement` | Form | pap financial statement | `src/app/money-claim-pap-financial-statement/page.tsx` |

#### Tenancy Agreement Pages (6 pages)

| Route | Jurisdiction | Primary Keyword | Source File |
|-------|-------------|-----------------|-------------|
| `/tenancy-agreements` | Index | tenancy agreements | `src/app/tenancy-agreements/page.tsx` |
| `/tenancy-agreements/england` | England | assured shorthold tenancy | `src/app/tenancy-agreements/england/page.tsx` |
| `/tenancy-agreements/wales` | Wales | occupation contract wales | `src/app/tenancy-agreements/wales/page.tsx` |
| `/tenancy-agreements/scotland` | Scotland | private residential tenancy | `src/app/tenancy-agreements/scotland/page.tsx` |
| `/tenancy-agreements/northern-ireland` | NI | private tenancy agreement | `src/app/tenancy-agreements/northern-ireland/page.tsx` |
| `/tenancy-agreement-template` | General | tenancy agreement template | `src/app/tenancy-agreement-template/page.tsx` |

**TOTAL SEO LANDING PAGES: 47**

---

### B. Blog / Articles (115 posts)

| Category | Count | Product(s) Supported | Topics |
|----------|-------|---------------------|--------|
| Eviction Guides | 35 | Notice Only, Complete Pack | Section 21, Section 8, grounds, processes |
| Legal Updates | 15 | All | Renters Reform Bill, law changes |
| Tenancy Agreements | 12 | AST Standard/Premium | AST, PRT, contracts, deposits |
| Money Claims | 18 | Money Claim Pack | Arrears, MCOL, CCJ, enforcement |
| Compliance | 20 | All | Gas safety, EICR, EPC, deposits |
| Property Management | 15 | All | Inventories, HMO licensing, insurance |

#### Blog by Jurisdiction

| Jurisdiction | Posts | URL Pattern |
|--------------|-------|-------------|
| England | 45 | `/blog/england-*` |
| Scotland | 25 | `/blog/scotland-*` |
| Wales | 18 | `/blog/wales-*` |
| Northern Ireland | 12 | `/blog/northern-ireland-*` |
| UK-Wide | 15 | `/blog/uk-*` |

**All 115 posts**: Indexed ✅ | In sitemap ✅ | Priority 0.8

---

### C. Template / Form / Tool Pages (8 tools)

| Route | Purpose | Product Upsell Target | Lead Capture |
|-------|---------|----------------------|--------------|
| `/tools/free-section-21-notice-generator` | Free S21 generator | Notice Only | Email required |
| `/tools/free-section-8-notice-generator` | Free S8 generator | Notice Only | Email required |
| `/tools/free-rent-demand-letter` | Free demand letter | Money Claim | Email required |
| `/tools/rent-arrears-calculator` | Calculate arrears | Money Claim | None |
| `/tools/hmo-license-checker` | Check HMO requirements | AST/HMO Pro | None |
| `/tools/validators/section-21` | Validate S21 notice | Complete Pack | Analysis result |
| `/tools/validators/section-8` | Validate S8 notice | Complete Pack | Analysis result |
| `/tools/validators` | Validators hub | Complete Pack | None |

**TOTAL TOOLS: 8**

---

### Content Totals

| Category | Count | Indexed | In Sitemap |
|----------|-------|---------|------------|
| SEO Landing Pages | 47 | 47 | 47 |
| Blog Articles | 115 | 115 | 115 |
| Tool Pages | 8 | 8 | 8 |
| Product Pages | 5 | 5 | 5 |
| **TOTAL** | **175** | **175** | **175** |

---

## 4. FUNNEL AUDIT

### PASS / NEEDS FIX Analysis

#### Product Pages

| Route | CTA Present | Product Pushed | Deep-Link Params | Cross-sell | Status |
|-------|:-----------:|----------------|------------------|:----------:|:------:|
| `/products/notice-only` | ✅ | Notice Only | `product=notice_only&src=product_page` | Complete Pack ✅ | **PASS** |
| `/products/complete-pack` | ✅ | Complete Pack | `product=complete_pack&src=product_page` | ❌ Missing Money Claim | **NEEDS FIX** |
| `/products/money-claim` | ✅ | Money Claim | `product=money_claim&src=product_page` | ❌ Missing Eviction link | **NEEDS FIX** |
| `/products/ast` | ✅ | AST Standard/Premium | `product=ast_standard&src=product_page` | ❌ Missing Eviction mention | **NEEDS FIX** |

#### Money Claim Landing Pages (Sample)

| Route | CTA | Product | Params | Cross-sell | Status |
|-------|:---:|---------|--------|:----------:|:------:|
| `/money-claim-unpaid-rent` | ✅ | Money Claim | `reason=rent_arrears&src=seo_unpaid_rent` | ✅ | **PASS** |
| `/money-claim-property-damage` | ✅ | Money Claim | `reason=property_damage&src=seo_damage` | ✅ | **PASS** |
| `/money-claim-cleaning-costs` | ✅ | Money Claim | `reason=cleaning&src=seo_cleaning` | ✅ | **PASS** |
| `/money-claim-ccj-enforcement` | ✅ | Money Claim | `src=seo_ccj_enforcement` | ✅ | **PASS** |
| `/money-claim-n1-claim-form` | ✅ | Money Claim | `src=seo_n1_form` | ✅ | **PASS** |

#### Eviction Landing Pages

| Route | CTA | Product | Params | Cross-sell | Status |
|-------|:---:|---------|--------|:----------:|:------:|
| `/how-to-evict-tenant` | ✅ | Notice Only, Complete | `src=guide` | ❌ Missing Money Claim | **NEEDS FIX** |
| `/tenant-not-paying-rent` | ✅ | Money Claim + Eviction | `src=seo` | ✅ Both products | **PASS** |
| `/section-21-notice-template` | ✅ | Notice Only | Uses `buildWizardLink()` | ✅ Complete Pack | **PASS** |
| `/eviction-cost-uk` | ✅ | Complete Pack | `src=seo` | ❌ Missing Money Claim | **NEEDS FIX** |

#### Template Pages

| Route | CTA | Product | Status | Issue |
|-------|:---:|---------|:------:|-------|
| `/section-21-notice-template` | ✅ | Notice Only | **PASS** | - |
| `/section-8-notice-template` | ⚠️ | Notice Only | **VERIFY** | CTA presence unconfirmed |
| `/rent-arrears-letter-template` | ⚠️ | Money Claim | **VERIFY** | CTA presence unconfirmed |
| `/tenancy-agreement-template` | ⚠️ | AST | **VERIFY** | CTA presence unconfirmed |

#### Tool Pages

| Route | CTA | Upsell Target | Status |
|-------|:---:|---------------|:------:|
| `/tools/free-section-21-notice-generator` | ✅ | Notice Only | **PASS** |
| `/tools/free-section-8-notice-generator` | ✅ | Notice Only | **PASS** |
| `/tools/free-rent-demand-letter` | ✅ | Money Claim | **PASS** |
| `/tools/rent-arrears-calculator` | ✅ | Money Claim | **PASS** |
| `/tools/validators/section-21` | ✅ | Complete Pack | **PASS** |
| `/tools/validators/section-8` | ✅ | Complete Pack | **PASS** |

#### Dashboard Pages

| Route | CTA | Status | Issue |
|-------|:---:|:------:|-------|
| `/dashboard` | ✅ | **NEEDS FIX** | Missing `src=dashboard` tracking |
| `/dashboard/cases` | ✅ | **NEEDS FIX** | Missing `src=dashboard` tracking |
| `/dashboard/cases/[id]` | ❌ | **NEEDS FIX** | No post-purchase cross-sell |

---

### Issues Summary

| Issue | Affected Pages | Priority | Fix |
|-------|---------------|----------|-----|
| Missing Money Claim cross-sell on eviction pages | 3 pages | P1 | Add RelatedLinks with Money Claim |
| Missing Eviction cross-sell on Money Claim page | 1 page | P1 | Add "Need to evict too?" section |
| Missing Eviction mention on AST page | 1 page | P2 | Add FAQ about future eviction |
| No post-purchase cross-sell | Dashboard case page | P1 | Add PostPurchaseCrossSell component |
| Dashboard links missing src param | 3 pages | P2 | Add `src=dashboard` to wizard links |
| Unconfirmed CTAs on template pages | 3 pages | P2 | Verify and add if missing |

---

## 5. INTERNAL LINKING & CROSS-SELL AUDIT

### Existing Link Groups

| Group Name | Products Covered | Links Included |
|------------|-----------------|----------------|
| `evictionRelatedLinks` | Notice Only, Complete Pack | Validators, Wales/Scotland guides, templates |
| `rentArrearsRelatedLinks` | Money Claim | Calculator, templates, eviction products |
| `tenancyRelatedLinks` | AST | Templates, jurisdiction guides |
| `moneyClaimHubLinks` | Money Claim | 4 core guides + calculator |
| `moneyClaimDamageLinks` | Money Claim | 6 damage-specific guides |
| `moneyClaimCleaningLinks` | Money Claim | Cleaning guides + evidence |
| `moneyClaimUtilitiesLinks` | Money Claim | Utilities/bills guides |
| `moneyClaimRentLinks` | Money Claim | Rent arrears guides + interest |
| `moneyClaimProcessLinks` | Money Claim | Process guides + forms |
| `moneyClaimEnforcementLinks` | Money Claim | Enforcement + CCJ blogs |
| `walesRelatedLinks` | Notice Only (Wales) | Ask Heaven, Wales guides |
| `scotlandRelatedLinks` | Notice Only (Scotland) | Ask Heaven, Scotland guides |

### Cross-Link Gaps Identified

#### Gap 1: Eviction → Money Claim

| Page | Mentions Arrears | Has Money Claim Link | Fix |
|------|:---------------:|:-------------------:|-----|
| `/products/complete-pack` | ✅ (line 365, 388) | ❌ | Add Money Claim to RelatedLinks |
| `/how-to-evict-tenant` | ✅ (Section 8 grounds) | ❌ | Add Money Claim section |
| `/eviction-cost-uk` | ✅ (cost breakdown) | ❌ | Add "recover costs" link |
| `/tenant-wont-leave` | ⚠️ (possible) | ❌ | Verify and add if applicable |

#### Gap 2: Money Claim → Eviction

| Page | Should Link to Eviction | Has Eviction Link | Fix |
|------|:-----------------------:|:-----------------:|-----|
| `/products/money-claim` | ✅ (tenant still there) | ❌ | Add "Need to evict too?" |
| `/money-claim-unpaid-rent` | ✅ (ongoing tenancy) | ⚠️ | Strengthen eviction CTA |
| `/money-claim-former-tenant` | ✅ (future reference) | ❌ | Add eviction for future |

#### Gap 3: Tenancy → Eviction

| Page | Future Eviction Mention | Has Eviction Link | Fix |
|------|:-----------------------:|:-----------------:|-----|
| `/products/ast` | ❌ | ❌ | Add FAQ about eviction |
| `/tenancy-agreements/england` | ❌ | ❌ | Add "What if I need to evict" |

### Proposed New Cross-Links (15 High-Value)

| # | From Page | Insert Point | Link To | Anchor Text |
|---|-----------|--------------|---------|-------------|
| 1 | `/products/complete-pack` | After FAQs | `/products/money-claim` | "Also need to recover unpaid rent?" |
| 2 | `/products/money-claim` | After pricing | `/products/notice-only` | "Need to evict the tenant first?" |
| 3 | `/products/money-claim` | After pricing | `/products/complete-pack` | "Need court forms for possession?" |
| 4 | `/products/ast` | New FAQ | `/products/notice-only` | "What if I need to evict later?" |
| 5 | `/how-to-evict-tenant` | After S8 grounds | `/money-claim-unpaid-rent` | "Recover unpaid rent" |
| 6 | `/eviction-cost-uk` | In cost breakdown | `/products/money-claim` | "Money claim to recover costs" |
| 7 | `/tenant-not-paying-rent` | Existing | ✅ Already has both | - |
| 8 | `/money-claim-unpaid-rent` | After intro | `/products/notice-only` | "Need to evict too?" |
| 9 | `/money-claim-cleaning-costs` | In evidence section | `/products/complete-pack` | "If tenant disputes, eviction may help" |
| 10 | `/dashboard/cases/[id]` | After documents | Cross-sell component | "You might also need..." |
| 11 | `/section-21-ban` | After main content | `/products/complete-pack` | "Prepare for Section 8 eviction" |
| 12 | `/scotland-eviction-notices` | After notice types | `/money-claim-unpaid-rent` | "Recovering rent in Scotland" |
| 13 | `/wales-eviction-notices` | After notice types | `/money-claim-unpaid-rent` | "Recovering rent in Wales" |
| 14 | `/tools/validators/section-21` | After result | `/products/money-claim` | "Also claim for unpaid rent" |
| 15 | `/tools/validators/section-8` | After result | `/products/money-claim` | "Also claim for unpaid rent" |

### Proposed New Link Group

```typescript
// Add to src/lib/seo/internal-links.ts
export const evictionToMoneyClaimLinks: InternalLink[] = [
  productLinks.moneyClaim,
  moneyClaimGuides.unpaidRent,
  toolLinks.rentArrearsCalculator,
];

export const moneyClaimToEvictionLinks: InternalLink[] = [
  productLinks.noticeOnly,
  productLinks.completePack,
  guideLinks.howToEvictTenant,
];
```

---

## 6. SEO HYGIENE AUDIT

### Metadata Coverage

| Element | Coverage | Status |
|---------|----------|--------|
| Title | 75/103 pages | ✅ Good |
| Meta Description | 75/103 pages | ✅ Good |
| Canonical URL | 62/75 content pages | ⚠️ 13 missing |
| Keywords | 58/75 content pages | ⚠️ 17 missing |
| OpenGraph | 63/75 content pages | ✅ Good |
| Twitter Cards | 3/75 content pages | ❌ Critical gap |
| robots: noindex | Auth/Dashboard/Wizard | ✅ Correct |

### Structured Data Coverage

| Schema Type | Pages Using | Status |
|-------------|-------------|--------|
| Organization | Layout (global) | ✅ |
| Product | 5 product pages + 28 money claim | ✅ |
| FAQ | Product pages, guide pages | ✅ |
| Article | 115 blog posts | ✅ |
| BreadcrumbList | Product pages, blog posts | ✅ |
| HowTo | Tool pages (generators) | ✅ |
| WebSite | Homepage only | ✅ |

### Sample SEO Audit (10 pages)

| Page | Title | Description | Canonical | Schema | Index | Sitemap |
|------|:-----:|:-----------:|:---------:|:------:|:-----:|:-------:|
| `/products/notice-only` | ✅ | ✅ | ✅ | Product+FAQ+Breadcrumb | ✅ | ✅ |
| `/products/money-claim` | ✅ | ✅ | ✅ | Product+FAQ+Breadcrumb | ✅ | ✅ |
| `/money-claim-unpaid-rent` | ✅ | ✅ | ✅ | Article+FAQ | ✅ | ✅ |
| `/section-21-notice-template` | ✅ | ✅ | ✅ | FAQ+Breadcrumb | ✅ | ✅ |
| `/how-to-evict-tenant` | ✅ | ✅ | ✅ | FAQ | ✅ | ✅ |
| `/blog/england-section-21-guide` | ✅ | ✅ | ✅ | Article+FAQ | ✅ | ✅ |
| `/tools/rent-arrears-calculator` | ✅ | ✅ | ✅ | HowTo | ✅ | ✅ |
| `/tenancy-agreements/england` | ✅ | ✅ | ✅ | Product | ✅ | ✅ |
| `/contact` | ✅ | ⚠️ Brief (28 words) | ❌ Missing | ❌ None | ✅ | ✅ |
| `/about` | ✅ | ✅ | ⚠️ Check | ❌ None | ✅ | ✅ |

### Indexability Issues

| Issue | Status |
|-------|--------|
| Duplicate content | ✅ Controlled via canonical |
| Thin content | ✅ All pages have substantial content |
| Noindex leaks | ✅ Only auth/dashboard/wizard |
| Orphan pages | ✅ All linked via sitemap + internal links |
| Cannibalization | ⚠️ Monitor money claim variants |

### Sitemap Configuration

| Category | Pages | Priority | Frequency |
|----------|-------|----------|-----------|
| Homepage | 1 | 1.0 | weekly |
| Products | 5 | 0.9 | weekly |
| Landing pages | 47 | 0.75-0.9 | weekly |
| Blog posts | 115 | 0.8 | monthly |
| Tools | 8 | 0.7-0.9 | weekly |
| Legal | 4 | 0.3 | yearly |

---

## 7. REVENUE LEVERAGE FINDINGS

### Under-Monetized Traffic Areas

| Area | Traffic Potential | Current State | Opportunity |
|------|-------------------|---------------|-------------|
| **Eviction pages without money claim links** | High | 3 pages missing Money Claim | Add cross-sell to capture arrears recovery |
| **Post-purchase dashboard** | Medium | No cross-sell | Add complementary product recommendations |
| **Validator results** | High | Only upsells to Complete Pack | Add Money Claim for arrears grounds |
| **Template pages (S8, rent arrears)** | Medium | CTAs unverified | Ensure CTAs present |
| **Tenancy agreement pages** | Medium | No eviction mention | Add future-proofing message |

### Content That Should Push Higher-Priced Products

| Current Push | Should Also Push | Pages Affected | Revenue Uplift |
|--------------|------------------|----------------|----------------|
| Notice Only (£39.99) | Complete Pack (£149.99) | Already doing ✅ | - |
| Money Claim (£99.99) | Complete Pack (£149.99) | If eviction also needed | +£50/conversion |
| Standard AST (£9.99) | Premium AST (£14.99) | Tenancy pages | +£5/conversion |
| Free tools | Paid products | All tool pages ✅ | - |

### Missing "Bridge" Pages

| Gap | Missing Bridge | Recommended Page |
|-----|----------------|------------------|
| Eviction → Money Claim | "Eviction AND money claim" combo page | `/landlord-debt-recovery` |
| Tenant left → Money Claim | Former tenant recovery guide | ✅ Exists: `/money-claim-former-tenant` |
| Tenancy → Eviction | "When eviction becomes necessary" | FAQ on AST page or new guide |
| Scotland Money Claim | Scotland Simple Procedure guide | Consider adding if demand |

### Product Content Balance

| Product | SEO Pages | Blog Posts | Tools | Status |
|---------|-----------|------------|-------|--------|
| Notice Only | 15 | 35 | 4 | ✅ Well-served |
| Complete Pack | 12 | 35 | 2 | ✅ Well-served |
| Money Claim | 26 | 18 | 2 | ✅ Well-served |
| AST/Tenancy | 6 | 12 | 1 | ⚠️ Could use more content |
| HMO Pro | 0 | 2 | 1 | ⚠️ Feature-flagged, content when ready |

---

## 8. PRIORITISED ACTION PLAN

### P0: Launch Blockers
*None identified* - The funnel is complete and functional.

---

### P1: High-Impact Revenue Optimizations

| # | Action | Why It Matters | Expected Upside | Files to Change |
|---|--------|----------------|-----------------|-----------------|
| 1 | **Add Money Claim cross-sell to Complete Pack page** | Eviction users with arrears don't see Money Claim | +5-10% Money Claim conversions | `src/app/products/complete-pack/page.tsx` |
| 2 | **Add Eviction cross-sell to Money Claim page** | Money claim users may also need eviction | +3-5% Eviction conversions | `src/app/products/money-claim/page.tsx` |
| 3 | **Create PostPurchaseCrossSell component** | Dashboard has zero cross-sell | +2-5% repeat purchases | New: `src/components/PostPurchaseCrossSell.tsx`, Update: `src/app/dashboard/cases/[id]/page.tsx` |
| 4 | **Add Money Claim links to validator results** | Users who validate arrears grounds don't see Money Claim | +3-5% Money Claim from validators | `src/components/validators/ValidatorResult.tsx` |
| 5 | **Verify and add CTAs to template pages** | S8, rent arrears templates may lack CTAs | Potential leaked traffic | `src/app/section-8-notice-template/page.tsx`, `src/app/rent-arrears-letter-template/page.tsx` |

**Total P1 Estimated Impact**: +10-20% cross-product revenue

---

### P2: SEO & UX Polish

| # | Action | Why It Matters | Expected Upside | Files to Change |
|---|--------|----------------|-----------------|-----------------|
| 6 | **Add Twitter Card metadata to all content pages** | Only 3 pages have Twitter cards | Better social sharing | `src/lib/seo/metadata.ts`, all page metadata |
| 7 | **Add canonical URLs to missing pages** | 13 pages lack explicit canonical | Avoid duplicate indexing | Various page.tsx files |
| 8 | **Add keywords to legal/utility pages** | 17 pages missing keywords | Minor SEO improvement | `/contact`, `/about`, `/privacy`, etc. |
| 9 | **Add tracking params to dashboard wizard links** | Dashboard links have no attribution | Better analytics | `src/app/dashboard/page.tsx`, `src/app/dashboard/cases/page.tsx` |
| 10 | **Expand Contact page description** | Only 28 words, unusually brief | Better SERP appearance | `src/app/contact/page.tsx` |
| 11 | **Add eviction FAQ to AST product page** | Users don't know about future needs | Plant seed for future eviction | `src/app/products/ast/page.tsx` |
| 12 | **Add Money Claim to eviction guide pages** | how-to-evict, eviction-cost missing | Cross-sell opportunity | `src/app/how-to-evict-tenant/page.tsx`, `src/app/eviction-cost-uk/page.tsx` |

---

### Implementation Files Quick Reference

| File | Changes Needed |
|------|----------------|
| `src/app/products/complete-pack/page.tsx` | Add Money Claim to RelatedLinks |
| `src/app/products/money-claim/page.tsx` | Add "Need to evict?" section |
| `src/app/products/ast/page.tsx` | Add eviction FAQ |
| `src/app/dashboard/cases/[id]/page.tsx` | Add PostPurchaseCrossSell |
| `src/components/PostPurchaseCrossSell.tsx` | Create new component |
| `src/lib/seo/internal-links.ts` | Add evictionToMoneyClaimLinks group |
| `src/lib/seo/metadata.ts` | Add Twitter card helper |
| `src/app/how-to-evict-tenant/page.tsx` | Add Money Claim link |
| `src/app/eviction-cost-uk/page.tsx` | Add Money Claim link |
| `src/app/contact/page.tsx` | Expand description |

---

## Appendix: File Locations

### Core Configuration Files
- **Products**: `src/lib/pricing/products.ts`
- **Internal Links**: `src/lib/seo/internal-links.ts`
- **Sitemap**: `src/app/sitemap.ts`
- **SEO Utilities**: `src/lib/seo/metadata.ts`, `src/lib/seo/urls.ts`
- **Blog Posts**: `src/lib/blog/posts.tsx`
- **Wizard Attribution**: `src/lib/wizard/wizardAttribution.ts`

### Wizard Flows
- **Notice Only**: `src/components/wizard/flows/NoticeOnlySectionFlow.tsx`
- **Complete Pack**: `src/components/wizard/flows/EvictionSectionFlow.tsx`
- **Money Claim**: `src/components/wizard/flows/MoneyClaimSectionFlow.tsx`
- **Tenancy**: `src/components/wizard/flows/TenancySectionFlow.tsx`

### Key Components
- **RelatedLinks**: `src/components/seo/RelatedLinks.tsx`
- **SeoCtaBlock**: `src/components/seo/SeoCtaBlock.tsx`
- **BlogCTA**: `src/components/blog/BlogCTA.tsx`
- **NextBestActionCard**: `src/components/ask-heaven/NextBestActionCard.tsx`

---

*End of Audit*
