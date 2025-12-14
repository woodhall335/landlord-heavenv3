# SUCCESS METRICS & MONITORING
## Notice Only Smart Guidance - Performance Tracking Guide

**Feature:** Notice Only Smart Guidance
**Purpose:** Track feature success, measure ROI, and identify optimization opportunities
**Owner:** Product Team
**Review Frequency:** Weekly (first month), Bi-weekly (months 2-3), Monthly (ongoing)

---

## 📊 EXECUTIVE SUMMARY

### Primary Success Criteria

The Notice Only Smart Guidance feature is considered **successful** if it achieves the following targets within **3 months** of deployment:

| Metric | Baseline | Target | Success Threshold |
|--------|----------|--------|-------------------|
| Wizard Completion Rate | 65% | 85% | ≥80% |
| Preview View Rate | 50% | 95% | ≥90% |
| Purchase Conversion | 40% | 57.5% | ≥50% |
| Support Tickets per 100 Purchases | 35 | 21-24.5 | ≤28 |

**ROI Target:** +£1,300-£2,400/month incremental revenue (+44-80%)

---

## 🎯 DETAILED METRICS FRAMEWORK

### 1. User Engagement Metrics

#### 1.1 Wizard Completion Rate
**Definition:** Percentage of users who complete all wizard questions after starting.

**Formula:**
```
Wizard Completion Rate = (Completed Wizards / Started Wizards) × 100
```

**How to Track:**
```javascript
// Google Analytics 4 Events
gtag('event', 'wizard_started', {
  product: 'notice_only',
  jurisdiction: 'england-wales',
  timestamp: Date.now()
});

gtag('event', 'wizard_completed', {
  product: 'notice_only',
  jurisdiction: 'england-wales',
  case_id: caseId,
  timestamp: Date.now()
});

// Calculate in GA4:
// Wizard Completion Rate = (wizard_completed events / wizard_started events) × 100
```

**Target Progression:**
- Week 1: 70% (baseline + 5%)
- Week 4: 75% (baseline + 10%)
- Week 8: 80% (baseline + 15%)
- Week 12: 85% (target achieved)

**Segment Analysis:**
- Compare England & Wales vs Scotland
- Compare Section 8 vs Section 21 flows
- Compare mobile vs desktop
- Compare first-time vs returning users

#### 1.2 Preview View Rate
**Definition:** Percentage of completed wizards that result in preview views.

**Formula:**
```
Preview View Rate = (Preview Views / Completed Wizards) × 100
```

**How to Track:**
```javascript
// GA4 Event when preview loads
gtag('event', 'preview_viewed', {
  product: 'notice_only',
  jurisdiction: 'england-wales',
  case_id: caseId,
  preview_type: 'merged_4_documents',
  timestamp: Date.now()
});

// Calculate:
// Preview View Rate = (preview_viewed events / wizard_completed events) × 100
```

**Target Progression:**
- Week 1: 60% (baseline + 10%)
- Week 4: 75% (baseline + 25%)
- Week 8: 85% (baseline + 35%)
- Week 12: 95% (target achieved)

**Why This Matters:**
- High preview view rate indicates users trust the wizard output
- Low rate suggests confusion or drop-off before preview
- Target 95% means nearly all completed wizards lead to preview views

#### 1.3 Smart Guidance Interaction Rate
**Definition:** Percentage of users who interact with smart guidance panels (expand, click "Why?", etc.)

**Formula:**
```
Interaction Rate = (Users Who Interacted / Users Who Saw Panel) × 100
```

**How to Track:**
```javascript
// Track panel visibility
gtag('event', 'smart_guidance_shown', {
  guidance_type: 'route_recommendation', // or 'ground_recommendation', 'calculated_date'
  recommended_value: 'section_8',
  jurisdiction: 'england-wales',
  case_id: caseId
});

// Track interactions
gtag('event', 'smart_guidance_interacted', {
  guidance_type: 'route_recommendation',
  interaction_type: 'expanded_reasoning', // or 'clicked_why', 'read_full_explanation'
  case_id: caseId
});
```

**Target:** ≥60% interaction rate (shows users find guidance valuable)

### 2. Conversion Metrics

#### 2.1 Purchase Conversion Rate
**Definition:** Percentage of preview views that result in purchases.

**Formula:**
```
Purchase Conversion = (Purchases / Preview Views) × 100
```

**How to Track:**
```javascript
// GA4 E-commerce Event
gtag('event', 'purchase', {
  transaction_id: stripeChargeId,
  value: 29.99,
  currency: 'GBP',
  items: [{
    item_id: 'notice_only_pack',
    item_name: 'Notice Only Pack',
    item_category: 'Legal Documents',
    quantity: 1,
    price: 29.99
  }],
  case_id: caseId,
  jurisdiction: 'england-wales'
});
```

