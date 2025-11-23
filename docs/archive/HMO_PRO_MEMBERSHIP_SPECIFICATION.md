# 🏢 HMO PRO MEMBERSHIP - COMPLETE SPECIFICATION

**Version:** 1.0  
**Date:** November 2024  
**Status:** Ready for Implementation (Week 2 Launch)  
**Launch Target:** Day 14 (1 week after core platform)

---

## 🎯 EXECUTIVE SUMMARY

**HMO Pro Membership** is a monthly subscription service for landlords operating Houses in Multiple Occupation (HMOs). It provides complete compliance management, council-specific licensing, unlimited tenant management, and automated reminders.

**Value Proposition:**

> "HMO compliance on autopilot - for less than the cost of coffee per property."

**Target Market:** Professional HMO landlords (3+ properties), portfolio landlords, property management companies

---

## 💰 PRICING MODEL

### Monthly Subscription Structure

```yaml
Base Tier (1-5 HMOs):        £19.99/month
Additional Blocks:           +£5.00/month per 5 HMOs

Pricing Table:
┌─────────────┬──────────────┬────────────┬─────────────────┐
│ HMOs        │ Monthly      │ Annual     │ Per Property    │
├─────────────┼──────────────┼────────────┼─────────────────┤
│ 1-5         │ £19.99       │ £239.88    │ £4.00/mo        │
│ 6-10        │ £24.99       │ £299.88    │ £2.50/mo        │
│ 11-15       │ £29.99       │ £359.88    │ £2.00/mo        │
│ 16-20       │ £34.99       │ £419.88    │ £1.75/mo        │
│ 21-25       │ £39.99       │ £479.88    │ £1.60/mo        │
│ 26-30       │ £44.99       │ £539.88    │ £1.50/mo        │
└─────────────┴──────────────┴────────────┴─────────────────┘

Pricing Logic:
band_index = Math.ceil(hmo_count / 5)
monthly_price = 19.99 + ((band_index - 1) × 5.00)
```

### Why Monthly?

```yaml
✅ Lower barrier to entry (£19.99 vs £199)
✅ Higher conversion rate (12-18% vs 3-5%)
✅ Easy upsells (+£5 feels minimal)
✅ Industry standard (SaaS expectation)
✅ Better psychology ("less than coffee")
✅ Predictable MRR growth
✅ Higher lifetime value (18 months avg)
✅ Auto-renewal (lower churn)
```

---

## 🎁 7-DAY FREE TRIAL

### Trial Structure

```yaml
Trial Length: 7 days
Card Required: Yes (to start trial)
Auto-Convert: Yes (after 7 days)
Cancellation: Anytime before trial ends = no charge
Trial Reminder: Day 5 (2 days before charge)
```

### Trial Flow

```yaml
Day 1: User clicks "Start Free Trial"
       → Redirects to Stripe Checkout
       → Must enter card details
       → Stripe creates subscription with 7-day trial
       → User redirected to welcome page
       → Welcome email sent

Day 1-7: Full access to all HMO Pro features
         Trial end date shown in dashboard

Day 5: Email: "Your trial ends in 2 days"
       Shows charge date and amount
       Cancel link included

Day 7: Trial ends
       Stripe automatically charges card
       User continues with paid subscription

If Cancelled: Access continues until trial end
              No charge occurs
              Subscription cancelled
```

---

## 🎯 FEATURES INCLUDED

### 1. Council-Specific HMO Licensing 📋

**Problem Solved:**  
Each UK council has different HMO licensing requirements. Landlords waste hours researching council-specific rules.

**Solution:**  
Automatic council detection via postcode → Pre-filled council-specific application packs.

**Features:**

- ✅ 380+ UK councils in database
- ✅ Mandatory, Additional, and Selective license variants
- ✅ Council-specific questions in wizard
- ✅ Pre-filled application forms
- ✅ Fit-and-proper person declarations
- ✅ Amenity standards checklists
- ✅ Minimum room size calculations
- ✅ Direct links to council portals

**Technical Implementation:**

```javascript
// Postcode → Council Lookup
async function getCouncilFromPostcode(postcode) {
  const response = await fetch(`/api/councils/lookup?postcode=${postcode}`)
  return response.json()
}

// Example Output
{
  council_code: 'manchester',
  council_name: 'Manchester City Council',
  has_mandatory_licensing: true,
  has_additional_licensing: true,
  min_room_size_sqm: 6.51,
  max_occupants_per_bathroom: 5,
  licensing_team_email: 'hmo@manchester.gov.uk',
  application_url: 'https://manchester.gov.uk/hmo-license'
}
```

