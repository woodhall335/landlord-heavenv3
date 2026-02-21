# Current State Snapshot Report

**Generated:** 2026-01-09
**Purpose:** Revenue projections (30-day and 12-month) and Stripe pricing integrity verification

---

## Executive Summary

### Critical Issues Found

| Priority | Issue | Impact |
|----------|-------|--------|
| **P0** | Checkout prices mismatch display prices | Customers shown £39.99, charged £29.99 |
| **P1** | Stripe env price IDs not used in checkout | Using `price_data` instead of `priceId` |
| **P2** | No runtime price validation | No safeguard against price mismatches |

---

## Part A: Product Prices (Source of Truth)

**File:** `src/lib/pricing/products.ts`

### Confirmed Pricing Table

| Product Key | Display Name | Expected Price | Actual in products.ts | Status |
|-------------|--------------|----------------|----------------------|--------|
| `notice_only` | Eviction Notice Pack | £39.99 | £39.99 | ✅ Confirmed |
| `complete_pack` | Complete Eviction Pack | £199.99 | £199.99 | ✅ Confirmed |
| `money_claim` | Money Claim Pack | £199.99 | £199.99 | ✅ Confirmed |
| `sc_money_claim` | Scotland Money Claim Pack | N/A | £199.99 | ✅ (Variant) |
| `ast_standard` | Standard Tenancy Agreement | £9.99 | £9.99 | ✅ Confirmed |
| `ast_premium` | Premium Tenancy Agreement | £14.99 | £14.99 | ✅ Confirmed |

### Jurisdiction Variants

| Product | Jurisdictions Supported |
|---------|------------------------|
| `notice_only` | England, Wales, Scotland |
| `complete_pack` | England, Wales, Scotland |
| `money_claim` | England, Wales |
| `sc_money_claim` | Scotland only |
| `ast_standard` / `ast_premium` | England, Wales, Scotland, Northern Ireland |

---

## Part B: Stripe Price Integrity Check

### CRITICAL: Price Mismatch Detected

**Location:** `src/app/api/checkout/create/route.ts:20-27`

The checkout API uses **hardcoded `price_data`** instead of Stripe price IDs. The hardcoded amounts **do not match** the display prices.

| Product | Display Price (products.ts) | Checkout Amount (route.ts) | Difference |
|---------|----------------------------|---------------------------|------------|
| `notice_only` | £39.99 | £29.99 (2999 pence) | **-£10.00** |
| `complete_pack` | £199.99 | £149.99 (14999 pence) | **-£50.00** |
| `money_claim` | £199.99 | £179.99 (17999 pence) | **-£20.00** |
| `sc_money_claim` | £199.99 | £179.99 (17999 pence) | **-£20.00** |
| `ast_standard` | £9.99 | £9.99 (999 pence) | ✅ Match |
| `ast_premium` | £14.99 | £14.99 (1499 pence) | ✅ Match |

### Stripe Environment Variables

**File:** `.env.example:55-72`

```env
# Required Stripe Price IDs (one-time products)
STRIPE_PRICE_ID_NOTICE_ONLY="price_..."      # Comment says £29.99 (OUTDATED)
STRIPE_PRICE_ID_EVICTION_PACK="price_..."    # Comment says £149.99 (OUTDATED)
STRIPE_PRICE_ID_MONEY_CLAIM="price_..."      # Comment says £179.99 (OUTDATED)
STRIPE_PRICE_ID_STANDARD_AST="price_..."     # £9.99
STRIPE_PRICE_ID_PREMIUM_AST="price_..."      # £14.99
```

### How Stripe is Currently Used

**File:** `src/lib/stripe/index.ts`

Defines `PRICE_IDS` from environment variables:
- `PRICE_IDS.NOTICE_ONLY`
- `PRICE_IDS.EVICTION_PACK`
- `PRICE_IDS.MONEY_CLAIM`
- `PRICE_IDS.STANDARD_AST`
- `PRICE_IDS.PREMIUM_AST`

**BUT** the main checkout (`/api/checkout/create`) does NOT use these. It uses `price_data` with hardcoded amounts.

### Recommended Fix

1. **Update checkout/create/route.ts** to use `PRICE_IDS` from stripe lib
2. **Create Stripe products** with correct prices (£39.99, £199.99, etc.)
3. **Add runtime validation** (see below)

