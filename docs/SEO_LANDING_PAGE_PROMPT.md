# SEO Landing Page Generation Prompt

> **Version:** 2.0
> **Last Updated:** January 2026
> **Purpose:** Generate high-quality, conversion-focused SEO landing pages for landlord eviction and rent recovery journeys.

---

You are Claude Code working in the Landlord Heaven codebase.

## Objective

Create high-quality, conversion-focused SEO landing pages for landlord eviction and rent recovery journeys across England, Scotland, and Wales.

**These are NOT blog posts.**

These are commercial, procedural SEO landing pages designed to convert landlords into:
- Notice-only products (entry point)
- Eviction packs (primary goal)
- Money claims (secondary goal — England only)

Each page must include structured data (Schema + FAQ blocks) to maximise SERP real estate (rich results, People Also Ask coverage).

---

## GLOBAL REQUIREMENTS (APPLY TO ALL PAGES)

### 1. Length & Content Quality

- Each landing page must be **at least 1,200 words**
- Content must be legally accurate, jurisdiction-specific, and written for UK landlords
- Tone: authoritative, reassuring, practical (not salesy, not academic)
- Use UK English spelling throughout

### 2. SEO Structure

Each page must include:
- One H1 targeting the primary keyword
- Multiple H2 sections
- Logical H3 subsections where appropriate
- Natural inclusion of secondary keywords
- Clear answers to:
  - What this notice/process is
  - When it applies
  - What commonly goes wrong
  - What happens if the tenant ignores it
  - What the landlord should do next

### 3. Conversion & Internal Linking (CRITICAL)

Every page MUST include:
- A contextual CTA to the relevant **Notice-only wizard** where applicable
- A contextual CTA to the **Eviction Pack** when court action is likely or required
- Rent arrears pages must link to the **Money Claim** product (England only)

**Internal linking rules:**
- Notice pages → Eviction process pages
- Eviction process pages → Eviction Pack CTA
- Rent arrears pages → Money Claim CTA (England) or explain local court process (Scotland/Wales)

### 4. Jurisdiction Discipline (MANDATORY)

- DO NOT mix England, Scotland, or Wales law on the same page
- DO NOT mention Section 21 or Section 8 on Scotland pages
- DO NOT mention Section 21 on Wales pages (use Section 173/178 only)
- State the jurisdiction clearly at the top of each page with a jurisdiction badge

### 5. What NOT to Do

- Do NOT target "free", "download", or "template" keywords on these pages
- Do NOT provide full DIY step-by-step instructions that eliminate the need for the product
- Do NOT include irrelevant legal history
- Do NOT hardcode prices — use the pricing config

---

## PRODUCT AVAILABILITY BY JURISDICTION (CRITICAL)

| Product | England | Wales | Scotland | Northern Ireland |
|---------|---------|-------|----------|------------------|
| Notice Only Pack (£49.99) | ✅ | ✅ | ✅ | ❌ |
| Complete Eviction Pack (£199.99) | ✅ | ✅ | ✅ | ❌ |
| Money Claim Pack (£99.99) | ✅ | ❌ | ❌ | ❌ |
| Tenancy Agreements | ✅ | ✅ | ✅ | ✅ |

**Important:** On Scotland/Wales pages discussing rent recovery, explain the local court process (Sheriff Court / Civil Court) but clarify that the Money Claim Pack product is England-only.

---

## JURISDICTION-SPECIFIC LEGAL REQUIREMENTS

### England
- **No-fault eviction:** Section 21 notice (Housing Act 1988)
- **Fault-based eviction:** Section 8 notice with grounds
- **Court:** County Court (Form N5B for accelerated, N5 for standard)
- **Money claims:** MCOL (Money Claim Online) or N1 form

### Wales (Renting Homes (Wales) Act 2016)
- **No-fault eviction:** Section 173 notice (NOT Section 21)
  - 6-month minimum notice period
  - Cannot serve in first 6 months of occupation
  - Landlord must have owned property for 6+ months
- **Breach eviction:** Section 178 notice (NOT Section 8)
  - For rent arrears, anti-social behaviour, breach of contract
- **Terminology:** "Contract-holder" (not tenant), "Occupation Contract" (not AST)
- **Court:** County Court

