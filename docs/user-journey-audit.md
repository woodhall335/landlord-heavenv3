# User Journey and Revenue Protection Audit

**Date:** 2025-12-31
**Auditor:** Claude Code
**Scope:** Complete user journey from wizard start to document access

---

## Executive Summary

This audit traces the complete user journey through Landlord Heaven, from anonymous wizard entry to authenticated document access. Key findings include:

- **Revenue protection relies on page limiting (2 pages) rather than watermarks** - All watermarks have been intentionally removed
- **Payment verification via `assertPaidEntitlement()` is properly implemented** at generation endpoints
- **Anonymous to authenticated transition is handled properly** via case linking during signup
- **Several potential improvements identified** for security and UX

---

## 1. WIZARD START FLOW

### 1.1 Entry Points

| Entry Point | URL | Allows Anonymous |
|------------|-----|------------------|
| Main wizard page | `/wizard` | ✅ Yes |
| Product page links | `/wizard?product=notice_only` | ✅ Yes |
| Direct flow entry | `/wizard/flow?type=X&jurisdiction=Y&product=Z` | ✅ Yes |
| Resume existing case | `/wizard/flow?case_id=UUID` | ✅ Yes |

**URL Parameters Supported:**
- `product` - Product type (notice_only, complete_pack, money_claim, ast_standard, ast_premium)
- `type` - Case type (eviction, money_claim, tenancy_agreement)
- `jurisdiction` - Jurisdiction (england, wales, scotland, northern-ireland)
- `case_id` - UUID to resume existing case
- `mode` - Edit mode for existing cases
- `jump_to` - Question ID to jump to
- `product_variant` - Alternative product variant

**File References:**
- Entry page: `src/app/wizard/page.tsx`
- Flow page: `src/app/wizard/flow/page.tsx`

### 1.2 Wizard Initialization

**API Endpoint:** `POST /api/wizard/start`
**File:** `src/app/api/wizard/start/route.ts`

**Request Schema:**
```typescript
{
  product: 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement' | 'ast_standard' | 'ast_premium',
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland',
  case_id?: string,        // UUID for resuming existing case
  validator_key?: string,  // For standalone validators
  case_type?: 'eviction' | 'money_claim' | 'tenancy_agreement'
}
```

**Database Records Created:**

| Table | Fields | Notes |
|-------|--------|-------|
| `cases` | id, user_id (nullable), case_type, jurisdiction, status, wizard_progress, collected_facts | Main case record |
| `case_facts` | case_id, facts, version, updated_at | Source of truth for answers |

**Session Tracking:**
- **Authenticated users:** Case linked via `user_id`
- **Anonymous users:** Case has `user_id = null`, tracked via session token in localStorage

### 1.3 Question Flow

**Question Definitions:** YAML files in `config/mqs/{product}/{jurisdiction}.yaml`

**Question Loading:**
- API: `POST /api/wizard/next-question`
- Loader: `src/lib/wizard/mqs-loader.ts`
- Function: `loadMQS(product, jurisdiction)` → `getNextMQSQuestion(mqs, facts)`

**Answer Saving:**
- API: `POST /api/wizard/answer`
- File: `src/app/api/wizard/answer/route.ts`
- **Auto-save:** Every answer is immediately persisted
- **Progress tracking:** Calculated as percentage of applicable questions answered

**Answer Flow:**
```
User submits answer → POST /api/wizard/answer
  → applyMappedAnswers() updates facts
  → batchClearDependentFacts() clears dependent answers
  → updateWizardFacts() persists to database
  → computeProgress() calculates % complete
  → getNextMQSQuestion() determines next question
  → Return response with next_question or is_complete=true
```

**Browser Close Behavior:** ✅ Progress is saved automatically - user can resume anytime

---

## 2. WIZARD COMPLETION & PREVIEW

### 2.1 Completion Detection

- **Trigger:** `getNextMQSQuestion()` returns `null` (no more applicable questions)
- **Database Update:** `wizard_completed_at` timestamp set
- **Redirection:** User navigated to `/wizard/preview/[caseId]`

### 2.2 Preview Page

**Route:** `/wizard/preview/[caseId]`
**File:** `src/app/wizard/preview/[caseId]/page.tsx`

