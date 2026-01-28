# Analytics + Attribution Audit Report — January 2026
## Landlord Heaven (woodhall335/landlord-heavenv3)

**Audit Type:** READ-ONLY inventory and gap analysis
**Purpose:** Identify gaps preventing revenue measurement from SEO landing pages at launch
**Date:** 2026-01-14
**Branch:** `claude/audit-analytics-attribution-alpip`

---

## Executive Summary

The current analytics implementation has **solid foundations** for event tracking (GA4, Facebook Pixel, Vercel Analytics) and payment processing (Stripe webhooks). However, **critical gaps exist in end-to-end attribution** that will prevent measuring revenue from SEO landing pages:

| Issue | Severity | Summary |
|-------|----------|---------|
| UTMs not stored in orders | **BLOCKER** | Cannot report revenue by campaign/source |
| UTMs not passed to Stripe | **BLOCKER** | Attribution lost at checkout boundary |
| No `landing_view` events on SEO pages | HIGH | Cannot track top-of-funnel by page |
| No server-side purchase event fallback | HIGH | Ad blockers cause ~15-25% data loss |
| `purchase` event lacks UTM/landing_path | HIGH | GA4 purchase can't be attributed |
| No CTA click tracking on SEO pages | MEDIUM | Cannot measure CTA effectiveness |

---

## Phase 1: Inventory — What Exists Today

### 1.1 Google Analytics Configuration

| Component | File | Line | Description |
|-----------|------|------|-------------|
| Measurement ID | `.env.example` | 196-209 | `NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"` |
| Script Injection | `src/components/analytics/TrackingPixels.tsx` | 1-85 | Loads gtag.js with `lazyOnload` strategy |
| Layout Integration | `src/app/layout.tsx` | 13, 72 | Renders `<TrackingPixels />` in root layout |
| Type Definitions | `src/types/gtag.d.ts` | 1-57 | TypeScript declarations for `window.gtag` |
| Wrapper Library | `src/lib/analytics.ts` | 1-976 | All tracking functions |

**Additional Tracking:**
- Facebook Pixel (`NEXT_PUBLIC_FB_PIXEL_ID`)
- Google Ads (`NEXT_PUBLIC_GOOGLE_ADS_ID`)
- Vercel Analytics (`@vercel/analytics`)

### 1.2 Stripe Payment Implementation

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| Checkout Creation | `src/app/api/checkout/create/route.ts` | 1-561 | Creates Stripe checkout sessions |
| Webhook Handler | `src/app/api/webhooks/stripe/route.ts` | 1-574 | Processes all Stripe events |
| Success Page | `src/app/dashboard/cases/[id]/page.tsx` | 1-1417 | Post-payment case detail page |
| Order Status API | `src/app/api/orders/status/route.ts` | 1-136 | DB-backed order status |
| Fulfillment | `src/lib/payments/fulfillment.ts` | - | Document generation after payment |
| Redirect URLs | `src/lib/payments/redirects.ts` | 1-151 | Success/cancel URL generation |

**Orders Table Schema:** `supabase/migrations/002_orders_payments.sql`
- Columns: `id`, `user_id`, `case_id`, `product_type`, `product_name`, `amount`, `currency`, `payment_status`, `stripe_session_id`, `paid_at`, `fulfillment_status`
- **Missing columns:** `utm_source`, `utm_medium`, `utm_campaign`, `landing_path`

### 1.3 Current Data Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  SEO Landing    │────▶│   Wizard Entry  │────▶│   Wizard Flow   │
│    Page         │     │   /wizard       │     │   /wizard/flow  │
│                 │     │                 │     │                 │
│ NO TRACKING     │     │ wizard_entry_   │     │ wizard_start    │
│ NO UTM CAPTURE  │     │ view (w/UTM)    │     │ wizard_step_    │
└─────────────────┘     └─────────────────┘     │ complete (w/UTM)│
                                                └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Case Detail    │◀────│ Stripe Checkout │◀────│  Preview Page   │
