# Product Flows Implementation Status Report
**Date:** 2025-11-29
**Repository:** landlord-heavenv3
**Branch:** claude/review-product-flows-016NwxaCAgpWJthNzyWE3Bj3

## Executive Summary

| Product Flow | Overall Status | MQS Config | Document Generation | Wizard Integration | Blocking Issues |
|--------------|----------------|------------|---------------------|-------------------|-----------------|
| **Notice Only** | ✅ Complete | ✅ E&W + Scotland | ✅ Complete | ✅ Working | None |
| **Complete Eviction Pack** | ✅ Complete (E&W)<br>⚠️ Partial (Scotland) | ✅ E&W<br>❌ Scotland | ✅ Both jurisdictions | ✅ Working | Scotland MQS missing |
| **Money Claims** | ⚠️ Backend Only | ❌ Missing both | ✅ Both jurisdictions | ❌ Blocked | **CRITICAL: No MQS configs** |
| **HMO Pro** | ✅ Core Complete | N/A | N/A | N/A | Enhancement opportunities |

---

## A) Notices Only (Section 8, Section 21, Scotland Notices)

### ✅ What's Implemented and Working

**MQS Configuration:**
- `/config/mqs/notice_only/england-wales.yaml` - Complete questionnaire for:
  - Section 8 notices (all 17 grounds including 14A)
  - Section 21 notices (Form 6A)
  - Landlord/tenant/property details
  - Rent arrears tracking

- `/config/mqs/notice_only/scotland.yaml` - Complete questionnaire for:
  - Private Residential Tenancy (PRT) Notice to Leave
  - Case overview and tenancy details
  - Rent arrears and pre-action requirements
  - Deposit protection, safety checks, ASB tracking
  - Notice service details

**Document Generators:**
- `/src/lib/documents/section8-generator.ts` - Fully functional
  - Supports all 17 grounds with ground-specific data collection
  - Arrears breakdowns, breach details, ASB incident tracking

- `/src/lib/documents/scotland/notice-to-leave-generator.ts` - Fully functional
  - Complete Notice to Leave generation for Scotland PRT

**Templates:**
- England & Wales:
  - `section8_notice.hbs`
  - `section21_form6a.hbs`
- Scotland:
  - `notice_to_leave.hbs`

**API Integration:**
- Wizard start endpoint supports `product: 'notice_only'`
- Full wizard flow (start → answer → next-question → analyze) working
- Document generation via `/api/documents/generate`

**Product Page:**
- `/src/app/products/notice-only/page.tsx` - Live and functional
- Pricing: £29.99 one-time (configured in `/src/config/pricing.ts`)
- Coverage: England & Wales, Scotland

### Status: ✅ **FULLY OPERATIONAL**

No gaps, no blockers. This product is production-ready and follows the complete wizard → WizardFacts → CaseFacts → validation → document generation pattern.

---

## B) Eviction Packs / Complete Packs

### ✅ What's Implemented and Working

**MQS Configuration (England & Wales):**
- `/config/mqs/complete_pack/england-wales.yaml` - Comprehensive 944-line questionnaire
  - Case overview
  - Landlord, tenant, and solicitor details
  - Property and tenancy information
  - Rent and deposit details
  - Section 21 validity checks (deposit protection, compliance)
  - Eviction route selection (Section 8/21)
  - Detailed arrears summary and schedule
  - Section 8 grounds (8, 10, 11, 12, 13, 14, 14A, 15, 17) with ground-specific questions
  - Attempts to resolve
  - Previous proceedings
  - Court route and fees
  - Notice details
  - Particulars of claim
  - Evidence uploads
  - Service contact information
  - Statement of truth

**Document Generators:**
- `/src/lib/documents/eviction-pack-generator.ts` - Complete for both jurisdictions

