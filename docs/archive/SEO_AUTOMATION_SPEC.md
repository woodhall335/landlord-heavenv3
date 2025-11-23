# 🤖 LANDLORD HEAVEN – FULLY AUTOMATED SEO MACHINE

### Zero Manual Work After Setup · AI Does Everything · Set It & Forget It · Scale to 10,000+ Pages Automatically

> **Purpose**
> This document is a **single master spec** for Claude Code.
> It describes how to turn Landlord Heaven into a **fully automated, jurisdiction-aware SEO machine** that:
> - Builds and maintains **all SEO pages** (hundreds → thousands)
> - Runs a **daily content engine**
> - Runs a **fully-automated backlink engine**
> - Continuously **optimizes and refreshes** content
> - Provides **intelligence & reporting**
> - Requires **near-zero ongoing human work** beyond light monitoring.

---

## 0. CONTEXT & ASSUMPTIONS

- Core Landlord Heaven app (wizard, dashboards, products, payments, deployment) is already built.
- Stack: Next.js 14 + TypeScript + Tailwind + Supabase + Stripe + OpenAI + Anthropic + Resend + Vercel (as per existing docs).
- This spec adds a **massive SEO/Automation layer** *on top* of the existing system.

**Key Principles:**

1. **Jurisdiction-aware** for all content:
   - England & Wales
   - Scotland
   - Northern Ireland

2. **All pages SEO-optimised**:
   - Strong titles, meta descriptions, schema, internal linking, CTAs, UX.

3. **Automation-first**:
   - After 4-week build of automation layer, the system runs itself:
     - AI creates content
     - AI gets links
     - AI optimizes pages
     - AI refreshes content
     - AI reports & recommends

---

## 1. JURISDICTIONS – GLOBAL CONSTRAINT

All SEO content, tools, and automation must respect jurisdiction boundaries:

### ⚖️ England & Wales

- Section 8 (Grounds 1–17; 6 mandatory, 11 discretionary)
- Section 21 (Form 6A, deposit, EPC, GSC, How to Rent, licensing constraints)
- County Court process (standard vs accelerated)
- Money claims for arrears; interest (commonly 8% simple, where applicable)

### ⚖️ Scotland

- Private Residential Tenancy (PRT)
- 18 eviction grounds (all discretionary by First-tier Tribunal)
- Pre-action requirements for arrears
- Repairing Standard & disrepair rules
- Illegal eviction penalties

### ⚖️ Northern Ireland

- Notice to Quit (different notice periods by tenancy length)
- County Court possession process
- Deposit scheme differences
- Distinct repair & rent rules

**Every page and tool must:**

- Clearly state which jurisdiction it applies to.
- Use jurisdiction-correct law and terminology.
- Include disclaimer:
  > "This is general legal information, not legal advice. For advice on your specific situation, consult a qualified professional."

---

## 2. SEO ARCHITECTURE OVERLAY

This layer turns Landlord Heaven into a **massive long-tail SEO site** with programmatic pages.

### 2.1 Main Hubs (Manual + Programmatic)

- `/` – Homepage
- `/eviction/` – Eviction hub
- `/tenancy-agreements/` – AST & tenancy templates
- `/hmo/` – HMO overview
- `/hmo-pro/` – HMO Pro product page
- `/tools/` – All tools & calculators
- `/learn/` – Articles & guides index
- `/hmo-licensing/` – Council licensing index
- `/problems/` – Common landlord problems index

Each hub is **SEO-optimised** and links to:

- Money pages
- Problem guides
- Tools
- Council/location pages

---

### 2.2 URL Strategy (Programmatic & Long-Tail)

**Eviction Routes & Notices:**

- `/eviction/section-8-notice-england-wales/`
- `/eviction/section-21-notice-england-wales/`
- `/eviction/prt-grounds-scotland/`
- `/eviction/notice-to-quit-northern-ireland/`
- `/eviction/compare-section-8-section-21/`

**Products:**

- `/products/complete-eviction-pack/`
- `/products/notice-only-pack/`
- `/products/rent-arrears-money-claim-pack/`

**Tenancy Agreements:**

- `/tenancy-agreements/ast-template-standard/`
- `/tenancy-agreements/premium-ast-with-hmo-clauses/`
- `/tenancy-agreements/scotland-prt-style-agreement/`
- `/tenancy-agreements/northern-ireland-tenancy-template/`

**Problem Pages (x3 jurisdictions each):**

