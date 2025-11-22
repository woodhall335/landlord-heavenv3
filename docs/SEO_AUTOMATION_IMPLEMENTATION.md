# 🤖 SEO Automation - Phase 2 Implementation Guide

## ✅ What's Been Built

### Database Schema
**File:** `supabase/migrations/003_seo_automation_schema.sql`

**6 New Tables:**
1. `seo_pages` - SEO landing pages (location, topic, service, guide)
2. `seo_keywords` - Keyword research and tracking
3. `seo_content_queue` - Automated content generation queue
4. `seo_backlinks` - Backlink opportunities and tracking
5. `seo_performance` - Daily performance metrics
6. `seo_automation_log` - Automation task logs

### Content Generation Engine
**File:** `src/lib/seo/content-generator.ts`

**Features:**
- AI-powered content generation (GPT-4o-mini & Claude Sonnet)
- SEO-optimized titles, meta descriptions, H1s
- 4 content types: location, topic, service, guide
- Multi-jurisdiction support (England & Wales, Scotland, Northern Ireland)
- Automatic slug generation
- Readability scoring (Flesch Reading Ease)
- Quality assessment (0-100 score)
- Schema.org structured data generation
- Secondary keyword extraction

### API Routes

**POST /api/seo/generate** - Generate new SEO content
```typescript
{
  "contentType": "location",
  "targetKeyword": "section 21 notice london",
  "location": "London",
  "jurisdiction": "england-wales",
  "wordCount": 1500,
  "model": "gpt-4o-mini",
  "publishImmediately": false
}
```

**GET /api/seo/pages** - List all SEO pages
- Filter by status, content_type, jurisdiction
- Pagination support

**POST /api/seo/queue** - Add content to generation queue
```typescript
{
  "contentType": "location_page",
  "targetKeyword": "evict tenant manchester",
  "location": "Manchester",
  "priority": 8,
  "scheduledFor": "2024-11-23T02:00:00Z"
}
```

**GET /api/seo/queue** - View queued items
- Filter by status (pending, processing, completed, failed)

**POST /api/seo/cron/daily** - Daily automation cron job
- Runs at 2am daily (configured in vercel.json)
- Processes up to 10 queued items per day
- Auto-publishes if quality score >= 70

### Cron Configuration
**File:** `vercel.json` (updated)

```json
{
  "crons": [
    {
      "path": "/api/seo/cron/daily",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Schedule:** Daily at 2:00 AM UTC

---

## 🚀 Getting Started

### 1. Run Database Migration

```bash
# Apply SEO schema to Supabase
psql $DATABASE_URL < supabase/migrations/003_seo_automation_schema.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `003_seo_automation_schema.sql`
3. Run query

### 2. Set Environment Variables

Add to your `.env` or Vercel environment:

```bash
# AI APIs (already configured)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Cron security (generate random string)
CRON_SECRET=your-random-secret-here

# Admin users (already configured)
ADMIN_USER_IDS=user-id-1,user-id-2
```

### 3. Deploy to Vercel

```bash
git add -A
git commit -m "Add Phase 2 SEO Automation"
git push

# Vercel will automatically deploy and set up the cron job
```

### 4. Verify Cron Job Setup

1. Go to Vercel Dashboard → Project → Settings → Crons
2. You should see: `POST /api/seo/cron/daily` scheduled for `0 2 * * *`
3. Test manually: Click "Run Now" or call the endpoint with the CRON_SECRET header

---

## 📖 Usage Guide

### Manual Content Generation

**Via Admin Dashboard (Recommended):**
```typescript
// Future: Admin UI at /dashboard/admin/seo

// For now, use API directly:
fetch('/api/seo/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contentType: 'location',
    targetKeyword: 'section 21 notice manchester',
    location: 'Manchester',
    jurisdiction: 'england-wales',
    wordCount: 1500,
    publishImmediately: false,
  })
})
```