**Documents Generated:**

- Mandatory HMO License Application
- Additional HMO License Application (if applicable)
- Selective License Application (if applicable)
- Fit & Proper Person Declaration
- Management Arrangements Statement
- Amenity Standards Compliance Checklist
- Floor Plan Requirements Guide

---

### 2. Unlimited Tenant Management 👥

**Problem Solved:**  
Agents charge £50-150 per tenant change. For HMOs with frequent turnover, this costs thousands per year.

**Solution:**  
Add/remove tenants unlimited times → Automatic regeneration of all affected documents.

**Features:**

- ✅ Add new tenant (any time)
- ✅ Remove tenant (any time)
- ✅ Change rooms (any time)
- ✅ Update rent amounts
- ✅ Add/remove guarantors
- ✅ Track tenant versions
- ✅ Historical snapshots

**What Regenerates Automatically:**

```yaml
When tenant added/removed: ✅ Individual room AST
  ✅ House rules (updated signatures)
  ✅ Guarantor agreement (if applicable)
  ✅ Deposit schedule
  ✅ Rent payment breakdown
  ✅ Occupancy certificate
  ✅ Fire safety acknowledgment

All documents: Instant, unlimited, no extra charge
```

**Database Schema:**

```sql
CREATE TABLE public.hmo_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hmo_property_id UUID REFERENCES public.hmo_properties(id) NOT NULL,

  -- Tenant Details
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Room Assignment
  room_number TEXT,
  room_rent DECIMAL(10,2),

  -- Tenancy Period
  tenancy_start DATE NOT NULL,
  tenancy_end DATE,
  is_active BOOLEAN DEFAULT true,

  -- Guarantor
  has_guarantor BOOLEAN DEFAULT false,
  guarantor_name TEXT,
  guarantor_email TEXT,
  guarantor_relationship TEXT,

  -- Version Control
  version INTEGER DEFAULT 1,
  superseded_by UUID REFERENCES public.hmo_tenants(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 3. Automated Compliance Reminders ⏰

**Problem Solved:**  
Missing renewal deadlines costs landlords £1,000s in fines and lost rent.

**Solution:**  
Automatic email reminders 90, 30, and 7 days before critical deadlines.

**Reminder Types:**

| Type                       | Triggers            | Impact                |
| -------------------------- | ------------------- | --------------------- |
| **HMO License Expiry**     | 90/30/7 days before | Avoid £30K fine       |
| **Gas Safety Certificate** | 90/30/7 days before | Legal requirement     |
| **EICR (Electrical)**      | 90/30/7 days before | Every 5 years         |
| **Fire Risk Assessment**   | Annually            | Insurance requirement |
| **Tenancy End Notices**    | 60 days before      | Plan for turnover     |
| **Deposit Return**         | 7 days after end    | Legal deadline        |

**Technical Implementation:**

```javascript
// Reminder Scheduler
async function scheduleReminders(hmoProperty) {
  const reminders = [];

  // License Expiry
  if (hmoProperty.licence_expiry_date) {
    reminders.push(
      createReminder({
        type: "licence_expiry",
        due_date: hmoProperty.licence_expiry_date,
        days_before: [90, 30, 7],
      })
    );
  }

  // Gas Safety
  if (hmoProperty.gas_safety_expiry) {
    reminders.push(
      createReminder({
        type: "gas_safety",
        due_date: hmoProperty.gas_safety_expiry,
        days_before: [90, 30, 7],
      })
    );
  }

  await Promise.all(reminders);
}

// Reminder Processor (Runs daily)
async function processReminders() {
  const today = new Date();

  const dueReminders = await db.query(
    `
    SELECT * FROM compliance_reminders
    WHERE status = 'scheduled'
    AND due_date - INTERVAL '${days_before} days' = $1
  `,
    [today]
  );

  for (const reminder of dueReminders) {
    await sendReminderEmail(reminder);
    await markReminderAsSent(reminder.id);
  }
}
```

---

### 4. HMO Portfolio Dashboard 📊

**Problem Solved:**  
Managing multiple HMOs = juggling spreadsheets, calendars, and folders. Critical dates get missed.

**Solution:**  
Single dashboard showing all HMOs, compliance status, upcoming deadlines, and tenant overview.

**Dashboard Views:**

#### Overview Tab:

```yaml
Portfolio Summary:
  - Total HMOs: 8
  - Current tier: 6-10 HMOs (£24.99/mo)
  - Total rooms: 43
  - Occupied rooms: 38 (88%)
  - Monthly rent: £14,200