- `/problems/tenant-not-paying-rent-england/`
- `/problems/tenant-not-paying-rent-scotland/`
- `/problems/tenant-not-paying-rent-northern-ireland/`
- `/problems/tenant-refusing-access-england/`
- `/problems/tenant-refusing-access-scotland/`
- `/problems/tenant-refusing-access-northern-ireland/`
- `/problems/can-i-evict-tenant-to-sell-house-england/`
- `/problems/can-i-evict-tenant-to-sell-house-scotland/`
- ... (20+ problem types × 3 = 60+ pages)

**Tools & Calculators:**

- `/tools/eviction-route-checker/`
- `/tools/notice-period-calculator-england-wales/`
- `/tools/notice-period-calculator-scotland/`
- `/tools/notice-period-calculator-northern-ireland/`
- `/tools/hmo-yield-calculator/`
- `/tools/rent-arrears-interest-calculator/`
- `/tools/deposit-deduction-helper/`

**HMO Licensing & Councils:**

- `/hmo-licensing/manchester-city-council/`
- `/hmo-licensing/birmingham-city-council/`
- `/hmo-licensing/leeds-city-council/`
- `/hmo-licensing/liverpool-city-council/`
- `/hmo-licensing/glasgow-city-council/`
- `/hmo-licensing/edinburgh-council/`
- `/hmo-licensing/belfast-city-council/`
- ... (up to 380+ councils in UK)

**City-Level Eviction Guides:**

- `/eviction/manchester-landlord-guide/`
- `/eviction/glasgow-landlord-guide/`
- `/eviction/belfast-landlord-guide/`
- `/eviction/london-landlord-guide/`
- ... (50–80 cities)

Total potential: **hundreds → thousands** of unique pages.

---

### 2.3 Page Types & SEO Templates

#### 2.3.1 Money Pages (Transactional)

**Examples:**

- Section 8 page, Section 21 page, Complete Eviction Pack, Rent Arrears pack, AST templates, HMO Pro.

**Template:**

```md
# {H1: Main keyword + Jurisdiction}

## What This Is
{Jurisdiction-specific explanation}

## When You Can Use It
{Eligibility conditions}

## Notice Period & Timeline in {Jurisdiction}
{Precise rules, exceptions}

## Step-by-Step Process
1. Step 1...
2. Step 2...
3. Step 3...

## Common Mistakes to Avoid
- Mistake 1
- Mistake 2

## When This Is Not Appropriate
{Alternative routes, warnings}

## Generate Your {Product Name} Now
[CTA Button → Checkout / Wizard]

## FAQs about {Product Name} in {Jurisdiction}
{10+ questions and answers}
```

**SEO Requirements:**

- Meta title (60–65 chars)
- Meta description (140–160 chars)
- H1 containing main keyword + jurisdiction
- Internal links to: tools, guides, wizard
- External links to: gov.uk, legislation.gov.uk where relevant
- Schema: Product, FAQPage, BreadcrumbList, optionally HowTo

#### 2.3.2 Problem Guides (Informational; x3 Jurisdictions)

**Examples:**

- Tenant not paying rent
- Tenant refusing access
- Tenant damaging property
- No written tenancy agreement
- Wanting to sell / move back in
- Anti-social behaviour
- Pets without permission
- Mould/damp complaints

**Template:**

```md
# {Problem} – {Jurisdiction}

## Quick Answer
{1–3 sentences, directly answering the question}

## The Law in {Jurisdiction}
{Jurisdiction-correct law}

## Your Options
### 1. Informal Steps
{Communication, payment plans, evidence}

### 2. Formal Notice Routes
{Section 8/21/PRT/NI etc.}

### 3. Going to Court/Tribunal
{High-level overview}

## What You Must Not Do
{Illegal eviction, harassment, etc.}

## Next Steps
- [Use free eviction route checker]
- [Generate correct notice and documents]

## FAQs about {Problem} in {Jurisdiction}
{10+ questions and answers}
```

**SEO Requirements:**

- Target "Can I…?" / "What can I do…?" type queries
- Clear snippet-optimised quick answer at top
- FAQ schema + FAQ accordion
- Internal links to relevant tools & products
- External links to authoritative references

#### 2.3.3 Tool Pages (Jurisdiction-Aware)

**Examples:**

- Notice period calculator
- Eviction route checker
- HMO yield calculator
- Rent arrears interest calculator

**Template:**