**Response:**
```json
{
  "success": true,
  "page": {
    "id": "...",
    "slug": "section-21-notice-manchester",
    "title": "Section 21 Notice Manchester: Complete Guide 2024",
    "status": "draft",
    ...
  },
  "metrics": {
    "wordCount": 1523,
    "readabilityScore": 65,
    "qualityScore": 88,
    "secondaryKeywords": 5
  }
}
```

### Batch Content Generation (Queue)

**Queue multiple pages for automated generation:**

```typescript
// Queue 20 location-based pages
const locations = ['London', 'Manchester', 'Birmingham', 'Leeds', ...];

for (const location of locations) {
  await fetch('/api/seo/queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentType: 'location_page',
      targetKeyword: `section 21 notice ${location.toLowerCase()}`,
      location,
      priority: 8,
    })
  });
}

// Cron will process them automatically at 2am daily (10 per day)
```

### View Generated Pages

```typescript
// Get all published pages
const response = await fetch('/api/seo/pages?status=published&limit=50');
const { pages, total } = await response.json();

// Get draft pages
const drafts = await fetch('/api/seo/pages?status=draft');

// Filter by jurisdiction
const scotland = await fetch('/api/seo/pages?jurisdiction=scotland');
```

---

## 📊 Content Strategy

### Phase 1: Location Pages (Weeks 1-2)

**Target:** 100 location-based pages

**Template:** `[Service] [Location]`

**Examples:**
- section-21-notice-london
- evict-tenant-manchester
- hmo-license-birmingham
- section-8-notice-leeds

**Implementation:**
```typescript
const topServices = [
  'section 21 notice',
  'section 8 notice',
  'evict tenant',
  'AST tenancy agreement',
  'HMO license'
];

const topCities = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow',
  'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh',
  // ... 40 more cities
];

// Queue 5 services × 50 cities = 250 pages
// Cron generates 10/day = 25 days to complete
```

### Phase 2: Topic Pages (Weeks 3-4)

**Target:** 50 topic/guide pages

**Template:** How-to guides, complete guides, process guides

**Examples:**
- how-to-evict-tenant-uk
- complete-section-21-guide
- landlord-rights-guide
- tenant-deposit-protection-guide

### Phase 3: Service Pages (Weeks 5-6)

**Target:** 30 service landing pages

**Examples:**
- eviction-notice-service
- tenancy-agreement-generator
- hmo-license-check
- rent-arrears-letter-service

---

## 🎯 Quality Control

### Quality Score Breakdown

**85-100: Excellent** ✅
- Auto-publish immediately
- Perfect title length (30-60 chars)
- Perfect meta (150-160 chars)
- Keyword in title
- Good readability (40-70)
- Target word count met

**70-84: Good** ⚠️
- Auto-publish (but review recommended)
- Minor SEO issues

**Below 70: Needs Review** ❌
- Save as draft
- Manual review required
- May need regeneration

### Manual Quality Review

1. Check content accuracy (legal information must be correct)
2. Verify jurisdiction-specific details
3. Check for AI hallucinations or outdated laws
4. Ensure clear CTAs to our services
5. Review internal linking opportunities
6. Verify schema markup

---

## 🔄 Content Refresh Strategy

**Monthly Refresh:** Update existing pages with latest info

```typescript
// Queue top 50 pages for refresh
const topPages = await fetch('/api/seo/pages?status=published&limit=50');

for (const page of topPages.pages) {
  await fetch('/api/seo/queue', {
    method: 'POST',
    body: JSON.stringify({
      contentType: 'refresh',
      targetKeyword: page.target_keyword,
      location: page.location,
      pageId: page.id,
      priority: 5,
    })
  });
}
```

---

## 📈 Performance Tracking

### View Automation Logs

```typescript
const logs = await supabase
  .from('seo_automation_log')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);

// Check daily cron execution
const cronLogs = await supabase
  .from('seo_automation_log')
  .select('*')
  .eq('task_type', 'content_generation')
  .eq('triggered_by', 'cron');
```

### Monitor Queue