Compliance Status:
  ✅ 6 properties fully compliant
  ⚠️ 2 properties need attention

Upcoming Deadlines:
  - [Property A] License expires: 45 days
  - [Property B] Gas safety due: 12 days
  - [Property C] EICR due: 89 days
```

#### Properties Tab:

```yaml
Property Card (Example):

┌─────────────────────────────────────────────────┐
│ 🏠 123 Student Street, Manchester M14 6HY       │
│                                                 │
│ Council: Manchester City Council                │
│ License: Mandatory HMO                          │
│                                                 │
│ Status: ✅ Fully Compliant                     │
│                                                 │
│ Compliance:                                     │
│ ✅ License valid until: 15 Mar 2025 (120 days) │
│ ✅ Gas safety valid until: 22 Jan 2025 (64d)   │
│ ⚠️ EICR expires soon: 5 Dec 2024 (16 days)     │
│ ✅ Fire assessment: Up to date                  │
│                                                 │
│ Occupancy:                                      │
│ 5 rooms | 5 tenants | 100% occupied            │
│                                                 │
│ [View Details] [Manage Tenants] [Documents]    │
└─────────────────────────────────────────────────┘
```

---

### 5. Complete HMO Document Suite 📄

**50+ Page HMO AST** (Individual & Joint Liability)

- Enhanced clauses for shared living
- Room-specific provisions
- Shared facilities schedules
- Parking & storage allocation
- Guest policies
- Noise restrictions
- Cleaning responsibilities

**House Rules Document**

- Communal area usage
- Kitchen rota (optional)
- Bathroom rota (optional)
- Waste disposal rules
- Recycling requirements
- Quiet hours
- Guest policies
- Smoking policy
- Pet policy

**Shared Facilities Schedule**

- Kitchen equipment inventory
- Living room furniture
- Shared appliances
- Garden/outdoor access
- Parking arrangements
- Storage facilities
- Utility meter locations

**Fire Safety Documents**

- Fire Risk Assessment template
- Fire escape routes
- Fire extinguisher locations
- Fire door maintenance log
- Emergency lighting checks
- Smoke alarm testing log
- Fire blanket locations
- Emergency contact list

**Guarantor Pack**

- Guarantor agreement (10 pages)
- Joint & several liability notice
- Financial disclosure forms
- Credit check authorization
- Independent legal advice confirmation

---

### 6. Law-Change Updates (Agent 6) 📢

**Problem Solved:**  
HMO law changes frequently. Landlords miss updates and face fines for non-compliance.

**Solution:**  
Agent 6 monitors quarterly updates to HMO law and council rules, then notifies affected landlords.

**How It Works:**

```yaml
Quarterly Review Process:

1. Agent 6 Reviews:
  - New legislation
  - Updated council requirements
  - Case law changes
  - Government guidance updates

2. Impact Analysis:
  - Which councils affected?
  - Which HMOs impacted?
  - What documents need updating?

3. Notification:
  - Email to affected landlords
  - Dashboard alert
  - Document update summary

4. Automatic Updates:
  - Templates updated
  - Decision rules revised
  - Council data refreshed
  - New documents generated
```

---

## 🎯 TARGET CUSTOMERS

### Primary Persona: Professional HMO Landlord

```yaml
Demographics:
  Age: 35-55
  Properties: 3-15 HMOs
  Annual income: £60K-£150K
  Location: University cities (Manchester, Birmingham, Leeds)

Pain Points: ❌ Council licensing complexity
  ❌ Frequent tenant turnover (£50-150/change)
  ❌ Compliance deadline tracking
  ❌ Document management chaos
  ❌ Fear of fines (£30K+ for license breach)
  ❌ Time spent on admin (10+ hours/week)

Goals: ✅ Simplify compliance
  ✅ Reduce admin costs
  ✅ Avoid fines
  ✅ Scale portfolio
  ✅ Professional operation

Budget:
  Currently paying: £2,000-5,000/year in agent fees
  Willing to pay: £240-480/year (massive savings)
```

---

## 📊 REVENUE PROJECTIONS

### Year 1 (Conservative):

```yaml
Growth Trajectory:
  Month 1-3: 5 new subs/month = 15 total
  Month 4-6: 8 new subs/month = 39 total
  Month 7-9: 12 new subs/month = 75 total
  Month 10-12: 20 new subs/month = 135 total