**England & Wales Bundle Includes:**
- Section 8 Notice
- Section 21 Notice (Form 6A)
- N5 Claim Form (official PDF fill)
- N5B Claim Form (accelerated possession)
- N119 Particulars of Claim (official PDF fill)
- Eviction roadmap
- Expert guidance document
- Timeline expectations
- Evidence checklist
- Proof of service templates

**Scotland Bundle Includes:**
- Notice to Leave (official PDF fill)
- Tribunal Form E (official PDF fill)
- Eviction roadmap
- Expert guidance
- Evidence tools

**Templates:**
- England & Wales: `/config/jurisdictions/uk/england-wales/templates/eviction/`
  - All notice templates
  - All court form templates
  - Guidance and roadmap templates

- Scotland: `/config/jurisdictions/uk/scotland/templates/`
  - Notice and tribunal templates
  - Guidance templates

**API Integration:**
- Wizard start supports `product: 'complete_pack'`
- Full England & Wales wizard flow operational

**Product Page:**
- `/src/app/products/complete-pack/page.tsx` - Live
- Pricing: £149.99 one-time
- Coverage: England & Wales, Scotland, Northern Ireland (gated)

### ⚠️ What's Partially Implemented

**Scotland MQS:**
- `/config/mqs/complete_pack/scotland.yaml` - **Does not exist**
- Document generators are fully functional for Scotland
- Can use `notice_only` Scotland MQS as fallback
- Wizard UX is degraded without dedicated complete_pack MQS

**Northern Ireland:**
- No specific MQS or templates
- Currently gated (only tenancy agreements supported)

### Status: ✅ **FULLY OPERATIONAL (England & Wales)**
### Status: ⚠️ **BACKEND COMPLETE, WIZARD INCOMPLETE (Scotland)**

**England & Wales:** Production-ready with complete wizard flow.
**Scotland:** Can generate documents but wizard experience is suboptimal without dedicated MQS.

---

## C) Money Claims

### ✅ What's Implemented and Working

**Document Generators:**

**England & Wales** (`/src/lib/documents/money-claim-pack-generator.ts`):
- Complete bundle generation including:
  - Pack cover/summary
  - Particulars of claim
  - Schedule of arrears
  - Interest calculation (Section 69 County Courts Act)
  - Evidence index
  - Official N1 claim form (PDF fill)
- Automatic court fee calculation
- Interest calculations
- Totals computation

**Scotland** (`/src/lib/documents/scotland-money-claim-pack-generator.ts`):
- Simple Procedure claim bundle:
  - Pack cover
  - Particulars of claim (Simple Procedure format)
  - Schedule of arrears
  - Interest calculation
  - Evidence index
  - Official Simple Procedure claim form (PDF fill)
- Scotland-specific court fees (£21-£145 based on claim amount)
- £5,000 Simple Procedure limit validation

**Templates:**
- England & Wales: `/config/jurisdictions/uk/england-wales/templates/money_claims/`
  - `pack_cover.hbs`
  - `particulars_of_claim.hbs`
  - `schedule_of_arrears.hbs`
  - `interest_workings.hbs`
  - `evidence_index.hbs`
  - `n1_claim.hbs`

- Scotland: `/config/jurisdictions/uk/scotland/templates/money_claims/`
  - `pack_cover.hbs`
  - `simple_procedure_particulars.hbs`
  - `schedule_of_arrears.hbs`
  - `interest_calculation.hbs`
  - `evidence_index.hbs`

**Official Forms Fillers:**
- `/src/lib/documents/official-forms-filler.ts` - N1 form filling working
- `/src/lib/documents/scotland-forms-filler.ts` - Simple Procedure form filling working

**API Routes:**
- `/api/wizard/start` accepts `product: 'money_claim'`
- Product type recognized in routing
- Northern Ireland gating in place

**Product Page:**
- `/src/app/products/money-claim/page.tsx` - Live
- Pricing: £129.99 one-time
- Coverage: England & Wales (Scotland noted "coming soon" but actually implemented!)
- Features listed:
  - Official Form N1 (Dec 2024)
  - Particulars of Claim
  - Interest Calculation
  - Evidence Index
  - Schedule of Arrears