```md
# {Tool Name} – Free {Jurisdiction} Calculator

## About This Tool
{What it does, who it's for}

## Use the Calculator
{Form UI – inputs vary per tool}

## Your Results
{Highlight main outputs clearly}

## What These Results Mean Legally
{Jurisdiction-correct explanation}

## Next Steps
- [Start free eviction route checker]
- [Generate notice/court pack]
- [Try HMO Pro if HMO detected]

## FAQs about {Tool Name}
{5–10 Q&A}
```

**SEO Requirements:**

- Title: "{Tool Name} – Free {Jurisdiction} Calculator"
- Schema: SoftwareApplication/WebApplication, FAQPage, BreadcrumbList
- Internal links to relevant guides & products
- External links if using official formulas

#### 2.3.4 Council & City Pages (Programmatic)

**HMO Licensing Council Pages:**

```md
# HMO Licensing – {Council Name} Landlord Guide

## Do You Need an HMO Licence in {Council Name}?
{Use council dataset}

## Types of Licences
- Mandatory HMO
- Additional licences (if any)
- Selective licences (if any)

## Fees in {Council Name}
{Table}

## How to Apply
- Link to council page
- Basic process steps

## Penalties for Non-Compliance
{Brief overview}

## Track Everything in One Place
[CTA → HMO Pro dashboard]

## FAQs about HMO Licensing in {Council Name}
{5–10 Q&A}
```

**City Eviction Pages:**

```md
# Evicting a Tenant in {City} – Landlord Guide

## Quick Overview
{Jurisdiction + courts + common issues}

## Typical Routes in {City}
{Common scenarios & routes}

## Local Considerations
{Any local schemes or quirks if available}

## Next Steps
- [Use free eviction route checker]
- [Generate documents]
- [Read HMO licensing guide for {Council}]
```

### 2.4 Backend & Technical SEO (Agent 2 & 5)

**Dynamic routing for all described URL patterns**

**DB schema for SEO pages:**

```sql
CREATE TABLE seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  template_type TEXT NOT NULL, -- 'money', 'problem', 'tool', 'council', 'city'
  jurisdiction TEXT, -- 'england-wales', 'scotland', 'northern-ireland', null for multi
  content JSONB NOT NULL,
  json_ld JSONB, -- Schema markup
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seo_pages_slug ON seo_pages(slug);
CREATE INDEX idx_seo_pages_status ON seo_pages(status);
CREATE INDEX idx_seo_pages_template_type ON seo_pages(template_type);
```

**Sitemaps:**

- `/sitemap.xml` (index)
- `/sitemap-pages.xml`
- `/sitemap-tools.xml`
- `/sitemap-councils.xml`
- `/sitemap-cities.xml`
- `/sitemap-problems.xml`

**robots.txt:**

- Staging: disallow all
- Production: allow all + link to sitemap

**SSR schema injection via `<script type="application/ld+json">`**

---

## 3. FULLY AUTOMATED SEO MACHINE – HIGH-LEVEL VISION

### 🎯 THE VISION: COMPLETE AUTOMATION

After initial 4-week setup, the system runs itself:

✅ **Content:** AI generates daily (blog posts, SEO pages, updates)

✅ **Backlinks:** AI finds opportunities and sends outreach emails automatically

✅ **Optimization:** AI monitors performance and improves pages

✅ **Monitoring:** AI alerts you to issues and fixes them

✅ **Scaling:** AI identifies new opportunities and expands coverage

**Human involvement:** ~2–4 hours/week monitoring & strategic decisions.

**You just watch revenue grow. 💰**

### 🏗️ AUTOMATION ARCHITECTURE

**Layer 1: Content Generation Engine**
AI creates all long-form content & SEO pages automatically.

**Layer 2: Backlink Acquisition Engine**
AI finds link opportunities and sends personalized outreach emails.

**Layer 3: Optimization Engine**
AI monitors performance (Search Console, Analytics, crawling) and optimizes pages.

**Layer 4: Intelligence Engine**
AI tracks competitors, trends, law changes, user behavior, and identifies new opportunities.

**Layer 5: Reporting Engine**
AI generates weekly reports and strategic recommendations.

**All layers run via cron jobs / scheduled tasks + APIs.**

---

## 4. AUTOMATED CONTENT GENERATION ENGINE

**Goal:** Daily AI-generated content, zero manual writing.

### 4.1 System Overview

**Input:** None (system decides what to create)

**Process:** AI research → AI writing → AI optimization → Auto-publish

**Output:** Unlimited high-quality, jurisdiction-aware content

**Human involvement:** 0% for creation; occasional spot checks for QA