**Target Progression:**
- Week 1: 42% (baseline + 2%)
- Week 4: 47% (baseline + 7%)
- Week 8: 52% (baseline + 12%)
- Week 12: 57.5% (target achieved)

**Revenue Impact Calculation:**
```
Baseline Revenue:
- 100 purchases/month × £29.99 = £2,999/month

Target Revenue (57.5% conversion):
- Assume wizard starts remain constant or increase 10%
- (100 ÷ 0.40) = 250 preview views/month (baseline)
- 250 × 0.575 = 144 purchases/month
- 144 × £29.99 = £4,318/month
- Incremental: +£1,319/month (+44%)

Optimistic Revenue (65% conversion, 20% more starts):
- 250 × 1.20 = 300 preview views/month
- 300 × 0.60 = 180 purchases/month
- 180 × £29.99 = £5,398/month
- Incremental: +£2,399/month (+80%)
```

#### 2.2 Cart Abandonment Rate
**Definition:** Percentage of users who start purchase but don't complete.

**Formula:**
```
Cart Abandonment = (Started Checkout - Completed Purchase) / Started Checkout × 100
```

**How to Track:**
```javascript
// Start checkout
gtag('event', 'begin_checkout', {
  value: 29.99,
  currency: 'GBP',
  items: [{item_id: 'notice_only_pack', price: 29.99}],
  case_id: caseId
});

// Complete purchase (tracked above)
```

**Target:** <20% cart abandonment (industry standard: 20-40%)

**Optimization Actions if High:**
- Simplify checkout flow
- Add trust badges
- Offer multiple payment methods
- Reduce form fields

### 3. Quality Metrics

#### 3.1 Smart Guidance Accuracy
**Definition:** Percentage of users who follow smart guidance recommendations.

**Sub-Metrics:**

**A. Route Recommendation Accuracy**
```
Route Acceptance = (Users Who Selected Recommended Route / Users Who Saw Recommendation) × 100
```

**How to Track:**
```javascript
// When recommendation shown
gtag('event', 'route_recommended', {
  recommended_route: 'section_8',
  allowed_routes: ['section_8', 'section_21'],
  blocked_routes: ['section_21'],
  case_id: caseId
});

// When user completes wizard (check if they followed recommendation)
gtag('event', 'route_selected', {
  recommended_route: 'section_8',
  actual_route: 'section_8',
  followed_recommendation: true,
  case_id: caseId
});
```

**Target:** ≥90% follow rate (indicates high trust in recommendations)

**B. Ground Recommendation Acceptance**
```
Ground Acceptance = (Users Who Kept Pre-Populated Grounds / Users Shown Recommendations) × 100
```

**How to Track:**
```javascript
// When grounds pre-populated
gtag('event', 'grounds_recommended', {
  recommended_grounds: [8, 10, 11],
  pre_populated: true,
  case_id: caseId
});

// When user submits grounds question
gtag('event', 'grounds_selected', {
  recommended_grounds: [8, 10, 11],
  actual_grounds: [8, 10], // user removed ground 11
  changed: true,
  case_id: caseId
});
```

**Target:** ≥85% acceptance (users keep most recommended grounds)

**C. Date Calculation Accuracy**
```
Date Accuracy = 100% - (Date Error Reports / Total Date Calculations) × 100
```

**How to Track:**
- Monitor support tickets about "wrong date calculated"
- Survey users: "Was the calculated expiry date correct?"

**Target:** 100% accuracy (zero date calculation errors)

#### 3.2 Support Ticket Reduction
**Definition:** Reduction in support tickets per 100 purchases.

**Formula:**
```
Tickets per 100 Purchases = (Support Tickets / Purchases) × 100
```

**How to Track:**
```
# Tag support tickets with product type
Ticket Categories:
- "Notice Only - Smart Guidance"
- "Notice Only - Preview Issues"
- "Notice Only - General Questions"
- "Notice Only - Document Download"

# Calculate monthly
Tickets This Month: ___
Purchases This Month: ___
Tickets per 100 = (___ / ___) × 100
```

**Target Progression:**
- Month 1: 30 tickets per 100 (baseline 35 - 14% reduction)
- Month 2: 26 tickets per 100 (baseline - 25% reduction)
- Month 3: 21-24.5 tickets per 100 (target: 30-40% reduction)

