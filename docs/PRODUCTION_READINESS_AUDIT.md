# LANDLORD HEAVEN - PRODUCTION READINESS AUDIT

**Date:** December 30, 2025
**Testing URL:** http://localhost:5000/
**Branch:** claude/audit-production-readiness-1dRwq

---

## EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| **Overall Production Readiness** | **72/100** |
| **Blockers (Must Fix)** | 8 |
| **Important Issues** | 14 |
| **Nice to Have** | 9 |

### Verdict
Landlord Heaven is a **well-architected, feature-complete legal document platform** with solid core functionality. The application can be deployed to production with targeted fixes for the 8 blocking issues identified. The codebase demonstrates good security practices, comprehensive test coverage setup, and proper separation of concerns.

---

## END-TO-END FLOW STATUS

| Step | Status | Notes |
|------|--------|-------|
| User signup (Supabase Auth) | ✅ | Email/password with verification |
| User login | ✅ | Rate limited (5/min), session cookies |
| Email verification | ✅ | Via Supabase magic link |
| Password reset | ⚠️ | Missing /auth/reset-password page |
| Start wizard | ✅ | Anonymous + authenticated supported |
| Save progress | ✅ | Auto-save to Supabase |
| Complete wizard | ✅ | All 4 products functional |
| Preview documents | ✅ | Watermarks removed (simplified UX) |
| Checkout/payment | ✅ | Stripe Checkout integration |
| Payment webhook | ✅ | Signature verified, idempotent |
| Document generation | ✅ | PDF-lib + Puppeteer |
| Document storage | ✅ | Supabase Storage (private) |
| Document unlock | ✅ | Payment entitlement check |
| PDF download | ✅ | Signed URLs (1hr expiry) |
| Dashboard access | ✅ | Full case/document management |
| Admin dashboard | ⚠️ | Missing refund/ban API endpoints |

---

## 1. USER REGISTRATION & AUTHENTICATION

### How It Works
- **Provider:** Supabase Auth (email/password only)
- **OAuth:** Not implemented
- **Email Verification:** Required (Supabase sends verification email)
- **Password Requirements:** Minimum 8 characters

### Auth Routes
| Route | Purpose | Status |
|-------|---------|--------|
| `/auth/login` | User login form | ✅ |
| `/auth/signup` | Registration form | ✅ |
| `/auth/forgot-password` | Request password reset | ✅ |
| `/auth/verify-email` | Post-signup confirmation page | ✅ |
| `/auth/reset-password` | Set new password | ❌ MISSING |
| `/auth/callback` | OAuth/email verification callback | ✅ |

### Auth API Endpoints
| Endpoint | Rate Limit | Validation |
|----------|-----------|-----------|
| `POST /api/auth/login` | 5/min | Zod schema |
| `POST /api/auth/signup` | 5/min | Zod schema |
| `POST /api/auth/logout` | None | Auth required |
| `POST /api/auth/forgot-password` | **None (ISSUE)** | Zod schema |
| `GET /api/auth/callback` | None | URL params |