### 4.2 Daily Automated Content Creation (2am–6am GMT)

```typescript
// Runs automatically every day at 2am GMT
// Zero human intervention required

DAILY AUTOMATION SEQUENCE

2:00 AM – Trend Scanner
- Scrape landlord-related trends:
  - Google Trends (UK; property, landlord-related hashes)
  - UK news sites (NewsAPI)
  - Reddit/forums (r/LegalAdviceUK, r/UKPersonalFinance, landlord forums)
  - gov.uk reforms & legislation updates
  - Competitor new content (SEMrush/Ahrefs content feeds)
- Generate 5 topic ideas ranked by priority (GPT-4/Claude)

2:30 AM – Topic Validator
- For each potential topic:
  - Query search volume (SEMrush / Keyword Planner API)
  - Estimate competition level (difficulty metrics)
  - Check if page already exists (DB lookup)
  - Predict traffic & revenue potential
  - Select best topic for today
  - Add to content_queue

3:00 AM – Research Phase
- Scrape top 10 Google results for chosen topic
- Extract key points, headings, gaps
- Identify authoritative sources (.gov.uk, legislation.gov.uk, major landlord orgs)
- Generate detailed content brief:
  - H1, title, meta description
  - Outline (10–15 sections)
  - Target keywords + long-tails
  - Jurisdiction(s) involved
  - Internal/external link targets

3:30 AM – Content Generation
- Generate outline (GPT-4)
- Generate full article (GPT-4, 1200–1500 words)
- Pass through Claude Sonnet 4 for:
  - Jurisdiction-specific legal accuracy
  - Removal of advice-like wording; keep to general information
- Generate:
  - Meta title & description
  - FAQ list (10–15 questions)
  - Schema markup (FAQ, Article, HowTo if applicable)
  - Internal link suggestions
  - External authoritative link suggestions
  - Featured image prompt

4:00 AM – Content Enhancement
- Generate featured image (DALL·E or Midjourney API)
- Compress image, add descriptive alt text
- Auto-insert 5–8 internal links
- Insert 3–5 external links (.gov.uk, legislation.gov.uk, Citizens Advice, etc.)
- Add CTAs:
  - "Start free eviction route checker"
  - "Generate your notice now"
  - "Try HMO Pro free for 7 days" (if relevant)
- Add:
  - Table of contents
  - Breadcrumb navigation
  - Featured snippet-optimised answer in intro

4:30 AM – Quality Assurance
- Plagiarism check (Copyscape API)
- AI detection check (GPTZero API)
- Readability score (Flesch-Kincaid > 60)
- SEO score (Surfer SEO API or equivalent > 75)
- Legal accuracy verification (Claude Sonnet 4 vs legal spec)
- Fact verification (cross-reference gov.uk / official sources)
- If any check fails → regenerate or adapt content until pass.

5:00 AM – Publication
- Insert into generated_content table
- Generate SEO-friendly slug
- Determine jurisdiction and attach proper disclaimers
- Set status: published
- Add to sitemaps
- Ping:
  - Google Search Console
  - Bing Webmaster Tools
- Log to content_calendar

5:30 AM – Distribution
- Auto-post to:
  - Twitter/X
  - LinkedIn
  - Facebook (via Buffer API)
- Send to email subscribers (Resend API)
- Create social card images (Canva API / image pipeline)
- Schedule follow-up posts at staggered times

6:00 AM – Post-Publish Monitoring
- Track indexation via Search Console API
- Log initial impressions & clicks
- Add to content_performance tracking table
```

### 4.3 Weekly Automated SEO Page Generation (20–30 pages)