**Categorize Ticket Types:**
- Technical issues (bugs, errors) - should decrease
- Feature questions ("How does smart guidance work?") - may increase initially, then decrease
- Legal questions ("Is this recommendation correct?") - should decrease significantly

### 4. Performance Metrics

#### 4.1 Preview Generation Time
**Definition:** Average time to generate merged preview PDF.

**Formula:**
```
Avg Generation Time = Sum(All Generation Times) / Total Previews Generated
```

**How to Track:**
```javascript
// Server-side logging (in preview API route)
const startTime = Date.now();
const previewPdf = await generateNoticeOnlyPreview(documents, options);
const generationTime = Date.now() - startTime;

// Log to monitoring service
logger.info('Preview generated', {
  case_id: caseId,
  generation_time_ms: generationTime,
  pdf_size_kb: Buffer.byteLength(previewPdf) / 1024,
  document_count: documents.length,
  jurisdiction: jurisdiction
});

// Track in APM tool (New Relic, Datadog, etc.)
```

**Target:** <10 seconds average, <15 seconds p95, <20 seconds p99

**Alert Thresholds:**
- Warning: >10s average
- Critical: >15s average or >30s p99

**Optimization Actions if Slow:**
- Increase server resources (CPU, memory)
- Optimize Handlebars template compilation
- Cache compiled templates
- Optimize PDF merging algorithm
- Consider async processing with queue

#### 4.2 PDF File Size
**Definition:** Average size of generated merged preview PDF.

**Target:** <5MB (ensures fast download on mobile)

**How to Track:**
```javascript
// Log with preview generation time (above)
const pdfSizeKB = Buffer.byteLength(previewPdf) / 1024;
```

**Alert Thresholds:**
- Warning: >5MB average
- Critical: >8MB average

**Optimization Actions if Large:**
- Compress images in templates
- Reduce font embedding (use system fonts)
- Optimize PDF structure (remove unused objects)

#### 4.3 API Response Time
**Definition:** Average response time for wizard answer API.

**Target:** <2 seconds for `/api/wizard/answer` (includes smart guidance generation)

**How to Track:**
- Use APM tool (New Relic, Datadog) to track API endpoint performance
- Set up alerts for slow responses

**Alert Thresholds:**
- Warning: >2s average
- Critical: >5s average or >10s p99

### 5. User Satisfaction Metrics

#### 5.1 Net Promoter Score (NPS)
**Definition:** "How likely are you to recommend Landlord Heaven to a friend?"

**Survey Timing:** After purchase completion (in thank you email)

**Question:**
```
On a scale of 0-10, how likely are you to recommend Landlord Heaven's Notice Only service to another landlord?

0 = Not at all likely
10 = Extremely likely
```

**Calculation:**
```
NPS = % Promoters (9-10) - % Detractors (0-6)
```

**Target:** NPS >50 (excellent for legal services)

**Benchmark:**
- Baseline (before smart guidance): Unknown - establish baseline
- Target (after smart guidance): NPS 50-70

#### 5.2 Feature Satisfaction Survey
**Survey Questions:**
1. "How helpful was the smart route recommendation?" (1-5 scale)
2. "Did the calculated expiry date match your expectations?" (Yes/No)
3. "Were the pre-populated grounds appropriate for your situation?" (Yes/No/Partially)
4. "How clear were the service instructions?" (1-5 scale)
5. "What could we improve?" (Free text)

**Survey Timing:** 7 days after purchase (allows time to review documents)

**Target:** Average satisfaction ≥4.0/5.0

---

## 📈 ANALYTICS IMPLEMENTATION GUIDE

### Google Analytics 4 Setup

#### Step 1: Define Custom Events

**File:** `src/lib/analytics/events.ts`
```typescript
export const trackWizardStarted = (product: string, jurisdiction: string) => {
  gtag('event', 'wizard_started', {
    product: product,
    jurisdiction: jurisdiction,
    timestamp: Date.now()
  });
};

export const trackWizardCompleted = (caseId: string, product: string, jurisdiction: string) => {
  gtag('event', 'wizard_completed', {
    case_id: caseId,
    product: product,
    jurisdiction: jurisdiction,
    timestamp: Date.now()
  });
};

export const trackSmartGuidanceShown = (
  guidanceType: 'route_recommendation' | 'ground_recommendation' | 'calculated_date',
  recommendedValue: string,
  jurisdiction: string,
  caseId: string
) => {
  gtag('event', 'smart_guidance_shown', {
    guidance_type: guidanceType,
    recommended_value: recommendedValue,
    jurisdiction: jurisdiction,
    case_id: caseId
  });
};

export const trackPreviewViewed = (caseId: string, product: string, jurisdiction: string) => {
  gtag('event', 'preview_viewed', {
    case_id: caseId,
    product: product,
    jurisdiction: jurisdiction,
    preview_type: 'merged_4_documents',
    timestamp: Date.now()
  });
};

export const trackPurchaseCompleted = (
  transactionId: string,
  caseId: string,
  product: string,
  jurisdiction: string,
  value: number
) => {
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'GBP',
    items: [{
      item_id: product,
      item_name: product === 'notice_only' ? 'Notice Only Pack' : product,
      item_category: 'Legal Documents',
      quantity: 1,
      price: value
    }],
    case_id: caseId,
    jurisdiction: jurisdiction
  });
};
```

