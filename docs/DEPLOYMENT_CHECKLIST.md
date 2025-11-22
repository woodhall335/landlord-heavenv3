# Landlord Heaven v3 - Deployment Checklist

Use this checklist to ensure all steps are completed before and after deployment.

## Pre-Deployment Checklist

### 1. Accounts Setup ✅

- [ ] Vercel account created
- [ ] Supabase project created
- [ ] Stripe account created (live mode enabled)
- [ ] OpenAI account with API access
- [ ] Anthropic account with API access
- [ ] Resend account created
- [ ] GitHub repository set up

### 2. Supabase Configuration ✅

- [ ] Database schema applied (from `DATABASE_SCHEMA.md`)
- [ ] All tables created successfully
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies configured for all tables
- [ ] Storage bucket `documents` created
- [ ] Storage policies configured
- [ ] Auth settings configured:
  - [ ] Email provider enabled
  - [ ] Email confirmation enabled
  - [ ] Site URL set to production domain
  - [ ] Redirect URLs whitelisted
- [ ] Email templates customized with branding
- [ ] Service role key copied

### 3. Stripe Configuration ✅

**One-Time Products:**
- [ ] Notice Only (£29.99) - price ID copied
- [ ] Complete Eviction Pack (£149.99) - price ID copied
- [ ] Money Claim Pack (£129.99) - price ID copied
- [ ] Standard AST (£39.99) - price ID copied
- [ ] Premium AST (£59.00) - price ID copied

**HMO Pro Subscriptions (all with 7-day trial):**
- [ ] Starter 1-5 properties (£19.99/month) - price ID copied
- [ ] Growth 6-10 properties (£24.99/month) - price ID copied
- [ ] Professional 11-15 properties (£29.99/month) - price ID copied
- [ ] Enterprise 16-20 properties (£34.99/month) - price ID copied

**Webhook Setup:**
- [ ] Webhook endpoint created: `https://your-domain.com/api/webhooks/stripe`
- [ ] All required events selected:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Webhook signing secret copied

### 4. API Keys Collected ✅

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `STRIPE_SECRET_KEY` (live mode)
- [ ] `STRIPE_PUBLISHABLE_KEY` (live mode)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] All 9 Stripe price IDs
- [ ] `RESEND_API_KEY`

### 5. Environment Variables File ✅

- [ ] `.env.local` created from `.env.example`
- [ ] All API keys added to `.env.local`
- [ ] All Stripe price IDs configured
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] `.env.local` is in `.gitignore` (DO NOT COMMIT!)

### 6. Code Review ✅

- [ ] All TypeScript errors resolved
- [ ] No console errors in development
- [ ] All API routes tested locally
- [ ] Wizard flow tested end-to-end
- [ ] Payment flow tested with test mode
- [ ] HMO Pro subscription tested
- [ ] All dashboard pages accessible

---

## Deployment Steps

### 1. Connect to Vercel ✅

- [ ] Log in to Vercel
- [ ] Click "Add New Project"
- [ ] Import GitHub repository
- [ ] Select `landlord-heavenv3` repo

### 2. Configure Build Settings ✅

- [ ] Framework Preset: **Next.js**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `npm install`
- [ ] Node Version: **18.x** or **20.x**
- [ ] Root Directory: `./` (leave as default)

### 3. Add Environment Variables ✅

**Go to Project Settings → Environment Variables**

Add these to **Production** environment:

**Supabase:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**AI Services:**
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`

**Stripe:**
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_ID_NOTICE_ONLY`
- [ ] `STRIPE_PRICE_ID_EVICTION_PACK`
- [ ] `STRIPE_PRICE_ID_MONEY_CLAIM`
- [ ] `STRIPE_PRICE_ID_STANDARD_AST`
- [ ] `STRIPE_PRICE_ID_PREMIUM_AST`
- [ ] `STRIPE_PRICE_ID_HMO_PRO_1_5`
- [ ] `STRIPE_PRICE_ID_HMO_PRO_6_10`
- [ ] `STRIPE_PRICE_ID_HMO_PRO_11_15`
- [ ] `STRIPE_PRICE_ID_HMO_PRO_16_20`

**Email:**
- [ ] `RESEND_API_KEY`

**App Config:**
- [ ] `NEXT_PUBLIC_APP_URL` (set to `https://your-domain.vercel.app`)
- [ ] `ADMIN_USER_IDS` (leave empty initially, add after first deployment)

