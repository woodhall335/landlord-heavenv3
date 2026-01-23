# Landlord Heaven Codebase, Product, Pricing & SEO Strategy Audit

**Date:** January 2026
**Auditor:** Claude Code
**Repository:** woodhall335/landlord-heavenv3

---

## 1) Product Inventory

### Current Products

| Product ID | Display Name | Price | Regions Available | Status | Key Files |
|------------|--------------|-------|-------------------|--------|-----------|
| `notice_only` | Eviction Notice Pack | £39.99 | England, Wales, Scotland | **Stable** | `/src/lib/pricing/products.ts:32-41` |
| `complete_pack` | Complete Eviction Pack | £149.99 | England only | **Stable** | `/src/lib/pricing/products.ts:42-52` |
| `money_claim` | Money Claim Pack | £99.99 | England only | **Stable** | `/src/lib/pricing/products.ts:53-63` |
| `sc_money_claim` | Scotland Money Claim | £99.99 | *Discontinued* | **Discontinued** | `/src/lib/pricing/products.ts:64-74` |
| `ast_standard` | Standard Tenancy Agreement | £9.99 | All UK regions | **Stable** | `/src/lib/pricing/products.ts:75-84` |
| `ast_premium` | Premium Tenancy Agreement | £14.99 | All UK regions | **Stable** | `/src/lib/pricing/products.ts:85-94` |

### Product Workflows

#### Notice Only (`notice_only`)
- **Wizard Routes:** `/wizard?product=notice_only` → `/wizard/flow`
- **API Endpoints:** `/api/notice-only/*`, `/api/orders/*`
- **PDF Generation:** Section 21 (Form 6A), Section 8 (Form 3), Section 173 (Wales), Notice to Leave (Scotland)
- **Pack Contents:** 3-4 documents (notice, service instructions, checklist, optional arrears schedule)
- **Key Logic:** `/src/lib/products/pack-contents.ts:49-104`

#### Complete Eviction Pack (`complete_pack`)
- **Wizard Routes:** `/wizard?product=complete_pack` → `/wizard/flow`
- **API Endpoints:** `/api/complete-pack/*`, `/api/orders/*`
- **PDF Generation:** Notice + N5/N5B court forms, N119 particulars, witness statement, filing guide
- **Pack Contents:** 7-9 documents depending on route
- **Key Logic:** `/src/lib/products/pack-contents.ts:106-174`

#### Money Claim Pack (`money_claim`)
- **Wizard Routes:** `/wizard?product=money_claim` → `/wizard/flow`
- **API Endpoints:** `/api/money-claim/*`, `/api/orders/*`
- **PDF Generation:** N1 form, Particulars of Claim, Schedule of Arrears, Letter Before Claim, etc.
- **Pack Contents:** 11 documents
- **Key Logic:** `/src/lib/products/pack-contents.ts:176-249`
- **Validator:** `/src/lib/documents/money-claim-validator.ts`

#### Tenancy Agreements (`ast_standard`, `ast_premium`)
- **Wizard Routes:** `/wizard?product=ast_standard` or `ast_premium` → `/wizard/flow`
- **API Endpoints:** `/api/ast/*`, `/api/orders/*`
- **PDF Generation:** AST (England), SOC (Wales), PRT (Scotland), Private Tenancy (NI)
- **Pack Contents:** 4-7 documents (standard: 4, premium: 7)
- **Key Logic:** `/src/lib/products/pack-contents.ts:251-308`

### Regional Availability Matrix

| Product | England | Wales | Scotland | Northern Ireland |
|---------|---------|-------|----------|------------------|
| `notice_only` | ✅ | ✅ | ✅ | ❌ |
| `complete_pack` | ✅ | ❌ | ❌ | ❌ |
| `money_claim` | ✅ | ❌ | ❌ | ❌ |
| `ast_standard` | ✅ | ✅ | ✅ | ✅ |
| `ast_premium` | ✅ | ✅ | ✅ | ✅ |

**Source:** `/src/lib/pricing/products.ts:178-205`

---

## 2) Pricing Consistency

### Pricing Sources

The codebase has **two pricing files** that must stay in sync:

1. **Primary UI Source:** `/src/lib/pricing/products.ts`
   - Contains `PRODUCTS` object with `price` and `displayPrice` fields
   - Used by product pages, pricing page, wizard

2. **Backend/API Source:** `/src/lib/pricing.ts`
   - Contains `PRICING` constants and `REGIONAL_PRICING` matrix
   - Contains `getRegionalPrice()`, `formatPrice()` functions