#### Step 2: Implement Event Tracking in Components

**In `src/components/wizard/StructuredWizard.tsx`:**
```typescript
import { trackWizardStarted, trackWizardCompleted, trackSmartGuidanceShown } from '@/lib/analytics/events';

// Track wizard start (in useEffect on mount)
useEffect(() => {
  if (isFirstQuestion) {
    trackWizardStarted('notice_only', jurisdiction);
  }
}, [isFirstQuestion, jurisdiction]);

// Track wizard completion (when last question answered)
if (isLastQuestion && answerSubmitted) {
  trackWizardCompleted(caseId, 'notice_only', jurisdiction);
}

// Track smart guidance shown (when panels appear)
useEffect(() => {
  if (routeRecommendation) {
    trackSmartGuidanceShown(
      'route_recommendation',
      routeRecommendation.recommended_route,
      jurisdiction,
      caseId
    );
  }
}, [routeRecommendation, jurisdiction, caseId]);
```

**In `src/app/wizard/preview/[caseId]/page.tsx`:**
```typescript
import { trackPreviewViewed } from '@/lib/analytics/events';

// Track preview viewed (when preview loads successfully)
useEffect(() => {
  if (previewUrl) {
    trackPreviewViewed(caseId, 'notice_only', jurisdiction);
  }
}, [previewUrl, caseId, jurisdiction]);
```

**In purchase completion handler:**
```typescript
import { trackPurchaseCompleted } from '@/lib/analytics/events';

// After Stripe payment succeeds
trackPurchaseCompleted(
  stripeChargeId,
  caseId,
  'notice_only',
  jurisdiction,
  29.99
);
```

#### Step 3: Create GA4 Explorations

**Exploration 1: Conversion Funnel**
```
GA4 → Explore → Funnel Exploration
Steps:
1. wizard_started (product = notice_only)
2. wizard_completed (product = notice_only)
3. preview_viewed (product = notice_only)
4. begin_checkout
5. purchase (product = notice_only)

Breakdown: jurisdiction, device category, user type (new vs returning)
```

**Exploration 2: Smart Guidance Impact**
```
GA4 → Explore → User Lifetime
Audience: Users who saw smart_guidance_shown event
Compare: Purchase rate vs users who didn't see smart guidance (shouldn't exist for notice_only)
Metrics: Conversion rate, avg revenue per user
```

### Dashboard Setup

#### Option 1: GA4 Dashboard (Free)

**Create Custom Dashboard:**
```
GA4 → Admin → Data Display → Create Dashboard "Notice Only Smart Guidance"

Tiles:
1. Wizard Starts (Last 7 days) - Count of wizard_started events
2. Wizard Completions (Last 7 days) - Count of wizard_completed events
3. Completion Rate - Calculated field: (wizard_completed / wizard_started) × 100
4. Preview Views (Last 7 days) - Count of preview_viewed events
5. Preview View Rate - Calculated field: (preview_viewed / wizard_completed) × 100
6. Purchases (Last 7 days) - Count of purchase events
7. Purchase Conversion - Calculated field: (purchase / preview_viewed) × 100
8. Revenue (Last 7 days) - Sum of purchase.value
9. Smart Guidance Shown - Count of smart_guidance_shown events by guidance_type
10. Top Routes Recommended - Dimension: recommended_value (route_recommendation)
```

#### Option 2: Metabase Dashboard (Recommended)

**Create Dashboard with Database Queries:**