### 4. Deploy! 🚀

- [ ] Click **"Deploy"**
- [ ] Wait for build to complete (usually 2-5 minutes)
- [ ] Check deployment logs for errors
- [ ] Note the deployment URL

---

## Post-Deployment Verification

### 1. Basic Functionality ✅

- [ ] Visit deployment URL
- [ ] Home page loads correctly
- [ ] Navigation works
- [ ] No console errors in browser

### 2. Authentication Flow ✅

- [ ] Sign up with new account
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Email confirmed successfully
- [ ] Log in with credentials
- [ ] Log out works
- [ ] Forgot password flow works
- [ ] Password reset email received
- [ ] Password reset successful

### 3. Wizard Flow ✅

- [ ] Click "New Document" from dashboard
- [ ] Select document type (e.g., Eviction)
- [ ] Select jurisdiction
- [ ] Wizard conversation starts
- [ ] AI responds to questions
- [ ] Can answer all question types:
  - [ ] Multiple choice (auto-advances)
  - [ ] Text input
  - [ ] Currency input
  - [ ] Date input
  - [ ] Yes/No toggle
  - [ ] Multiple selection
  - [ ] File upload
  - [ ] Scale slider
- [ ] Wizard completes and shows analysis
- [ ] Case saved to dashboard

### 4. Payment Flow (One-Time) ✅

- [ ] Select "Complete Eviction Pack"
- [ ] Click "Buy Now"
- [ ] Redirects to Stripe Checkout
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Redirects back to success page
- [ ] Order appears in dashboard
- [ ] Webhook event logged in Stripe
- [ ] Order status shows "paid"

### 5. HMO Pro Subscription ✅

- [ ] Go to pricing page
- [ ] Select HMO Pro tier
- [ ] Click "Start 7-Day Free Trial"
- [ ] Redirects to Stripe Checkout
- [ ] Shows "Free trial for 7 days"
- [ ] Enter payment details
- [ ] Complete subscription
- [ ] Subscription status: "trialing"
- [ ] Access HMO Pro dashboard
- [ ] Add property successfully
- [ ] Add tenant successfully
- [ ] Dashboard shows correct data

### 6. Dashboard Testing ✅

**User Dashboard:**
- [ ] Main dashboard loads
- [ ] Stats cards show correct numbers
- [ ] Recent cases displayed
- [ ] Documents listed
- [ ] Quick actions work
- [ ] Cases page shows all cases
- [ ] Can filter cases by status
- [ ] Individual case detail loads
- [ ] Documents page lists all docs
- [ ] Settings page loads
- [ ] Can update profile
- [ ] Can change password

**HMO Pro Dashboard:**
- [ ] Requires active subscription
- [ ] Shows upgrade prompt if no subscription
- [ ] Main HMO dashboard loads stats
- [ ] Properties list shows all properties
- [ ] Can add new property
- [ ] Property detail page loads
- [ ] Tenants list shows all tenants
- [ ] Can add new tenant
- [ ] Compliance tracking works

**Admin Dashboard:**
- [ ] Shows "Access Denied" initially (before adding to ADMIN_USER_IDS)

### 7. Admin Access Setup ✅

**Get your user ID:**
- [ ] Log in to Supabase dashboard
- [ ] Go to Authentication → Users
- [ ] Copy your user ID (UUID)

**Update environment variables:**
- [ ] Go to Vercel → Project Settings → Environment Variables
- [ ] Update `ADMIN_USER_IDS` with your UUID
- [ ] Click "Save"
- [ ] Redeploy the project

**Verify admin access:**
- [ ] Log out and log in again
- [ ] Visit `/dashboard/admin`
- [ ] Admin dashboard loads successfully
- [ ] Platform stats displayed
- [ ] Recent orders shown
- [ ] Recent users shown
- [ ] All metrics correct

### 8. Email Sending ✅

**Resend Domain Setup:**
- [ ] Add domain to Resend
- [ ] Configure DNS records:
  - [ ] TXT record for domain verification
  - [ ] TXT record for SPF
  - [ ] DKIM record
- [ ] Wait for verification (usually < 5 minutes)
- [ ] Domain status: "Verified"

**Test emails:**
- [ ] Trigger password reset
- [ ] Receive email within 1 minute
- [ ] Email not in spam folder
- [ ] Reset link works
- [ ] New user signup email works
- [ ] Email confirmation link works