End Year 1: 135 subscribers
Average MRR: £19.99 base + upgrades
Month 12 MRR: £2,698.65

Year 1 Total Revenue: £16,023
Plus Upgrade Revenue: £2,670
Total: £18,693
```

### Year 2 (Growth):

```yaml
Start Year 2: 135 subscribers
Growth: +135 new subscribers
Churn: 5% monthly (industry low for B2B)
Net Growth: +10 subscribers/month

End Year 2: 270 subscribers
Month 24 MRR: £5,397.30
Year 2 Total: £48,576
```

### Year 3 (Scale):

```yaml
Start Year 3: 270 subscribers
Accelerated Growth: +20 subscribers/month
Churn: 4% (improved product)

End Year 3: 450+ subscribers
Month 36 MRR: £9,000+
Year 3 Total: £120,000+
```

---

## 🚀 LAUNCH PLAN

### Week 2 (Days 8-14): HMO Pro Launch

```yaml
Day 8-9: Infrastructure
  ✅ Database tables created
  ✅ Stripe products configured
  ✅ Webhook handlers deployed

Day 10-11: Features
  ✅ Dashboard UI built
  ✅ Property management flows
  ✅ Tenant management system
  ✅ Council lookup API

Day 12-13: Reminders + Polish
  ✅ Reminder scheduler deployed
  ✅ Email templates created
  ✅ Onboarding flow tested
  ✅ Documentation complete

Day 14: HMO Pro LAUNCH 🚀
  ✅ Feature announced
  ✅ Landing page live
  ✅ Free trials available
  ✅ Support ready
```

---

## 🎯 SUCCESS METRICS

### Month 1 Targets:

```yaml
Signups: 10 free trials
Conversions: 5 paid subscribers (50%)
MRR: £99.95
Churn: 0%
```

### Month 3 Targets:

```yaml
Signups: 50 total subscribers
MRR: £999.50
Churn: <10%
Upgrades: 5 landlords
```

### Month 6 Targets:

```yaml
Subscribers: 100
MRR: £2,000+
Churn: <8%
NPS: 50+
```

### Month 12 Targets:

```yaml
Subscribers: 200
MRR: £4,000+
Churn: <5%
Annual Run Rate: £48K+
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Stripe Integration:

```javascript
// Create Subscription with Trial
async function createHMOProSubscription(userId, hmoCount) {
  const tier = getRequiredTier(hmoCount);
  const price = STRIPE_PRICES[`tier_${tier.max_hmos}`];

  // Create Checkout Session with trial
  const session = await stripe.checkout.sessions.create({
    customer: user.stripe_customer_id,
    mode: "subscription",
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
      trial_settings: {
        end_behavior: {
          missing_payment_method: "cancel",
        },
      },
      metadata: {
        user_id: userId,
        hmo_count: hmoCount,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/hmo-pro/welcome`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/hmo-pro/upgrade`,
  });

  return session;
}
```

### Webhook Handlers:

```javascript
// Handle Trial Started
async function handleCheckoutCompleted(session) {
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription
  );

  await db.query(
    `
    UPDATE users 
    SET hmo_pro_active = true,
        hmo_pro_trial_ends_at = $1,
        stripe_subscription_id = $2
    WHERE id = $3
  `,
    [
      new Date(subscription.trial_end * 1000),
      subscription.id,
      session.metadata.user_id,
    ]
  );

  await sendEmail({
    template: "hmo_pro_trial_started",
    to: session.customer_email,
  });
}

// Handle Trial Will End
async function handleTrialWillEnd(subscription) {
  await sendEmail({
    template: "hmo_pro_trial_ending",
    to: user.email,
    data: {
      trial_ends_at: new Date(subscription.trial_end * 1000),
      amount: subscription.items.data[0].price.unit_amount / 100,
    },
  });
}
```

---

## ✅ LAUNCH CHECKLIST

### Technical:

- [ ] Database tables created
- [ ] Stripe integration tested
- [ ] Council data populated (380+ councils)
- [ ] Reminder cron job deployed
- [ ] Email templates tested
- [ ] Webhooks configured

### Content:

- [ ] Landing page copy
- [ ] Feature documentation
- [ ] Help center articles
- [ ] Email templates
- [ ] In-app tooltips

### Marketing:

- [ ] Launch email to existing users
- [ ] Social media posts
- [ ] Landing page SEO
- [ ] Affiliate materials

---

**END OF HMO PRO MEMBERSHIP SPECIFICATION**

This subscription feature is the path to £1M+ ARR! 🚀
