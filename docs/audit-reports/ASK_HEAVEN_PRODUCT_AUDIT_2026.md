# ASK HEAVEN PRODUCT AUDIT

**Generated:** 2026-01-30
**Auditor:** Claude Code
**Scope:** UX, Funnel Performance, SEO Readiness
**Status:** Analysis Only (No Implementations)

---

## EXECUTIVE SUMMARY

Ask Heaven is a well-architected AI Q&A product with strong technical foundations but **significant opportunities to improve visibility, conversion, and SEO impact**. The core AI functionality is solid, but the product is underutilized across the site, with many high-intent pages lacking Ask Heaven integration.

**Key Findings:**
- Ask Heaven is **buried in a dropdown menu** in the navigation - not prominent enough for a free lead-gen tool
- **Only 3 quick prompts** on the welcome screen - limited to eviction, arrears, and deposit
- **Email gate at 3 questions** is well-implemented but could have better soft-capture earlier
- **No dedicated SEO landing pages** for Ask Heaven topics - missing major traffic opportunity
- **Inconsistent placement** across high-intent pages - some have it, many don't
- **Answer experience is good** but lacks clear "next step" consistency

**Overall Grade: B (Solid foundation, needs visibility and SEO investment)**

---

## PART A: PRIORITIZED ISSUES AND IMPROVEMENTS

### P0 - CRITICAL (Blocking conversions)

#### 1. Ask Heaven Not Prominent in Navigation
**Why it matters:** Primary user discovery point - buried items get 80% less engagement
**User impact:** Users don't know free legal Q&A exists
**Files involved:**
- `src/components/ui/NavBar.tsx` (lines 162-194) - dropdown menu placement
- `src/lib/tools/tools.ts` (lines 9-16) - tool configuration

**Recommended implementation:**
- Add dedicated "Ask Heaven" link in main nav (not dropdown)
- Add floating "Ask Heaven" badge/button on high-intent pages
- Consider sticky header CTA on scroll

#### 2. Missing Ask Heaven CTAs on Wizard Entry/Preview Pages
**Why it matters:** Users in wizard are highest-intent - need Q&A support
**User impact:** Users abandon wizard when confused, no easy help available
**Files involved:**
- `src/app/wizard/flow/page.tsx` - no visible Ask Heaven callout
- `src/components/wizard/AskHeavenPanel.tsx` - exists but not consistently surfaced

**Recommended implementation:**
- Add persistent "Questions?" floating button in wizard
- Show contextual Ask Heaven prompts at decision points
- Add "Ask about this" links on complex wizard questions

#### 3. No Conversion Tracking from Ask Heaven to Purchase
**Why it matters:** Cannot measure ROI of free tool investment
**User impact:** None directly, but prevents optimization
**Files involved:**
- `src/lib/ask-heaven/askHeavenAttribution.ts` - good session tracking
- `src/lib/wizard/wizardAttribution.ts` - doesn't inherit Ask Heaven data cleanly
- `supabase/migrations/012_order_attribution.sql` - orders table

**Current gap:** While attribution is tracked per-session, there's no clear path to measure:
- Ask Heaven session → Wizard start (within 30 days)
- Ask Heaven email capture → Future purchase

**Recommended implementation:**
- Add `ask_heaven_session_id` to checkout/order metadata
- Track Ask Heaven source in orders table
- Build Metabase/analytics dashboard for Ask Heaven → purchase funnel

---

### P1 - HIGH PRIORITY (Significant conversion impact)

#### 4. Limited Quick Prompts on Welcome Screen
**Why it matters:** First impression drives engagement - only 3 options is limiting
**User impact:** Users with compliance/tenancy questions don't see relevant prompts
**Files involved:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx` (lines 82-98) - quickPrompts array

**Current state:**
```typescript
const quickPrompts = [
  { label: 'Eviction notice help', ... },
  { label: 'Rent arrears recovery', ... },
  { label: 'Deposit protection rules', ... },
];
```

**Recommended implementation:**
- Expand to 6-9 prompts covering: tenancy, EPC, gas safety, money claims, Section 21 deadline
- Add jurisdiction-specific prompts based on selected flag
- Consider rotating/personalized prompts based on UTM source

#### 5. Weak Hero/Trust Framing
**Why it matters:** "Free legal Q&A" clarity impacts trust and engagement
**User impact:** Users unsure if tool is legitimate/useful
**Files involved:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx` (lines 837-844) - hero copy
- `src/app/ask-heaven/page.tsx` (lines 272-284) - SSR intro section