**Query 1: Weekly Metrics Summary**
```sql
WITH weekly_stats AS (
  SELECT
    DATE_TRUNC('week', created_at) AS week,
    COUNT(DISTINCT CASE WHEN status = 'started' THEN id END) AS wizard_starts,
    COUNT(DISTINCT CASE WHEN status = 'completed' THEN id END) AS wizard_completions,
    COUNT(DISTINCT CASE WHEN preview_viewed_at IS NOT NULL THEN id END) AS preview_views,
    COUNT(DISTINCT CASE WHEN purchased_at IS NOT NULL THEN id END) AS purchases,
    SUM(CASE WHEN purchased_at IS NOT NULL THEN 29.99 ELSE 0 END) AS revenue
  FROM cases
  WHERE product = 'notice_only'
    AND created_at >= NOW() - INTERVAL '3 months'
  GROUP BY week
)
SELECT
  week,
  wizard_starts,
  wizard_completions,
  ROUND(100.0 * wizard_completions / NULLIF(wizard_starts, 0), 1) AS completion_rate,
  preview_views,
  ROUND(100.0 * preview_views / NULLIF(wizard_completions, 0), 1) AS preview_view_rate,
  purchases,
  ROUND(100.0 * purchases / NULLIF(preview_views, 0), 1) AS purchase_conversion,
  revenue
FROM weekly_stats
ORDER BY week DESC;
```

**Query 2: Smart Guidance Performance**
```sql
SELECT
  jurisdiction,
  JSON_EXTRACT_PATH_TEXT(wizard_facts, 'route_recommendation', 'recommended_route') AS recommended_route,
  COUNT(*) AS total_recommendations,
  COUNT(CASE WHEN purchased_at IS NOT NULL THEN 1 END) AS purchases,
  ROUND(100.0 * COUNT(CASE WHEN purchased_at IS NOT NULL THEN 1 END) / COUNT(*), 1) AS conversion_rate,
  AVG(EXTRACT(EPOCH FROM (purchased_at - completed_at)) / 3600) AS avg_hours_to_purchase
FROM cases
WHERE product = 'notice_only'
  AND wizard_facts::json->'route_recommendation' IS NOT NULL
  AND completed_at >= NOW() - INTERVAL '1 month'
GROUP BY jurisdiction, recommended_route
ORDER BY total_recommendations DESC;
```

**Query 3: Support Ticket Trends**
```sql
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS total_tickets,
  COUNT(CASE WHEN category LIKE '%Smart Guidance%' THEN 1 END) AS smart_guidance_tickets,
  COUNT(CASE WHEN category LIKE '%Preview%' THEN 1 END) AS preview_tickets,
  COUNT(CASE WHEN category LIKE '%General%' THEN 1 END) AS general_tickets,
  -- Join with purchases to calculate tickets per 100 purchases
  ROUND(100.0 * COUNT(*) / (
    SELECT COUNT(*) FROM cases
    WHERE product = 'notice_only'
      AND purchased_at IS NOT NULL
      AND DATE_TRUNC('month', purchased_at) = DATE_TRUNC('month', support_tickets.created_at)
  ), 1) AS tickets_per_100_purchases
FROM support_tickets
WHERE product = 'notice_only'
  AND created_at >= NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month DESC;
```

**Dashboard Tiles:**
1. KPI Cards (top row):
   - Wizard Completion Rate (current week vs baseline)
   - Preview View Rate (current week vs baseline)
   - Purchase Conversion (current week vs baseline)
   - Revenue (current week vs last week)

2. Trend Charts (middle row):
   - Weekly metrics over time (line chart)
   - Conversion funnel (funnel chart)
   - Smart guidance acceptance by type (bar chart)

3. Detailed Tables (bottom row):
   - Top recommended routes and conversion rates
   - Performance by jurisdiction
   - Recent support tickets summary

#### Option 3: Looker Studio (Free, Google)

**Connect to GA4 and Database:**
- GA4 connector for real-time analytics events
- BigQuery or PostgreSQL connector for database queries

**Sample Dashboard Layout:**
```
[Notice Only Smart Guidance Performance Dashboard]

Row 1: KPI Scorecards
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Completion  │ Preview     │ Purchase    │ Revenue     │
│   82%       │   91%       │   52%       │  £4,200     │
│ Target: 85% │ Target: 95% │ Target: 57% │ Target: £5k │
│   ↑ 17%     │   ↑ 41%     │   ↑ 12%     │   ↑ 40%     │
└─────────────┴─────────────┴─────────────┴─────────────┘

Row 2: Funnel & Trends
┌─────────────────────────┬─────────────────────────────┐
│  Conversion Funnel      │  Weekly Trend (12 weeks)    │
│                         │                             │
│  Started: 100%  (500)   │  [Line chart showing        │
│     ↓ 82%              │   completion, preview,      │
│  Completed: 82% (410)   │   purchase rates trending   │
│     ↓ 91%              │   upward over time]         │
│  Preview: 75%  (375)    │                             │
│     ↓ 52%              │                             │
│  Purchase: 39% (195)    │                             │
└─────────────────────────┴─────────────────────────────┘

Row 3: Smart Guidance Performance
┌──────────────────────────────────────────────────────┐
│  Route Recommendations (England & Wales)             │
│  Section 8: 60% of cases, 54% conversion             │
│  Section 21: 40% of cases, 49% conversion            │
│  Acceptance Rate: 92% (users follow recommendation)  │
└──────────────────────────────────────────────────────┘
```