**Database Schema:**
- `case_type: 'money_claim'` supported
- `product_type: 'money_claim'` in orders table

**Tests:**
- `/tests/documents/money-claim-pack.test.ts` - exists
- `/tests/documents/scotland-money-claim-pack.test.ts` - exists
- `/tests/api/wizard-money-claim-access.test.ts` - access control tests passing

**Test Scripts:**
- `/scripts/generate-sample-n1.ts` - working sample N1 generator

### ❌ What's Missing Entirely

**MQS Configuration - CRITICAL BLOCKER:**
- `/config/mqs/money_claim/england-wales.yaml` - **Does not exist**
- `/config/mqs/money_claim/scotland.yaml` - **Does not exist**
- `/config/mqs/money_claim/` directory doesn't exist at all

**Impact:**
When users try to start a money claim wizard, the API returns:
```json
{ "error": "MQS not implemented for this jurisdiction yet" }
```

Users cannot complete the wizard flow to collect the data needed for document generation.

### Status: ⚠️ **BACKEND 100% COMPLETE, WIZARD 0% COMPLETE**

**Critical Gap:** The entire document generation pipeline, templates, official forms, and product page are production-ready. However, users cannot access any of it because there's no MQS questionnaire to collect their data through the wizard.

**What the MQS Should Collect:**
- Claimant (landlord) details
- Defendant (tenant) details
- Property address
- Tenancy details (rent amount, frequency, start date)
- Arrears breakdown (periods owed, amounts per period)
- Damage or other charges (if applicable)
- Interest preferences
- Court selection
- Attempts to resolve the dispute
- Evidence summary
- Statement of truth details

---

## D) HMO Pro

### ✅ What's Implemented and Working

**Note:** HMO Pro is a different type of product - it's a subscription-based property management tool, not a document generation wizard flow.

**Database Schema:**

`hmo_properties` table:
- Property details (name, address, council code)
- License information (number, expiry date)
- Fire safety tracking:
  - Fire alarms
  - CO alarms
  - Emergency lighting
  - Fire doors
- Capacity details:
  - Number of bedrooms
  - Maximum occupancy
  - Bathrooms and kitchens

`hmo_tenants` table:
- Tenant details (full name, property link)
- Tenancy status tracking
- Financial data (monthly rent, deposit amount)
- Dates (move-in, move-out, notice given)

`hmo_compliance_items` table:
- Compliance tracking infrastructure

`users` table extensions:
- `hmo_pro_active: boolean`
- `hmo_pro_tier: text`

**API Routes (All Functional):**
- `/api/hmo/properties/` - GET (list), POST (create)
- `/api/hmo/properties/[id]/` - GET, PATCH, DELETE
- `/api/hmo/tenants/` - GET (list), POST (create)
- `/api/hmo/tenants/[id]/` - GET, PATCH, DELETE
- `/api/hmo/stats/` - GET aggregate statistics
  - Total properties, bedrooms, tenants, vacancies
  - Occupancy rate calculations
  - Financial summaries (total rent, deposits, averages)
  - Compliance status (fire alarms, CO alarms, emergency lighting, fire doors)
  - License tracking (total licensed, expiring soon)
  - Tenancy status breakdown
  - Recent activity

All routes include access control checking `hmo_pro_active` flag.

**Dashboard Pages:**
- `/src/app/dashboard/hmo/page.tsx` - Main HMO dashboard
- `/src/app/dashboard/hmo/properties/page.tsx` - Properties list
- `/src/app/dashboard/hmo/properties/new/page.tsx` - Add new property
- `/src/app/dashboard/hmo/properties/[id]/page.tsx` - Property details
- `/src/app/dashboard/hmo/tenants/page.tsx` - Tenants list
- `/src/app/dashboard/hmo/tenants/new/page.tsx` - Add new tenant

