# 🚀 Landlord Heaven v3 - Quick Deployment Guide

**Complete AI-powered legal automation platform for UK landlords**

## What You're Deploying

✅ **6 Legal Products:**
- Notice Only (£29.99)
- Complete Eviction Pack (£149.99)
- Money Claim Pack (£129.99)
- Standard AST (£39.99)
- Premium AST (£59.00)
- HMO Pro Subscription (£19.99-£34.99/month)

✅ **AI-Powered Features:**
- Conversational fact-finding wizard (GPT-4o-mini)
- Document QA validation (Claude Sonnet 4.5)
- Real-time document generation
- 85+ quality score enforcement

✅ **Full Platform:**
- Authentication & email verification
- User dashboard (cases, documents, orders)
- HMO Pro dashboard (properties, tenants, compliance)
- Admin dashboard (stats, analytics, monitoring)
- Stripe payments & subscriptions
- Complete UK coverage (England & Wales, Scotland, Northern Ireland)

---

## Quick Start (5 Steps)

### 1. Prerequisites Setup

Create accounts at:
- ✅ [Vercel](https://vercel.com) - Hosting
- ✅ [Supabase](https://supabase.com) - Database & Auth
- ✅ [Stripe](https://stripe.com) - Payments
- ✅ [OpenAI](https://platform.openai.com) - AI (GPT-4o-mini)
- ✅ [Anthropic](https://console.anthropic.com) - AI (Claude Sonnet 4.5)
- ✅ [Resend](https://resend.com) - Emails

### 2. Configure Database

1. Create new Supabase project
2. Run the SQL from `docs/DATABASE_SCHEMA.md` in SQL Editor
3. Enable Row Level Security on all tables
4. Create storage bucket named `documents`
5. Copy your API keys

### 3. Set Up Stripe Products

Follow `docs/STRIPE_SETUP_GUIDE.md`:

**Create 5 one-time products:**
- Notice Only - £29.99
- Complete Eviction Pack - £149.99
- Money Claim Pack - £129.99
- Standard AST - £39.99
- Premium AST - £59.00

**Create 4 HMO Pro tiers (all with 7-day trial):**
- Starter (1-5 properties) - £19.99/month
- Growth (6-10 properties) - £24.99/month
- Professional (11-15 properties) - £29.99/month
- Enterprise (16-20 properties) - £34.99/month

Copy all 9 price IDs!

### 4. Deploy to Vercel

1. Push code to GitHub
2. Import repository to Vercel
3. Add ALL environment variables (see `.env.example`)
4. Deploy!

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
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
ADMIN_USER_IDS=  # Add after first deployment
```

### 5. Post-Deployment Setup

1. **Create Admin Account:**
   - Sign up on your deployed site
   - Get your user ID from Supabase → Authentication → Users
   - Add to `ADMIN_USER_IDS` env var in Vercel
   - Redeploy

2. **Configure Stripe Webhook:**
   - Go to Stripe → Developers → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events (see deployment guide)
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

3. **Set Up Emails:**
   - Add domain to Resend
   - Configure DNS records
   - Verify domain

---

## Testing Your Deployment

### ✅ Authentication
1. Sign up with email
2. Verify email received
3. Confirm account
4. Log in successfully

### ✅ Wizard Flow
1. Click "New Document"
2. Select "Eviction" → "England & Wales"
3. Complete AI-powered fact-finding
4. Verify document generation

### ✅ Payments
1. Select "Complete Eviction Pack"
2. Pay with test card: `4242 4242 4242 4242`
3. Verify order in dashboard
4. Check webhook in Stripe

### ✅ HMO Pro
1. Go to pricing
2. Select HMO Pro tier
3. Start 7-day free trial
4. Access HMO Pro dashboard
5. Add property and tenant

### ✅ Admin Dashboard
1. Add your ID to `ADMIN_USER_IDS`
2. Visit `/dashboard/admin`
3. Verify all stats load

---

## 📚 Full Documentation

For detailed guides:

- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Verify every step
- **[Stripe Setup Guide](docs/STRIPE_SETUP_GUIDE.md)** - Configure all products
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Full database structure
- **[API Documentation](docs/API_ROUTES.md)** - All 38+ endpoints
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS APP (VERCEL)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Frontend   │  │  API Routes  │  │  AI Integration │  │
│  │              │  │              │  │                 │  │
│  │ • Auth Pages │  │ • /api/auth  │  │ • OpenAI GPT-4o │  │
│  │ • Dashboard  │  │ • /api/cases │  │ • Claude Sonnet │  │
│  │ • Wizard UI  │  │ • /api/docs  │  │ • Fact-finding  │  │
│  │ • HMO Pro    │  │ • /api/hmo   │  │ • QA Validation │  │
│  │ • Admin      │  │ • /api/admin │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
           │                  │                    │
           ▼                  ▼                    ▼
   ┌──────────────┐  ┌──────────────┐   ┌─────────────────┐
   │   SUPABASE   │  │    STRIPE    │   │   AI SERVICES   │
   │              │  │              │   │                 │
   │ • PostgreSQL │  │ • Checkout   │   │ • OpenAI API    │
   │ • Auth       │  │ • Webhooks   │   │ • Anthropic API │
   │ • Storage    │  │ • Subs       │   │                 │
   │ • RLS        │  │              │   │                 │
   └──────────────┘  └──────────────┘   └─────────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- React Server Components

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL + Auth + Storage)
- Row Level Security (RLS)

**AI:**
- OpenAI GPT-4o-mini (fact-finding)
- Anthropic Claude Sonnet 4.5 (QA)

**Payments:**
- Stripe Checkout
- Stripe Subscriptions
- Webhook handling

**Email:**
- Resend API
- Email verification
- Password reset

---

## 🎯 Key Features

### 1. AI-Powered Wizard
- Conversational interface (like Claude for legal)
- 8 smart input types
- Auto-advancing multiple choice
- Real-time context panel
- Progress tracking (0-100%)

### 2. Multi-Dashboard System
- **User Dashboard:** Cases, documents, orders, settings
- **HMO Pro Dashboard:** Properties (up to 20), tenants, compliance, analytics
- **Admin Dashboard:** Platform stats, users, revenue, AI usage

### 3. Complete Payment System
- 5 one-time products
- 4 subscription tiers
- 7-day free trial on HMO Pro
- Automatic fulfillment
- Webhook-driven order processing

### 4. UK-Wide Coverage
- England & Wales jurisdiction
- Scotland jurisdiction
- Northern Ireland jurisdiction
- 380+ council data

### 5. HMO Pro Features
- Property management (up to 20 properties)
- Tenant tracking (leases, rent, deposits)
- Compliance monitoring (license expiry alerts)
- Portfolio analytics (occupancy, revenue)

---

## Cost Estimates (Monthly)

**Assuming 1,000 active users:**

| Service | Usage | Cost |
|---------|-------|------|
| Vercel (Pro) | Hosting | $20 |
| Supabase (Pro) | Database + Auth | $25 |
| OpenAI | ~500k tokens/month | $5-10 |
| Anthropic | ~300k tokens/month | $3-6 |
| Resend | 10k emails | Free-$20 |
| Stripe | Transaction fees | 1.5% + 20p per charge |
| **Total** | | **~$70-100/month** |

**Revenue potential:**
- 100 eviction packs/month × £149.99 = £14,999
- 50 HMO Pro subscriptions × £24.99 = £1,249.50/month
- **Total: ~£16,000/month** 💰

---

## Support & Troubleshooting

**Common Issues:**

**Build fails on Vercel?**
→ Clear cache in Project Settings → General → Clear Cache

**Database connection issues?**
→ Verify Supabase env vars and RLS policies

**Stripe webhooks not working?**
→ Check webhook secret matches Stripe dashboard

**AI requests failing?**
→ Verify API keys have credits and are correct

**Emails not sending?**
→ Verify Resend domain is verified

**Admin access denied?**
→ Add user UUID to ADMIN_USER_IDS and redeploy

---

## Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Supabase database schema applied
- [ ] All 9 Stripe products configured
- [ ] Stripe webhook configured
- [ ] Resend domain verified
- [ ] Admin user IDs added
- [ ] Test complete user flow
- [ ] Test payment with real card (small amount)
- [ ] Test subscription flow
- [ ] Monitor logs for 24 hours
- [ ] Set up error tracking (Sentry recommended)

---

## 🎉 You're Ready!

Follow the **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** step-by-step for a smooth deployment.

**Questions?** Check the **[Full Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**.

---

**Built with ❤️ for UK Landlords**

Good luck with your deployment! 🚀