```typescript
// Check pending items
const { data: pending } = await supabase
  .from('seo_content_queue')
  .select('*')
  .eq('status', 'pending');

// Check failed items
const { data: failed } = await supabase
  .from('seo_content_queue')
  .select('*')
  .eq('status', 'failed');

// Retry failed items
for (const item of failed) {
  await supabase
    .from('seo_content_queue')
    .update({ status: 'pending' })
    .eq('id', item.id);
}
```

---

## 🔒 Security

**Admin-Only Access:**
- All SEO management routes require admin authentication
- RLS policies enforce admin-only access to SEO tables
- Cron endpoint secured with CRON_SECRET

**Public Access:**
- SEO pages with status='published' are publicly readable (for rendering)
- Draft pages are admin-only

---

## 💰 Cost Estimates

### AI Content Generation Costs

**GPT-4o-mini (default):**
- ~$0.10 per 1,500-word article
- 10 articles/day = $1/day = $30/month
- 250 articles/month = $25/month

**Claude Sonnet (optional):**
- ~$0.50 per 1,500-word article
- More expensive but higher quality
- Use for important/complex pages

**Recommended Strategy:**
- GPT-4o-mini for location pages (bulk generation)
- Claude Sonnet for topic/guide pages (higher quality needed)

---

## 🚀 Expansion Opportunities

### Future Enhancements

1. **Backlink Automation** (seo_backlinks table ready)
   - Automated outreach
   - Link monitoring
   - Competitor analysis

2. **Performance Tracking** (seo_performance table ready)
   - Google Search Console integration
   - Rank tracking
   - Traffic attribution

3. **Keyword Research Automation** (seo_keywords table ready)
   - Auto-discover high-value keywords
   - Competition analysis
   - Search volume tracking

4. **Admin Dashboard**
   - UI for content management
   - Analytics & reporting
   - Bulk operations

5. **A/B Testing**
   - Test different titles/meta descriptions
   - Track conversion rates
   - Optimize CTAs

---

## 📚 Next Steps

### Immediate Actions:

1. ✅ Run database migration
2. ✅ Deploy to Vercel (cron will auto-configure)
3. ✅ Add CRON_SECRET to environment variables
4. ✅ Test manual generation with 1-2 test pages
5. ✅ Queue 10-20 pages for automated generation
6. ✅ Monitor first cron execution (check logs next day)

### Week 1:

- Queue 50 location-based pages
- Review generated content quality
- Publish high-quality pages (85+ score)
- Refine prompts if needed

### Month 1:

- Scale to 250+ location pages
- Add topic/guide pages
- Monitor search performance
- Iterate and improve

---

## ✅ System Status

**✅ Database Schema:** Complete (6 tables)
**✅ Content Generator:** Complete (AI-powered, multi-model)
**✅ API Routes:** Complete (4 endpoints)
**✅ Cron Automation:** Complete (daily execution)
**⚠️ Admin Dashboard UI:** Not built (use APIs directly)
**⚠️ Backlink Automation:** Infrastructure ready (not implemented)
**⚠️ Performance Tracking:** Infrastructure ready (not implemented)

---

## 🆘 Troubleshooting

### Cron Not Running

**Check Vercel Dashboard:**
1. Settings → Crons
2. View execution logs
3. Manually trigger: "Run Now"

**Common Issues:**
- CRON_SECRET not set
- Vercel cron plan not enabled (requires Pro plan)
- Timezone confusion (cron runs in UTC)

### Content Quality Low

**Solutions:**
- Increase word count target
- Switch to Claude Sonnet for better quality
- Refine prompts in content-generator.ts
- Add more context about jurisdiction/location

### Queue Not Processing

**Debug:**
```sql
-- Check pending items
SELECT * FROM seo_content_queue WHERE status = 'pending';

-- Check failed items
SELECT * FROM seo_content_queue WHERE status = 'failed';

-- Check automation logs
SELECT * FROM seo_automation_log
ORDER BY created_at DESC
LIMIT 10;
```

---

**Built with ❤️ for Landlord Heaven Phase 2**

*This SEO automation system can generate 250+ high-quality legal content pages per month, fully automated, for ~$25/month in AI costs.*