### User Profile Storage
```sql
-- public.users table (extends auth.users)
id UUID PRIMARY KEY REFERENCES auth.users(id)
email TEXT UNIQUE NOT NULL
full_name TEXT
phone TEXT
stripe_customer_id TEXT
stripe_subscription_id TEXT
hmo_pro_active BOOLEAN DEFAULT FALSE
hmo_pro_tier TEXT -- '1-5', '6-10', '11-15', '16-20'
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Auth Issues
| Issue | Severity | Fix Required |
|-------|----------|--------------|
| Missing `/auth/reset-password` page | 🔴 Blocker | Create page to handle password reset |
| Missing `/api/auth/change-password` endpoint | 🔴 Blocker | Implement endpoint |
| Forgot password not rate limited | 🟡 Important | Add rate limiting |
| Settings page references wrong fields | 🟡 Important | Update to use hmo_pro_* fields |

---

## 2. WIZARD FLOWS

### Product Entry Points
| Product | Price | Entry URL | Wizard Type |
|---------|-------|-----------|-------------|
| Notice Only Pack | £29.99 | `/wizard?product=notice_only` | eviction |
| Complete Eviction Pack | £149.99 | `/wizard?product=complete_pack` | eviction |
| Money Claim Pack | £179.99 | `/wizard?product=money_claim` | money_claim |
| AST Standard | £9.99 | `/wizard?product=ast_standard` | tenancy_agreement |
| AST Premium | £14.99 | `/wizard?product=ast_premium` | tenancy_agreement |

### Jurisdiction Support
| Jurisdiction | Eviction | Money Claim | Tenancy Agreement |
|--------------|----------|-------------|-------------------|
| England | ✅ S8, S21 | ✅ | ✅ AST |
| Wales | ✅ S173 | ✅ | ✅ Occupation Contract |
| Scotland | ✅ Notice to Leave | ✅ Simple Procedure | ✅ PRT |
| Northern Ireland | ❌ | ❌ | ✅ Private Tenancy |

### MQS Question System
- **Location:** `/config/mqs/[product]/[jurisdiction].yaml`
- **Total Templates:** 107 Handlebars templates
- **Question Types:** text, textarea, date, number, currency, yes_no, radio, select, multiselect, scale, group, file_upload

### Data Storage
```
Source of Truth: case_facts.facts (JSONB - flat WizardFacts)
Mirrored Cache: cases.collected_facts (for convenience)
Conversion: wizardFactsToCaseFacts() for document generation
```

### Progress Saving
- **Auto-save:** After each answer via `/api/wizard/answer`
- **Resume:** Cases can be resumed from `/dashboard/cases/[id]`
- **Anonymous Support:** Yes - cases can be created without auth

### Wizard Status: ✅ PRODUCTION READY

---

## 3. PAYMENT FLOW (STRIPE)

### Integration Type
- **Method:** Stripe Checkout (redirect-based)
- **PCI Compliance:** Level 1 (no card data touches server)

### Products Configured
| Product | Amount | Stripe Price ID Env Var |
|---------|--------|------------------------|
| Notice Only | £29.99 | `STRIPE_PRICE_ID_NOTICE_ONLY` |
| Complete Pack | £149.99 | `STRIPE_PRICE_ID_EVICTION_PACK` |
| Money Claim | £179.99 | `STRIPE_PRICE_ID_MONEY_CLAIM` |
| AST Standard | £9.99 | `STRIPE_PRICE_ID_STANDARD_AST` |
| AST Premium | £14.99 | `STRIPE_PRICE_ID_PREMIUM_AST` |
| HMO Pro 1-5 | £19.99/mo | `STRIPE_PRICE_ID_HMO_PRO_1_5` |
| HMO Pro 6-10 | £24.99/mo | `STRIPE_PRICE_ID_HMO_PRO_6_10` |
| HMO Pro 11-15 | £29.99/mo | `STRIPE_PRICE_ID_HMO_PRO_11_15` |
| HMO Pro 16-20 | £34.99/mo | `STRIPE_PRICE_ID_HMO_PRO_16_20` |

### Webhook Events Handled
| Event | Handler Action |
|-------|---------------|
| `checkout.session.completed` (payment) | Create order, generate documents, send email |
| `checkout.session.completed` (subscription) | Activate HMO Pro, set trial end |
| `payment_intent.succeeded` | Update order status |
| `payment_intent.payment_failed` | Mark order failed |
| `customer.subscription.updated` | Update HMO Pro status |
| `customer.subscription.deleted` | Deactivate HMO Pro |
| `invoice.paid` | Confirm subscription active |
| `invoice.payment_failed` | Deactivate HMO Pro |

### Security
- ✅ Webhook signature verification
- ✅ Idempotency via `webhook_logs` table
- ✅ Payload redaction before logging

### Payment Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| No refund webhook handler | 🟡 Important | Add `charge.refunded` handler |
| No dispute handler | 🟡 Important | Add `charge.dispute.*` handlers |
| Missing exponential backoff | 🟢 Nice to have | Add retry logic |

### Payment Status: ✅ PRODUCTION READY

---

## 4. POST-PAYMENT DOCUMENT ACCESS

### Access Flow
1. User completes payment on Stripe Checkout
2. Webhook receives `checkout.session.completed`
3. `fulfillOrder()` generates documents with `is_preview = false`
4. PDFs uploaded to Supabase Storage (`documents` bucket)
5. Document records created in `documents` table
6. User accesses documents via `/dashboard/documents`
7. Download generates signed URL (1-hour expiry)

### Access Control
```typescript
// Payment entitlement check before final document generation
await assertPaidEntitlement({ caseId, product });
// Returns 402 PAYMENT_REQUIRED if no paid order exists
```

### Document Features
| Feature | Status |
|---------|--------|
| Preview (watermarked) | ✅ (watermarks removed per simplified UX) |
| Final (paid) | ✅ |
| PDF download | ✅ Signed URLs |
| Regenerate documents | ✅ |
| Access expiry | None (indefinite) |
| Multiple downloads | ✅ Unlimited |

### Document Access: ✅ PRODUCTION READY

---

## 5. USER DASHBOARD

### Routes
| Route | Purpose | Status |
|-------|---------|--------|
| `/dashboard` | Overview with stats | ✅ |
| `/dashboard/cases` | Case list with filters | ✅ |
| `/dashboard/cases/[id]` | Case detail & management | ✅ |
| `/dashboard/documents` | Document list | ✅ |
| `/dashboard/profile` | Profile management | ✅ |
| `/dashboard/settings` | Account settings | ⚠️ |
| `/dashboard/billing` | Order history | ✅ |
| `/dashboard/hmo` | HMO Pro dashboard | ✅ |
| `/dashboard/hmo/properties` | Property management | ✅ |
| `/dashboard/hmo/tenants` | Tenant management | ✅ |

### Dashboard Features
- ✅ Case statistics (total, in progress, completed)
- ✅ Recent cases display (5 most recent)
- ✅ Document listing with type filters
- ✅ Quick actions sidebar
- ✅ Resume incomplete wizards
- ✅ Start new wizard from dashboard

### Dashboard Status: ✅ PRODUCTION READY

---

## 6. ADMIN DASHBOARD

### Admin Routes
| Route | Purpose | Status |
|-------|---------|--------|
| `/dashboard/admin` | Admin overview | ✅ |
| `/dashboard/admin/users` | User management | ✅ |
| `/dashboard/admin/orders` | Order management | ✅ |
| `/dashboard/admin/failed-payments` | Failed payment tracking | ✅ |
| `/dashboard/admin/ai-usage` | AI cost analytics | ✅ |

### Admin Access Control
- **Method:** Environment variable `ADMIN_USER_IDS` (comma-separated UUIDs)
- **Verification:** Server-side check on all admin API routes
- **No database role table** - purely env var based

### Admin Features
| Feature | Status | Notes |
|---------|--------|-------|
| View all users | ✅ | Paginated, searchable |
| View all orders | ✅ | Filterable, CSV export |
| View revenue/analytics | ✅ | Daily, monthly, all-time |
| View AI usage/costs | ✅ | By operation type |
| Failed payments | ✅ | List view |
| Refund processing | ❌ | API endpoint missing |
| Ban user | ❌ | API endpoint missing |
| Audit logging | ❌ | Not implemented |

### Admin Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| Missing `/api/admin/orders/refund` | 🔴 Blocker | Implement Stripe refund |
| Missing `/api/admin/users/ban` | 🟡 Important | Implement user ban |
| No admin action audit logging | 🟡 Important | Add to webhook_logs |
| NEXT_PUBLIC_ADMIN_USER_IDS exposed | 🟡 Important | Remove public version |

### Admin Status: ⚠️ NEEDS FIXES

---

## 7. SUPABASE CONFIGURATION

### Environment Variables Required
```env
# Server-side (secret)
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # CRITICAL - server only