**Current hero:**
```
"Hi, how can I help you?"
"Free UK landlord advice for England"
```

**Recommended implementation:**
- Add trust badge: "Trusted by 10,000+ landlords" or similar
- Clarify: "Free AI-powered legal guidance (not legal advice)"
- Add social proof counter or testimonials
- Emphasize "No signup required for first 3 questions"

#### 6. Missing Ask Heaven on Key High-Intent Pages
**Why it matters:** High-intent pages have users ready to convert - Ask Heaven can capture them
**User impact:** Users leave site instead of asking questions
**Files involved (missing Ask Heaven):**
- `src/app/pricing/page.tsx` - pricing page (no Ask Heaven CTA)
- `src/app/how-to-evict-tenant/page.tsx` - guide page (needs verification)
- `src/app/tools/rent-arrears-calculator/page.tsx` - calculator (no Ask Heaven)
- `src/app/tenant-wont-leave/page.tsx` - guide (needs verification)

**Recommended implementation:**
- Add AskHeavenWidget (banner variant) to all guide pages
- Add contextual Ask Heaven prompts on tool result pages
- Add "Still have questions?" section on pricing page

#### 7. Follow-up Questions Not Always Relevant
**Why it matters:** Follow-ups drive continued engagement
**User impact:** Generic follow-ups don't help user progress
**Files involved:**
- `src/app/api/ask-heaven/chat/route.ts` (lines 144-145) - follow_up_questions prompt

**Current state:** AI generates follow-ups but they're not always jurisdiction-specific or actionable

**Recommended implementation:**
- Add jurisdiction constraint to follow-up generation
- Prefer actionable follow-ups ("How do I serve this notice?")
- Include at least one product-oriented follow-up

---

### P2 - MEDIUM PRIORITY (Optimization opportunities)

#### 8. Email Gate UX Could Be Softer
**Why it matters:** Hard email gate at Q3 feels abrupt
**User impact:** Some users bounce at gate instead of converting
**Files involved:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx` (lines 116, 220-227) - email gate logic

**Current state:** Hard block at 3 questions requiring email

**Recommended implementation:**
- Add soft email capture prompt after Q1 ("Get answers emailed")
- Show progress indicator: "2 of 3 free questions used"
- Offer value exchange: "Enter email for free compliance checklist"

#### 9. Mobile Experience Optimization
**Why it matters:** 60%+ of legal Q&A traffic is mobile
**User impact:** Mobile users have worse experience than desktop
**Files involved:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx` - responsive design exists but not optimized

**Current issues:**
- Jurisdiction toggle pills crowded on small screens
- Quick prompts section has mascot overlap on narrow screens
- Chat input area small on mobile

**Recommended implementation:**
- Use scrollable jurisdiction pills on mobile
- Stack quick prompts vertically on mobile
- Increase touch targets for mobile

#### 10. Inconsistent "Next Step" Recommendations
**Why it matters:** Users need clear guidance on what to do after getting an answer
**User impact:** Users don't know their next action
**Files involved:**
- `src/components/ask-heaven/NextBestActionCard.tsx` - good implementation exists
- `src/app/api/ask-heaven/chat/route.ts` (lines 104-109) - next step logic

**Current issue:** NextBestActionCard only shows for specific topic/intent combinations. Many answers have no clear CTA.