### Scotland (Private Housing (Tenancies) (Scotland) Act 2016)
- **Eviction notice:** Notice to Leave (NOT Section 21/8)
- **18 eviction grounds** — mandatory and discretionary:
  - **Mandatory grounds:** Landlord intends to sell, landlord/family moving in, arrears of 3+ consecutive months
  - **Discretionary grounds:** Antisocial behaviour, breach of tenancy, landlord registration revoked
- **Notice periods:** 28 days to 84 days depending on ground and tenancy length
- **Court:** First-tier Tribunal for Housing (not county court)
- **Terminology:** "Private Residential Tenancy" (PRT)

---

## TECHNICAL IMPLEMENTATION REQUIREMENTS (CRITICAL)

### A. Required Components

Use existing components from the codebase:

```tsx
// Hero section
import { StandardHero } from '@/components/marketing/StandardHero';

// CTA blocks (use throughout page)
import { SeoCtaBlock } from '@/components/seo/SeoCtaBlock';
// Variants: 'hero' | 'section' | 'faq' | 'inline' | 'final'
// Page types: 'problem' | 'court' | 'money' | 'general' | 'tenancy'

// FAQ section (auto-generates FAQPage schema)
import { FAQSection } from '@/components/seo/FAQSection';

// Related links carousel
import { RelatedLinks } from '@/components/seo/RelatedLinks';

// Cross-sell component
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';

// Legal disclaimer (required on all pages)
import { SeoDisclaimer } from '@/components/seo/SeoDisclaimer';

// Tracking wrapper (required on all pages)
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';

// Structured data
import { StructuredData, articleSchema, breadcrumbSchema } from '@/lib/seo/structured-data';
```

### B. Wizard Links for CTAs

All CTA links must use `buildWizardLink()` for proper attribution tracking:

```tsx
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';

// Notice Only CTA
buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england', // or 'wales' | 'scotland'
  src: 'seo_eviction',
  topic: 'eviction'
})

// Complete Eviction Pack CTA
buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_eviction',
  topic: 'eviction'
})

// Money Claim CTA (England only)
buildWizardLink({
  product: 'money_claim',
  jurisdiction: 'england',
  src: 'seo_money_claim',
  topic: 'money_claim'
})
```

**Available `src` values:** `product_page`, `template`, `guide`, `seo_eviction`, `seo_money_claim`, `seo_tenancy`, `tool`, `blog`

### C. Pricing — Single Source of Truth

Never hardcode prices. Use the pricing config:

```tsx
import { PRODUCTS } from '@/lib/pricing/products';

PRODUCTS.notice_only.displayPrice      // "£49.99"
PRODUCTS.complete_pack.displayPrice    // "£199.99"
PRODUCTS.money_claim.displayPrice      // "£99.99"
PRODUCTS.ast_standard.displayPrice     // "£14.99"
PRODUCTS.ast_premium.displayPrice      // "£24.99"
```

**Note:** `SeoCtaBlock` automatically pulls correct prices when you specify `pageType`.

### D. Internal Links — Use Centralized Definitions

Import from `src/lib/seo/internal-links.ts`:

```tsx
import {
  // Products
  productLinks,        // .noticeOnly, .completePack, .moneyClaim, .tenancyAgreement

  // Tools
  toolLinks,           // .section21Validator, .section8Validator, .rentArrearsCalculator, .rentDemandLetter

  // Guides
  guideLinks,          // .howToEvictTenant, .possessionClaimGuide, .walesEviction, .scotlandEviction

  // Pre-built link groups
  evictionRelatedLinks,
  section21RelatedLinks,
  section8RelatedLinks,
  rentArrearsRelatedLinks,
  moneyClaimRelatedLinks,
  walesRelatedLinks,
  scotlandRelatedLinks,
  possessionClaimRelatedLinks,
} from '@/lib/seo/internal-links';

// Usage
<RelatedLinks
  title="Related Resources"
  links={evictionRelatedLinks}
  variant="cards"
/>
```

### E. FAQ Data Files

Define FAQs in `src/data/faqs.ts`, not inline:

```tsx
// In src/data/faqs.ts
export const evictionProcessEnglandFAQs = [
  {
    question: 'How long does the eviction process take in England?',
    answer: 'The eviction process typically takes 4-6 months from serving notice...'
  },
  // ... more FAQs
];

// In page file
import { evictionProcessEnglandFAQs } from '@/data/faqs';

<FAQSection faqs={evictionProcessEnglandFAQs} />
```

### F. Analytics & Tracking

Wrap all landing pages for attribution tracking:

```tsx
<SeoLandingWrapper pagePath="/eviction-process-england">
  {/* Page content */}
</SeoLandingWrapper>
```

Events tracked automatically:
- `landing_view` — when page loads
- `landing_cta_click` — when CTA is clicked (via SeoCtaBlock)

---

## PAGE STRUCTURE TEMPLATE (FOLLOW THIS ORDER)

```tsx
// 1. Metadata export
export const metadata: Metadata = {
  title: 'Eviction Process England | How to Evict a Tenant | Landlord Heaven',
  description: 'Complete guide to the eviction process in England. Learn the legal steps, timelines, and costs. Get court-ready eviction documents from £49.99.',
  keywords: ['eviction process england', 'how to evict tenant england', 'landlord eviction process'],
  openGraph: {
    title: 'Eviction Process England | How to Evict a Tenant | Landlord Heaven',
    description: 'Complete guide to the eviction process in England...',
    type: 'article',
    url: getCanonicalUrl('/eviction-process-england'),
  },
  alternates: {
    canonical: getCanonicalUrl('/eviction-process-england'),
  },
};

// 2. Page component structure
export default function EvictionProcessEnglandPage() {
  return (
    <SeoLandingWrapper pagePath="/eviction-process-england">
      {/* JSON-LD Schemas */}
      <StructuredData data={articleSchema({
        headline: 'Eviction Process England: Complete Landlord Guide',
        description: 'Step-by-step guide to evicting a tenant in England...',
        datePublished: '2026-01-15',
        dateModified: '2026-01-30',
      })} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: getCanonicalUrl('/') },
        { name: 'Eviction Guides', url: getCanonicalUrl('/guides') },
        { name: 'Eviction Process England', url: getCanonicalUrl('/eviction-process-england') },
      ])} />

      {/* 3. Hero Section */}
      <StandardHero
        badge="England"
        title="Eviction Process England"
        subtitle="The complete landlord guide to legally evicting a tenant"
        primaryCTA={{
          text: 'Get Eviction Pack',
          href: buildWizardLink({ product: 'complete_pack', jurisdiction: 'england', src: 'seo_eviction', topic: 'eviction' }),
        }}
        secondaryCTA={{
          text: 'Just Need the Notice?',
          href: buildWizardLink({ product: 'notice_only', jurisdiction: 'england', src: 'seo_eviction', topic: 'eviction' }),
        }}
      />

      {/* 4. Trust signals / Social proof */}
      <SocialProofCounter />

      {/* 5. Prerequisites section */}
      <section>
        <h2>Before You Start: Key Requirements</h2>
        {/* Content */}
      </section>

      {/* 6-7. Main content sections (H2 → H3 hierarchy) */}
      <section>
        <h2>Understanding Your Eviction Options</h2>
        <h3>Section 21: No-Fault Eviction</h3>
        {/* Content */}
        <h3>Section 8: Fault-Based Eviction</h3>
        {/* Content */}
      </section>

      <section>
        <h2>The Court Process Explained</h2>
        {/* Content */}
      </section>

      <section>
        <h2>Common Mistakes That Invalidate Evictions</h2>
        {/* Content */}
      </section>

      {/* 8. Cost/timeline summary grid */}
      <section>
        <h2>Eviction Costs and Timelines</h2>
        {/* Grid with costs, timelines, common issues */}
      </section>

      {/* 9. Mid-page CTA */}
      <SeoCtaBlock
        variant="section"
        pageType="court"
        jurisdiction="england"
      />

      {/* 10. Cross-sell component */}
      <NextLegalSteps
        currentStep="eviction"
        jurisdiction="england"
      />

      {/* 11. FAQ Section (auto-generates schema) */}
      <FAQSection faqs={evictionProcessEnglandFAQs} />

      {/* 12. Final CTA */}
      <SeoCtaBlock
        variant="final"
        pageType="court"
        jurisdiction="england"
      />

      {/* 13. Legal disclaimer */}
      <SeoDisclaimer />

      {/* 14. Related resources */}
      <RelatedLinks
        title="Related Resources"
        links={evictionRelatedLinks}
        variant="cards"
      />
    </SeoLandingWrapper>
  );
}
```