# Browser-side (public)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Database Tables
| Table | Purpose | RLS |
|-------|---------|-----|
| `users` | User profiles (extends auth.users) | ✅ |
| `cases` | Wizard sessions & legal cases | ✅ |
| `case_facts` | Source of truth for wizard data | ✅ |
| `documents` | Generated legal documents | ✅ |
| `orders` | Purchase orders | ✅ |
| `hmo_properties` | HMO Pro properties | ✅ |
| `hmo_tenants` | HMO Pro tenants | ✅ |
| `hmo_compliance_items` | HMO compliance tracking | ✅ |
| `councils` | UK council data (382 records) | ✅ (public read) |
| `ai_usage` | AI token/cost tracking | ✅ |
| `webhook_logs` | Stripe webhook audit trail | ✅ (service role) |
| `email_subscribers` | Lead capture | ✅ |
| `seo_pages` | SEO automation | ✅ (admin only) |

### Storage Buckets Required
| Bucket | Purpose | Access | Max Size |
|--------|---------|--------|----------|
| `documents` | PDFs & evidence files | PRIVATE | 10MB |

### Migrations
```
001_initial_schema.sql      (594 lines) - Core tables
002_councils_table.sql      (136 lines) - Council data
003_ai_usage_table.sql      (47 lines)  - AI tracking
003_seo_automation_schema.sql (457 lines) - SEO tables
004_allow_anonymous_wizard.sql (62 lines) - Anonymous cases
005_allow_anonymous_documents.sql (62 lines) - Anonymous docs
006_email_leads.sql         (20 lines)  - Lead capture
007_webhook_logs_processing_result.sql (3 lines) - Webhook logging
```

