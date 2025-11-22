# Landlord Heaven v3 - Stripe Product Setup Guide

This guide shows you how to create all 6 products in Stripe Dashboard.

## Prerequisites
- Stripe account created
- Test mode enabled

---

## 1. ONE-TIME PRODUCTS (Eviction & Tenancy)

### Product 1: Notice Only - £29.99

1. Go to Stripe Dashboard → Products → Create Product
2. **Product Information:**
   - Name: `Notice Only Pack`
   - Description: `Single eviction notice generation - Jurisdiction-specific notice with plain-English guidance`
3. **Pricing:**
   - Pricing model: `Standard pricing`
   - Price: `£29.99`
   - Billing period: `One time`
   - Currency: `GBP`
4. Copy the Price ID (starts with `price_`) → Add to `.env` as `STRIPE_NOTICE_ONLY_PRICE_ID`

---

### Product 2: Complete Eviction Pack - £149.99

1. Create Product → Products → Create Product
2. **Product Information:**
   - Name: `Complete Eviction Pack`
   - Description: `Full DIY eviction bundle from notice to possession order - All notices, court forms, and step-by-step guidance`
3. **Pricing:**
   - Price: `£149.99`
   - Billing: `One time`
   - Currency: `GBP`
4. Copy Price ID → `.env` as `STRIPE_COMPLETE_PACK_PRICE_ID`

---

### Product 3: Money Claim Pack - £129.99

1. Create Product
2. **Product Information:**
   - Name: `Money Claim Pack`
   - Description: `Recover rent arrears and damages - Complete claim forms, evidence checklist, and process guidance`
3. **Pricing:**
   - Price: `£129.99`
   - Billing: `One time`
   - Currency: `GBP`
4. Copy Price ID → `.env` as `STRIPE_MONEY_CLAIM_PRICE_ID`

---

### Product 4: Standard AST - £39.99

1. Create Product
2. **Product Information:**
   - Name: `Standard AST Agreement`
   - Description: `Basic tenancy agreement for occasional landlords - Up-to-date AST with mandatory clauses`
3. **Pricing:**
   - Price: `£39.99`
   - Billing: `One time`
   - Currency: `GBP`
4. Copy Price ID → `.env` as `STRIPE_AST_STANDARD_PRICE_ID`

---

### Product 5: Premium AST - £59.00

1. Create Product
2. **Product Information:**
   - Name: `Premium AST Agreement`
   - Description: `Professional tenancy agreement with flexibility - Advanced clauses, guarantor support, multi-party signing`
3. **Pricing:**
   - Price: `£59.00`
   - Billing: `One time`
   - Currency: `GBP`
4. Copy Price ID → `.env` as `STRIPE_AST_PREMIUM_PRICE_ID`

---

## 2. SUBSCRIPTION PRODUCTS (HMO Pro Membership)

### Product 6: HMO Pro Membership

Create ONE product with FOUR pricing tiers:

1. Create Product
2. **Product Information:**
   - Name: `HMO Pro Membership`
   - Description: `Complete HMO compliance management for professional landlords - Portfolio dashboard, council-specific licensing, automated reminders`

3. **Create 4 Pricing Tiers:**

#### Tier 1: Starter (1-5 HMOs) - £19.99/month
- Click "Add another price"
- **Pricing:**
  - Price: `£19.99`
  - Billing period: `Monthly`
  - Currency: `GBP`
- **Free trial:** `7 days`
- **Metadata:** Add `tier: starter`, `max_properties: 5`
- Copy Price ID → `.env` as `STRIPE_HMO_STARTER_PRICE_ID`

#### Tier 2: Growth (6-10 HMOs) - £24.99/month
- Add another price
- Price: `£24.99`, Monthly, GBP
- Free trial: `7 days`
- Metadata: `tier: growth`, `max_properties: 10`
- Copy Price ID → `.env` as `STRIPE_HMO_GROWTH_PRICE_ID`

#### Tier 3: Professional (11-15 HMOs) - £29.99/month
- Add another price
- Price: `£29.99`, Monthly, GBP
- Free trial: `7 days`
- Metadata: `tier: professional`, `max_properties: 15`
- Copy Price ID → `.env` as `STRIPE_HMO_PROFESSIONAL_PRICE_ID`

#### Tier 4: Enterprise (16-20 HMOs) - £34.99/month
- Add another price
- Price: `£34.99`, Monthly, GBP
- Free trial: `7 days`
- Metadata: `tier: enterprise`, `max_properties: 20`
- Copy Price ID → `.env` as `STRIPE_HMO_ENTERPRISE_PRICE_ID`

---

## 3. WEBHOOK SETUP

1. Go to Developers → Webhooks → Add endpoint
2. **Endpoint URL:** `https://yourdomain.com/api/webhooks/stripe`
3. **Events to send:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.created`
4. Copy the Signing Secret → `.env` as `STRIPE_WEBHOOK_SECRET`

---

## 4. VERIFY SETUP

All Price IDs should be in your `.env`:
```bash
# One-time products
STRIPE_NOTICE_ONLY_PRICE_ID=price_xxxxxx
STRIPE_COMPLETE_PACK_PRICE_ID=price_xxxxxx
STRIPE_MONEY_CLAIM_PRICE_ID=price_xxxxxx
STRIPE_AST_STANDARD_PRICE_ID=price_xxxxxx
STRIPE_AST_PREMIUM_PRICE_ID=price_xxxxxx

# HMO Pro subscription tiers
STRIPE_HMO_STARTER_PRICE_ID=price_xxxxxx
STRIPE_HMO_GROWTH_PRICE_ID=price_xxxxxx
STRIPE_HMO_PROFESSIONAL_PRICE_ID=price_xxxxxx
STRIPE_HMO_ENTERPRISE_PRICE_ID=price_xxxxxx
```

---

## 5. TEST MODE

**IMPORTANT:** Start in Test Mode!
- All product creation above should be done in **Test Mode**
- Use test cards: `4242 4242 4242 4242`
- After testing, repeat the same setup in **Live Mode** for production

---

## 6. GO LIVE CHECKLIST

Before switching to Live Mode:
- [ ] All 6 products created in Live Mode
- [ ] All 9 Price IDs copied to production `.env`
- [ ] Webhook endpoint updated to production URL
- [ ] Webhook secret updated
- [ ] Test successful payment
- [ ] Test successful subscription
- [ ] Test webhook events firing
- [ ] Verify 7-day trial works correctly