```typescript
// Runs every Sunday at 1am GMT
// Creates 20-30 new SEO pages weekly
// Zero human involvement

WEEKLY SEO PAGE GENERATION

Step 1: Opportunity Discovery
- Read Search Console data for:
  - Queries with impressions but no clicks
  - Queries where position > 20
- Discover:
  - Competitor keywords we do not rank for (SEMrush/Ahrefs)
  - New problem queries (AnswerThePublic API-style feed)
  - Council/city gaps in coverage
→ Generate ~50 page opportunities.

Step 2: Prioritisation Algorithm
- For each opportunity:
  - Compute: opportunityScore = searchVolume × intentScore × (1 / competitionScore)
  - Emphasise:
    - High-intent problem queries
    - Councils/cities not yet covered
  - Filter out:
    - Duplicates
    - Cannibalization risks (similar existing pages)
→ Select top 20–30 pages for this week.

Step 3: Automated Page Creation
- For each selected page:
  - Research:
    - Scrape top 10 competitors.
    - Extract data points, headings, content gaps.
  - Content Generation:
    - Generate 1200–1500 word article using template for its type (problem / council / city / tool explainer).
    - Apply correct jurisdiction rules.
    - Add local/council info where required (using council dataset).
    - Generate schema markup, internal links, external authority links.
  - Quality Checks:
    - Plagiarism, AI detection, SEO score, readability, legal accuracy.
  - Publish:
    - Create page record.
    - Update sitemap.
    - Submit via Search Console.
    - Add to internal linking system.

Step 4: Internal Linking Update
- Scan all existing pages for relevant anchor contexts.
- Auto-add contextual internal links to new pages.
- Update older pages to point at new content where relevant.

Step 5: Monitoring Setup
- Add new pages to rank tracking.
- Set alerts for indexation and performance.
```

### 4.4 Monthly Automated Content Refresh (50+ pages)

```typescript
// Runs first Monday of each month at 1am GMT
// Updates old content to keep it fresh
// Zero human involvement

MONTHLY CONTENT REFRESH AUTOMATION

Step 1: Content Audit
- Identify pages older than 6 months.
- Filter those with:
  - High traffic but declining trend
  - Important legal topics
- Select ~50 pages for refresh.

Step 2: Update Detection
- Scrape gov.uk for law/procedure changes.
- Check council websites for updated fees/rules.
- Monitor court & regulatory updates.

Step 3: Automated Updates
- For each flagged page:
  - Generate updated content sections (GPT-4)
  - Update old statistics, references, fees, timeframes
  - Refresh examples and scenarios
  - Update "Last Updated" date in UI
  - Add new FAQs from user queries & Search Console Qs
  - Improve underperforming sections based on performance metrics

Step 4: Re-optimisation
- Run SEO audit per page.
- Add/fix schema.
- Improve titles, meta descriptions, headings.
- Add missing internal links.

Step 5: Re-publish & Notify
- Save updated page.
- Resubmit URL via Search Console.
- Optionally generate "updated" social/email snippet.

Step 6: Performance Monitoring
- Track ranking & traffic changes post-update.
- Feed learnings into content generation prompts.
```

---

## 5. AUTOMATED BACKLINK ACQUISITION ENGINE

**Goal:** AI gets backlinks while you sleep – zero manual outreach.

### 5.1 Daily Automated Link Building (8am onward)

```typescript
// Runs every day at 8am GMT
// Finds opportunities and sends outreach emails
// Gets backlinks automatically

DAILY LINK BUILDING AUTOMATION

8:00 AM – Opportunity Discovery

Strategy 1: Broken Link Detection
- Fetch competitor backlink profiles (Ahrefs API).
- Identify 404/broken links pointing to them.
- Find suitable replacement pages on Landlord Heaven.
- Score opportunity by domain rating × relevance.

Strategy 2: Unlinked Mentions
- Monitor mentions of landlord-related terms using Brand24 API.
- Detect mentions without links.
- Extract author/site contact info.

Strategy 3: HARO Auto-Response
- Monitor HARO / journalist queries for landlord/property law topics.
- Auto-generate expert response (300–500 words).
- Auto-submit with a link suggestion.

Strategy 4: Resource Page Finder
- Search for "landlord resources" + city/region.
- Identify landlord resource pages and missing links to us.

Strategy 5: Government Links
- Monitor council sites & .gov.uk resource pages & their updates.
- Look for outdated/broken resources we can replace.

→ Collect 20–30 opportunities per day.

8:30 AM – Contact Extraction
- Use Hunter.io to get emails.
- Validate with NeverBounce.
- Scrape LinkedIn / site for names.
- Collect personalization data (recent posts, page context).

9:00 AM – Email Generation
- For each contact, AI generates personalised email using GPT-4:
  - References specific broken link / article / resource.
  - Proposes our page as better replacement / addition.
  - Friendly, non-spammy tone.
  - Add tracking pixel & unique tracking parameters.

9:30 AM – Automated Sending
- Use Mailgun API to send, staggering times.
- Log each email in outreach_emails.

Day 3 – Auto Follow-Up #1
- If email opened but no reply: send short friendly follow-up.

Day 7 – Auto Follow-Up #2
- Final nudge if no response.

Day 8+ – Auto-Archive
- Mark as "no response" and optionally schedule re-try in 3 months.

Response Handling
- AI analyses reply sentiment:
  - Positive → send thank you, update backlinks_acquired.
  - Question → AI draft answer; flag if needed.
  - Negative → polite closure.

Expected Results
- 20–30 outreach emails/day
- 600–900 emails/month
- 3–5% success rate → 18–45 new backlinks/month
```