### Supabase Status: ✅ PRODUCTION READY

---

## 8. DOCUMENT GENERATION & STORAGE

### PDF Libraries
| Library | Version | Use Case |
|---------|---------|----------|
| pdf-lib | 1.17.1 | Official form filling (N5, N5B, N119) |
| Puppeteer | 24.31.0 | HTML to PDF conversion |
| Handlebars | 4.7.8 | Template rendering |

### Document Types (32 total)
**Eviction Notices:**
- Section 8 Notice (England)
- Section 21 Form 6A (England)
- Section 173 Notice (Wales)
- Notice to Leave (Scotland)

**Court Forms:**
- N5 Claim for Possession
- N5B Accelerated Procedure
- N119 Particulars of Claim
- Wales bilingual versions
- Scotland simple procedure forms

**Tenancy Agreements:**
- AST Standard/Premium (England)
- Occupation Contract (Wales)
- PRT (Scotland)
- Private Tenancy (N. Ireland)

**AI-Generated:**
- Witness Statement
- Compliance Audit
- Risk Assessment

**Guidance Documents:**
- Eviction Roadmap
- Service Instructions
- Evidence Checklist
- Court Filing Guide

### Storage
- **Bucket:** `documents` (Supabase Storage)
- **Path:** `{userId}/{caseId}/{documentType}_{timestamp}.pdf`
- **Access:** Signed URLs (1-hour expiry)

### Document Generation Status: ✅ PRODUCTION READY

---

## 9. API ENDPOINTS SUMMARY

### Total Routes: 60+

| Category | Count | Auth Required | Notes |
|----------|-------|---------------|-------|
| `/api/auth/*` | 7 | Mixed | Login/signup public |
| `/api/wizard/*` | 12 | No* | Anonymous allowed |
| `/api/checkout/*` | 3 | Yes | All protected |
| `/api/webhooks/*` | 1 | Signature | Stripe verification |
| `/api/documents/*` | 5 | Yes | All protected |
| `/api/admin/*` | 4 | Admin | Admin ID check |
| `/api/cases/*` | 4 | Yes | All protected |
| `/api/subscription/*` | 4 | Yes | All protected |
| `/api/hmo/*` | 7 | Yes + HMO Pro | Subscription check |
| `/api/users/*` | 1 | Yes | Protected |
| `/api/ask-heaven/*` | 3 | No* | Rate limited |
| `/api/leads/*` | 2 | No | Marketing |
| `/api/cron/*` | 2 | Token | CRON_SECRET |
| Others | 5+ | Mixed | Various |