│  /dashboard/    │     │ (External)      │     │  /wizard/preview│
│  cases/[id]     │     │                 │     │                 │
│                 │     │ Metadata:       │     │ begin_checkout  │
│ purchase event  │     │ ✗ NO UTMs       │     │ (NO UTMs)       │
│ (NO UTMs)       │     │ ✗ NO landing    │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Webhook Handler │────▶│   Orders DB     │
│ /api/webhooks/  │     │                 │
│ stripe          │     │ ✗ NO UTM cols   │
│                 │     │ ✗ NO landing    │
│ ✗ NO server-    │     │   _path col     │
│   side GA event │     │                 │
└─────────────────┘     └─────────────────┘
```

### 1.4 SEO Landing Pages (No Tracking)

The following pages have **NO analytics events** (no `landing_view`, no `cta_click`):

| Page | File |
|------|------|
| `/how-to-evict-tenant` | `src/app/how-to-evict-tenant/page.tsx` |
| `/tenant-not-paying-rent` | `src/app/tenant-not-paying-rent/page.tsx` |
| `/tenant-wont-leave` | `src/app/tenant-wont-leave/page.tsx` |
| `/section-21-notice-template` | `src/app/section-21-notice-template/page.tsx` |
| `/section-8-notice-template` | `src/app/section-8-notice-template/page.tsx` |
| `/eviction-notice-template` | `src/app/eviction-notice-template/page.tsx` |
| `/rent-arrears-letter-template` | `src/app/rent-arrears-letter-template/page.tsx` |
| `/money-claim-unpaid-rent` | `src/app/money-claim-unpaid-rent/page.tsx` |
| `/eviction-cost-uk` | `src/app/eviction-cost-uk/page.tsx` |
| `/possession-claim-guide` | `src/app/possession-claim-guide/page.tsx` |
| `/warrant-of-possession` | `src/app/warrant-of-possession/page.tsx` |
| `/n5b-form-guide` | `src/app/n5b-form-guide/page.tsx` |

---

## Phase 2: UTM + Landing Path Attribution Audit

### 2.1 UTM Coverage Matrix

| Field | Captured on Landing? | Persisted Client-Side? | Passed to Checkout? | Stored in Stripe Metadata? | Stored in Orders DB? | File/Line |
|-------|---------------------|------------------------|---------------------|---------------------------|---------------------|-----------|
| `utm_source` | ✗ Only on /wizard | ✓ sessionStorage | ✗ NO | ✗ NO | ✗ NO | `wizardAttribution.ts:311` |
| `utm_medium` | ✗ Only on /wizard | ✓ sessionStorage | ✗ NO | ✗ NO | ✗ NO | `wizardAttribution.ts:312` |
| `utm_campaign` | ✗ Only on /wizard | ✓ sessionStorage | ✗ NO | ✗ NO | ✗ NO | `wizardAttribution.ts:313` |
| `utm_term` | ✗ NOT captured | ✗ NO | ✗ NO | ✗ NO | ✗ NO | - |
| `utm_content` | ✗ NOT captured | ✗ NO | ✗ NO | ✗ NO | ✗ NO | - |
| `landing_path` | ✗ NOT captured | ✓ as `landing_url` | ✗ NO | ✗ NO | ✗ NO | `wizardAttribution.ts:16` |
| `src` (internal) | ✓ On /wizard | ✓ sessionStorage | ✗ NO | ✗ NO | ✗ NO | `wizardAttribution.ts:309` |
| `topic` (internal) | ✓ On /wizard | ✓ sessionStorage | ✗ NO | ✗ NO | ✗ NO | `wizardAttribution.ts:310` |

### 2.2 Attribution Flow Analysis

**Current Flow:**
```
SEO Page ──(no capture)──▶ Wizard ──(sessionStorage)──▶ Checkout ──(LOST)──▶ Stripe ──(LOST)──▶ DB
```

**Issues:**

1. **SEO pages don't capture UTMs on landing**
   - File: All SEO pages (see 1.4)
   - Impact: User arrives with `?utm_source=google`, navigates to /wizard, UTMs lost

2. **UTMs only captured when user lands directly on /wizard**
   - File: `src/app/wizard/page.tsx:35`
   - Call: `initializeAttribution()` extracts from URL
   - Impact: Indirect journeys lose attribution

3. **sessionStorage cleared on tab close**
   - File: `src/lib/wizard/wizardAttribution.ts:20-24`
   - Impact: User opens new tab = attribution lost

4. **Checkout creation doesn't receive UTMs**
   - File: `src/app/api/checkout/create/route.ts:506-511`
   - Current metadata: `{ user_id, order_id, product_type, case_id }`
   - Missing: `utm_source, utm_medium, utm_campaign, landing_path`

5. **No first-touch vs last-touch strategy**
   - File: `wizardAttribution.ts:104-106`
   - Current: `first_seen_at` and `landing_url` preserved, but lost at checkout

### 2.3 Edge Case Failures

| Scenario | Current Behavior | Attribution Outcome |
|----------|-----------------|---------------------|
| User returns next day (direct) | sessionStorage empty | Attribution LOST |
| User clears cookies | sessionStorage empty | Attribution LOST |
| User opens new browser tab | sessionStorage empty | Attribution LOST |
| Stripe redirect back | No UTM restoration | Attribution LOST at boundary |
| Ad blocker blocks gtag.js | No events fire | Events LOST, but Stripe works |

---

## Phase 3: Funnel Event Audit (GA4 Events)

### 3.1 Event Coverage Matrix

| Event Name | Implemented? | Fired Where? | Properties Included | Gaps |
|------------|-------------|--------------|---------------------|------|
| `landing_view` | ✗ NO | - | - | **NOT IMPLEMENTED** on any SEO page |
| `cta_click` | ✗ NO | - | - | **NOT IMPLEMENTED** on any SEO page |
| `wizard_entry_view` | ✓ YES | Client: `/wizard` | product, jurisdiction, src, topic, utm_*, landing_url | None |
| `wizard_start` | ✓ YES | Client: `/wizard/flow` | product, jurisdiction, src, topic, utm_*, landing_url | Dedupe via `hasWizardStarted()` |
| `wizard_step_complete` | ✓ YES | Client: Flow components | product, jurisdiction, step_name, step_index, utm_* | Dedupe via `markStepCompleted()` |
| `wizard_review_view` | ✓ YES | Client: `/wizard/review` | product, jurisdiction, has_blockers, has_warnings, utm_* | None |
| `begin_checkout` | ✓ YES | Client: `PreviewPageLayout.tsx:95` | product, productName, value | **Missing: UTMs, landing_path** |
| `checkout_started` | ✓ YES | Client: `PreviewPageLayout.tsx:98` | product | Vercel Analytics only |
| `purchase` | ✓ YES | Client: `cases/[id]/page.tsx:462` | transaction_id, value, currency, items | **Missing: UTMs, landing_path, jurisdiction, notice_type** |

### 3.2 Required Events Not Implemented

**`landing_view`** — Required for top-of-funnel measurement
- Should fire: On every SEO landing page load
- Properties needed: `page_path`, `page_title`, `pageType` (problem/court/money/general), `variant`
- Current: Does not exist
- Where to implement: Each SEO page component or via middleware/layout

**`cta_click`** — Required for CTA effectiveness measurement
- Should fire: When user clicks hero CTA, section CTA, FAQ CTA, final CTA
- Properties needed: `page_path`, `cta_variant` (hero/section/faq/final), `pageType`
- Current: Does not exist
- Where to implement: CTA Link components on SEO pages

### 3.3 Event Deduplication Status

| Event | Dedupe Mechanism | Risk |
|-------|-----------------|------|
| `wizard_entry_view` | None | May fire on each visit to /wizard |
| `wizard_start` | `hasWizardStarted()` sessionStorage | ✓ Safe within session |
| `wizard_step_complete` | `markStepCompleted(stepId)` sessionStorage | ✓ Safe within session |
| `purchase` | `sessionStorage.getItem('purchase_tracked_${caseId}')` | ✓ Safe within session |

### 3.4 Dashboard/Auth Route Filtering

| Event | Can Fire on /dashboard? | Can Fire on /auth? | Issue |
|-------|------------------------|-------------------|-------|
| `wizard_entry_view` | ✗ No (route-specific) | ✗ No | OK |
| `purchase` | ✓ YES (fires on `/dashboard/cases/[id]`) | ✗ No | Expected behavior |
| All wizard events | ✗ No | ✗ No | OK |

---

## Phase 4: Stripe ↔ Analytics Consistency Audit

### 4.1 Stripe Session Metadata

**File:** `src/app/api/checkout/create/route.ts:506-511`

```typescript
metadata: {
  user_id: user.id,
  order_id: (order as any).id,
  product_type,
  case_id: case_id || '',
  // ✗ MISSING: utm_source
  // ✗ MISSING: utm_medium
  // ✗ MISSING: utm_campaign
  // ✗ MISSING: landing_path
  // ✗ MISSING: jurisdiction
}
```

### 4.2 Webhook Order Creation

**File:** `src/app/api/webhooks/stripe/route.ts:217-227`

The webhook updates order status but does **NOT** write attribution data because:
1. Attribution not in Stripe metadata
2. No attribution columns in orders table

### 4.3 GA4 Purchase Event vs Stripe Truth

| Aspect | GA4 Purchase Event | Stripe/DB Order |
|--------|-------------------|-----------------|
| Fired from | Client (success page) | Server (webhook) |
| Reliability | ~75-85% (ad blockers) | ~100% |
| Transaction ID | `caseId` | `order.id` |
| Value | From `orderStatus.total_amount` | From Stripe `amount_total` |
| UTMs | ✗ NOT INCLUDED | ✗ NOT STORED |
| Landing path | ✗ NOT INCLUDED | ✗ NOT STORED |

### 4.4 Server-Side Fallback (Measurement Protocol)

**Status:** ✗ NOT IMPLEMENTED

There is no server-side fallback to send GA4 purchase events via Measurement Protocol from the webhook handler. This means:
- Ad blocker users (~15-25%) have no GA4 purchase event
- Revenue in GA4 will undercount actual Stripe revenue
- Attribution impossible to reconcile

### 4.5 Source of Truth Statement

| Question | Source of Truth | Reliability |
|----------|-----------------|-------------|
| **Did payment succeed?** | Stripe webhook → orders.payment_status | ✓ 100% |
| **Revenue total** | Stripe → orders.total_amount | ✓ 100% |
| **Revenue by product** | orders.product_type | ✓ 100% |
| **Revenue by campaign** | ✗ CANNOT DETERMINE | ✗ Not stored |
| **Revenue by landing page** | ✗ CANNOT DETERMINE | ✗ Not stored |
| **Funnel conversion rate** | GA4 (incomplete) | ~75-85% |

---

## Phase 5: Reporting Readiness Audit

### 5.1 Can We Answer These Questions Today?

| Question | Can Answer? | Data Source | Gap |
|----------|-------------|-------------|-----|
| Total revenue | ✓ YES | `orders` table SUM(total_amount) WHERE payment_status='paid' | None |
| Revenue by product_type | ✓ YES | `orders` GROUP BY product_type | None |
| Revenue by jurisdiction | ✓ YES | JOIN orders → cases → jurisdiction | None |
| Revenue by landing_path | ✗ NO | Not stored | Add `landing_path` to orders |
| Revenue by utm_campaign | ✗ NO | Not stored | Add `utm_campaign` to orders |
| Revenue by utm_source | ✗ NO | Not stored | Add `utm_source` to orders |
| Conversion rate by pageType | ✗ NO | No `landing_view` events | Implement landing_view |
| Conversion rate by SEO page | ✗ NO | No page-level tracking | Implement landing_view |
| Funnel drop-off: landing → wizard | ✗ NO | No landing_view | Implement landing_view |
| Funnel drop-off: wizard → checkout | ✓ PARTIAL | GA4 wizard_start → begin_checkout | Ad blockers cause gaps |
| Funnel drop-off: checkout → purchase | ✓ PARTIAL | GA4 begin_checkout → purchase | Ad blockers cause gaps |

### 5.2 Reporting Gaps — Prioritized

| Priority | Gap | Minimum Viable Change |
|----------|-----|----------------------|
| **BLOCKER** | UTMs not stored in orders | Add columns + pass from client → checkout → webhook |
| **BLOCKER** | Landing path not stored | Add column + capture on first page load |
| **HIGH** | No `landing_view` events | Add event to SEO pages |
| **HIGH** | No server-side purchase event | Implement Measurement Protocol in webhook |
| **HIGH** | `purchase` event missing UTMs | Pass UTMs from sessionStorage/cookies |
| **MEDIUM** | No `cta_click` events | Add click tracking to SEO CTAs |
| **MEDIUM** | utm_term, utm_content not captured | Extend wizardAttribution.ts |
| **LOW** | No cross-device attribution | Would require server-side identity resolution |

---

## Phase 6: Test/QA Audit

### 6.1 Existing Tests

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `src/lib/analytics/__tests__/track.test.ts` | SSR safety, client tracking, error handling | Vercel Analytics wrapper only |
| `tests/api/checkout-create.test.ts` | Checkout creation | No UTM tests |
| `tests/lib/leads.local.test.ts` | localStorage lead storage | No UTM tests |

### 6.2 Missing Tests

| Test | Priority | Location Recommendation |
|------|----------|------------------------|
| UTM persistence across wizard steps | HIGH | `tests/lib/wizard/wizardAttribution.test.ts` |
| UTM included in purchase GA4 event payload | HIGH | `tests/lib/analytics/purchase-attribution.test.ts` |
| Events NOT firing on /dashboard routes | MEDIUM | `tests/lib/analytics/route-filtering.test.ts` |
| Events NOT firing on /auth routes | MEDIUM | `tests/lib/analytics/route-filtering.test.ts` |
| First-touch attribution preserved | MEDIUM | `tests/lib/wizard/wizardAttribution.test.ts` |

### 6.3 Recommended Test Implementations

**Test 1: UTM Persistence (HIGHEST PRIORITY)**
```typescript
// tests/lib/wizard/wizardAttribution.test.ts
describe('UTM persistence', () => {
  it('should preserve UTMs across wizard steps', () => {
    // Set UTMs on entry
    // Navigate through steps
    // Verify UTMs still present
  });

  it('should preserve first-touch UTMs when re-entering wizard', () => {
    // Set UTMs
    // Leave wizard
    // Return to wizard
    // Verify original UTMs preserved
  });
});
```

**Test 2: Purchase Event Attribution**
```typescript
// tests/lib/analytics/purchase-attribution.test.ts
describe('purchase event', () => {
  it('should include UTMs in purchase event payload', () => {
    // Mock sessionStorage with UTMs
    // Trigger purchase event
    // Verify gtag called with UTM params
  });
});
```

**Test 3: Route Filtering**
```typescript
// tests/lib/analytics/route-filtering.test.ts
describe('route filtering', () => {
  it('should not fire landing_view on /dashboard', () => {
    // Mock window.location to /dashboard
    // Import tracking
    // Verify no events fired
  });
});
```

---

## Prioritized Fix Plan

### Severity: BLOCKER (Must fix before launch)

#### Fix 1: Add Attribution Columns to Orders Table

**Files to modify:**
- `supabase/migrations/XXX_add_order_attribution.sql` (NEW)

**Changes:**
```sql
ALTER TABLE public.orders
ADD COLUMN utm_source TEXT,
ADD COLUMN utm_medium TEXT,
ADD COLUMN utm_campaign TEXT,
ADD COLUMN landing_path TEXT,
ADD COLUMN first_seen_at TIMESTAMPTZ;