### Consistency Tests

✅ **Pricing consistency tests exist:** `/tests/lib/pricing/pricing-consistency.test.ts`

This test file verifies:
- `PRICING.NOTICE_ONLY` matches `PRODUCTS.notice_only.price`
- `PRICING.COMPLETE_EVICTION_PACK` matches `PRODUCTS.complete_pack.price`
- `PRICING.MONEY_CLAIM_PACK` matches `PRODUCTS.money_claim.price`
- `PRICING.STANDARD_AST` matches `PRODUCTS.ast_standard.price`
- `PRICING.PREMIUM_AST` matches `PRODUCTS.ast_premium.price`
- Display prices match numeric prices
- Regional availability checks

### Hardcoded Price References Audit

**UI Components with prices:**
| Location | Price | Status |
|----------|-------|--------|
| `/src/app/pricing/page.tsx:73-97` | £39.99, £149.99, £99.99, £9.99, £14.99 | Uses `PRODUCTS` ✅ |
| `/src/app/products/notice-only/page.tsx` | Dynamic via `PRODUCTS.notice_only.displayPrice` | ✅ |
| `/src/app/products/complete-pack/page.tsx` | Dynamic via `PRODUCTS.complete_pack.displayPrice` | ✅ |
| `/src/app/products/money-claim/page.tsx` | Dynamic via `PRODUCTS.money_claim.displayPrice` | ✅ |
| `/src/app/wizard/page.tsx:124-155` | Hardcoded "From £39.99", "£149.99", "£99.99", "From £9.99" | ⚠️ **Could reference PRODUCTS** |
| `/src/lib/seo/internal-links.ts:11-35` | Hardcoded £39.99, £149.99, £99.99, £9.99 | ⚠️ **Could reference PRODUCTS** |

### Pricing Issues Found

1. **Wizard page hardcodes prices** (`/src/app/wizard/page.tsx:124-155`)
   - `price: 'From £39.99'`, `'£149.99'`, `'£99.99'`, `'From £9.99'`
   - Should import from `PRODUCTS` for consistency

2. **Internal links hardcode prices** (`/src/lib/seo/internal-links.ts`)
   - Descriptions contain hardcoded prices like "£39.99", "£149.99"
   - Should use template literals with `PRODUCTS`

### Missing Test Coverage

- ❌ No tests for email template pricing references
- ❌ No tests for receipt/invoice pricing
- ❌ No integration tests for Stripe price sync

---

## 3) Code Quality Summary

### Region Gating Logic

**UI Region Gating:**
- Location: `/src/app/wizard/page.tsx:170-203`
- Functions: `isJurisdictionEnabled()`, `isProductAvailableForJurisdiction()`
- Implementation: Correctly blocks Complete Pack and Money Claim for non-England jurisdictions
- NI auto-switches to tenancy agreement with user notification

**API Region Gating:**
- Location: `/src/lib/pricing/products.ts:210-217`
- Function: `isProductAvailableInRegion(sku, jurisdiction)`
- Also: `/src/lib/pricing.ts:66-69` - `isProductAvailable(product, jurisdiction)`

**Potential Issue:** Two separate availability check implementations:
- `REGIONAL_PRODUCT_AVAILABILITY` in `products.ts` uses `'northern-ireland'` (hyphenated)
- `PRODUCT_AVAILABILITY` in `pricing.ts` uses `'northern_ireland'` (underscored)
- The `isProductAvailable()` function normalizes with `.replace('-', '_')` but this is fragile

### Data Validation Logic

**Money Claim Validator:**
- Location: `/src/lib/documents/money-claim-validator.ts`
- Validates: Required fields, claim amounts, address/postcode, interest, PAP compliance
- Status: ✅ Well-implemented with detailed error messages

**Required Fields (Money Claim):**
- `landlord_full_name`, `landlord_address`, `tenant_full_name`
- `property_address`, `rent_amount`, `rent_frequency`

**Missing/Weak Validation:**
- ⚠️ No pre-generation validator for Notice Only pack
- ⚠️ No pre-generation validator for Complete Pack
- ⚠️ No pre-generation validator for AST packs

### Type Safety Issues

1. **Jurisdiction type inconsistency:**
   - `Jurisdiction` type in `/src/lib/pricing.ts:17` uses underscores
   - Wizard uses hyphens in URLs and state
   - Pack contents uses hyphens

2. **Product SKU type:**
   - Well-defined in `/src/lib/pricing/products.ts:4-10`
   - Consistent usage across codebase

### Error Handling