**Preview Generation Flow:**
```
1. Page loads → Calls /api/documents/generate with is_preview: true
2. OR for notice_only: Returns PDF directly from endpoint
3. Document generated with preparePreviewHtml() (2 page limit)
4. PDF uploaded to Supabase Storage
5. Signed URL generated (1-hour expiry)
6. Preview displayed in iframe
```

### 2.3 Document Generation Timing

| Stage | When | Watermark | Page Limit | Payment Required |
|-------|------|-----------|------------|------------------|
| Preview | Before checkout | ❌ None | 2 pages | ❌ No |
| Final | After payment | ❌ None | Full document | ✅ Yes |

**Critical Finding:** All watermarks have been removed from the system as part of a "simplified UX" change. Revenue protection now relies on:
1. **Page limiting** (2 pages max for preview)
2. **Payment verification** at generation endpoints

---

## 3. REVENUE PROTECTION (CRITICAL)

### 3.1 What's Free vs Paid

| Access Level | What User Gets | Protection Mechanism |
|--------------|----------------|----------------------|
| **FREE (Preview)** | 2-page truncated document with preview header/footer | `preparePreviewHtml()` limits to 2 pages |
| **PAID (Full)** | Complete multi-page document + bonus materials | `assertPaidEntitlement()` check |

**Preview HTML Modifications:**
- Red header: "🔒 PREVIEW ONLY - LIMITED VIEW"
- Blue footer: "What You Get With Full Purchase" + feature list
- Bottom notice: "🔒 This is a PREVIEW ONLY - Not valid for legal use"

**Watermark Status:** ⚠️ **REMOVED**
- All watermarks intentionally removed from system
- See: `docs/pdf-watermark-audit.md`
- Code comments: "watermarks removed as part of simplified UX"

### 3.2 Payment Gate Implementation

**Function:** `assertPaidEntitlement()`
**File:** `src/lib/payments/entitlement.ts`

```typescript
export async function assertPaidEntitlement({ caseId, product }) {
  const { data: order } = await supabase
    .from('orders')
    .select('id, payment_status, fulfillment_status, product_type, case_id')
    .eq('case_id', caseId)
    .eq('product_type', product)
    .eq('payment_status', 'paid')
    .maybeSingle();

  if (!order) {
    throw NextResponse.json(
      { error: 'PAYMENT_REQUIRED', code: 'PAYMENT_REQUIRED' },
      { status: 402 }
    );
  }
  return order;
}
```

**Payment Status Field:** `orders.payment_status = 'paid'`

### 3.3 Document Access Control

| Endpoint | Payment Check | Auth Check | Notes |
|----------|---------------|------------|-------|
| `POST /api/documents/generate` | ✅ Only if `is_preview: false` | Ownership via RLS | Main generation endpoint |
| `GET /api/documents/[id]` | ❌ No | ✅ `requireServerAuth()` + user_id check | Returns documents user owns |
| `GET /api/documents/preview/[id]` | ❌ No | ✅ user_id check | For preview documents only |
| `GET /api/notice-only/preview/[caseId]` | ✅ `assertPaidEntitlement()` | ✅ user_id check | Despite name, this is POST-PAYMENT |
| `GET /api/money-claim/pack/[caseId]` | ✅ `assertPaidEntitlement()` | ✅ user_id check | Returns ZIP of all documents |

**Signed URL Configuration:**
- Document downloads: 1 hour (3600 seconds)
- Evidence downloads: 15 minutes (900 seconds)

---

## 4. PURCHASE FLOW

### 4.1 Checkout Initiation

**Trigger:** User clicks "Purchase" on preview page

**Flow:**
```
1. Check authentication via GET /api/auth/me
2. If anonymous → Show SignupModal
3. If authenticated → POST /api/checkout/create
4. Redirect to Stripe Checkout
```

**API Endpoint:** `POST /api/checkout/create`
**File:** `src/app/api/checkout/create/route.ts`

### 4.2 Stripe Configuration

**Mode:** `payment` (one-time) or `subscription` (HMO Pro)

**Metadata Passed:**
```typescript
{
  user_id: string,
  order_id: string,
  product_type: string,
  case_id: string
}
```