CREATE INDEX idx_orders_utm_source ON public.orders(utm_source);
CREATE INDEX idx_orders_utm_campaign ON public.orders(utm_campaign);
CREATE INDEX idx_orders_landing_path ON public.orders(landing_path);
```

#### Fix 2: Pass Attribution to Checkout Creation

**Files to modify:**
- `src/components/preview/PreviewPageLayout.tsx` (lines 60-68)
- `src/app/api/checkout/create/route.ts` (lines 506-511)

**Client-side change (PreviewPageLayout.tsx):**
```typescript
// Get attribution from sessionStorage or cookies
const attribution = getWizardAttribution();

const response = await fetch('/api/checkout/create', {
  body: JSON.stringify({
    product_type: product,
    case_id: caseId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    // ADD these:
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    landing_path: attribution.landing_url,
  }),
});
```

**Server-side change (checkout/create/route.ts):**
```typescript
// Add to validation schema
const createCheckoutSchema = z.object({
  // ... existing
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  landing_path: z.string().optional(),
});

// Add to Stripe metadata
metadata: {
  // ... existing
  utm_source: utm_source || '',
  utm_medium: utm_medium || '',
  utm_campaign: utm_campaign || '',
  landing_path: landing_path || '',
}

// Store in order creation
const { data: order } = await adminSupabase
  .from('orders')
  .insert({
    // ... existing
    utm_source,
    utm_medium,
    utm_campaign,
    landing_path,
  })