- ✅ Try-catch in analytics tracking functions with console.warn fallback
- ✅ Validation errors throw with detailed messages in money-claim-validator
- ⚠️ Limited error boundaries in wizard flow

---

## 4) Test Coverage Review

### Test Inventory

| Category | Test Count | Location |
|----------|------------|----------|
| Pricing Tests | 1 | `/tests/lib/pricing/pricing-consistency.test.ts` |
| Complete Pack Tests | 8+ | `/tests/complete-pack/*.test.ts` |
| Document Tests | 12+ | `/tests/documents/*.test.ts` |
| Integration Tests | 6+ | `/tests/integration/*.test.ts` |
| Wales Tests | 7 | `/tests/lib/wales/*.test.ts` |
| Scotland Tests | 4 | `/tests/lib/scotland/*.test.ts` |
| Wizard Tests | 4+ | `/tests/lib/wizard/*.test.ts` |
| Validation Tests | 10+ | `/tests/lib/validation/*.test.ts`, `/tests/validators/*.test.ts` |
| E2E/Flow Tests | 4 | `/tests/e2e-jurisdiction-flows.test.ts`, `/tests/integration/e2e-generator-parity.test.ts` |

### Coverage Gaps

**Uncovered User Flows:**
1. ❌ No E2E test for Wales Section 173 notice generation
2. ❌ No E2E test for Scotland Notice to Leave generation
3. ❌ No E2E test for Northern Ireland tenancy agreement flow
4. ❌ No E2E test for Premium AST additional documents
5. ❌ No E2E test for Money Claim wizard flow to PDF output

**Uncovered Edge Cases:**
1. ❌ Multi-tenant notice generation
2. ❌ Arrears schedule with 100+ entries
3. ❌ Long property addresses (field overflow)
4. ❌ Special characters in tenant names
5. ❌ Date boundary cases (leap year, notice period spanning DST)

**Missing Region-Product Matrix Tests:**
- ✅ Pricing consistency tests cover availability
- ❌ No wizard flow tests per region-product combination
- ❌ No PDF generation tests per region

### Recommended New Tests

```typescript
// Priority 1: Critical Flow Tests
- tests/e2e/wales-section173-flow.test.ts
- tests/e2e/scotland-notice-to-leave-flow.test.ts
- tests/e2e/money-claim-wizard-to-pdf.test.ts
- tests/e2e/northern-ireland-tenancy-flow.test.ts

// Priority 2: Edge Case Tests
- tests/documents/multi-tenant-notice.test.ts
- tests/documents/large-arrears-schedule.test.ts
- tests/validation/field-overflow.test.ts

// Priority 3: Regression Tests
- tests/regression/pricing-display-consistency.test.ts
- tests/regression/region-gating-ui.test.ts
```

---

## 5) SEO & Keyword Opportunities

### Current SEO Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| Metadata Generation | `/src/lib/seo/metadata.ts` | ✅ Complete |
| Structured Data | `/src/lib/seo/structured-data.tsx` | ✅ Product, FAQ, Breadcrumb schemas |
| Sitemap | `/src/app/sitemap.ts` | ✅ Dynamic generation |
| Internal Links | `/src/lib/seo/internal-links.ts` | ✅ Comprehensive link groups |
| Canonical URLs | `/src/lib/seo/urls.ts` | ✅ Implemented |
| IndexNow | `/src/lib/seo/indexnow.ts` | ✅ Implemented |

### Product & Landing Pages

| Page | Path | Target Keywords |
|------|------|-----------------|
| Notice Only Product | `/products/notice-only` | eviction notice UK, section 21 notice, section 8 notice |
| Complete Pack Product | `/products/complete-pack` | eviction pack, court forms landlord, possession order |
| Money Claim Product | `/products/money-claim` | money claim pack, recover rent arrears, MCOL |
| AST Product | `/products/ast` | tenancy agreement, AST template |
| Section 21 Template | `/section-21-notice-template` | section 21 notice template |
| Section 8 Template | `/section-8-notice-template` | section 8 notice template |
| Eviction Template | `/eviction-notice-template` | eviction notice template UK |
| Wales Eviction | `/wales-eviction-notices` | wales eviction notice, section 173 |
| Scotland Eviction | `/scotland-eviction-notices` | notice to leave scotland, PRT eviction |
| How to Evict | `/how-to-evict-tenant` | how to evict tenant UK |
| Money Claim Guide | `/money-claim-unpaid-rent` | claim unpaid rent, landlord money claim |
| Section 21 Ban | `/section-21-ban` | section 21 ban 2026, renters reform |