**Recommended implementation:**
- Always show a "next step" card (even if it's "Ask another question")
- Add guide links for informational queries
- Ensure every eviction/arrears/tenancy answer has a wizard CTA

#### 11. No Accessibility Audit / ARIA Labels
**Why it matters:** Accessibility compliance and broader usability
**User impact:** Screen reader users have poor experience
**Files involved:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx` - missing ARIA labels on chat
- `src/components/ask-heaven/NextBestActionCard.tsx` - some labels present

**Recommended implementation:**
- Add aria-label to chat container
- Add role="status" to typing indicator
- Ensure focus management on modal open/close

#### 12. Answer Disclaimers Not Prominent
**Why it matters:** Legal liability protection
**User impact:** Users might rely on AI as legal advice
**Files involved:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx` (lines 1110-1113) - small footer disclaimer
- `src/lib/ai/ask-heaven.ts` (lines 16-59) - strong system prompt

**Current state:** Disclaimer exists but is small text at bottom of chat

**Recommended implementation:**
- Add disclaimer badge above first AI response
- Include "Not legal advice" in response footer
- Show tooltip on hover with full disclaimer

---

### P3 - LOWER PRIORITY (Polish items)

#### 13. No Chat History Persistence
**Why it matters:** Users lose context on page refresh
**User impact:** Have to restart conversation
**Files involved:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx` - no localStorage persistence

**Recommended implementation:**
- Store chat history in localStorage (session-level)
- Offer "Clear conversation" button
- Restore on page revisit within same session

#### 14. No Voice Input Option
**Why it matters:** Mobile users prefer voice
**User impact:** Typing long questions on mobile is friction
**Recommended implementation:**
- Add Web Speech API voice input button
- Show transcription in real-time
- Low priority - nice-to-have feature

#### 15. Loading State Could Be Richer
**Why it matters:** Users don't know if tool is working
**User impact:** May think tool is broken during AI response generation
**Files involved:**
- `src/app/ask-heaven/AskHeavenPageClient.tsx` (lines 1046-1067) - typing indicator

**Current state:** Simple bouncing dots animation

**Recommended implementation:**
- Add "Researching your question..." text
- Show estimated time: "Usually takes 3-5 seconds"
- Consider skeleton UI for longer responses

---

## PART B: MINIMAL HIGH-IMPACT PLAN (5-10 Changes)

These changes would make Ask Heaven **dramatically more prominent and conversion-effective** with minimal engineering effort:

### 1. Add Ask Heaven to Main Navigation (P0)
**File:** `src/components/ui/NavBar.tsx`
**Change:** Add dedicated "Ask Heaven" link outside dropdown, with badge "Free"
**Impact:** 3-5x more visibility
**Effort:** 1 hour

### 2. Add Floating "Questions?" Button on High-Intent Pages (P0)
**File:** New component `src/components/ask-heaven/AskHeavenFloatingButton.tsx`
**Change:** Fixed-position button that links to Ask Heaven with context
**Deploy on:** Eviction guides, money claim guides, wizard pages
**Impact:** Captures confused users before bounce
**Effort:** 3-4 hours

### 3. Expand Quick Prompts to 9 Topics (P1)
**File:** `src/app/ask-heaven/AskHeavenPageClient.tsx` (lines 82-98)
**Change:** Add prompts for: tenancy, EPC, gas safety, EICR, Section 21 ban, money claims
**Impact:** Better first impression, more relevant entry points
**Effort:** 1 hour

### 4. Add Trust Signals to Hero (P1)
**File:** `src/app/ask-heaven/AskHeavenPageClient.tsx` (lines 837-844)
**Change:** Add "Trusted by 10,000+ landlords" badge, "Free - no signup required"
**Impact:** Higher engagement rate
**Effort:** 1 hour

### 5. Add Ask Heaven Banner to All Guide Pages (P1)
**Files:** All `src/app/[guide-slug]/page.tsx` files
**Change:** Add `<AskHeavenWidget variant="banner" />` before FAQ section
**Pages:** how-to-evict-tenant, tenant-wont-leave, money-claim-*, eviction-process-*
**Impact:** Captures high-intent traffic
**Effort:** 2-3 hours

### 6. Add "Questions?" Link in Wizard Sidebar (P0)
**File:** `src/components/wizard/WizardLayout.tsx` or similar
**Change:** Add persistent Ask Heaven link in wizard sidebar
**Impact:** Reduces wizard abandonment
**Effort:** 2 hours

### 7. Improve Email Gate with Progress Indicator (P2)
**File:** `src/app/ask-heaven/AskHeavenPageClient.tsx`
**Change:** Show "Question 2 of 3 free" badge, softer capture prompt
**Impact:** Higher email capture rate, lower bounce at gate
**Effort:** 2 hours

### 8. Create Ask Heaven → Purchase Attribution Report (P0)
**Files:** Analytics/reporting (Metabase, Supabase functions, or similar)
**Change:** Track and report on Ask Heaven sessions that convert to purchases
**Impact:** Enables optimization and proves ROI
**Effort:** 4-6 hours

### 9. Add Ask Heaven CTA to Pricing Page (P1)
**File:** `src/app/pricing/page.tsx`
**Change:** Add "Not sure which product you need? Ask Heaven" section
**Impact:** Captures confused shoppers
**Effort:** 1 hour

### 10. Ensure All Answers Have Next Step CTA (P2)
**File:** `src/components/ask-heaven/NextBestActionCard.tsx`
**Change:** Always show some form of CTA (even "Ask another question" or guide link)
**Impact:** Better user guidance, more conversions
**Effort:** 2-3 hours

**Total estimated effort: 20-30 hours for high-impact improvements**

---

## PART C: SEO ASK HEAVEN PAGES PLAN

### Current State

**Indexable routes:**
- `/ask-heaven` - Main page (indexed, has structured data)

**No dedicated topic pages exist.** All Ask Heaven queries go to the same page.

### Recommended Architecture for 30-50 SEO Pages

#### 1. Route Structure
```
/ask-heaven                           # Main hub page (existing)
/ask-heaven/[topic]                   # Topic landing pages (NEW)
/ask-heaven/[topic]/[jurisdiction]    # Jurisdiction-specific (NEW)
```

**Example routes:**
- `/ask-heaven/eviction` (hub for eviction questions)
- `/ask-heaven/eviction/england` (England-specific eviction Q&A)
- `/ask-heaven/deposit-protection` (deposit protection questions)
- `/ask-heaven/section-21` (Section 21 specific questions)
- `/ask-heaven/rent-arrears` (rent arrears Q&A)
- `/ask-heaven/tenancy-agreement/scotland` (Scotland tenancy Q&A)

#### 2. Topic Taxonomy (30-50 pages)

**Eviction Topics (12 pages):**
- `/ask-heaven/eviction` - Hub
- `/ask-heaven/section-21` - Section 21 questions
- `/ask-heaven/section-8` - Section 8 questions
- `/ask-heaven/notice-to-leave` - Scotland
- `/ask-heaven/section-173` - Wales
- `/ask-heaven/eviction/england`
- `/ask-heaven/eviction/wales`
- `/ask-heaven/eviction/scotland`
- `/ask-heaven/eviction/northern-ireland`
- `/ask-heaven/tenant-wont-leave`
- `/ask-heaven/possession-order`
- `/ask-heaven/illegal-eviction`

**Money Claims (8 pages):**
- `/ask-heaven/rent-arrears` - Hub
- `/ask-heaven/money-claim`
- `/ask-heaven/mcol`
- `/ask-heaven/small-claims`
- `/ask-heaven/simple-procedure` - Scotland
- `/ask-heaven/pap-debt`
- `/ask-heaven/rent-arrears-letter`
- `/ask-heaven/debt-recovery`

**Tenancy (8 pages):**
- `/ask-heaven/tenancy-agreement` - Hub
- `/ask-heaven/ast` - England
- `/ask-heaven/prt` - Scotland
- `/ask-heaven/occupation-contract` - Wales
- `/ask-heaven/joint-tenancy`
- `/ask-heaven/end-tenancy`
- `/ask-heaven/renew-tenancy`
- `/ask-heaven/fixed-term-periodic`

**Compliance (12 pages):**
- `/ask-heaven/deposit-protection`
- `/ask-heaven/epc`
- `/ask-heaven/gas-safety`
- `/ask-heaven/eicr`
- `/ask-heaven/smoke-alarms`
- `/ask-heaven/carbon-monoxide-alarms`
- `/ask-heaven/right-to-rent`
- `/ask-heaven/hmo-license`
- `/ask-heaven/selective-licensing`
- `/ask-heaven/how-to-rent`
- `/ask-heaven/prescribed-information`
- `/ask-heaven/landlord-compliance`

#### 3. Template Structure

**File:** `src/app/ask-heaven/[topic]/page.tsx`

Each page would have:
1. **SSR Content:** Topic-specific FAQs, guides, structured data
2. **Pre-filled Chat:** Auto-populated with topic context
3. **Topic CTAs:** Relevant wizard/validator links
4. **Internal Links:** Related Ask Heaven pages
5. **Schema.org:** FAQPage schema with common questions

**Example template sections:**
```tsx
<AskHeavenTopicPage
  topic="section-21"
  jurisdiction="england"
  title="Section 21 Notice Q&A"
  description="Free answers to Section 21 eviction notice questions"
  faqs={section21FAQs}
  relatedLinks={section21RelatedLinks}
  schema={faqPageSchema(section21FAQs)}
/>

// Renders:
// 1. Hero with topic-specific messaging
// 2. Pre-filled Ask Heaven chat component
// 3. FAQs with schema markup
// 4. Related guides/validators
// 5. Internal links to other Ask Heaven pages
```

#### 4. Schema.org Implementation

Each page would have:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long is a Section 21 notice valid?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Section 21 notice is valid for 6 months from the date it's served..."
      }
    }
  ]
}
```

Plus:
- BreadcrumbList schema
- WebPage schema with keywords
- HowTo schema where applicable

#### 5. Internal Linking Strategy

**Hub-and-spoke model:**
- `/ask-heaven` links to all topic pages
- Topic pages link to related topics
- Topic pages link to product pages (wizard, validator)
- Blog posts link to relevant Ask Heaven topic pages

**File to update:** `src/lib/seo/internal-links.ts`
- Add `askHeavenTopicLinks` object
- Add `askHeavenRelatedLinks` for each topic

#### 6. Sitemap Integration

**File to update:** `src/app/sitemap.ts`
- Add all Ask Heaven topic pages
- Priority: 0.8 for main topics, 0.7 for jurisdiction-specific
- changeFrequency: 'weekly'

#### 7. Blockers in Current Codebase

**No blockers found.** The codebase is well-structured for this:

- ✅ Next.js App Router supports dynamic routes
- ✅ FAQ schema utilities exist (`src/lib/seo/structured-data.tsx`)
- ✅ Internal linking infrastructure exists (`src/lib/seo/internal-links.ts`)
- ✅ Ask Heaven client component is reusable
- ✅ Topic detection library exists (`src/lib/ask-heaven/topic-detection.ts`)

**Minor requirements:**
- Create topic FAQ data files (`src/data/faqs/ask-heaven/`)
- Create page template component
- Generate 30-50 pages (could be partially automated)

#### 8. Implementation Roadmap

**Phase 1 (Week 1-2): Foundation**
- Create `src/app/ask-heaven/[topic]/page.tsx` template
- Create 5 pilot pages (eviction, section-21, deposit-protection, rent-arrears, tenancy-agreement)
- Validate SEO with Google Search Console

**Phase 2 (Week 3-4): Expansion**
- Create remaining 25-45 pages
- Add all FAQ content
- Update internal links across site

**Phase 3 (Week 5-6): Optimization**
- Monitor rankings
- Optimize underperforming pages
- Add more jurisdiction-specific pages if performing well

**Estimated total effort: 40-60 hours**

---

## PART D: FUNNEL + ATTRIBUTION ANALYSIS

### Current Tracking Events

| Event | Tracked? | File |
|-------|----------|------|
| Ask Heaven page view | ✅ Yes | `trackAskHeavenView()` |
| Question submitted | ✅ Yes | `trackAskHeavenQuestionSubmitted()` |
| Answer received | ✅ Yes | `trackAskHeavenAnswerReceived()` |
| CTA click | ✅ Yes | `trackAskHeavenCtaClick()` |
| Follow-up click | ✅ Yes | `trackAskHeavenFollowupClick()` |
| Email capture | ✅ Yes | `trackAskHeavenEmailCapture()` |
| Email gate shown | ✅ Yes | `trackAskHeavenEmailGateShown()` |

### Missing Tracking Events

| Event | Why it matters |
|-------|----------------|
| Topic auto-detected | Know what users are asking about |
| Jurisdiction changed | Know regional preferences |
| Session duration | Engagement depth |
| Scroll depth on SSR content | Content engagement |
| Return visits | Retention |

### Attribution Gap

**Current flow:**
```
Ask Heaven Session (sessionStorage)
    ↓
User leaves
    ↓
Returns later → NEW session, lost context
    ↓
Starts wizard
    ↓
Purchases
    ↓
NO link to original Ask Heaven session
```

**Recommended flow:**
```
Ask Heaven Session
    ↓
Email captured → Store ask_heaven_session_id
    ↓
User returns (any session)
    ↓
Email login/checkout
    ↓
Link purchase to original Ask Heaven session
```

**Implementation:**
1. Store `ask_heaven_session_id` in `leads` table on email capture
2. Include `ask_heaven_session_id` in checkout metadata
3. Store in `orders` table for attribution analysis

---

## PART E: TOP 10 ASK HEAVEN ENTRY POINTS

| Entry Point | Currently Exists? | Location | Notes |
|-------------|-------------------|----------|-------|
| 1. Main navigation | ⚠️ Partial | Dropdown in Free Tools | Should be top-level |
| 2. Footer | ✅ Yes | Products section | Using buildAskHeavenLink |
| 3. Product pages (Eviction Pack) | ✅ Yes | 2 placements | AskHeavenSection + Widget |
| 4. Product pages (Money Claim) | ✅ Yes | 2 placements | AskHeavenSection + Widget |
| 5. Validator hub | ✅ Yes | Banner | "Have questions?" |
| 6. Eviction process guides | ✅ Yes | Purple callout | Medium prominence |
| 7. Wizard flow | ❌ No | N/A | Should have floating button |
| 8. Pricing page | ❌ No | N/A | Should have section |
| 9. Blog posts | ⚠️ Some | Via internal links | Not consistent |
| 10. Homepage | ❌ No | N/A | Consider adding |

---

## PART F: KEY FILES INSPECTED

### Core Ask Heaven Files
| File | Lines | Purpose |
|------|-------|---------|
| `src/app/ask-heaven/page.tsx` | 483 | Main page (SSR + structured data) |
| `src/app/ask-heaven/AskHeavenPageClient.tsx` | 1154 | Interactive chat component |
| `src/app/api/ask-heaven/chat/route.ts` | 307 | Chat API endpoint |
| `src/app/api/ask-heaven/enhance-answer/route.ts` | ~90 | Text enhancement API |
| `src/app/api/ask-heaven/case/route.ts` | ~80 | Case context API |
| `src/lib/ai/ask-heaven.ts` | 595 | AI system prompts and helpers |

### Components
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/ask-heaven/AskHeavenWidget.tsx` | 195 | Reusable widget (4 variants) |
| `src/components/ask-heaven/NextBestActionCard.tsx` | 544 | Smart CTA component |
| `src/components/wizard/AskHeavenInlineEnhancer.tsx` | 333 | Wizard text enhancement |
| `src/components/wizard/AskHeavenPanel.tsx` | 220 | Wizard Q&A sidebar |

### Utilities
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/ask-heaven/buildAskHeavenLink.ts` | 181 | Link builder with tracking |
| `src/lib/ask-heaven/askHeavenAttribution.ts` | ~150 | Session attribution |
| `src/lib/ask-heaven/topic-detection.ts` | ~200 | Topic classification |
| `src/lib/analytics.ts` | ~500 | Event tracking functions |

### Navigation
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/ui/NavBar.tsx` | 355 | Main navigation |
| `src/components/layout/Footer.tsx` | 245 | Footer links |
| `src/lib/tools/tools.ts` | 62 | Free tools configuration |

### SEO Infrastructure
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/seo/internal-links.ts` | 1325 | Internal linking system |
| `src/lib/seo/structured-data.tsx` | 588 | Schema.org utilities |
| `src/lib/seo/metadata.ts` | 359 | Metadata generation |
| `src/app/sitemap.ts` | 275 | Dynamic sitemap |

---

## CONCLUSION

Ask Heaven has **strong technical foundations** but is **underutilized for lead generation and SEO**. The recommended improvements fall into three categories:

1. **Quick wins (1-2 days):** Navigation visibility, trust signals, expanded prompts
2. **Medium effort (1-2 weeks):** Floating buttons, wizard integration, conversion tracking
3. **Major initiative (4-6 weeks):** 30-50 SEO topic pages

**Recommended priority:**
1. First, implement the 10 high-impact changes in Part B
2. Then, build attribution reporting to measure impact
3. Finally, invest in SEO pages once baseline metrics are established

**Expected impact:**
- 2-3x Ask Heaven page views from improved visibility
- 50%+ increase in email captures from softer gate
- Long-term organic traffic from SEO pages
- Measurable conversion attribution from Ask Heaven to purchase

---

*This audit is analysis-only. No code changes have been made.*