---

## 📅 REPORTING SCHEDULE

### Daily Monitoring (First 2 Weeks)

**Who:** Engineering Lead + Product Owner
**When:** Every day at 10 AM GMT
**Duration:** 5 minutes

**Quick Check:**
- [ ] Any error spikes? (Check APM dashboard)
- [ ] Preview generation time within targets? (<10s)
- [ ] Any new support tickets about smart guidance?
- [ ] Conversion rate trending in right direction?

**Action:** If any red flags, investigate immediately.

### Weekly Review (First 3 Months)

**Who:** Product Team + Engineering Lead + QA Lead
**When:** Every Monday at 2 PM GMT
**Duration:** 30 minutes

**Agenda:**
1. **Review KPIs (10 min):**
   - Wizard completion rate vs target
   - Preview view rate vs target
   - Purchase conversion vs target
   - Revenue impact

2. **Deep Dive (10 min):**
   - Which jurisdiction performing better?
   - Which route (Section 8 vs 21) has higher conversion?
   - Mobile vs desktop conversion differences
   - Smart guidance acceptance rates

3. **Support & Issues (5 min):**
   - Review support tickets from past week
   - Identify patterns or common confusion points
   - Prioritize fixes

4. **Action Items (5 min):**
   - Assign optimization tasks
   - Set priorities for next sprint
   - Update stakeholders if needed

**Deliverable:** Email summary to stakeholders with key metrics and trends.

### Monthly Business Review (Ongoing)

**Who:** Leadership Team + Product Team
**When:** First Monday of each month
**Duration:** 1 hour

**Agenda:**
1. **Metrics Review (20 min):**
   - Progress toward 3-month targets
   - Revenue impact and ROI
   - User satisfaction (NPS, surveys)

2. **Success Stories (10 min):**
   - Positive user feedback
   - Support ticket reduction examples
   - Conversion wins

3. **Challenges & Learnings (15 min):**
   - What's not working as expected?
   - User confusion points
   - Technical issues or performance concerns

4. **Strategic Planning (15 min):**
   - Expansion opportunities (other products?)
   - Feature enhancements based on feedback
   - Marketing strategy adjustments

**Deliverable:** Monthly report with executive summary, detailed metrics, and recommendations.

---

## 🎨 SAMPLE WEEKLY REPORT TEMPLATE

