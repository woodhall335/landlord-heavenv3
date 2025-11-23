# Landlord Heaven v3 - Deployment Guide

Complete guide for deploying Landlord Heaven v3 to Vercel production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Stripe Configuration](#stripe-configuration)
5. [Vercel Deployment](#vercel-deployment)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Vercel account ([vercel.com](https://vercel.com))
- ✅ Supabase project ([supabase.com](https://supabase.com))
- ✅ Stripe account ([stripe.com](https://stripe.com))
- ✅ OpenAI API key ([platform.openai.com](https://platform.openai.com))
- ✅ Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- ✅ Resend account for emails ([resend.com](https://resend.com))
- ✅ GitHub repository connected to Vercel

---

## Environment Setup

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure All Environment Variables

#### **Supabase** (Database & Auth)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL, anon/public key, and service_role key

#### **OpenAI** (Fact-Finding Wizard)

```bash
OPENAI_API_KEY=sk-...
```

**How to get this:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys
3. Create new secret key

#### **Anthropic** (QA Validation)

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

**How to get this:**
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Navigate to API Keys
3. Create new API key

#### **Stripe** (Payments)

```bash
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...

# One-time product price IDs
STRIPE_PRICE_ID_NOTICE_ONLY=price_...
STRIPE_PRICE_ID_EVICTION_PACK=price_...
STRIPE_PRICE_ID_MONEY_CLAIM=price_...
STRIPE_PRICE_ID_STANDARD_AST=price_...
STRIPE_PRICE_ID_PREMIUM_AST=price_...

# HMO Pro subscription price IDs (with 7-day trial)
STRIPE_PRICE_ID_HMO_PRO_1_5=price_...
STRIPE_PRICE_ID_HMO_PRO_6_10=price_...
STRIPE_PRICE_ID_HMO_PRO_11_15=price_...
STRIPE_PRICE_ID_HMO_PRO_16_20=price_...
```

**How to get these:**
1. Follow the [Stripe Setup Guide](./STRIPE_SETUP_GUIDE.md)
2. Create all 5 one-time products
3. Create all 4 HMO Pro subscription tiers with 7-day trial
4. Copy each price ID to the corresponding env var

#### **Resend** (Email Service)

```bash
RESEND_API_KEY=re_...
```

**How to get this:**
1. Go to [Resend Dashboard](https://resend.com)
2. Navigate to API Keys
3. Create new API key

#### **App Configuration**

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Admin user IDs (comma-separated UUIDs from Supabase auth.users)
ADMIN_USER_IDS=uuid1,uuid2,uuid3
```

**How to get admin user IDs:**
1. Deploy the app first
2. Create admin user accounts via signup
3. Go to Supabase → Authentication → Users
4. Copy the user IDs (UUIDs)
5. Add them to this env var (comma-separated)
6. Redeploy to apply changes

---

## Supabase Configuration

### 1. Run Database Migrations

The database schema is already defined in `/docs/DATABASE_SCHEMA.md`. Apply it:

```sql
-- Run this in Supabase SQL Editor
-- Copy the entire schema from DATABASE_SCHEMA.md
-- Execute it to create all tables, RLS policies, and triggers
```

### 2. Enable Row Level Security (RLS)

All tables should have RLS enabled. Verify in Supabase:

```
Database → Tables → [table_name] → Row Level Security: Enabled
```

### 3. Configure Storage Buckets

Create the following storage buckets:

**Bucket: `documents`**
- Public: No
- File size limit: 10 MB
- Allowed MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

RLS Policies for `documents` bucket:
```sql
-- Users can upload documents
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4. Configure Auth Settings

Go to Supabase → Authentication → Settings:

**Email Templates:**
- Customize the confirmation email template
- Customize the password recovery template
- Add your app logo and branding

**Email Auth Settings:**
- Enable Email provider
- Enable Email confirmations: **Yes**
- Secure email change: **Yes**

**Site URL:**
```
https://your-production-domain.com
```

**Redirect URLs (whitelist these):**
```
https://your-production-domain.com/auth/callback
https://your-production-domain.com/auth/verify-email
```

---

## Stripe Configuration

### 1. Create All Products

Follow the complete [Stripe Setup Guide](./STRIPE_SETUP_GUIDE.md) to create:

✅ 5 one-time payment products
✅ 4 HMO Pro subscription tiers (with 7-day trial)

### 2. Configure Webhooks

**Production Webhook Endpoint:**
```
https://your-production-domain.com/api/webhooks/stripe
```

**Events to Listen For:**
```
checkout.session.completed
payment_intent.succeeded
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

**How to set up:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL
4. Select the events listed above
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add it to `STRIPE_WEBHOOK_SECRET` env var

### 3. Test Webhook Locally (Development)

Use Stripe CLI to forward webhooks during development:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Vercel Deployment

### 1. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository: `landlord-heavenv3`

### 2. Configure Build Settings

**Framework Preset:** Next.js

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

**Node Version:** 18.x or 20.x

### 3. Add Environment Variables

Go to Project Settings → Environment Variables

Add **ALL** environment variables from your `.env.local`:

**Production Environment:**
- Set all variables to "Production" environment
- Use production API keys (live mode for Stripe)
- Use production Supabase project

**Preview/Development:**
- Optionally set test keys for preview deployments

**IMPORTANT:** Do NOT commit `.env.local` to git!

### 4. Deploy

Click **"Deploy"**

Vercel will:
1. ✅ Clone your repository
2. ✅ Install dependencies
3. ✅ Build the Next.js app
4. ✅ Deploy to production URL

**First deployment URL:**
```
https://landlord-heavenv3.vercel.app
```

### 5. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records:

**For root domain (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Wait for DNS propagation (can take up to 48 hours)

---

## Post-Deployment

### 1. Verify Deployment

**Test these critical flows:**

✅ **Authentication:**
- Sign up with new account
- Verify email confirmation works
- Log in with credentials
- Password reset flow

✅ **Wizard Flow:**
- Start new case from wizard
- Complete fact-finding questions
- Verify AI responses work
- Check document generation

✅ **Payments:**
- Purchase one-time product
- Verify Stripe checkout works
- Check webhook event handling
- Verify order appears in dashboard

✅ **HMO Pro Subscription:**
- Subscribe to HMO Pro tier
- Verify 7-day trial starts
- Access HMO Pro dashboard
- Add property and tenant

✅ **Admin Dashboard:**
- Add your user ID to `ADMIN_USER_IDS`
- Access `/dashboard/admin`
- Verify all stats load correctly

### 2. Configure Admin Users

```bash
# In Vercel Environment Variables, update:
ADMIN_USER_IDS=your-user-uuid,another-admin-uuid

# Redeploy to apply changes
```

### 3. Monitor Logs

**Vercel Dashboard → Deployments → [Latest] → Logs**

Watch for:
- ❌ API errors
- ❌ Database connection issues
- ❌ Webhook failures
- ✅ Successful requests

**Supabase Dashboard → Logs**

Watch for:
- ❌ RLS policy violations
- ❌ Query errors
- ✅ Successful auth events

**Stripe Dashboard → Developers → Logs**

Watch for:
- ❌ Webhook delivery failures
- ✅ Successful payments
- ✅ Subscription events

### 4. Set Up Error Tracking (Recommended)

Consider integrating:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [PostHog](https://posthog.com) for analytics

### 5. Configure Email Sending

**Resend Configuration:**

1. Go to [Resend Dashboard](https://resend.com)
2. Add and verify your domain
3. Configure DNS records for email sending:

```
Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

4. Wait for verification (usually < 5 minutes)
5. Test by triggering a password reset email

---

## Troubleshooting

### Build Fails on Vercel

**Error:** `Module not found`

**Solution:**
```bash
# Clear Vercel cache
# Go to Project Settings → General → Clear Cache
# Redeploy
```

### Database Connection Issues

**Error:** `Could not connect to Supabase`

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` has admin permissions
- Ensure RLS policies are correctly configured

### Stripe Webhooks Not Working

**Error:** `Webhook signature verification failed`

**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook endpoint is publicly accessible
- Ensure webhook events are configured correctly

### AI Requests Failing

**Error:** `OpenAI API key invalid`

**Solution:**
- Verify `OPENAI_API_KEY` is correct
- Check API key has credits
- Monitor usage limits in OpenAI dashboard

### Email Not Sending

**Error:** `Resend API error`

**Solution:**
- Verify `RESEND_API_KEY` is correct
- Check domain is verified in Resend
- Ensure email templates are configured

### Admin Dashboard Access Denied

**Error:** `403 Forbidden`

**Solution:**
- Add your user UUID to `ADMIN_USER_IDS`
- Redeploy to apply env var changes
- Clear browser cache and re-login

---

## Performance Optimization

### 1. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// Inside <body>
<Analytics />
```

### 2. Configure Caching

Already configured in `next.config.js`:
- Static pages cached for 1 hour
- API routes revalidated on demand
- Images optimized automatically

### 3. Monitor Core Web Vitals

Go to Vercel → Analytics → Core Web Vitals

Target scores:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Security Checklist

✅ **Environment Variables:**
- All secrets in Vercel env vars (not committed to git)
- `.env.local` in `.gitignore`

✅ **API Keys:**
- Production keys only in production environment
- Test keys for preview deployments

✅ **Database:**
- Row Level Security (RLS) enabled on all tables
- Service role key kept secret
- No public access to sensitive data

✅ **Authentication:**
- Email verification required
- Secure password requirements (min 8 chars)
- HTTPS only (enforced by Vercel)

✅ **Payments:**
- Stripe webhook signature verification
- No client-side price manipulation
- Secure checkout flow

✅ **CORS:**
- Only allow requests from your domain
- Configured in API route middleware

---

## Support

**Documentation:**
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

**Need Help?**
- Check [Troubleshooting](#troubleshooting) section
- Review Vercel deployment logs
- Contact support if issues persist

---

**Deployment Complete! 🎉**

Your Landlord Heaven v3 platform is now live and ready to serve UK landlords with AI-powered legal automation.
