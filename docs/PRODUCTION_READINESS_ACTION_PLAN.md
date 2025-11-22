# 🚀 PRODUCTION READINESS ACTION PLAN

**Target:** 100% production-ready with ZERO issues
**Current:** 70% complete
**Estimated Time:** 24-32 hours total

---

## 📋 PHASE 1: CRITICAL BLOCKERS (12-16 hours) 🔴

### Task 1.1: Create Header/Navigation Component (3-4 hours)

**File:** `src/components/layout/Header.tsx`

**Requirements:**
```tsx
- Logo (clickable, links to homepage)
- Main Nav Links:
  - Products (dropdown: Notice Only, Complete Pack, Money Claim, AST, HMO Pro)
  - Pricing
  - Help
  - About
- Right Side:
  - Login button (when logged out)
  - Sign Up button (when logged out)
  - User dropdown (when logged in): Dashboard, Settings, Logout
- Mobile:
  - Hamburger menu
  - Slide-out drawer
- Sticky header on scroll
- Use Tailwind + design system colors
```

**Acceptance Criteria:**
- ✅ Header appears on ALL pages
- ✅ Responsive (mobile hamburger menu)
- ✅ Login/logout state changes nav
- ✅ Dropdown menus work
- ✅ Matches STYLE_GUIDE.md colors

---

### Task 1.2: Create Footer Component (2 hours)

**File:** `src/components/layout/Footer.tsx`

**Requirements:**
```tsx
- 4 Columns:
  1. About Landlord Heaven (logo, tagline)
  2. Products (all 5 products linked)
  3. Legal (Terms, Privacy, Refunds)
  4. Support (Help, Contact, FAQ)
- Bottom row: Copyright, jurisdiction badges
- Use charcoal background (#1f2937)
- Links in gray-400, hover to white
```

**Acceptance Criteria:**
- ✅ Reusable component
- ✅ Used in all layouts (homepage, dashboard, wizard)
- ✅ All links work (or show "Coming Soon" modal)

---

### Task 1.3: Create Legal Pages (3 hours)

**Required Pages:**

1. **`src/app/terms/page.tsx`** - Terms & Conditions
   - Service description
   - User responsibilities
   - Refund policy link
   - Limitation of liability
   - Governing law (UK)

2. **`src/app/privacy/page.tsx`** - Privacy Policy
   - GDPR compliant
   - Data collection (what, why, how)
   - Cookie policy
   - Third-party services (Stripe, Supabase, OpenAI, Anthropic)
   - User rights

3. **`src/app/refunds/page.tsx`** - Refund Policy
   - 30-day money-back guarantee
   - Refund process
   - Exclusions
   - Contact info

**Acceptance Criteria:**
- ✅ All 3 pages exist
- ✅ Professional legal language
- ✅ Company info (name, address, contact)
- ✅ GDPR compliant
- ✅ Linked from footer

---

### Task 1.4: Create Product Pages (4-5 hours)

**Required Pages:**

1. **`src/app/products/notice-only/page.tsx`**
   - Hero: "Section 8/21 Notices - £29.99"
   - What's included
   - How it works (3-step process)
   - FAQ
   - CTA: "Get Your Notice"

2. **`src/app/products/complete-pack/page.tsx`**
   - Hero: "Complete Eviction Pack - £149.99"
   - Full package breakdown
   - Timeline visualization
   - Comparison with hiring solicitor (£2000+)
   - FAQ
   - CTA: "Get Complete Pack"

3. **`src/app/products/money-claim/page.tsx`**
   - Hero: "Money Claim Pack - £129.99"
   - Recover: rent arrears, damages, fees
   - N1 form explanation
   - MCOL guidance
   - Calculator widget
   - CTA: "Start Claim"

4. **`src/app/products/ast/page.tsx`**
   - Hero: "Tenancy Agreements"
   - Standard vs Premium comparison
   - What's included in each
   - Pricing: £39.99 vs £59.00
   - CTA: "Create Agreement"