### 5.2 Weekly Strategic Link Campaigns

```typescript
// Runs every Wednesday at 9am GMT
// Larger link building initiatives

Week 1: Council Outreach Campaign
- Target: 20 councils.
- Offer: free HMO licensing guides tailored to their area.
- Ask: inclusion on resource pages.

Week 2: Guest Post Pitch Campaign
- Target: 15 property/landlord blogs.
- AI generates personalised pitches with 2–3 topical ideas.

Week 3: Directory Submission Campaign
- Identify new landlord/property/resource directories.
- Auto-fill forms via Zapier+AI.

Week 4: Journalist Outreach Campaign
- Track reporters writing about landlord issues.
- Offer expert commentary and unique data from wizard usage.

All follow-ups & tracking: automated.
```

### 5.3 Monthly Link Profile Audit

```typescript
// First Tuesday of month at 10am GMT

Steps:
1. Fetch all backlinks via Ahrefs.
2. Identify new, lost, and potentially toxic links.
3. Compare with competitor link profiles.
4. Auto-generate disavow file (for obviously spammy links).
5. Submit disavow to Google Search Console.
6. Attempt reclamation of lost valuable links.
7. Generate link growth report.
```

---

## 6. AUTOMATED OPTIMIZATION ENGINE

**Goal:** AI continuously improves site performance.

### 6.1 Daily Optimization Automation (11pm–12am)

```typescript
// Runs daily at 11pm GMT
// Analyzes performance and makes improvements

11:00 PM – Performance Analysis
- Fetch 7-day data from Search Console & GA4.
- Identify:
  - Pages with high impressions but CTR < 2%.
  - Pages with declining traffic.
  - Pages with avg position > 20.
  - Pages with high bounce rate.
→ Flag ~10 pages per night.

11:15 PM – Diagnosis Phase
- For each flagged page:
  - Compare content with top competitors.
  - Analyse user behavior (Hotjar API events, scroll depth, time on page).
  - Check technical SEO:
    - Page speed (PageSpeed Insights).
    - Mobile usability.
    - Schema coverage.

11:30 PM – Automated Improvements
If Low CTR:
  - Generate 5 new titles + 5 meta descriptions.
  - Run small A/B test or implement best candidate.

If Low Rankings:
  - Add 300–500 words of more comprehensive content.
  - Integrate additional keyword variants.
  - Improve schema & internal links.

If High Bounce Rate:
  - Improve intro & structure (better hook, TOC, subheadings).
  - Add visual elements or short examples.
  - Improve load time (compress images, lazy load non-critical assets).

If Outdated Content:
  - Update examples, statistics, legal references, fees.

11:45 PM – Implementation
- Apply changes.
- Update page_performance and optimization_tasks logs.
- Resubmit updated URLs to Search Console.

12:00 AM – A/B Testing
- Continuously test:
  - Titles
  - Meta descriptions
  - CTA wording
  - Page layout variants
- Auto-adopt winners after a minimum of statistically significant impressions.
```

### 6.2 Weekly Technical SEO Audit (Saturday 3am)

```typescript
// Every Saturday at 3am GMT

Steps:
1. Crawl whole site via Screaming Frog API.
2. Detect:
   - Broken internal/external links.
   - Missing or duplicate meta tags.
   - Missing H1s.
   - Slow pages.
   - Schema gaps.
3. Auto-fix easy issues:
   - Add missing metas (GPT-4).
   - Fix broken internal links.
   - Add alt text to images.
   - Compress large images.
   - Add missing schema where possible.
4. Flag complex issues for manual review:
   - Major speed issues.
   - Duplicate content requiring merging.
5. Log and re-check to confirm fixes.
```

---

## 7. AUTOMATED INTELLIGENCE ENGINE

**Goal:** AI monitors everything, learns, and adapts.

### 7.1 Continuous Intelligence System

**Competitor Monitoring (Hourly)**

- Track competitor rankings (SEMrush/Ahrefs).
- Log new content and major changes.
- Identify their best pages and backlinks.
- Suggest counter-content & link-building strategies.

**Trend Detection (Every 6 hours)**

- Monitor search trend data.
- Identify emerging topics (e.g., law changes, high-profile cases).
- Feed new topics into content_queue.