```

#### Fix 3: Capture Attribution from Webhook

**Files to modify:**
- `src/app/api/webhooks/stripe/route.ts` (lines 217-227)

**Change:**
```typescript
// Extract attribution from Stripe metadata
const utm_source = session.metadata?.utm_source || null;
const utm_medium = session.metadata?.utm_medium || null;
const utm_campaign = session.metadata?.utm_campaign || null;
const landing_path = session.metadata?.landing_path || null;

// Update order with attribution (if not already set during creation)
await supabase
  .from('orders')
  .update({
    payment_status: 'paid',
    // ... existing
    utm_source: utm_source || order.utm_source,
    utm_medium: utm_medium || order.utm_medium,
    utm_campaign: utm_campaign || order.utm_campaign,
    landing_path: landing_path || order.landing_path,
  })
  .eq('id', order.id);
```

### Severity: HIGH

#### Fix 4: Add `landing_view` Event to SEO Pages

**Files to modify:**
- Each SEO page (see list in 1.4)
- OR create shared `LandingPageTracker.tsx` component

**Approach A: Per-page tracking (more control)**
```typescript
// In each SEO page, add:
'use client';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { initializeAttribution } from '@/lib/wizard/wizardAttribution';

export default function HowToEvictTenantPage() {
  useEffect(() => {
    // Capture UTMs on landing
    initializeAttribution();

    // Fire landing_view
    trackEvent('landing_view', {
      page_path: '/how-to-evict-tenant',
      page_title: 'How to Evict a Tenant',
      pageType: 'problem', // problem | court | money | general
    });
  }, []);

  // ... rest of page
}
```

**Approach B: Shared component (DRY)**
```typescript
// src/components/analytics/LandingPageTracker.tsx
'use client';
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { initializeAttribution } from '@/lib/wizard/wizardAttribution';