**Success/Cancel URLs:**
- Success: `/dashboard/cases/{caseId}?payment=success`
- Cancel: `/wizard/preview/{caseId}?payment=cancelled`

### 4.3 Account Creation Timeline

| Scenario | Account Creation | Case Linking |
|----------|-----------------|--------------|
| Anonymous user purchases | During checkout (SignupModal) | Via `/api/cases/${caseId}/link` |
| Authenticated user purchases | Already exists | Already linked |
| Guest checkout | Not supported | N/A |

---

## 5. POST-PAYMENT FLOW

### 5.1 Webhook Processing

**Endpoint:** `POST /api/webhooks/stripe`
**File:** `src/app/api/webhooks/stripe/route.ts`

**Event: `checkout.session.completed`**
```
1. Find order from metadata
2. Update order: payment_status = 'paid'
3. Set fulfillment_status = 'ready_to_generate'
4. Call fulfillOrder() with caseId + productType
5. Send purchase confirmation email
6. Log webhook event
```

### 5.2 Document Fulfillment

**Function:** `fulfillOrder()`
**File:** `src/lib/payments/fulfillment.ts`

**Steps:**
1. Check for existing fulfilled documents
2. Generate all documents for product type
3. Upload PDFs to Supabase Storage
4. Create document records with `is_preview: false`
5. Update order: `fulfillment_status = 'fulfilled'`

**Storage Path:** `{user_id}/{case_id}/{document_type}_{timestamp}.pdf`

### 5.3 Order Record

**Table:** `orders`

**Key Fields:**
```typescript
{
  id: string,
  user_id: string,
  case_id: string,
  product_type: string,
  payment_status: 'pending' | 'paid' | 'failed',
  fulfillment_status: 'pending' | 'ready_to_generate' | 'processing' | 'fulfilled' | 'failed',
  stripe_session_id: string,
  stripe_payment_intent_id: string,
  paid_at: timestamp,
  fulfilled_at: timestamp
}
```

---

## 6. EMAIL CONFIRMATION

### 6.1 Email System

**Provider:** Resend
**File:** `src/lib/email/resend.ts`

| Email Type | Trigger | Template Location |
|------------|---------|-------------------|
| Purchase confirmation | Stripe webhook `checkout.session.completed` | Inline in `resend.ts` |
| Welcome email | User signup | Inline in `resend.ts` |
| Password reset | Forgot password request | Supabase Auth built-in |
| Compliance reminders | Daily cron job | `src/app/api/cron/compliance-check/route.ts` |
| HMO Pro trial reminder | Subscription activated | Inline in `resend.ts` |

**Purchase Confirmation Content:**
- Customer name
- Product name
- Amount paid
- Order number
- "Download Your Documents" button → Dashboard link

---

## 7. USER PORTAL / DASHBOARD

### 7.1 Access Control

**Authentication:** Client-side via `useAuthCheck()` hook
**Behavior:** Unauthenticated users see login/signup prompt

**Protected Routes:**
- `/dashboard`
- `/dashboard/cases`
- `/dashboard/documents`
- `/dashboard/cases/[id]`

### 7.2 Dashboard Content

| Route | Content |
|-------|---------|
| `/dashboard` | Overview with recent cases and documents |
| `/dashboard/cases` | List of all user's cases |
| `/dashboard/documents` | List of all user's documents |
| `/dashboard/cases/[id]` | Case details + document downloads + regenerate button |

### 7.3 Document Download from Dashboard

**Flow:**
```
1. Dashboard calls GET /api/documents?case_id=X
2. User clicks download → GET /api/documents/[id]
3. Endpoint verifies user_id ownership
4. Returns signed URL (1-hour expiry)
5. Browser downloads PDF
```

**Security:**
- Ownership verified via `user_id` check
- RLS policies prevent cross-user access
- Signed URLs are time-limited

---

## 8. DOCUMENT REGENERATION

### 8.1 Regeneration Capability

**Location:** Dashboard case detail page
**Button:** "Regenerate Document"
**File:** `src/app/dashboard/cases/[id]/page.tsx`

**Flow:**
```typescript
const handleRegenerateDocument = async () => {
  await fetch('/api/documents/generate', {
    method: 'POST',
    body: JSON.stringify({
      case_id: caseId,
      document_type: caseDetails.case_type,
      is_preview: false,  // Triggers payment check
    }),
  });
};
```