5. **`src/app/hmo-pro/page.tsx`**
   - Hero: "HMO Pro Membership"
   - Problem: Manual HMO compliance is painful
   - Solution: Automated tracking + reminders
   - Pricing tiers (1-5, 6-10, 11-15, 16-20 properties)
   - Features breakdown
   - Council database (380+ councils)
   - 7-day free trial CTA

**Acceptance Criteria:**
- ✅ All 5 pages exist
- ✅ SEO optimized (unique title/description)
- ✅ CTAs link to wizard or checkout
- ✅ Professional copy
- ✅ Mobile responsive

---

### Task 1.5: Create Support Pages (2-3 hours)

1. **`src/app/help/page.tsx`** - Help Center
   - FAQ (top 10-15 questions)
   - Searchable
   - Categories: Evictions, Tenancy Agreements, HMO, Billing
   - Link to contact form

2. **`src/app/contact/page.tsx`** - Contact Us
   - Contact form (name, email, subject, message)
   - Alternative: support@landlordheaven.co.uk
   - Response time: 24-48 hours
   - Submit → Saves to Supabase `support_tickets` table

**Acceptance Criteria:**
- ✅ Help page with 15+ FAQs
- ✅ Contact form functional
- ✅ Email notifications (using Resend)

---

## 📋 PHASE 2: HIGH-PRIORITY ENHANCEMENTS (6-8 hours) 🟡

### Task 2.1: Add Per-Page SEO Metadata (2 hours)

**Implementation:**

Create `src/components/seo/PageMeta.tsx`:
```tsx
import { Metadata } from 'next';

export function generatePageMeta(params: {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}): Metadata {
  return {
    title: `${params.title} | Landlord Heaven`,
    description: params.description,
    keywords: params.keywords,
    openGraph: {
      title: params.title,
      description: params.description,
      images: [params.ogImage || '/og-default.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      images: [params.ogImage || '/og-default.jpg'],
    },
  };
}
```

**Apply to ALL pages:**
```tsx
// src/app/products/notice-only/page.tsx
export const metadata = generatePageMeta({
  title: 'Section 8 & 21 Notices - £29.99',
  description: 'Court-ready eviction notices...',
  keywords: ['section 8', 'section 21', ...],
});
```

**Acceptance Criteria:**
- ✅ Unique metadata for every page
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Test with https://metatags.io/

---

### Task 2.2: Add Structured Data (JSON-LD) (2 hours)

**Files to Create:**

1. `src/components/seo/OrganizationSchema.tsx` - Company info
2. `src/components/seo/ProductSchema.tsx` - For product pages
3. `src/components/seo/FAQSchema.tsx` - For FAQ sections

**Example:**
```tsx
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Complete Eviction Pack",
  "description": "...",
  "offers": {
    "@type": "Offer",
    "price": "149.99",
    "priceCurrency": "GBP"
  }
}
</script>
```

**Acceptance Criteria:**
- ✅ Organization schema on homepage
- ✅ Product schema on all product pages
- ✅ FAQ schema on help page
- ✅ Validate with Google's Rich Results Test

---

### Task 2.3: Create Pricing Page (2 hours)

**File:** `src/app/pricing/page.tsx`

**Requirements:**
- Side-by-side comparison table
- All 5 one-time products
- HMO Pro tiers
- "Best for..." recommendations
- FAQ section
- CTAs for each product

**Acceptance Criteria:**
- ✅ Clean comparison table
- ✅ Mobile responsive (cards stack)
- ✅ Links to individual product pages

---

### Task 2.4: Create About Page (1-2 hours)

**File:** `src/app/about/page.tsx`

**Requirements:**
- Mission: Make landlord law accessible
- Problem: Solicitors cost £2000+, DIY is risky
- Solution: AI-powered, court-ready documents at 95% discount
- Trust signals: 100% UK coverage, 30-day guarantee
- Team (optional)
- Contact CTA