**Product Page:**
- `/src/app/hmo-pro/page.tsx` - Live and functional
- Features showcase:
  - License tracking
  - Fire safety management
  - Gas & electrical certificates
  - Council inspections
  - Tenant & room management
  - Document storage
- Pricing: "Starting at £19.99/month"

**Pricing Model:**
Tiered subscription in `/src/config/pricing.ts`:
```
TIER_1: 1-5 HMOs   → £19.99/month
TIER_2: 6-10 HMOs  → £24.99/month
TIER_3: 11-15 HMOs → £29.99/month
TIER_4: 16-20 HMOs → £34.99/month
Formula: +£5 per 5 HMOs after tier 4
```

Helper functions available:
- `calculateHMOProPrice(propertyCount)`
- `getHMOProTier(propertyCount)`

**Stripe Integration:**
- Product ID: `'hmo_pro'` configured
- Checkout support in `/api/checkout/subscription/route.ts`
- Webhook handling in `/api/webhooks/stripe/route.ts`
- Subscription management operational

**Utilities:**
- `/src/lib/utils/hmo-detection.ts` - HMO detection logic

### ⚠️ Enhancement Opportunities (Not Blocking)

**Compliance Reminders:**
- Infrastructure exists but automated reminder system not implemented
- "SMS reminders coming soon" noted on product page

**Document Storage:**
- Supabase Storage infrastructure exists
- HMO-specific document upload/organization UI not implemented
- Can store documents but no dedicated HMO document management interface

**Council Data Integration:**
- Council codes referenced in properties table
- `/scripts/councils-data.ts` has council data structure
- Council-specific licensing rules not automated
- Manual entry required for license requirements

### Status: ✅ **CORE FEATURES FULLY OPERATIONAL**

All essential property and tenant management features are working. The product is production-ready for core use cases. Enhancements around compliance automation and document management are nice-to-haves, not blockers.

---

## File Paths Reference

### MQS Configs
```
config/mqs/notice_only/england-wales.yaml          ✅ EXISTS
config/mqs/notice_only/scotland.yaml               ✅ EXISTS
config/mqs/complete_pack/england-wales.yaml        ✅ EXISTS
config/mqs/complete_pack/scotland.yaml             ❌ MISSING
config/mqs/money_claim/england-wales.yaml          ❌ MISSING
config/mqs/money_claim/scotland.yaml               ❌ MISSING
config/mqs/tenancy_agreement/england-wales.yaml    ✅ EXISTS
config/mqs/tenancy_agreement/scotland.yaml         ✅ EXISTS
```

### Document Generators
```
src/lib/documents/section8-generator.ts                          ✅
src/lib/documents/eviction-pack-generator.ts                     ✅
src/lib/documents/money-claim-pack-generator.ts                  ✅
src/lib/documents/scotland-money-claim-pack-generator.ts         ✅
src/lib/documents/scotland/notice-to-leave-generator.ts          ✅
src/lib/documents/official-forms-filler.ts                       ✅
src/lib/documents/scotland-forms-filler.ts                       ✅
```

### Product Pages
```
src/app/products/notice-only/page.tsx              ✅
src/app/products/complete-pack/page.tsx            ✅
src/app/products/money-claim/page.tsx              ✅
src/app/hmo-pro/page.tsx                           ✅
```

### Templates
```
config/jurisdictions/uk/england-wales/templates/eviction/        ✅
config/jurisdictions/uk/england-wales/templates/money_claims/    ✅
config/jurisdictions/uk/scotland/templates/                      ✅
```

---

## Prioritized Recommendations

### Priority 1: Money Claims MQS (CRITICAL - Blocks Entire Product)

**Problem:** Money claims product has a complete backend but is completely inaccessible to users due to missing MQS configs.

**Impact:** High - Product page exists, pricing is set, all infrastructure is ready, but users hit an error immediately when trying to start.