**Payment Verification:** ✅ Yes - `assertPaidEntitlement()` called because `is_preview: false`

### 8.2 Editing After Purchase

- ✅ Users can edit case facts after purchase
- ✅ Users can regenerate documents with updated facts
- ❓ No explicit limit on regenerations
- Old documents remain in storage (not automatically deleted)

---

## 9. ANONYMOUS TO AUTHENTICATED TRANSITION

### 9.1 Session Token System

**File:** `src/lib/session-token.ts`

**Mechanism:**
- Anonymous users get UUID stored in `localStorage` as `lh_session_token`
- Sent in requests via `x-session-token` header
- RLS policies check `session_token` for anonymous document access

### 9.2 Case Claiming During Checkout

**Flow:**
```
1. Anonymous user clicks "Purchase"
2. SignupModal appears
3. User creates account via POST /api/auth/signup
4. Case linked via POST /api/cases/${caseId}/link
5. Checkout proceeds with authenticated user
```

**Case Link Endpoint:** `POST /api/cases/[id]/link`
**File:** `src/app/api/cases/[id]/link/route.ts`

**What Happens:**
```typescript
await supabase.from('cases').update({
  user_id: user.id,
  anonymous_user_id: null,
}).eq('id', caseId);
```

### 9.3 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Different email than Stripe | Case linked to account created, not Stripe email |
| Orphaned anonymous cases | Remain with `user_id = null` indefinitely |
| Same user, different browser | Cannot claim - no session token matching |

---

## 10. SECURITY AUDIT

### 10.1 Payment Bypass Analysis

| Potential Bypass | Status | Notes |
|------------------|--------|-------|
| Direct document download without payment | ❌ Protected | `is_preview: false` triggers payment check |
| Guessing document IDs | ❌ Protected | RLS + user_id ownership check |
| Sharing signed URLs | ⚠️ Limited risk | URLs expire in 1 hour |
| Modifying `is_preview` flag in database | ❌ Protected | Only server-side code can write |
| Accessing `/api/notice-only/preview/[caseId]` | ❌ Protected | Calls `assertPaidEntitlement()` |

### 10.2 Potential Improvements

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| Preview documents downloadable without watermarks | Medium | Consider re-adding watermarks or reducing preview to 1 page |
| No regeneration limit | Low | Add rate limiting or count to prevent abuse |
| Orphaned anonymous cases | Low | Add cleanup job for old anonymous cases |
| Confusing endpoint naming | Low | Rename `/api/notice-only/preview` to `/api/notice-only/pack` |

### 10.3 Defense in Depth Summary

| Layer | Mechanism |
|-------|-----------|
| Client-side | `useAuthCheck()` redirects unauthenticated users |
| API Layer | `requireServerAuth()` / `tryGetServerUser()` |
| Payment Layer | `assertPaidEntitlement()` checks orders table |
| Database Layer | RLS policies filter by user_id |
| Storage Layer | Signed URLs with 1-hour expiry |
| Anonymous Layer | Session token validation via header |

---

## User Journey Flowchart

```
[Landing Page] → [/wizard] → [Select Product] → [Select Jurisdiction]
      ↓
[/wizard/flow] → [Answer Questions] → [Auto-save each answer]
      ↓
[Wizard Complete] → [/wizard/preview/[caseId]]
      ↓
[View 2-page Preview] → [Click "Purchase"]
      ↓
[Anonymous?] → YES → [SignupModal] → [Create Account] → [Link Case]
      ↓                                       ↓
      NO ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
      ↓
[POST /api/checkout/create] → [Order Created (pending)]
      ↓
[Redirect to Stripe Checkout] → [Payment]
      ↓
[Success] → [Webhook: checkout.session.completed]
      ↓
[Update Order: paid] → [fulfillOrder()] → [Generate Documents]
      ↓
[Send Confirmation Email] → [Redirect to /dashboard/cases/[id]]
      ↓
[User Downloads Documents] → [Signed URLs, 1-hour expiry]
```

---

## Database Record Lifecycle