**Acceptance Criteria:**
- ✅ Professional copy
- ✅ Trust signals prominent
- ✅ CTA to products or wizard

---

## 📋 PHASE 3: SCOTLAND & NI OFFICIAL FORMS (8-12 hours) 🟡

### Task 3.1: Download Scotland Official PDFs (2-3 hours)

**Forms to Download:**

1. **AT6** - Notice to Leave
   - URL: https://www.gov.scot/publications/notice-to-leave-tenants/
   - Save to: `/public/official-forms/scotland/AT6.pdf`

2. **Form E** - First-tier Tribunal Application
   - URL: https://www.housingandpropertychamber.scot/apply-tribunal/eviction-order
   - Save to: `/public/official-forms/scotland/Form_E.pdf`

3. **AT2** - Deposit Notification
   - URL: https://www.gov.scot/publications/tenant-information-pack/
   - Save to: `/public/official-forms/scotland/AT2.pdf`

4. **AT5** - Model PRT Agreement
   - URL: https://www.gov.scot/publications/model-private-residential-tenancy-agreement/
   - Save to: `/public/official-forms/scotland/AT5.pdf`

**Acceptance Criteria:**
- ✅ All 4 PDFs downloaded
- ✅ Saved in correct directory
- ✅ Inspect fields using `/scripts/inspect-pdf-forms.ts`

---

### Task 3.2: Implement Scotland PDF Field Mapping (4-6 hours)

**Files to Update:**

1. `src/lib/documents/scotland/notice-to-leave-generator.ts`
   - Add PDF filling using pdf-lib
   - Map data to AT6 form fields
   - Fall back to Handlebars if PDF fails

2. `src/lib/documents/scotland/prt-generator.ts`
   - Add PDF filling for AT5
   - Map tenancy data to form fields

3. `src/lib/documents/scotland/tribunal-application-generator.ts` (create)
   - Add PDF filling for Form E
   - Map case data to tribunal form

**Example:**
```ts
import { PDFDocument } from 'pdf-lib';

async function fillAT6(data: NoticeToLeaveData) {
  const pdfBytes = await fs.readFile('./public/official-forms/scotland/AT6.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Fill fields
  form.getTextField('landlord_name').setText(data.landlord_name);
  form.getTextField('tenant_name').setText(data.tenant_name);
  // ... etc

  return pdfDoc.save();
}
```

**Acceptance Criteria:**
- ✅ AT6 PDF filled correctly
- ✅ AT5 PDF filled correctly
- ✅ Form E PDF filled correctly
- ✅ Test with sample data
- ✅ Verify PDFs open in Adobe Reader

---

### Task 3.3: Download Northern Ireland Official PDFs (1-2 hours)

**Forms to Download:**

1. **Civil Bill for Possession**
   - URL: https://www.judiciaryni.uk/court-forms
   - Search for "possession" or "landlord and tenant"
   - Save to: `/public/official-forms/northern-ireland/Civil_Bill_Possession.pdf`

2. **Application for Possession Order** (if separate form)
   - Check NI Courts website
   - Save to: `/public/official-forms/northern-ireland/Possession_Application.pdf`

**Note:** NI does NOT have official Notice to Quit PDF, so Handlebars template is acceptable.

**Acceptance Criteria:**
- ✅ Civil Bill PDF downloaded
- ✅ Inspect fields
- ✅ Document in MISSING_OFFICIAL_FORMS.md

---

### Task 3.4: Implement NI PDF Field Mapping (2-3 hours)

**Files to Update:**

1. `src/lib/documents/northern-ireland/civil-bill-generator.ts` (create)
   - Fill Civil Bill PDF
   - Map eviction case data to form

**Acceptance Criteria:**
- ✅ Civil Bill PDF filled correctly
- ✅ Test with sample data