### Security Patterns
- ✅ Rate limiting on auth (5/min)
- ✅ Zod validation on most endpoints
- ✅ Service role key server-only
- ⚠️ Anonymous wizard access (by design)
- ⚠️ Missing rate limits on some endpoints

---

## 10. ENVIRONMENT VARIABLES

### Required for Production (35+ variables)

```env
# === APPLICATION ===
NEXT_PUBLIC_APP_NAME="Landlord Heaven"
NEXT_PUBLIC_APP_URL="https://landlordheaven.co.uk"
NODE_ENV="production"

# === SUPABASE ===
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."

# === STRIPE ===
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_NOTICE_ONLY="price_..."
STRIPE_PRICE_ID_EVICTION_PACK="price_..."
STRIPE_PRICE_ID_MONEY_CLAIM="price_..."
STRIPE_PRICE_ID_STANDARD_AST="price_..."
STRIPE_PRICE_ID_PREMIUM_AST="price_..."
STRIPE_PRICE_ID_HMO_PRO_1_5="price_..."
STRIPE_PRICE_ID_HMO_PRO_6_10="price_..."
STRIPE_PRICE_ID_HMO_PRO_11_15="price_..."
STRIPE_PRICE_ID_HMO_PRO_16_20="price_..."

# === AI ===
OPENAI_API_KEY="sk-proj-..."
AI_MODEL_WIZARD="gpt-4o-mini"
AI_MODEL_DECISION="gpt-4o-mini"
AI_MODEL_GENERATION="gpt-4o-mini"
AI_MODEL_QA="gpt-4o-mini"

# === EMAIL ===
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Landlord Heaven <no-reply@landlordheaven.co.uk>"
RESEND_REPLY_TO_EMAIL="support@landlordheaven.co.uk"

# === SECURITY ===
CRON_SECRET="$(openssl rand -hex 32)"
ADMIN_USER_IDS=""  # Add after first admin signup

# === FEATURE FLAGS ===
NEXT_PUBLIC_ENABLE_HMO_PRO="true"
NEXT_PUBLIC_ENABLE_MONEY_CLAIMS="true"
NEXT_PUBLIC_ENABLE_SCOTLAND="true"
NEXT_PUBLIC_ENABLE_NORTHERN_IRELAND="true"

# === ANALYTICS (Optional) ===
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
LOG_LEVEL="warn"
```

### Hardcoded Values to Fix
| Location | Issue | Fix |
|----------|-------|-----|
| `/src/lib/api.ts:10` | `localhost:3000` fallback | Use env var only |
| `/src/middleware.ts` | Domain inconsistency (.com vs .co.uk) | Standardize |
| Multiple files | Mixed domain references | Choose one domain |

---

## 11. SECURITY AUDIT

### Strengths
- ✅ RLS enabled on all tables
- ✅ Service role key server-only
- ✅ Stripe webhook signature verification
- ✅ Rate limiting on auth endpoints
- ✅ Input validation with Zod
- ✅ Signed URLs for document access
- ✅ Password requirements enforced
- ✅ PCI compliant (Stripe Checkout)

### Issues

| Issue | Severity | Category |
|-------|----------|----------|
| Missing security headers (HSTS, CSP) | 🔴 HIGH | Headers |
| Anonymous case RLS too permissive | 🔴 HIGH | RLS |
| Evidence download lacks session validation | 🔴 HIGH | Storage |
| No admin audit logging | 🟡 MEDIUM | Compliance |
| serverActions allowedOrigins: ["*"] | 🟡 MEDIUM | CORS |
| NEXT_PUBLIC_ADMIN_USER_IDS exposed | 🟡 MEDIUM | Auth |
| Rate limiter in-memory only | 🟡 MEDIUM | Scaling |
| Password reset not rate limited | 🟡 MEDIUM | Auth |