---

## SCHEMA & FAQ REQUIREMENTS

### A. Required Schemas

Each page must include JSON-LD schema for:

1. **Article Schema** (use `articleSchema()` — better than generic WebPage for guides)
2. **BreadcrumbList Schema** (use `breadcrumbSchema()`)
3. **FAQPage Schema** (auto-generated by `FAQSection` component)
4. **HowTo Schema** (for process pages — use pre-built schemas)

Pre-built HowTo schemas available:
```tsx
import { HOWTO_SCHEMAS } from '@/lib/seo/structured-data';

HOWTO_SCHEMAS.section21Process   // Section 21 eviction process
HOWTO_SCHEMAS.section8Process    // Section 8 eviction process
HOWTO_SCHEMAS.mcolProcess        // MCOL money claim process
```

### B. FAQ Requirements

- Include **5-8 FAQs per page**
- FAQs must:
  - Match real landlord search intent (check "People Also Ask" in Google)
  - Be jurisdiction-specific
  - Be written in plain English
  - Avoid legal advice disclaimers within answers
- Each FAQ rendered:
  1. Visibly on page under "Frequently Asked Questions" heading
  2. As valid JSON-LD FAQPage schema (automatic with FAQSection)

**Example FAQ topics (adapt per page):**
- "How long does the eviction process take in [jurisdiction]?"
- "What happens if my tenant ignores the [notice type]?"
- "When do I need to go to court?"
- "Can I claim rent arrears at the same time as eviction?"
- "What makes a [notice type] invalid?"
- "How much does eviction cost in [jurisdiction]?"
- "Do I need a solicitor to evict a tenant?"

### C. FAQ Placement

- Place FAQs **near the bottom of the page**, after the main content and mid-page CTA
- Use clear `<h2>Frequently Asked Questions</h2>` heading
- Answers should be **concise (40-80 words each)** but accurate

---

## CTA CONFIGURATION BY PAGE TYPE

`SeoCtaBlock` has pre-configured copy per page type. Use the appropriate `pageType`:

| pageType | Primary CTA Text | Secondary CTA Text | Use For |
|----------|------------------|-------------------|---------|
| `problem` | "Get Court-Ready Notice" | "View Complete Pack" | Problem pages (tenant not paying, etc.) |
| `court` | "Get Complete Eviction Pack" | "Just Need the Notice?" | Court/eviction process pages |
| `money` | "Start Money Claim" | "Also Need Eviction?" | Money claim / rent arrears pages |
| `general` | "Get Started" | "Learn More" | Generic pages |
| `tenancy` | "Create Tenancy Agreement" | "View Options" | Tenancy agreement pages |

**Override copy only when page-specific messaging is needed:**

```tsx
<SeoCtaBlock
  variant="section"
  pageType="money"
  primaryText="Claim Your Rent Arrears Now"
  secondaryText="Need to Evict Too?"
/>
```

---

## ASK HEAVEN INTEGRATION

Include an Ask Heaven callout on complex guide pages where landlords may have follow-up questions:

```tsx
<div className="bg-purple-50 border border-purple-200 rounded-xl p-6 my-8">
  <h3 className="text-lg font-semibold text-purple-900 mb-2">
    Have Questions About Your Situation?
  </h3>
  <p className="text-purple-800 mb-4">
    Every eviction case is different. Use our free Ask Heaven tool to get
    answers to your specific landlord questions.
  </p>
  <Link
    href="/ask-heaven"
    className="inline-flex items-center text-purple-700 font-medium hover:text-purple-900"
  >
    Ask Heaven Free Q&A →
  </Link>
</div>
```

Or use the pre-defined link:
```tsx
import { askHeavenLink } from '@/lib/seo/internal-links';
```

---

## METADATA TEMPLATE