### Suggested Runtime Validation

Add to `src/lib/stripe/validate-prices.ts`:

```typescript
// Dev-only startup validation
export async function validateStripePrices() {
  if (process.env.NODE_ENV !== 'development') return;

  const expected = {
    notice_only: 3999,      // £39.99
    complete_pack: 19999,   // £199.99
    money_claim: 19999,     // £199.99
    ast_standard: 999,      // £9.99
    ast_premium: 1499,      // £14.99
  };

  for (const [key, expectedAmount] of Object.entries(expected)) {
    const priceId = PRICE_IDS[key];
    if (!priceId) {
      console.warn(`[Stripe Validation] Missing price ID for ${key}`);
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(priceId);
      if (price.unit_amount !== expectedAmount) {
        console.error(
          `[Stripe Validation] Price mismatch for ${key}: ` +
          `expected ${expectedAmount}, got ${price.unit_amount}`
        );
      }
    } catch (err) {
      console.warn(`[Stripe Validation] Could not retrieve price for ${key}`);
    }
  }
}
```

---

## Part C: Funnel Events & Tracking Inventory

### Analytics Infrastructure

**File:** `src/lib/analytics.ts`
**Tracking Pixels:** `src/components/analytics/TrackingPixels.tsx`

| Platform | Environment Variable | Purpose |
|----------|---------------------|---------|
| Google Analytics 4 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Web analytics |
| Google Ads | `NEXT_PUBLIC_GOOGLE_ADS_ID` | Conversion tracking |
| Facebook Pixel | `NEXT_PUBLIC_FB_PIXEL_ID` | Retargeting & conversions |

### Current Events Tracked

#### Wizard Funnel Events

| Event Name | Where Fired | Properties |
|------------|-------------|------------|
| `wizard_entry_view` | `/wizard` page mount | product, jurisdiction, src, topic, utm_* |
| `wizard_start` | `/wizard/flow` mount | product, jurisdiction, src, topic, utm_* |
| `wizard_step_complete` | Each section complete | product, jurisdiction, step_name, step_index |
| `wizard_review_view` | `/wizard/review` mount | product, jurisdiction, has_blockers, has_warnings |
| `wizard_abandon` | Page unload/visibility change | product, jurisdiction, last_step |

#### Checkout & Purchase Events

| Event Name | Where Fired | Properties |
|------------|-------------|------------|
| `begin_checkout` | Checkout initiated | product, value, currency |
| `purchase` | Stripe webhook (server-side) | transaction_id, value, items |
| `add_to_cart` | Wizard start (intent signal) | product, value |

#### Validator Events (Free Tools)

| Event Name | Where Fired | Properties |
|------------|-------------|------------|
| `validator_view` | Validator page mount | validator_type, jurisdiction |
| `validator_upload` | Document uploaded | validator_type, document_type |
| `validator_result` | Validation complete | validator_type, status, blocker_count, warning_count |
| `validator_cta_click` | CTA clicked | validator_type, cta_type, product_slug |
| `validator_report_requested` | Email capture for report | validator_type |

#### Ask Heaven Events

| Event Name | Where Fired | Properties |
|------------|-------------|------------|
| `ask_heaven_view` | Ask Heaven page mount | src, topic, question_count |
| `ask_heaven_question_submitted` | Question sent | question_count, topic |
| `ask_heaven_answer_received` | Answer displayed | suggested_product, suggested_next_step |
| `ask_heaven_cta_click` | CTA clicked | cta_type, target_url |
| `ask_heaven_email_capture` | Email gate submitted | src, topic, question_count |

#### Lead Capture Events

| Event Name | Where Fired | Properties |
|------------|-------------|------------|
| `generate_lead` | Email captured | source |
| `Lead` (FB Pixel) | Email captured | content_name, content_category |

### Metrics We Can Calculate Today

| Metric | Formula | Data Source |
|--------|---------|-------------|
| Click → Wizard Rate | `wizard_entry_view / page_view` | GA4 |
| Wizard Start Rate | `wizard_start / wizard_entry_view` | GA4 |
| Wizard Completion Rate | `wizard_review_view / wizard_start` | GA4 |
| Checkout Conversion Rate | `purchase / begin_checkout` | GA4 |
| AOV | `SUM(value) / COUNT(purchase)` | GA4 / DB |
| Product Mix | `COUNT by product_type` | DB orders table |