**User Behavior Analysis (Daily)**

- Analyse GA4 events:
  - On-site search terms.
  - Conversion paths.
  - Drop-off points.
- Identify content gaps and page friction points.

**Performance Learning (Weekly)**

- Detect pattern of top-performing pages:
  - Content length, structure, media usage, FAQ patterns.
- Refine prompts & templates based on these insights.

**Market Intelligence (Monthly)**

- Track landlord law & policy changes (gov.uk, law firms, commentary).
- Update internal legal knowledge for Agent 6 & content prompts.

**Predictive Analytics (Quarterly)**

- Forecast:
  - Traffic
  - Revenues
  - Link growth
- Suggest scaling strategies (e.g. "build out 150 more council pages in Scotland").

---

## 8. AUTOMATED REPORTING ENGINE

**Goal:** Weekly AI-generated SEO & revenue reports.

### 8.1 Weekly Reports (Every Monday 8am GMT)

```typescript
// Every Monday at 8am GMT
// Delivered via email (Resend)

Subject: Landlord Heaven SEO Report – Week {X}

Sections (AI-generated):
1. Executive Summary
2. Content Performance
3. Link Building Summary
4. Technical Health
5. Rankings Overview
6. Competitor Intelligence
7. AI Recommendations
8. Forecast & Action Items

Include:
- Top 5 pages by traffic & growth
- Largest ranking winners/losers
- Backlinks gained/lost
- SEO health score
- Real charts & tables where possible
```

---

## 9. IMPLEMENTATION BLUEPRINT – 4 WEEK PLAN

### WEEK 1 – BUILD AUTOMATION INFRASTRUCTURE

**Day 1–2: Content Generation System**

Components:
- **Trend Scanner**
  - Integrate:
    - Google Trends API
    - NewsAPI (UK landlord/property)
    - Reddit API (key subs)
    - gov.uk RSS feeds
- **Topic Generation Engine**
  - GPT-4/Claude to generate & score topics.
  - Store in content_queue.
- **Content Pipeline**
  - Research scraper (Puppeteer or similar).
  - GPT-4 for content.
  - Claude Sonnet for legal validation.
  - DALL·E for images.
  - Schema generator.
- **Quality Assurance System**
  - Copyscape, GPTZero (optional), Surfer SEO/own SEO scoring.
- **Publishing System**
  - Auto-publish to DB.
  - Auto-update sitemaps.
  - Search Console/bing pings.
- **Cron Jobs**
  - 2am: content generation
  - 5am: publication
  - 6am: distribution

**Test:** Generate and auto-publish 1 blog post.

**Day 3–4: Link Building Automation**

Components:
- **Opportunity Engines**
  - Ahrefs API
  - Brand24
  - HARO email parser
  - Resource page finder (Google search)
  - Council website monitor
- **Contact Extraction**
  - Hunter.io
  - NeverBounce
  - LinkedIn scraping (if used)
- **Email Generation**
  - GPT-4 templates + personalization.
- **Outreach Automation**
  - Mailgun sending
  - Tracking & CRM (Airtable/DB).
- **Follow-Up System**
  - Auto follow-ups at Day 3 & Day 7.
  - AI-based response handling.
- **Cron Jobs**
  - 8am: discovery
  - 9am: outreach
  - 10am: follow-ups

**Test:** Send 5 automated outreach emails.

**Day 5–6: Optimization Engine**

Components:
- **Performance Monitoring**
  - Search Console
  - GA4
  - Ahrefs/SEMrush (rank tracking)
  - PageSpeed Insights
  - Hotjar
- **Issue Detection**
  - Low CTR
  - Ranking drops
  - Traffic decline
  - High bounce
  - Content age
- **Automated Fix Engine**
  - Title/meta generator
  - Content enhancer
  - Schema adder
  - Internal linking booster
- **A/B Testing**
  - Google Optimize or custom system.
- **Weekly Technical Audit**
  - Screaming Frog API.
- **Cron Jobs**
  - 11pm: performance analysis & fixes
  - Saturday 3am: audit

**Test:** Detect and fix 1 low-CTR page automatically.

**Day 7: Intelligence & Reporting**

Components:
- **Competitor Intelligence Engine**
- **Learning System & Predictive Analytics**
- **Automated Reporting**
  - Weekly email via Resend
  - Dashboard updates
- **Cron Jobs**
  - Hourly competitor updates
  - Daily intelligence
  - Monday 8am weekly report