| Stage | Tables Modified | Key Fields |
|-------|-----------------|------------|
| Wizard Start | `cases`, `case_facts` | status='in_progress', user_id (nullable) |
| Each Answer | `case_facts`, `cases.collected_facts` | facts (JSON), version++ |
| Wizard Complete | `cases` | wizard_completed_at, wizard_progress=100 |
| Preview Generate | `documents` | is_preview=true, pdf_url |
| Checkout Start | `orders` | payment_status='pending' |
| Payment Success | `orders` | payment_status='paid', paid_at |
| Fulfillment | `documents`, `orders` | is_preview=false, fulfillment_status='fulfilled' |

---

## Revenue Protection Summary

| Protection | Implemented | How |
|------------|-------------|-----|
| Preview watermarks | ❌ Removed | Previously CSS + PDF-lib, now removed |
| Preview page limit | ✅ Yes | `preparePreviewHtml()` limits to 2 pages |
| Preview header/footer | ✅ Yes | Red "PREVIEW ONLY" header, blue "What You Get" footer |
| Download blocked before payment | ✅ Yes | `assertPaidEntitlement()` on `is_preview: false` |
| Signed URLs | ✅ Yes | 1-hour expiry for documents, 15-min for evidence |
| Payment verification on download | ⚠️ Partial | Only on generation, not on existing document access |
| RLS policies | ✅ Yes | user_id and session_token checks |

---

## Email Summary

| Email Type | Trigger | Status |
|------------|---------|--------|
| Purchase confirmation | Stripe webhook | ✅ Implemented |
| Welcome email | User signup | ✅ Implemented |
| Password reset | Forgot password | ✅ Via Supabase Auth |
| Document ready | After fulfillment | ❌ Not implemented (covered by purchase confirmation) |
| Compliance reminders | Daily cron | ✅ Implemented (HMO Pro only) |

---

## Code File References

| Function | File Path |
|----------|-----------|
| Wizard start | `src/app/api/wizard/start/route.ts` |
| Question loading | `src/lib/wizard/mqs-loader.ts` |
| Answer saving | `src/app/api/wizard/answer/route.ts` |
| Document generation | `src/app/api/documents/generate/route.ts` |
| Payment verification | `src/lib/payments/entitlement.ts` |
| Fulfillment | `src/lib/payments/fulfillment.ts` |
| Document download | `src/app/api/documents/[id]/route.ts` |
| Preview generation | `src/app/api/documents/preview/[id]/route.ts` |
| Email sending | `src/lib/email/resend.ts` |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` |
| Checkout creation | `src/app/api/checkout/create/route.ts` |
| Case linking | `src/app/api/cases/[id]/link/route.ts` |
| Session tokens | `src/lib/session-token.ts` |
| Preview page | `src/app/wizard/preview/[caseId]/page.tsx` |
| Dashboard case page | `src/app/dashboard/cases/[id]/page.tsx` |

---

## Potential Issues Found

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| **Watermarks removed** - Users can screenshot/print 2-page preview | Medium | Re-add watermarks OR reduce preview to 1 page |
| **No document access logging** - Can't track who downloaded what | Low | Add audit log for document access |
| **Confusing endpoint naming** - `/api/notice-only/preview` is actually post-payment | Low | Rename to `/api/notice-only/pack` |
| **No regeneration limits** - Users can regenerate unlimited times | Low | Add rate limiting (e.g., 10/day) |
| **Orphaned anonymous cases** - Never cleaned up | Low | Add scheduled cleanup for cases > 30 days old with no user |
| **Missing GDPR download** - No way to export all user data | Medium | Add `/api/user/export` endpoint |
| **No explicit terms acceptance** - Terms link shown but not required | Medium | Add checkbox before checkout |

---

## Conclusion

The Landlord Heaven user journey is well-implemented with proper separation between free preview and paid access. The main revenue protection relies on page limiting (2 pages) and payment verification at document generation time.

**Key strengths:**
- Proper payment verification via `assertPaidEntitlement()`
- Defense in depth with RLS, auth checks, and signed URLs
- Smooth anonymous-to-authenticated transition

**Key concerns:**
- Watermarks have been removed, reducing preview protection
- Some edge cases around orphaned anonymous cases

The system is fundamentally sound but would benefit from re-evaluating the watermark removal decision and adding the recommended improvements above.