### Gaps & Recommendations

| Missing Event | Purpose | Recommendation |
|--------------|---------|----------------|
| `checkout_started` (distinct from `begin_checkout`) | Track Stripe redirect | Add before `stripe.checkout.sessions.create` |
| `checkout_completed` (client-side) | Confirm on success page | Fire on `/dashboard?session_id=` |
| `jurisdiction_selected` | Track jurisdiction preference | Fire in wizard selection |
| `route_recommended` | Track AI recommendations | Fire after decision engine |

---

## Part D: SEO Entrypoints (Money Pages)

### Product Pages (Direct Purchase Intent)

| Route | Product | CTA Uses buildWizardLink |
|-------|---------|-------------------------|
| `/products/notice-only` | Notice Only | ✅ Yes |
| `/products/complete-pack` | Complete Pack | ✅ Yes |
| `/products/money-claim` | Money Claim | ✅ Yes |
| `/products/ast` | AST Standard/Premium | ✅ Yes |

### Template Pages (High SEO Value)

| Route | Target Keyword | CTA Destination |
|-------|---------------|-----------------|
| `/section-21-notice-template` | "section 21 notice template" | `/wizard?product=notice_only&jurisdiction=england&src=template&topic=eviction` |
| `/section-8-notice-template` | "section 8 notice template" | `/wizard?product=notice_only&src=template` |
| `/eviction-notice-template` | "eviction notice template" | `/wizard?product=notice_only&src=template` |
| `/rent-arrears-letter-template` | "rent arrears letter template" | `/wizard?product=notice_only&src=template` |
| `/tenancy-agreement-template` | "tenancy agreement template" | `/wizard?product=ast_standard&src=template` |

### Free Tools (Lead Generation)

| Route | Tool | Upsell Target |
|-------|------|---------------|
| `/tools/validators/section-21` | Section 21 Validator | Notice Only |
| `/tools/validators/section-8` | Section 8 Validator | Notice Only |
| `/tools/free-section-21-notice-generator` | Free Generator | Notice Only (paid) |
| `/tools/free-section-8-notice-generator` | Free Generator | Notice Only (paid) |
| `/tools/free-rent-demand-letter` | Free Letter | Money Claim |
| `/tools/rent-arrears-calculator` | Calculator | Money Claim |
| `/tools/hmo-license-checker` | HMO Checker | HMO Pro (subscription) |

### Landing Pages (Jurisdiction-Specific)

| Route | Jurisdiction |
|-------|-------------|
| `/scotland-eviction-notices` | Scotland |
| `/wales-eviction-notices` | Wales |
| `/tenancy-agreements/england` | England |
| `/tenancy-agreements/scotland` | Scotland |
| `/tenancy-agreements/wales` | Wales |
| `/tenancy-agreements/northern-ireland` | Northern Ireland |

### Ask Heaven (AI Q&A)

| Route | Purpose |
|-------|---------|
| `/ask-heaven` | Free Q&A tool, captures emails, recommends products |

---

## Part E: Revenue Model Inputs

### Database Tables for Revenue Analysis

**Location:** `supabase/migrations/`

#### Orders Table (`002_orders_payments.sql`)

```sql
-- Key columns for revenue analysis
product_type TEXT       -- 'notice_only', 'complete_pack', etc.
product_name TEXT       -- Display name
amount DECIMAL(10,2)    -- Unit price in GBP
total_amount DECIMAL(10,2)
payment_status TEXT     -- 'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
fulfillment_status TEXT -- 'pending', 'processing', 'fulfilled', 'failed'
created_at TIMESTAMPTZ
paid_at TIMESTAMPTZ
```

#### Cases Table (`001_core_schema.sql`)

```sql
-- Key columns for funnel/conversion analysis
case_type TEXT          -- 'eviction', 'money_claim', 'tenancy_agreement'
jurisdiction TEXT       -- 'england', 'wales', 'scotland', 'northern-ireland'
status TEXT             -- 'in_progress', 'completed', 'archived'
wizard_progress INTEGER -- 0-100
wizard_completed_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

#### Webhook Logs (`002_orders_payments.sql`)

```sql
-- For debugging payment issues
event_type TEXT
stripe_event_id TEXT
status TEXT
processing_result JSONB
```

### Queries We Can Run Today

#### 1. Total Purchases per Product (Last 30 Days)

```sql
SELECT
  product_type,
  COUNT(*) as purchase_count,
  SUM(total_amount) as revenue