```markdown
# Notice Only Smart Guidance - Weekly Performance Report
**Week Ending:** [Date]
**Report Date:** [Date]
**Prepared By:** [Name]

---

## Executive Summary

This week, Notice Only Smart Guidance achieved [brief 1-2 sentence summary of key wins or concerns].

**Key Highlights:**
- ✅ Wizard completion rate: [X]% (target: 85%)
- ✅ Purchase conversion: [X]% (target: 57.5%)
- ⚠️  [Any concerns or areas needing attention]

---

## Primary Metrics

| Metric | This Week | Last Week | Change | Target | Status |
|--------|-----------|-----------|--------|--------|--------|
| Wizard Starts | [X] | [X] | [+/-X%] | - | - |
| Wizard Completions | [X] | [X] | [+/-X%] | - | - |
| Completion Rate | [X]% | [X]% | [+/-X%] | 85% | [🟢🟡🔴] |
| Preview Views | [X] | [X] | [+/-X%] | - | - |
| Preview View Rate | [X]% | [X]% | [+/-X%] | 95% | [🟢🟡🔴] |
| Purchases | [X] | [X] | [+/-X%] | - | - |
| Purchase Conversion | [X]% | [X]% | [+/-X%] | 57.5% | [🟢🟡🔴] |
| Revenue | £[X] | £[X] | [+/-X%] | £[X] | [🟢🟡🔴] |

**Status Key:** 🟢 On track or exceeding target | 🟡 Slightly below target | 🔴 Significantly below target

---

## Smart Guidance Performance

### Route Recommendations (England & Wales)
- **Section 8 Recommended:** [X] cases ([X]% of total)
  - Acceptance Rate: [X]% (users who followed recommendation)
  - Purchase Conversion: [X]%

- **Section 21 Recommended:** [X] cases ([X]% of total)
  - Acceptance Rate: [X]%
  - Purchase Conversion: [X]%

### Ground Recommendations
- **Average Grounds Recommended:** [X] grounds per case
- **Ground Acceptance Rate:** [X]% (users kept recommended grounds)
- **Most Recommended Grounds:** Ground 8 ([X]%), Ground 10 ([X]%), Ground 11 ([X]%)

### Date Calculations
- **Total Date Calculations:** [X]
- **Accuracy:** 100% (zero error reports) ✅

---

## Performance Metrics

| Metric | This Week Avg | Target | Status |
|--------|---------------|--------|--------|
| Preview Generation Time | [X]s | <10s | [🟢🟡🔴] |
| PDF File Size | [X]MB | <5MB | [🟢🟡🔴] |
| API Response Time (/wizard/answer) | [X]s | <2s | [🟢🟡🔴] |

---

## Support Tickets

**Total Tickets This Week:** [X] ([X] tickets per 100 purchases)
**Target:** <28 tickets per 100 purchases

**Breakdown:**
- Smart Guidance Questions: [X] ([X]%)
- Preview Issues: [X] ([X]%)
- General Questions: [X] ([X]%)
- Technical Issues: [X] ([X]%)

**Notable Issues:**
1. [Issue description] - [X] tickets
2. [Issue description] - [X] tickets

**Actions Taken:**
- [Action 1]
- [Action 2]

---

## Insights & Observations

**What's Working:**
- [Positive observation 1]
- [Positive observation 2]

**What Needs Attention:**
- [Concern 1]
- [Concern 2]

**User Feedback Highlights:**
- [Quote or summary of positive feedback]
- [Quote or summary of constructive feedback]

---

## Action Items for Next Week

1. **[Action Item 1]** - Owner: [Name], Due: [Date]
2. **[Action Item 2]** - Owner: [Name], Due: [Date]
3. **[Action Item 3]** - Owner: [Name], Due: [Date]

---

## Progress Toward 3-Month Targets

| Metric | Baseline | Current | 3-Month Target | Progress |
|--------|----------|---------|----------------|----------|
| Completion Rate | 65% | [X]% | 85% | [█████░░░░░] [X]% |
| Preview View Rate | 50% | [X]% | 95% | [█████░░░░░] [X]% |
| Purchase Conversion | 40% | [X]% | 57.5% | [█████░░░░░] [X]% |
| Support Tickets per 100 | 35 | [X] | 21-24.5 | [█████░░░░░] [X]% |

**Projected Achievement Date:** [Date] (if current trend continues)

---

**Next Review:** [Date]
**Questions or Concerns:** Contact [Name] at [Email]
```

---

## 🚨 ALERT CONFIGURATION

### Critical Alerts (Immediate Action Required)

**Alert 1: Error Rate Spike**
- **Condition:** Error rate on `/api/wizard/answer` or `/api/notice-only/preview/[caseId]` >5% for 5 minutes
- **Action:** Page on-call engineer
- **Severity:** P0
- **Response Time:** 5 minutes

**Alert 2: Preview Generation Failure**
- **Condition:** Preview generation success rate <90% for 10 minutes
- **Action:** Page on-call engineer + notify product owner
- **Severity:** P0
- **Response Time:** 10 minutes

**Alert 3: Purchase Flow Broken**
- **Condition:** Zero purchases for 2 hours (during normal business hours)
- **Action:** Page on-call engineer + notify product owner + check Stripe
- **Severity:** P0
- **Response Time:** 15 minutes

### Warning Alerts (Monitor Closely)

**Alert 4: Slow Preview Generation**
- **Condition:** Average preview generation time >10s for 30 minutes
- **Action:** Email engineering team
- **Severity:** P1
- **Response Time:** 1 hour

**Alert 5: Conversion Rate Drop**
- **Condition:** Purchase conversion rate drops >10% from 7-day average
- **Action:** Email product team + engineering team
- **Severity:** P1
- **Response Time:** 4 hours

**Alert 6: Completion Rate Drop**
- **Condition:** Wizard completion rate drops >5% from 7-day average
- **Action:** Email product team
- **Severity:** P2
- **Response Time:** 24 hours

### Informational Alerts

**Alert 7: Support Ticket Pattern**
- **Condition:** >3 support tickets about same issue within 2 hours
- **Action:** Email product team + customer support lead
- **Severity:** P2
- **Response Time:** 4 hours

---

## 🎯 OPTIMIZATION PLAYBOOK

Based on metrics, here's what to do:

### If Wizard Completion Rate is Low (<75%)

**Diagnose:**
1. Where are users dropping off? (Check GA4 funnel)
2. Is a specific question causing drop-off?
3. Mobile vs desktop - is one worse?