### 9. Monitoring Setup ✅

**Vercel:**
- [ ] Check deployment logs for errors
- [ ] Enable Vercel Analytics
- [ ] Monitor function execution times
- [ ] Check for any build warnings

**Supabase:**
- [ ] Monitor database usage
- [ ] Check auth event logs
- [ ] Verify RLS policies working
- [ ] Monitor storage usage

**Stripe:**
- [ ] Check webhook delivery logs
- [ ] All webhooks delivered successfully
- [ ] No failed webhook events
- [ ] Payment events logged correctly

**AI Usage:**
- [ ] Monitor OpenAI usage dashboard
- [ ] Check Anthropic usage
- [ ] Verify token counts are reasonable
- [ ] No unexpected spikes in usage

---

## Custom Domain (Optional)

### 1. Add Domain to Vercel ✅

- [ ] Go to Project Settings → Domains
- [ ] Click "Add Domain"
- [ ] Enter your domain (e.g., `landlordheaven.co.uk`)
- [ ] Copy DNS records shown

### 2. Configure DNS ✅

**For root domain:**
- [ ] Type: `A`
- [ ] Name: `@`
- [ ] Value: `76.76.21.21`
- [ ] TTL: `Auto` or `3600`

**For www subdomain:**
- [ ] Type: `CNAME`
- [ ] Name: `www`
- [ ] Value: `cname.vercel-dns.com`
- [ ] TTL: `Auto` or `3600`

### 3. SSL Certificate ✅

- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Vercel automatically provisions SSL certificate
- [ ] Certificate status: "Active"
- [ ] HTTPS working on custom domain

### 4. Update Environment Variables ✅

- [ ] Update `NEXT_PUBLIC_APP_URL` to custom domain
- [ ] Update Supabase Site URL to custom domain
- [ ] Update Supabase Redirect URLs
- [ ] Update Stripe webhook URL to custom domain
- [ ] Redeploy to apply changes

---

## Performance Optimization

### 1. Core Web Vitals ✅

- [ ] LCP (Largest Contentful Paint): < 2.5s ✅
- [ ] FID (First Input Delay): < 100ms ✅
- [ ] CLS (Cumulative Layout Shift): < 0.1 ✅

### 2. Lighthouse Score ✅

- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

### 3. Image Optimization ✅

- [ ] All images using Next.js Image component
- [ ] Images lazy-loaded
- [ ] WebP format used where supported

---

## Security Review

### 1. Environment Variables ✅

- [ ] All secrets in Vercel env vars only
- [ ] `.env.local` NOT committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] No hardcoded API keys in code

### 2. Database Security ✅

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies tested and working
- [ ] Service role key kept secret
- [ ] No public access to sensitive data

### 3. API Security ✅

- [ ] All API routes require authentication where needed
- [ ] Admin routes check `ADMIN_USER_IDS`
- [ ] Input validation on all endpoints
- [ ] Rate limiting considered (Vercel Pro)

### 4. Payment Security ✅

- [ ] Stripe webhook signature verification
- [ ] No client-side price manipulation
- [ ] Checkout flow uses Stripe Checkout
- [ ] No sensitive card data stored

### 5. HTTPS & Headers ✅

- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Security headers configured in `vercel.json`:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`

---

## Final Checks

### 1. Documentation ✅

- [ ] README updated with deployment info
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Deployment guide complete

### 2. User Testing ✅

- [ ] Complete end-to-end user flow tested
- [ ] All features working as expected
- [ ] No critical bugs
- [ ] Performance acceptable on mobile

### 3. Support Readiness ✅

- [ ] Support email configured
- [ ] Contact form working
- [ ] FAQ/docs accessible
- [ ] Error messages user-friendly

### 4. Launch Readiness ✅

- [ ] All checklist items completed
- [ ] Production data backed up
- [ ] Monitoring alerts configured
- [ ] Team notified of launch

---

## 🎉 Deployment Complete!

**Your Landlord Heaven v3 platform is now LIVE!**

**Production URL:** `https://your-domain.vercel.app` or custom domain

**Next Steps:**
1. Monitor logs for first 24 hours
2. Watch for any user-reported issues
3. Track key metrics:
   - User signups
   - Document generations
   - Payment conversions
   - Subscription activations
4. Collect user feedback
5. Plan for future updates

**Support:**
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com

---

**Congratulations! 🚀**
