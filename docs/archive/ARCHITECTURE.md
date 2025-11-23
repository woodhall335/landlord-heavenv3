# 🏗️ Landlord Heaven v3 - System Architecture

Complete architectural overview of the platform.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Scalability Strategy](#scalability-strategy)
7. [Deployment Architecture](#deployment-architecture)

---

## High-Level Overview

Landlord Heaven v3 is a **full-stack AI-powered legal automation platform** for UK landlords, built with Next.js 14, Supabase, and multiple AI services.

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Landing     │  │  Wizard UI   │  │  Dashboards            │   │
│  │  Pages       │  │  (React)     │  │  (User/HMO/Admin)      │   │
│  └──────────────┘  └──────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 14 APPLICATION (Vercel)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                    Frontend Layer                         │      │
│  │  • Server Components (RSC)                                │      │
│  │  • Client Components                                      │      │
│  │  • App Router (file-based routing)                        │      │
│  └──────────────────────────────────────────────────────────┘      │
│                              │                                       │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                  API Routes Layer                         │      │
│  │  • /api/auth/*          • /api/wizard/*                   │      │
│  │  • /api/cases/*         • /api/checkout/*                 │      │
│  │  • /api/documents/*     • /api/hmo/*                      │      │
│  │  • /api/admin/*         • /api/webhooks/*                 │      │
│  └──────────────────────────────────────────────────────────┘      │
│                              │                                       │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │               Business Logic Layer                        │      │
│  │  • Authentication Logic   • Payment Processing            │      │
│  │  • Wizard Flow Engine     • Document Generation          │      │
│  │  • AI Integration         • HMO Management               │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
         │              │                │                │
         ▼              ▼                ▼                ▼
┌──────────────┐ ┌──────────┐ ┌────────────────┐ ┌──────────────┐
│   SUPABASE   │ │  STRIPE  │ │  AI SERVICES   │ │   RESEND     │
│              │ │          │ │                │ │              │
│ • PostgreSQL │ │ • Checkout│ │ • OpenAI       │ │ • Email      │
│ • Auth       │ │ • Subs   │ │   GPT-4o-mini  │ │   Sending    │
│ • Storage    │ │ • Webhooks│ │ • Anthropic    │ │ • Templates  │
│ • RLS        │ │          │ │   Claude 4.5   │ │              │
└──────────────┘ └──────────┘ └────────────────┘ └──────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 3.x | Styling |
| **Headless UI** | 1.x | Accessible UI components |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 14.x | Serverless API endpoints |
| **Supabase** | Latest | PostgreSQL + Auth + Storage |
| **Zod** | 3.x | Runtime validation |
| **jose** | 4.x | JWT handling |

### AI & ML

| Service | Model | Purpose |
|---------|-------|---------|
| **OpenAI** | GPT-4o-mini | Conversational wizard fact-finding |
| **Anthropic** | Claude Sonnet 4.5 | Document QA validation (85+ score) |
| **OpenAI** | DALL·E 3 | Featured image generation (optional) |

### Payments

| Service | Purpose |
|---------|---------|
| **Stripe** | Payment processing, subscriptions, webhooks |

### Email

| Service | Purpose |
|---------|---------|
| **Resend** | Transactional emails, verification, password reset |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting, deployment, edge functions |
| **Supabase** | Database, auth, file storage |
| **GitHub** | Version control, CI/CD |

---

## System Components

### 1. Authentication System

**Components:**
- Supabase Auth (email/password)
- Cookie-based sessions
- Email verification
- Password reset flow

**Flow:**
```
User Sign Up
  ↓
Create Supabase User
  ↓
Send Verification Email (Resend)
  ↓
User Clicks Link
  ↓
Verify Email
  ↓
Set Auth Cookie
  ↓
Redirect to Dashboard
```

**Security:**
- Passwords hashed with bcrypt (Supabase default)
- HTTP-only cookies
- CSRF protection
- Rate limiting on auth routes

---

### 2. Wizard System (Main Sales Funnel)

**Architecture:**

```
┌────────────────────────────────────────────────────┐
│              Wizard Container                      │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Conversation    │  │  Context Panel        │  │
│  │  (60%)           │  │  (40%)                │  │
│  │                  │  │                       │  │
│  │  • Messages      │  │  • Collected Facts    │  │
│  │  • AI Responses  │  │  • Progress Bar       │  │
│  │  • Input Area    │  │  • Case Summary       │  │
│  └──────────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────┘
              │
              │ POST /api/wizard/next-question
              ▼
┌────────────────────────────────────────────────────┐
│         AI Fact-Finding Engine                     │
│                                                     │
│  1. Receive collected facts                        │
│  2. Generate context prompt for GPT-4o-mini        │
│  3. Get next question + input type                 │
│  4. Return to frontend                             │
│  5. Save progress to Supabase                      │
└────────────────────────────────────────────────────┘
              │
              │ When complete
              ▼
┌────────────────────────────────────────────────────┐
│         Document Generation Pipeline               │
│                                                     │
│  1. Analyze all collected facts                    │
│  2. Determine recommended route                    │
│  3. Generate document via Claude Sonnet 4.5        │
│  4. QA validation (85+ score required)             │
│  5. Save to Supabase Storage                       │
│  6. Create document record                         │
└────────────────────────────────────────────────────┘
```

**8 Input Types:**
1. Multiple Choice (auto-advancing)
2. Currency Input (GBP formatting)
3. Date Input (DD/MM/YYYY with quick options)
4. Yes/No Toggle (with warnings)
5. Text Input (with character counter)
6. Multiple Selection (checkboxes)
7. File Upload (drag & drop, 10MB limit)
8. Scale Slider (severity/frequency ratings)

---

### 3. Payment System

**Architecture:**

```
User Selects Product
  ↓
POST /api/checkout/one-time or /subscription
  ↓
Create Stripe Checkout Session
  ↓
Redirect to Stripe Checkout
  ↓
User Completes Payment
  ↓
Stripe Webhook → /api/webhooks/stripe
  ↓
Handle Event (checkout.session.completed)
  ↓
Create Order Record in Supabase
  ↓
Update User Subscription (if applicable)
  ↓
Send Confirmation Email (Resend)
  ↓
Redirect to Success Page
```

**Products:**
1. **One-Time Products** (5):
   - Notice Only - £29.99
   - Complete Eviction Pack - £149.99
   - Money Claim Pack - £129.99
   - Standard AST - £39.99
   - Premium AST - £59.00

2. **HMO Pro Subscription** (4 tiers):
   - Starter (1-5 properties) - £19.99/month
   - Growth (6-10 properties) - £24.99/month
   - Professional (11-15 properties) - £29.99/month
   - Enterprise (16-20 properties) - £34.99/month

**Webhook Events Handled:**
- `checkout.session.completed` → Create order
- `payment_intent.succeeded` → Update payment status
- `customer.subscription.created` → Activate subscription
- `customer.subscription.updated` → Update subscription tier
- `customer.subscription.deleted` → Cancel subscription
- `invoice.payment_succeeded` → Renew subscription
- `invoice.payment_failed` → Send payment failure email

---

### 4. HMO Pro System

**Features:**
- Property management (up to 20 properties based on tier)
- Tenant tracking (leases, rent, deposits)
- Compliance monitoring (license expiry alerts)
- Portfolio analytics (occupancy rates, revenue)

**Access Control:**
```typescript
// Middleware checks subscription status
async function requireHMOProAccess(user: User) {
  if (!user.subscription_tier) {
    return { error: 'HMO Pro subscription required' };
  }

  if (user.subscription_status !== 'active' && user.subscription_status !== 'trialing') {
    return { error: 'Active subscription required' };
  }

  return { success: true };
}
```

**Property Limits:**
```typescript
const MAX_PROPERTIES = {
  starter: 5,
  growth: 10,
  professional: 15,
  enterprise: 20,
};
```

---

### 5. Admin System

**Access Control:**
```typescript
// Check if user is admin
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}
```

**Admin Dashboard Features:**
- Platform statistics (users, cases, revenue, MRR)
- User management
- Order analytics
- AI usage tracking
- System health monitoring

---

## Data Flow

### Wizard to Document Generation

```
1. USER INTERACTION
   ↓
   User answers questions in wizard UI
   Each answer triggers POST /api/wizard/next-question

2. AI FACT-FINDING
   ↓
   OpenAI GPT-4o-mini generates next question
   Based on: case type, jurisdiction, collected facts
   Stores progress in Supabase (cases table)

3. COMPLETION DETECTION
   ↓
   When wizard_progress = 100%
   POST /api/wizard/analyze

4. ANALYSIS PHASE
   ↓
   AI analyzes all collected facts
   Determines: recommended route, eligibility, warnings
   Stores analysis in cases table (ai_analysis column)

5. DOCUMENT GENERATION
   ↓
   POST /api/documents/generate
   Claude Sonnet 4.5 generates document
   QA validation (must score 85+)
   If < 85, regenerate with improvements

6. STORAGE
   ↓
   Upload PDF to Supabase Storage
   Create document record in documents table
   Link to case via case_id

7. USER NOTIFICATION
   ↓
   Show success message
   Provide download link
   Send email with document (if paid)
```

---

## Security Architecture

### 1. Authentication & Authorization

**Row Level Security (RLS):**

All Supabase tables have RLS enabled:

```sql
-- Example: Cases table
CREATE POLICY "Users can view own cases"
ON cases FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cases"
ON cases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
ON cases FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

**API Route Protection:**

```typescript
// Every protected route
export async function GET(request: Request) {
  const user = await requireServerAuth();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ... route logic
}
```

### 2. Data Security

**Encryption:**
- All data encrypted at rest (Supabase default)
- All data encrypted in transit (HTTPS only)
- Passwords hashed with bcrypt

**Sensitive Data:**
- Payment details never stored (handled by Stripe)
- API keys stored in environment variables
- No PII in logs

### 3. Input Validation

**All API routes use Zod schemas:**

```typescript
const CreateCaseSchema = z.object({
  case_type: z.enum(['eviction', 'money_claim', 'tenancy_agreement']),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
});

// In route
const validationResult = CreateCaseSchema.safeParse(body);
if (!validationResult.success) {
  return NextResponse.json(
    { error: 'Invalid input', details: validationResult.error },
    { status: 400 }
  );
}
```

### 4. Rate Limiting

**Implementation:**

```typescript
// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(identifier: string, limit: number, window: number): boolean {
  const now = Date.now();
  const requests = rateLimiter.get(identifier) || [];

  // Remove old requests outside window
  const recent = requests.filter(time => now - time < window);

  if (recent.length >= limit) {
    return false; // Rate limit exceeded
  }

  recent.push(now);
  rateLimiter.set(identifier, recent);
  return true;
}
```

**Limits:**
- Auth routes: 10 requests per 15 minutes per IP
- Standard routes: 100 requests per 15 minutes per user
- Admin routes: 500 requests per 15 minutes per admin

---

## Scalability Strategy

### 1. Database Scaling

**Current: Supabase Free Tier**
- 500MB database
- Unlimited API requests
- 1GB file storage

**Scaling Path:**
1. **Pro Tier** (£25/month): 8GB database, 100GB storage
2. **Team Tier** (£599/month): Dedicated resources
3. **Enterprise**: Custom infrastructure

**Optimization:**
- Indexes on frequently queried columns
- Materialized views for analytics
- Partitioning for large tables (cases, documents)

### 2. Application Scaling

**Vercel Auto-Scaling:**
- Serverless functions scale automatically
- Edge caching for static assets
- Global CDN

**Optimization:**
- Server components for static content
- Client components only where needed
- Dynamic imports for large components
- Image optimization with Next.js Image

### 3. AI Cost Management

**Token Usage Optimization:**

```typescript
// Use cheaper model for fact-finding
const factFindingModel = 'gpt-4o-mini'; // $0.15 per 1M tokens

// Use premium model for document generation
const documentModel = 'claude-sonnet-4.5'; // $3.00 per 1M tokens

// Track usage
await trackTokenUsage({
  user_id,
  model,
  operation,
  prompt_tokens,
  completion_tokens,
  cost_usd,
});
```

**Caching:**
- Cache common wizard flows
- Cache jurisdiction-specific prompts
- Cache council data lookups

### 4. File Storage

**Current: Supabase Storage**
- 1GB free tier
- CDN distribution

**Scaling:**
- Migrate to S3 for large files
- CloudFront CDN for global distribution
- Implement file compression

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│           Vercel Edge Network           │
│  ┌───────────────────────────────────┐  │
│  │     Next.js Application           │  │
│  │  • Serverless Functions           │  │
│  │  • Edge Functions                 │  │
│  │  • Static Assets (CDN)            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │              │
              │              │
              ▼              ▼
┌──────────────────┐  ┌──────────────────┐
│    Supabase      │  │  External APIs   │
│  • Database      │  │  • Stripe        │
│  • Auth          │  │  • OpenAI        │
│  • Storage       │  │  • Anthropic     │
│  • Realtime      │  │  • Resend        │
└──────────────────┘  └──────────────────┘
```

### Environment Configuration

**Required Environment Variables:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Stripe (9 price IDs + keys)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_NOTICE_ONLY=
STRIPE_PRICE_ID_EVICTION_PACK=
STRIPE_PRICE_ID_MONEY_CLAIM=
STRIPE_PRICE_ID_STANDARD_AST=
STRIPE_PRICE_ID_PREMIUM_AST=
STRIPE_PRICE_ID_HMO_PRO_1_5=
STRIPE_PRICE_ID_HMO_PRO_6_10=
STRIPE_PRICE_ID_HMO_PRO_11_15=
STRIPE_PRICE_ID_HMO_PRO_16_20=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
ADMIN_USER_IDS=
```

### CI/CD Pipeline

```
1. Push to GitHub
   ↓
2. Vercel detects push
   ↓
3. Runs build
   - npm install
   - npm run build
   - TypeScript check
   - Linting
   ↓
4. Deploy to preview (for PRs)
   OR
   Deploy to production (for main branch)
   ↓
5. Run post-deployment checks
   - Health check
   - Database migration (if needed)
   - Cache warming
```

### Monitoring & Logging

**Vercel Analytics:**
- Request logs
- Error tracking
- Performance metrics
- Core Web Vitals

**Supabase:**
- Database metrics
- Query performance
- Auth events
- Storage usage

**Custom Logging:**
```typescript
// Structured logging
logger.info('Wizard question generated', {
  case_id,
  question_id,
  input_type,
  tokens_used,
  cost_usd,
});

logger.error('Document generation failed', {
  case_id,
  error: error.message,
  stack: error.stack,
});
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Page Load Time** | < 2s | TBD |
| **API Response Time** | < 500ms | TBD |
| **AI Generation Time** | < 3s | TBD |
| **Document Generation** | < 10s | TBD |
| **Uptime** | 99.9% | TBD |

**Core Web Vitals Targets:**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## Disaster Recovery

### Backup Strategy

**Database:**
- Supabase automatic daily backups
- Point-in-time recovery (up to 7 days)
- Manual backup before major changes

**Files:**
- Supabase Storage automatic replication
- S3 backup for critical documents

**Code:**
- Git version control
- GitHub repository backup
- Tagged releases for rollback

### Recovery Procedures

**Database Restore:**
```sql
-- Supabase dashboard → Database → Backups
-- Select backup date → Restore
```

**Application Rollback:**
```bash
# Vercel dashboard → Deployments
# Select previous deployment → Promote to Production
```

**Emergency Contact:**
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.io

---

## Future Enhancements

### Phase 2 (Q1 2025)

1. **SEO Automation** (See SEO_AUTOMATION_SPEC.md)
   - Automated content generation
   - Backlink acquisition engine
   - Performance optimization

2. **Mobile Apps**
   - React Native iOS/Android app
   - Push notifications for HMO Pro

3. **Advanced Analytics**
   - User behavior tracking
   - Conversion funnel analysis
   - Revenue forecasting

### Phase 3 (Q2 2025)

1. **Multi-Language Support**
   - Welsh language (legal requirement)
   - Polish (large landlord demographic)

2. **Integration Marketplace**
   - Property management systems
   - Accounting software
   - CRM systems

3. **AI Enhancements**
   - Voice input for wizard
   - Document summarization
   - Predictive case outcomes

---

**END OF ARCHITECTURE DOCUMENTATION**