### Recommended Headers (add to vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com;" }
      ]
    }
  ]
}
```

---

## 12. THIRD-PARTY INTEGRATIONS

| Integration | Status | Env Var | Notes |
|-------------|--------|---------|-------|
| Supabase Database | ✅ Ready | `SUPABASE_URL` | All migrations ready |
| Supabase Auth | ✅ Ready | `SUPABASE_ANON_KEY` | Email/password |
| Supabase Storage | ✅ Ready | (same) | `documents` bucket |
| Stripe Payments | ✅ Ready | `STRIPE_SECRET_KEY` | 9 products to create |
| Stripe Webhooks | ✅ Ready | `STRIPE_WEBHOOK_SECRET` | Signature verified |
| OpenAI | ✅ Ready | `OPENAI_API_KEY` | GPT-4o Mini |
| Resend Email | ✅ Ready | `RESEND_API_KEY` | Domain verification needed |
| Google Analytics | ⚠️ Optional | `GA_MEASUREMENT_ID` | Not required |
| Sentry | ❌ Not Implemented | `SENTRY_DSN` | Recommended |

---

## 13. DEPLOYMENT READINESS

### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "functions": { "api/**": { "maxDuration": 60 } },
  "crons": [
    { "path": "/api/seo/cron/daily", "schedule": "0 2 * * *" },
    { "path": "/api/cron/compliance-check", "schedule": "0 8 * * *" }
  ]
}
```

### Security Headers (Already Configured)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ❌ HSTS (missing)
- ❌ CSP (missing)

### Build Status
- Framework: Next.js 16.0.7
- TypeScript: Strict mode enabled
- React: 19.2.0 with React Compiler

---

## BLOCKING ISSUES (Must Fix Before Launch)

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | Missing `/auth/reset-password` page | `/src/app/auth/` | Users can't reset passwords | Create reset password page |
| 2 | Missing `/api/auth/change-password` endpoint | `/src/app/api/auth/` | Settings page broken | Implement endpoint |
| 3 | Missing `/api/admin/orders/refund` endpoint | `/src/app/api/admin/` | Admin can't process refunds | Implement Stripe refund |
| 4 | Missing security headers (HSTS) | `vercel.json` | Security vulnerability | Add HSTS header |
| 5 | Anonymous case RLS too permissive | Supabase migrations | Data exposure risk | Add session validation |
| 6 | Evidence download lacks session check | `/api/evidence/download` | Unauthorized access | Add session token |
| 7 | Domain inconsistency | Multiple files | Broken redirects | Standardize to .co.uk |
| 8 | serverActions allowedOrigins: ["*"] | `next.config.ts` | CSRF vulnerability | Restrict origins |

---

## IMPORTANT ISSUES (Should Fix Before Launch)

| # | Issue | Impact | Fix |
|---|-------|--------|-----|
| 1 | No admin audit logging | Compliance risk | Add logging to webhook_logs |
| 2 | NEXT_PUBLIC_ADMIN_USER_IDS exposed | Security risk | Remove public env var |
| 3 | Rate limiter in-memory only | Won't scale | Move to Redis |
| 4 | Password reset not rate limited | Email flooding | Add rate limit |
| 5 | Missing refund webhook handler | Sync issues | Add charge.refunded handler |
| 6 | Missing dispute webhook handler | Legal risk | Add dispute handlers |
| 7 | Missing ban user endpoint | Moderation blocked | Implement user ban |
| 8 | Settings page wrong field names | UI broken | Fix field references |
| 9 | No GDPR data export | Compliance | Add /api/users/export |
| 10 | Sentry not integrated | Blind to errors | Add error tracking |
| 11 | Missing CSP header | XSS risk | Add CSP |
| 12 | Localhost fallbacks in code | Production breaks | Remove fallbacks |
| 13 | No admin session timeout | Security risk | Add timeout |
| 14 | useAuthCheck hook underutilized | Routes unprotected | Implement guards |

---

## NICE TO HAVE