**Test:** Generate first automated weekly SEO report.

### WEEK 2–4 – SCALE PRODUCTION

**Week 2:**
- Let automation run.
- Aim: 50 SEO pages created + 7 blog posts.
- 600 outreach emails.
- 70 pages optimized (daily optimization).

**Week 3:**
- Scale: 100 more pages.
- 900 outreach emails.
- 140 pages optimized.
- Backlinks begin compounding.

**Week 4:**
- Reach 200+ pages total (mix of blog + SEO).
- 1,200 outreach emails.
- 210 pages optimized.
- Automation stable.

---

## 10. DATA MODEL – TABLES TO CREATE

At minimum:

```sql
-- Content management
CREATE TABLE content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  priority INTEGER,
  search_volume INTEGER,
  competition_score DECIMAL,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  template_type TEXT,
  jurisdiction TEXT,
  json_ld JSONB,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES generated_content(id),
  scheduled_for TIMESTAMP NOT NULL,
  distribution_channels JSONB,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES generated_content(id),
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL,
  avg_position DECIMAL,
  bounce_rate DECIMAL,
  time_on_page INTEGER,
  conversions INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Page optimization
CREATE TABLE page_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL,
  avg_position DECIMAL,
  bounce_rate DECIMAL,
  page_speed_score INTEGER,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE optimization_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT,
  ai_solution TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Link building
CREATE TABLE link_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_type TEXT NOT NULL,
  target_url TEXT NOT NULL,
  domain_rating INTEGER,
  relevance_score DECIMAL,
  contact_info JSONB,
  status TEXT DEFAULT 'discovered',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE outreach_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  domain TEXT NOT NULL,
  personalization_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE outreach_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES outreach_contacts(id),
  opportunity_id UUID REFERENCES link_opportunities(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  replied_at TIMESTAMP,
  reply_sentiment TEXT,
  follow_up_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE backlinks_acquired (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  domain_rating INTEGER,
  anchor_text TEXT,
  acquired_via TEXT,
  acquired_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- A/B testing
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  variant_a JSONB NOT NULL,
  variant_b JSONB NOT NULL,
  metric TEXT NOT NULL,
  impressions_a INTEGER DEFAULT 0,
  impressions_b INTEGER DEFAULT 0,
  conversions_a INTEGER DEFAULT 0,
  conversions_b INTEGER DEFAULT 0,
  winner TEXT,
  status TEXT DEFAULT 'running',
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Intelligence
CREATE TABLE competitor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_domain TEXT NOT NULL,
  ranking_keywords INTEGER,
  backlinks INTEGER,
  domain_rating INTEGER,
  new_content JSONB,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE performance_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reports_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE strategy_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_type TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER,
  estimated_impact JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 11. CRON JOB SUMMARY

**Daily:**
- `2am:` Content generation
- `5am:` Publication
- `6am:` Distribution
- `8am:` Link opportunity discovery
- `9am:` Outreach sending
- `11pm:` Performance analysis & optimization

**Weekly:**
- `Sunday 1am:` New SEO page generation
- `Saturday 3am:` Technical SEO audit
- `Wednesday 9am:` Strategic link campaigns

**Monthly:**
- `First Monday 1am:` Content refresh
- `First Tuesday 10am:` Link profile audit

**Weekly Reporting:**
- `Monday 8am:` Automated SEO report

---

## 12. CRITICAL SUCCESS FACTORS

To keep this machine profitable & safe:

1. **Prompt quality:** refine prompts constantly.
2. **Monitoring:** check logs & dashboards daily.
3. **Validation:** always use Claude Sonnet for legal checks.
4. **Testing:** verify each automation before scaling.
5. **Fallbacks:** alerting for failures.
6. **Human oversight:** randomly review ~10% of generated content.
7. **Continuous improvement:** use data to refine everything.

---

## 13. END STATE

After 4 weeks:

✅ Daily blog posts, fully automated

✅ 20–30 SEO pages per week, fully automated

✅ 20–30 outreach emails/day, fully automated

✅ 10 pages optimized daily, fully automated

✅ Technical SEO maintained automatically

✅ Links acquired automatically

✅ Weekly reports generated automatically

✅ System learns and improves automatically

**Your job:**

- Monitor dashboard 30 minutes/day
- Read Monday reports
- Make strategic decisions
- Count money 💰

**Build once, run forever. This is the Landlord Heaven SEO Money Machine.**

---

**END OF SEO AUTOMATION SPECIFICATION**