### Keyword Gap Analysis

**High-Priority Missing Keywords:**

| Keyword | Search Volume (est.) | Current Ranking | Recommendation |
|---------|---------------------|-----------------|----------------|
| "money claim pack UK" | 500/mo | Not ranking | Create dedicated SEO page |
| "eviction pack download" | 300/mo | Not ranking | Add to Complete Pack page |
| "tenancy agreement UK template" | 2K/mo | Partial | Optimize AST page |
| "section 21 notice UK 2026" | 1K/mo | Ranking | Maintain freshness |
| "tenant won't leave after notice" | 800/mo | Partial | Expand tenant-wont-leave page |
| "ground 8 rent arrears" | 400/mo | Not ranking | Create dedicated blog post |
| "form 6a section 21" | 600/mo | Not ranking | Add to notice-only page |
| "n5 form landlord" | 500/mo | Not ranking | Add to complete-pack page |

**Content Gaps:**
1. No dedicated page for "court fees eviction UK"
2. No page targeting "bailiff eviction process"
3. Limited content on specific eviction grounds (Ground 8, Ground 10, etc.)
4. No comparison page "solicitor vs DIY eviction"

### Pages Not Indexed/Ranking Issues

**Potential Indexing Issues:**
- `/products/money-claim-pack` redirects to `/products/money-claim` - ensure 301
- HMO Pro pages removed - ensure proper 410 responses
- Auth pages correctly marked noindex

---

## 6) Analytics & Tracking Recommendations

### Currently Instrumented Events

**Vercel Analytics** (`/src/lib/analytics/track.ts`):
- `wizard_preview_viewed`
- `checkout_started`
- `payment_success_landed`
- `document_download_clicked`
- `case_archived`
- `free_tool_viewed`
- `validator_completed`
- `upsell_clicked`
- `product_selected`
- `purchase_completed`
- `product_region_blocked`

**Google Analytics / Facebook Pixel** (`/src/lib/analytics.ts`):
- `wizard_entry_view`
- `wizard_start`
- `wizard_step_complete`
- `wizard_review_view`
- `wizard_abandon`
- `wizard_incompatible_choice`
- `ask_heaven_*` events (view, question, answer, CTA)
- `validator_*` events
- Purchase tracking with attribution

### Missing Instrumentation

| Event | Purpose | Priority |
|-------|---------|----------|
| `wizard_error_shown` | Track validation/generation errors | High |
| `pdf_regenerated` | Track regeneration frequency | Medium |
| `email_verification_completed` | User activation tracking | High |
| `support_contact_clicked` | Support demand signal | Low |
| `pricing_page_cta_clicked` | Track which CTA converts | High |
| `blog_to_product_click` | Content attribution | Medium |
| `scroll_depth` | Content engagement | Low |
| `time_on_wizard_step` | Friction identification | Medium |

### Funnel Instrumentation Gaps

**Current Funnel Coverage:**
```
Landing → wizard_entry_view → wizard_start → wizard_step_complete →
wizard_review_view → checkout_started → payment_success_landed →
document_download_clicked
```

**Missing Funnel Points:**
1. ❌ Time between steps (latency tracking)
2. ❌ Specific field completion in wizard
3. ❌ Preview interaction (zoom, scroll)
4. ❌ Return visitor tracking

### Recommended Additional Events

```typescript
// Funnel dropoff analysis
trackEvent('wizard_step_abandoned', { step, time_spent });
trackEvent('checkout_abandoned', { step, cart_value });

// Regional demand signals
trackEvent('region_selected', { region, product, source });
trackEvent('unavailable_product_viewed', { product, region });

// Content engagement
trackEvent('faq_expanded', { question, page });
trackEvent('related_link_clicked', { from_page, to_page });
```

---

## 7) UI/UX Copy & Messaging Notes

### Price Display Consistency

| Location | Current Copy | Issue | Recommendation |
|----------|-------------|-------|----------------|
| Wizard page | "From £39.99" | Hardcoded | Use dynamic import |
| Internal links | "£39.99", "£149.99" in descriptions | Hardcoded | Use template |
| Pricing table | Uses PRODUCTS correctly | ✅ Good | - |
| Product pages | Uses PRODUCTS correctly | ✅ Good | - |

### Regional Availability Messaging

**Current Implementation:**
- Complete Pack and Money Claim show "England only" badge ✅
- NI users see auto-switch message when selecting unavailable products ✅
- Wales/Scotland users see filtered product list