```tsx
import { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export const metadata: Metadata = {
  // Title: Primary keyword + brand (under 60 characters)
  title: 'Eviction Process England | How to Evict a Tenant | Landlord Heaven',

  // Description: Value proposition + CTA hint (150-160 characters)
  description: 'Complete guide to the eviction process in England. Learn the legal steps, timelines, and costs. Get court-ready eviction documents from £49.99.',

  // Keywords: Primary + 2-3 secondary keywords
  keywords: [
    'eviction process england',
    'how to evict tenant england',
    'landlord eviction process',
    'court eviction landlord'
  ],

  // Open Graph
  openGraph: {
    title: 'Eviction Process England | How to Evict a Tenant | Landlord Heaven',
    description: 'Complete guide to the eviction process in England. Learn the legal steps, timelines, and costs.',
    type: 'article',
    url: getCanonicalUrl('/eviction-process-england'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Eviction Process England | Landlord Heaven',
    description: 'Complete guide to the eviction process in England.',
  },

  // Canonical URL (critical for SEO)
  alternates: {
    canonical: getCanonicalUrl('/eviction-process-england'),
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },
};
```

---

## PAGES TO BUILD (PRIORITY ORDER)

### Page 1: ENGLAND — Eviction Process (Highest Value)

**URL:** `/eviction-process-england`

**Primary keywords:**
- eviction process england landlord
- how to evict a tenant england
- court eviction process landlord

**Page type:** `court`

**Primary CTA:** Complete Eviction Pack (England)
**Secondary CTA:** Notice Only (if notice not yet served)

**Content sections:**
1. When you can evict (AST requirements, deposit protection, EPC, etc.)
2. Section 21 vs Section 8 comparison
3. Notice periods and requirements
4. The court process (N5B accelerated vs N5 standard)
5. Possession order and warrant
6. Bailiff enforcement
7. Costs and timelines
8. Common mistakes

---

### Page 2: ENGLAND — Section 21 Notice Expired / Ignored

**URL:** `/section-21-expired-what-next`

**Primary keywords:**
- section 21 expired what next
- tenant ignored section 21
- section 21 eviction after expiry

**Page type:** `court`

**Primary CTA:** Complete Eviction Pack (England)

**Content sections:**
1. What happens when Section 21 expires
2. How long is a Section 21 valid after expiry
3. Next steps: applying for possession order
4. Accelerated possession procedure (N5B)
5. What if tenant still won't leave after court order
6. Warrant of possession and bailiffs
7. Timeline expectations

---

### Page 3: ENGLAND — Section 8 Rent Arrears Eviction

**URL:** `/section-8-rent-arrears-eviction`

**Primary keywords:**
- section 8 rent arrears eviction
- ground 8 eviction process
- section 8 eviction court

**Page type:** `court` (with money cross-sell)

**Primary CTA:** Complete Eviction Pack (England)
**Secondary CTA:** Money Claim (for arrears recovery)

**Content sections:**
1. When to use Section 8 for rent arrears
2. Ground 8 (mandatory) vs Ground 10/11 (discretionary)
3. Two months' arrears requirement for Ground 8
4. Notice period (2 weeks for rent arrears grounds)
5. Court hearing process
6. Can you claim rent arrears in possession proceedings?
7. When to use separate money claim
8. Common Section 8 mistakes

---

### Page 4: ENGLAND — Apply for a Possession Order

**URL:** `/apply-possession-order-landlord`

**Primary keywords:**
- apply for possession order landlord
- possession order landlord england
- possession claim landlord

**Page type:** `court`

**Primary CTA:** Complete Eviction Pack (England)

**Content sections:**
1. Types of possession claims (accelerated vs standard)
2. Which court forms you need (N5B, N5, N119, N215)
3. Court fees and costs
4. What happens at the hearing
5. Possession order types (outright, suspended, postponed)
6. After the order: what if tenant doesn't leave
7. Applying for warrant of possession

---

### Page 5: SCOTLAND — Eviction Notice & Tribunal (PRT)

**URL:** `/eviction-process-scotland`

**Primary keywords:**
- eviction process scotland landlord
- eviction tribunal scotland
- notice to leave scotland

**Page type:** `court`

**Primary CTA:** Scotland Eviction Pack