FROM orders
WHERE payment_status = 'paid'
  AND paid_at >= NOW() - INTERVAL '30 days'
GROUP BY product_type
ORDER BY revenue DESC;
```

#### 2. Jurisdiction Mix

```sql
SELECT
  c.jurisdiction,
  COUNT(o.id) as purchases,
  SUM(o.total_amount) as revenue
FROM orders o
JOIN cases c ON o.case_id = c.id
WHERE o.payment_status = 'paid'
  AND o.paid_at >= NOW() - INTERVAL '30 days'
GROUP BY c.jurisdiction;
```

#### 3. Conversion by Source (Requires Client-Side Attribution)

Currently **NOT tracked in DB**. Would need to add `utm_source`, `utm_medium`, `utm_campaign` columns to `orders` or `cases` table.

#### 4. Refund Rate

```sql
SELECT
  COUNT(CASE WHEN payment_status IN ('refunded', 'partially_refunded') THEN 1 END)::float /
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as refund_rate
FROM orders
WHERE paid_at >= NOW() - INTERVAL '30 days';
```

#### 5. Daily Revenue Trend

```sql
SELECT
  DATE(paid_at) as date,
  COUNT(*) as purchases,
  SUM(total_amount) as revenue
FROM orders
WHERE payment_status = 'paid'
  AND paid_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(paid_at)
ORDER BY date;
```

### What We CAN Compute Today

| Metric | Available | Source |
|--------|-----------|--------|
| Total revenue (30d / 12m) | ✅ Yes | `orders` table |
| Revenue by product | ✅ Yes | `orders.product_type` |
| Revenue by jurisdiction | ✅ Yes | `orders` JOIN `cases` |
| Refund rate | ✅ Yes | `orders.payment_status` |
| Average order value | ✅ Yes | `orders.total_amount` |
| Purchase count by day | ✅ Yes | `orders.paid_at` |
| Fulfillment success rate | ✅ Yes | `orders.fulfillment_status` |
| Wizard completion rate | ⚠️ Partial | `cases.wizard_completed_at` |

### What We NEED to Add

| Metric | Missing Data | Recommendation |
|--------|--------------|----------------|
| Conversion per page/source | `utm_source`, `src` not stored | Add to `orders` table |
| Click → Purchase attribution | No click tracking | Add `landing_url` to orders |
| Checkout abandonment rate | No `checkout_started` events | Add DB logging for checkout starts |
| Funnel drop-off analysis | Events only in GA4 | Consider server-side event logging |

---

## Summary: Action Items

### Immediate (P0)

1. **Fix checkout pricing mismatch** in `src/app/api/checkout/create/route.ts`
   - Update hardcoded amounts to match `products.ts`
   - Or switch to using Stripe price IDs

### High Priority (P1)

2. **Update `.env.example` comments** to reflect correct prices
3. **Create correct Stripe products** in dashboard with new prices
4. **Add runtime price validation** (dev-only, warning logs)

### Medium Priority (P2)

5. **Add attribution columns** to `orders` table (`utm_source`, `src`, `landing_url`)
6. **Add `checkout_started` event** tracking (client and/or server)
7. **Add `checkout_completed` client-side** event on success page

### Nice to Have (P3)

8. **Server-side funnel event logging** for deeper analysis
9. **Dashboard for real-time revenue metrics**

---

## Appendix: File References

| Purpose | File Path |
|---------|-----------|
| Pricing source of truth | `src/lib/pricing/products.ts` |
| Stripe utilities | `src/lib/stripe/index.ts` |
| Checkout API | `src/app/api/checkout/create/route.ts` |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` |
| Analytics functions | `src/lib/analytics.ts` |
| Tracking pixels | `src/components/analytics/TrackingPixels.tsx` |
| Wizard link builder | `src/lib/wizard/buildWizardLink.ts` |
| Orders schema | `supabase/migrations/002_orders_payments.sql` |
| Cases schema | `supabase/migrations/001_core_schema.sql` |
| Env template | `.env.example` |