---

## 📋 PHASE 4: POLISH & OPTIMIZATION (4-6 hours) 🟢

### Task 4.1: Generate Sitemap (1 hour)

**File:** `src/app/sitemap.ts`

```ts
export default function sitemap() {
  return [
    { url: 'https://landlordheaven.co.uk', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/products/notice-only', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/products/complete-pack', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/products/money-claim', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/products/ast', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/hmo-pro', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/pricing', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/about', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/help', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/contact', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/terms', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/privacy', lastModified: new Date() },
    { url: 'https://landlordheaven.co.uk/refunds', lastModified: new Date() },
  ];
}
```

---

### Task 4.2: Create Robots.txt (15 min)

**File:** `public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /wizard/
Disallow: /api/

Sitemap: https://landlordheaven.co.uk/sitemap.xml
```

---

### Task 4.3: Add Loading States & Error Boundaries (2 hours)

**Files:**
- `src/app/loading.tsx` - Global loading UI
- `src/app/error.tsx` - Global error boundary
- Per-page loading states for wizard, dashboard

---

### Task 4.4: Accessibility Audit (1-2 hours)

**Checklist:**
- ✅ All images have alt text
- ✅ Buttons have aria-labels
- ✅ Forms have proper labels
- ✅ Color contrast >= 4.5:1
- ✅ Keyboard navigation works
- ✅ Screen reader tested

---

### Task 4.5: Performance Optimization (1 hour)

**Checklist:**
- ✅ Images optimized (use next/image)
- ✅ Fonts preloaded
- ✅ Code splitting
- ✅ Lazy loading for heavy components
- ✅ Lighthouse score > 90

---

## 📊 SUMMARY

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| **Phase 1: Critical Blockers** | 5 | 12-16h | 🔴 CRITICAL |
| **Phase 2: High-Priority** | 4 | 6-8h | 🟡 HIGH |
| **Phase 3: Scotland/NI Forms** | 4 | 8-12h | 🟡 MEDIUM |
| **Phase 4: Polish** | 5 | 4-6h | 🟢 NICE-TO-HAVE |
| **TOTAL** | **18** | **30-42h** | - |

---

## 🎯 RECOMMENDED APPROACH

### Week 1: MVP Launch (Phase 1 + Phase 2)
- Days 1-2: Header, Footer, Legal pages (Tasks 1.1-1.3)
- Days 3-4: Product pages, Support pages (Tasks 1.4-1.5)
- Day 5: SEO, Pricing, About (Phase 2)

**Result:** Fully functional website, ready for marketing

### Week 2: Enhancement (Phase 3 + Phase 4)
- Days 1-3: Scotland/NI official forms
- Days 4-5: Polish, optimization, testing

**Result:** 100% production-ready, zero compromises

---

## ✅ DEFINITION OF DONE

**100% Complete = ALL of the following:**

- ✅ Header with working navigation on every page
- ✅ Footer component on every page
- ✅ All footer links work (no 404s)
- ✅ Terms, Privacy, Refunds pages exist
- ✅ All 5 product pages exist
- ✅ Help & Contact pages exist
- ✅ Per-page SEO metadata (Open Graph, Twitter)
- ✅ Structured data (JSON-LD)
- ✅ Sitemap.xml generated
- ✅ Robots.txt configured
- ✅ Scotland official PDFs (AT6, Form E, AT2, AT5)
- ✅ Northern Ireland official PDFs (Civil Bill)
- ✅ All PDFs tested and fillable
- ✅ Lighthouse score > 90
- ✅ Accessibility audit passed
- ✅ Mobile responsive (all pages)
- ✅ No TypeScript errors
- ✅ Build passes
- ✅ Deployed to Vercel
- ✅ All features tested end-to-end

---

**Created:** 2025-11-22
**Status:** Ready to implement
**Estimated Completion:** 30-42 hours (1-2 weeks)