**Content sections:**
1. Private Residential Tenancy (PRT) explained
2. The 18 eviction grounds (mandatory vs discretionary)
3. Notice to Leave requirements
4. Notice periods (28-84 days based on ground/tenancy length)
5. First-tier Tribunal for Housing application
6. Tribunal hearing process
7. Eviction order enforcement
8. Rent arrears recovery in Scotland (Sheriff Court)

**Important:** Do NOT mention Section 21 or Section 8. Explain that Money Claim Pack is England-only; rent recovery in Scotland uses Sheriff Court Simple Procedure.

---

### Page 6: WALES — Eviction Process (Section 173/178)

**URL:** `/eviction-process-wales`

**Primary keywords:**
- eviction process wales landlord
- section 173 eviction
- tenant not leaving after section 173

**Page type:** `court`

**Primary CTA:** Wales Eviction Pack

**Content sections:**
1. Renting Homes (Wales) Act 2016 overview
2. Section 173 (no-fault) vs Section 178 (breach)
3. Section 173 requirements:
   - 6-month notice period
   - Cannot serve in first 6 months
   - Landlord ownership requirement
4. Section 178 for rent arrears and breach
5. Court process in Wales
6. Possession order and enforcement
7. Rent recovery options (County Court)

**Important:** Do NOT mention Section 21 or Section 8. Use "contract-holder" not "tenant", "occupation contract" not "AST".

---

### Page 7: ENGLAND — Claim Rent Arrears from a Tenant

**URL:** `/claim-rent-arrears-tenant`

**Primary keywords:**
- claim rent arrears tenant
- money claim rent arrears
- sue tenant for unpaid rent

**Page type:** `money`

**Primary CTA:** Money Claim Pack
**Secondary CTA:** Complete Eviction Pack (if possession also needed)

**Content sections:**
1. When to claim rent arrears (during tenancy vs after)
2. Letter before action requirements
3. MCOL (Money Claim Online) process
4. Court fees based on claim amount
5. What happens if tenant defends
6. CCJ and enforcement options
7. Eviction vs money claim: can you do both?
8. Claiming from a guarantor

---

### Page 8: ENGLAND — Section 8 vs Section 21

**URL:** `/section-8-vs-section-21`

**Primary keywords:**
- section 8 vs section 21
- should i use section 8 or section 21
- fastest way to evict tenant england

**Page type:** `problem` (route selection)

**Primary CTA:** Notice Only (route selection)
**Secondary CTA:** Complete Eviction Pack

**Content sections:**
1. Key differences at a glance (comparison table)
2. When to use Section 21 (no-fault, end of tenancy)
3. When to use Section 8 (rent arrears, breach, antisocial)
4. Notice periods compared
5. Court process compared (accelerated vs standard hearing)
6. Can you serve both notices?
7. Which is faster?
8. Which is cheaper?
9. Decision flowchart

---

## OUTPUT EXPECTATIONS

For EACH page, deliver:

1. **Complete Next.js page file** (`page.tsx`) with:
   - Metadata export
   - StructuredData components (article + breadcrumb schemas)
   - Full page structure following the template
   - Proper component imports

2. **FAQ data** in `src/data/faqs.ts`:
   - 5-8 FAQs per page
   - Exported as named constant (e.g., `evictionProcessEnglandFAQs`)

3. **Content requirements:**
   - Minimum 1,200 words of body content
   - Clean H1 → H2 → H3 hierarchy
   - Embedded internal links using centralized definitions
   - Context-appropriate CTAs using `SeoCtaBlock`
   - Jurisdiction-specific accuracy

4. **Quality checklist:**
   - [ ] Jurisdiction clearly stated (badge + content)
   - [ ] No cross-jurisdiction legal mixing
   - [ ] Prices from PRODUCTS config (not hardcoded)
   - [ ] CTAs use buildWizardLink() for tracking
   - [ ] FAQs match search intent
   - [ ] Canonical URL set correctly
   - [ ] SeoLandingWrapper applied
   - [ ] SeoDisclaimer included
   - [ ] RelatedLinks at bottom

Build pages one at a time, starting from Page 1.
Do not summarise. Do not shorten. Produce production-ready content.