| # | Issue | Impact |
|---|-------|--------|
| 1 | Add Apple Pay / Google Pay | Higher conversion |
| 2 | Document preview regeneration | Better UX |
| 3 | Case templates/duplicates | Faster repeat use |
| 4 | Document usage analytics | Business insights |
| 5 | Automated backups documented | Data safety |
| 6 | VAT/tax handling | UK compliance |
| 7 | Proration preview for upgrades | Transparency |
| 8 | Dunning management | Revenue recovery |
| 9 | IP whitelisting for admin | Enhanced security |

---

## SUPABASE SETUP CHECKLIST

- [ ] Create Supabase project at https://supabase.com
- [ ] Run all 8 migrations in order (001-007)
- [ ] Create storage bucket: `documents` (PRIVATE, 10MB limit)
- [ ] Verify RLS enabled on all tables
- [ ] Configure Auth settings:
  - [ ] Enable email confirmations
  - [ ] Set password minimum length: 8
  - [ ] Configure redirect URLs
- [ ] Customize email templates (optional)
- [ ] Note project URL and keys

---

## STRIPE SETUP CHECKLIST

- [ ] Create Stripe account (or use existing)
- [ ] Create 5 one-time products with prices:
  - [ ] Notice Only Pack - £29.99
  - [ ] Complete Eviction Pack - £149.99
  - [ ] Money Claim Pack - £179.99
  - [ ] AST Standard - £9.99
  - [ ] AST Premium - £14.99
- [ ] Create 4 subscription products (monthly + 7-day trial):
  - [ ] HMO Pro 1-5 properties - £19.99/mo
  - [ ] HMO Pro 6-10 properties - £24.99/mo
  - [ ] HMO Pro 11-15 properties - £29.99/mo
  - [ ] HMO Pro 16-20 properties - £34.99/mo
- [ ] Copy all Price IDs to env vars
- [ ] Configure webhook endpoint:
  - URL: `https://landlordheaven.co.uk/api/webhooks/stripe`
  - Events: checkout.session.completed, payment_intent.*, invoice.*, customer.subscription.*
- [ ] Copy webhook signing secret

---

## RECOMMENDED LAUNCH SEQUENCE

### Phase 1: Infrastructure (Day 1)
1. Create Supabase project
2. Run all database migrations
3. Create storage bucket
4. Create Stripe products and webhook
5. Set up Resend and verify domain

### Phase 2: Deployment (Day 1-2)
1. Connect GitHub repo to Vercel
2. Configure all environment variables
3. Deploy to preview environment
4. Test complete user flow

### Phase 3: Blockers (Day 2-3)
1. Create `/auth/reset-password` page
2. Implement `/api/auth/change-password`
3. Implement `/api/admin/orders/refund`
4. Add HSTS header
5. Fix anonymous case RLS
6. Add evidence download session check
7. Standardize domain
8. Restrict serverActions origins

### Phase 4: Testing (Day 3-4)
1. Test full signup → wizard → payment → download flow
2. Test password reset flow
3. Test admin dashboard
4. Test webhook with test payments
5. Verify all documents generate correctly

### Phase 5: Launch (Day 4-5)
1. Switch Stripe to live mode
2. Add first admin user ID
3. Final security review
4. Go live!

---

## TIME ESTIMATES

| Task Category | Estimated Time |
|---------------|----------------|
| Blocking fixes | 8-12 hours |
| Important fixes | 16-24 hours |
| Infrastructure setup | 4-6 hours |
| Testing | 8-12 hours |
| **Total to Production** | **36-54 hours (4-7 days)** |

---

## CONCLUSION

Landlord Heaven is a **comprehensive, well-architected legal document platform** that is approximately **72% production ready**. The core functionality (wizard, payments, document generation, dashboard) is complete and functional.

The 8 blocking issues identified are straightforward fixes that can be completed in 1-2 days. The remaining important and nice-to-have issues can be addressed post-launch as part of ongoing maintenance.

**Recommendation:** Proceed with deployment after addressing blocking issues. The platform is architecturally sound and follows good security practices.

---

*Generated by Production Readiness Audit - December 30, 2025*