**Effort:** Medium - Need to create two MQS YAML files (England & Wales and Scotland).

**Files to Create:**
1. `/config/mqs/money_claim/england-wales.yaml`
2. `/config/mqs/money_claim/scotland.yaml`

**Required MQS Sections:**
- Claimant details (landlord/agent)
- Defendant details (tenant)
- Property information
- Tenancy details (rent amount, frequency, start date, end date)
- Arrears breakdown:
  - Period from/to
  - Amount owed per period
  - Running total
- Additional charges (damage, legal costs, etc.)
- Interest preferences:
  - Claim interest? (yes/no)
  - Interest rate (8% statutory or contractual)
  - Start date for interest
- Court selection (county court location)
- Attempts to resolve:
  - Letters/emails sent
  - Dates of contact
  - Responses received
- Evidence summary
- Statement of truth

**Deliverable:** After MQS creation, money claims will be immediately operational with zero additional backend work required.

---

### Priority 2: Complete Pack Scotland MQS (Medium Priority - Degrades UX)

**Problem:** Scotland complete pack can generate documents but has no dedicated wizard flow.

**Impact:** Medium - Users can technically get eviction documents through the notice_only flow, but it's a poor experience. Document generators are ready but underutilized.

**Effort:** Medium-High - Scotland eviction process is different from England & Wales, requires understanding tribunal vs. court process.

**File to Create:**
`/config/mqs/complete_pack/scotland.yaml`

**Required MQS Sections (Scotland-specific):**
- Case overview
- Landlord details (including landlord registration number)
- Tenant details
- Property details
- Private Residential Tenancy (PRT) details
- Notice to Leave details
- Grounds for eviction (Scotland has different grounds system)
- Tribunal application details (not court like E&W)
- Rent arrears (if applicable)
- Pre-action requirements (mandatory in Scotland)
- Evidence for tribunal
- Service details

**Reference:** Can use existing England & Wales complete_pack MQS as template but must adapt for:
- Tribunal system (not county court)
- Different grounds structure
- Different notice requirements
- Pre-action protocol requirements

---

### Priority 3: HMO Pro Enhancements (Low Priority - Nice to Have)

**Status:** Core product is working. These are value-adds.

**Enhancement 1: Compliance Reminder System**
- **Effort:** Medium
- **Impact:** High value for users
- **Requirements:**
  - Automated email/SMS reminders for:
    - License renewals (30/60/90 days before expiry)
    - Gas safety certificate expiry
    - Electrical safety certificate expiry
    - Fire alarm testing schedules
    - Council inspection dates
  - User preference settings for reminder frequency
  - Notification delivery system (email via Resend, SMS via Twilio)

**Enhancement 2: HMO Document Management**
- **Effort:** Medium
- **Impact:** Medium value
- **Requirements:**
  - Document upload interface per property
  - Document categories:
    - Licenses
    - Safety certificates (gas, electrical, fire)
    - Floor plans
    - Inspection reports
    - Correspondence
  - Document expiry tracking
  - Integration with existing Supabase Storage
  - Document preview/download

**Enhancement 3: Council Rule Automation**
- **Effort:** High
- **Impact:** Medium value
- **Requirements:**
  - Council-specific licensing requirement rules
  - Automated eligibility checking based on:
    - Property location (council area)
    - Number of occupants
    - Number of households
    - Number of stories
  - License requirement alerts
  - Council contact information auto-population

---

## Implementation Order Recommendation

Based on **code completeness**, **user impact**, and **effort required**:

### 1. 🔴 IMMEDIATE: Money Claims MQS
- **Why First:** Backend is 100% complete, just needs MQS to unlock entire product
- **Effort:** ~2-3 days to write comprehensive MQS YAML files
- **ROI:** Highest - unlocks entire £129.99 product immediately
- **Dependencies:** None
- **Deliverable:** Two YAML files