**Recommendations:**
1. Add explicit "Not available in [region]" messaging for greyed-out products
2. Show alternative product suggestions inline (e.g., "Try Notice Only instead")
3. Add FAQ entry explaining regional limitations

### USP Messaging Audit

**Current USPs (from product pages):**
- "Preview before you buy"
- "Edit & regenerate (unlimited)"
- "Portal storage (12+ months)"
- "Court-ready documents"
- "Save 80%+ vs solicitors"

**Missing USPs to highlight:**
1. "Official government forms" - mentioned in FAQ but not hero
2. "AI-drafted witness statements" - undersold on Complete Pack
3. "PAP-DEBT compliant" - technical but important for Money Claim
4. "Jurisdiction-specific" - differentiation from generic templates

### Stale/Ambiguous Copy

| Location | Issue | Fix |
|----------|-------|-----|
| Pricing FAQ | "HMO Pro" references removed but double-check | Verify complete |
| Complete Pack | Says "7-9 documents" - clarify when 7 vs 9 | Add conditional logic |
| Money Claim | "England only" in multiple places | Consistent placement |
| Section 21 Ban page | Check date references for May 2026 | Update as needed |

---

## 8) High-Impact Action Plan

### Immediate Priority (Week 1-2)

| Action | Impact | Effort | Files |
|--------|--------|--------|-------|
| Fix hardcoded prices in wizard | Prevents pricing bugs | Low | `/src/app/wizard/page.tsx` |
| Fix hardcoded prices in internal links | Consistency | Low | `/src/lib/seo/internal-links.ts` |
| Add E2E test for Wales Section 173 | Quality | Medium | Create new test |
| Add E2E test for Scotland Notice to Leave | Quality | Medium | Create new test |
| Add `wizard_error_shown` analytics event | Debugging | Low | `/src/lib/analytics/track.ts` |

### Short-Term Priority (Week 3-4)

| Action | Impact | Effort | Notes |
|--------|--------|--------|-------|
| Create pre-generation validators for all packs | Reduce support tickets | Medium | Follow money-claim-validator pattern |
| Add "ground 8 rent arrears" blog post | SEO traffic | Medium | Target high-volume keyword |
| Add "n5 form landlord" content to Complete Pack page | SEO traffic | Low | Keyword optimization |
| Normalize jurisdiction string format | Code quality | Medium | Pick hyphen or underscore |
| Add pricing_page_cta_clicked analytics | Conversion insight | Low | New event |

### Medium-Term Priority (Month 2)

| Action | Impact | Effort | Notes |
|--------|--------|--------|-------|
| Create Money Claim for Wales (Simple Procedure) | Revenue expansion | High | New product |
| Add Scotland Complete Pack (Tribunal forms) | Revenue expansion | High | New product |
| Create dedicated SEO pages for top keyword gaps | Traffic growth | Medium | 3-5 new pages |
| Implement time-on-step analytics | Friction ID | Medium | New tracking |
| Bundle pricing experiment (Notice + Money Claim) | Revenue | Medium | A/B test infrastructure |

### Long-Term Considerations

1. **Product Expansion:**
   - Consider generic "Debt Claim Pack" beyond landlord-tenant
   - Northern Ireland eviction (requires legal research)
   - Commercial lease eviction

2. **Pricing Strategy:**
   - Bundle discounts (Notice + Complete = £160 vs £190)
   - Regional pricing tests
   - Annual subscription for portfolio landlords

3. **SEO Authority Building:**
   - Expert contributor program
   - Court fee calculator tool
   - Eviction timeline interactive tool

---

## Summary

### Strengths
- ✅ Well-structured product configuration with single source of truth
- ✅ Comprehensive pricing consistency tests
- ✅ Strong SEO infrastructure (metadata, structured data, sitemap)
- ✅ Good analytics foundation with GA4, Facebook, Vercel
- ✅ Proper region gating in UI and API
- ✅ Extensive test coverage for document generation

### Areas for Improvement
- ⚠️ Hardcoded prices in wizard and internal links
- ⚠️ Jurisdiction string format inconsistency
- ⚠️ Missing E2E tests for Wales and Scotland flows
- ⚠️ No pre-generation validators for Notice Only, Complete Pack, AST
- ⚠️ Several SEO keyword gaps (court forms, specific grounds)
- ⚠️ Missing analytics events for error states and funnel timing

### Risk Areas
- 🔴 Pricing mismatches could cause checkout failures
- 🔴 Jurisdiction bugs could generate invalid documents
- 🔴 Missing validation could produce incomplete packs

---

*Report generated by Claude Code audit workflow*