interface Props {
  pagePath: string;
  pageTitle: string;
  pageType: 'problem' | 'court' | 'money' | 'general';
}

export function LandingPageTracker({ pagePath, pageTitle, pageType }: Props) {
  useEffect(() => {
    initializeAttribution();
    trackEvent('landing_view', { page_path: pagePath, page_title: pageTitle, pageType });
  }, []);

  return null;
}
```

#### Fix 5: Server-Side Purchase Event via Measurement Protocol

**Files to modify:**
- `src/app/api/webhooks/stripe/route.ts` (add after line 280)
- `src/lib/analytics/measurement-protocol.ts` (NEW)

**New file:**
```typescript
// src/lib/analytics/measurement-protocol.ts
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA_MEASUREMENT_PROTOCOL_SECRET;

export async function sendServerPurchaseEvent(params: {
  clientId: string;
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{ item_id: string; item_name: string; price: number }>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_path?: string;
}) {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) return;

  await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: params.clientId,
      events: [{
        name: 'purchase',
        params: {
          transaction_id: params.transactionId,
          value: params.value,
          currency: params.currency,
          items: params.items,
          utm_source: params.utm_source,
          utm_medium: params.utm_medium,
          utm_campaign: params.utm_campaign,
          landing_path: params.landing_path,
        }
      }]
    })
  });
}
```

#### Fix 6: Include UTMs in Client-Side Purchase Event

**Files to modify:**
- `src/app/dashboard/cases/[id]/page.tsx` (lines 462-470)

**Change:**
```typescript
// Get attribution (could be from cookies if sessionStorage cleared)
const attribution = getWizardAttribution();