**Steps to Complete:**
1. Create `/config/mqs/money_claim/england-wales.yaml`
2. Create `/config/mqs/money_claim/scotland.yaml`
3. Test wizard flow end-to-end
4. Verify document generation from wizard data
5. Test N1 form filling with real wizard data
6. Update product page if needed (currently says Scotland "coming soon" but it's actually ready)

---

### 2. 🟡 MEDIUM PRIORITY: Scotland Complete Pack MQS
- **Why Second:** Document generators ready, just needs better wizard UX
- **Effort:** ~3-4 days (requires Scotland tribunal process research)
- **ROI:** Medium - enhances existing partially-working product
- **Dependencies:** None
- **Deliverable:** One YAML file

**Steps to Complete:**
1. Research Scotland tribunal eviction process thoroughly
2. Map grounds for eviction (Scotland uses different system than E&W)
3. Create `/config/mqs/complete_pack/scotland.yaml` based on tribunal requirements
4. Map pre-action protocol steps into wizard
5. Test with Scotland document generators
6. Verify Tribunal Form E filling

---

### 3. 🟢 LOW PRIORITY: HMO Pro Enhancements
- **Why Third:** Core product already working, these are value-adds
- **Effort:** Variable (2-5 days per enhancement)
- **ROI:** Enhances retention, not acquisition
- **Dependencies:** Third-party services (email/SMS providers)

**Steps for Compliance Reminders:**
1. Design reminder scheduling system
2. Create database tables for reminder preferences
3. Build cron job or scheduled task system
4. Integrate email service (Resend)
5. Integrate SMS service (Twilio) - optional
6. Build user preferences UI
7. Test reminder delivery

**Steps for Document Management:**
1. Design document upload UI
2. Create document metadata tables
3. Implement upload to Supabase Storage
4. Build document listing/preview UI
5. Add expiry tracking logic
6. Create document category management

---

## Summary

### What's Production-Ready Today:
- ✅ **Notice Only** - Fully operational for E&W and Scotland
- ✅ **Complete Pack** - Fully operational for England & Wales
- ✅ **HMO Pro** - Core features fully operational

### What's One MQS File Away from Launch:
- ⚠️ **Money Claims** - All backend infrastructure complete, just needs MQS

### What Needs Research + Development:
- ⚠️ **Complete Pack (Scotland)** - Generators ready, needs Scotland-specific MQS

### What's Enhanced Later:
- 🔧 **HMO Pro** - Additional features for compliance automation and document management

---

## Technical Debt & TODOs Found

### Scotland-Specific Field Mappings
Multiple TODO comments in `/src/lib/documents/scotland/*.ts` files indicate fields that need to be added to the CaseFacts schema:
- `landlord_reg_number`
- `council_phone`
- `agreement_date`
- `dob`
- Other Scotland-specific fields

**Impact:** Medium - Scotland documents may not be utilizing all available fields

**Recommendation:** Audit CaseFacts schema and add Scotland-specific fields

### Case Facts Normalization
`/src/lib/case-facts/normalize.ts` has TODOs for detailed mappings:
- Arrears items (line 171)
- ASB incidents (line 178)
- Notice details (line 190)
- Court details (line 205)
- Evidence fields (line 222)
- Service contact details (line 236)

**Impact:** Low-Medium - Affects data transformation quality

**Recommendation:** Complete these mappings during next CaseFacts refactor

---

## Conclusion

The codebase demonstrates **excellent maturity** in document generation infrastructure. The pattern of MQS → WizardFacts → CaseFacts → document generation is well-established and reusable.

**Key Finding:** Money claims is the **fastest win** - it has the most complete backend with the smallest gap (just MQS config files).

**Strategic Recommendation:**
1. Ship money claims ASAP (highest ROI for effort)
2. Complete Scotland complete pack for market coverage
3. Enhance HMO Pro over time based on user feedback

All products follow or can easily follow the same proven pattern established by the AST tenancy agreement flow.