**Actions:**
- Simplify confusing questions
- Add more help text or tooltips
- Improve mobile UX
- Add progress indicator
- Consider saving partial progress

### If Preview View Rate is Low (<80%)

**Diagnose:**
1. Are users completing wizard but not clicking preview?
2. Is preview button visible and clear?
3. Are there errors generating preview?

**Actions:**
- Make preview CTA more prominent
- Add preview teaser ("See what you'll get")
- Fix any preview generation errors
- Add loading state (don't leave users wondering)

### If Purchase Conversion is Low (<45%)

**Diagnose:**
1. Are users viewing preview but not purchasing?
2. Is pricing clear?
3. Is checkout flow smooth?
4. Are there trust signals?

**Actions:**
- Add customer testimonials
- Show preview quality ("This is what you'll download")
- Simplify checkout (fewer steps)
- Add payment options (Apple Pay, Google Pay)
- Add urgency ("Complete your eviction notice today")
- Consider limited-time discount for first purchase

### If Support Tickets are High (>30 per 100 purchases)

**Diagnose:**
1. What are common ticket themes?
2. Is smart guidance confusing users?
3. Are documents unclear?

**Actions:**
- Add FAQ section
- Improve help text based on common questions
- Add video tutorial
- Create knowledge base articles
- Consider in-app chat support

### If Smart Guidance Acceptance is Low (<80%)

**Diagnose:**
1. Are recommendations accurate?
2. Is reasoning clear?
3. Are users understanding the recommendations?

**Actions:**
- Improve recommendation reasoning text
- Add more legal context
- Show confidence scores
- Allow users to provide feedback ("Was this helpful?")
- Refine decision engine rules based on feedback

---

## 📚 SUCCESS METRICS GLOSSARY

| Term | Definition |
|------|------------|
| **Baseline** | Metric value before smart guidance feature deployed |
| **Conversion Funnel** | Series of steps from wizard start to purchase |
| **Drop-off Rate** | Percentage of users who leave at each funnel step |
| **NPS (Net Promoter Score)** | Measure of customer satisfaction and loyalty (-100 to +100) |
| **P95/P99** | 95th/99th percentile (value that 95%/99% of requests are faster than) |
| **ROI (Return on Investment)** | Revenue increase divided by development cost |
| **Smart Guidance Acceptance** | Percentage of users who follow smart recommendations |
| **Success Threshold** | Minimum metric value to consider feature successful |
| **Target** | Desired metric value within 3 months of deployment |

---

## ✅ SUCCESS METRICS CHECKLIST

### Analytics Setup
- [ ] GA4 custom events implemented (wizard_started, wizard_completed, preview_viewed, etc.)
- [ ] E-commerce tracking configured (purchase events with transaction IDs)
- [ ] GA4 conversion funnel created
- [ ] Custom dashboard created (GA4, Metabase, or Looker Studio)

### Monitoring Setup
- [ ] APM tool configured (New Relic, Datadog, or equivalent)
- [ ] Error rate alerts configured
- [ ] Performance alerts configured (preview generation time, API response time)
- [ ] Conversion rate alerts configured

### Reporting Process
- [ ] Daily monitoring checklist created
- [ ] Weekly report template created
- [ ] Monthly business review scheduled
- [ ] Stakeholder distribution list created

### Baselines Established
- [ ] Pre-deployment baseline metrics recorded
- [ ] Target metrics defined and communicated
- [ ] Success thresholds agreed upon by stakeholders

### Feedback Loops
- [ ] User satisfaction survey created
- [ ] NPS survey scheduled (post-purchase)
- [ ] Support ticket tagging system implemented
- [ ] User feedback collection process defined

---

## 🎉 CONCLUSION

This success metrics framework provides comprehensive tracking and monitoring for the Notice Only Smart Guidance feature. By measuring engagement, conversion, quality, performance, and user satisfaction, the team can:

1. **Validate Success:** Confirm the feature achieves its ROI targets
2. **Identify Issues:** Quickly spot problems and address them
3. **Optimize Continuously:** Use data to improve the feature over time
4. **Communicate Impact:** Show stakeholders the business value

**Key Success Indicators to Watch:**
- Wizard completion rate increases to 85%
- Purchase conversion increases to 57.5%
- Support tickets decrease by 30-40%
- Revenue increases by £1,300-£2,400/month

**Remember:** Metrics are a tool for learning and improvement, not just for reporting. Use insights to make the product better for users every week.

---

**Document Version:** 1.0
**Last Updated:** December 14, 2025
**Owner:** Product Team
**Review Frequency:** Update quarterly or when metrics framework changes

**Ready for Tracking** ✅