trackPurchase(caseId, amount, currency, [
  {
    item_id: caseDetails.case_type,
    item_name: productName,
    item_category: 'legal_document',
    price: amount,
    quantity: 1,
  },
], {
  // ADD these:
  utm_source: attribution.utm_source,
  utm_medium: attribution.utm_medium,
  utm_campaign: attribution.utm_campaign,
  landing_path: attribution.landing_url,
  jurisdiction: caseDetails.jurisdiction,
});
```

### Severity: MEDIUM

#### Fix 7: Add `cta_click` Tracking to SEO Pages

**Files to modify:**
- SEO page CTAs (hero, section, FAQ, final)

**Pattern:**
```typescript
<Link
  href="/products/notice-only"
  onClick={() => trackEvent('cta_click', {
    page_path: '/how-to-evict-tenant',
    cta_variant: 'hero',
    pageType: 'problem',
  })}
>
```

#### Fix 8: Extend UTM Capture to Include utm_term, utm_content

**Files to modify:**
- `src/lib/wizard/wizardAttribution.ts` (lines 306-326)

**Change:**
```typescript
export function extractAttributionFromUrl(searchParams: URLSearchParams): Partial<WizardAttributionPayload> {
  // ... existing
  const utm_term = searchParams.get('utm_term');
  const utm_content = searchParams.get('utm_content');

  if (utm_term) attribution.utm_term = utm_term;
  if (utm_content) attribution.utm_content = utm_content;

  return attribution;
}
```

---

## Implementation Order

1. **Phase 1 (BLOCKER):** Database migration + checkout attribution (Fixes 1-3)
2. **Phase 2 (HIGH):** Landing page tracking + server-side purchase (Fixes 4-6)
3. **Phase 3 (MEDIUM):** CTA tracking + extended UTMs (Fixes 7-8)
4. **Phase 4 (Tests):** Add attribution tests

---

## Appendix: File Reference Index

| Category | File | Purpose |
|----------|------|---------|
| Analytics Config | `src/components/analytics/TrackingPixels.tsx` | Script injection |
| Analytics Library | `src/lib/analytics.ts` | All tracking functions |
| Vercel Analytics | `src/lib/analytics/track.ts` | Vercel-specific tracking |
| Attribution | `src/lib/wizard/wizardAttribution.ts` | UTM capture + persistence |
| Checkout | `src/app/api/checkout/create/route.ts` | Stripe session creation |
| Webhook | `src/app/api/webhooks/stripe/route.ts` | Payment processing |
| Success Page | `src/app/dashboard/cases/[id]/page.tsx` | Purchase event firing |
| Preview | `src/components/preview/PreviewPageLayout.tsx` | begin_checkout event |
| Orders Schema | `supabase/migrations/002_orders_payments.sql` | DB structure |
| Test | `src/lib/analytics/__tests__/track.test.ts` | Analytics tests |

---

*Audit completed 2026-01-14. No code changes made per audit constraints.*
