# Landlord Heaven – SEO + Product/Tools Audit (Ground-Truth)

## Scope
Indexable marketing + funnel pages under `src/app/**` excluding dashboard/auth/wizard/admin. Audit covers products, tools, Ask Heaven, guides/landing pages, and blog entry points.

---

## A) Route & Page Inventory

### Paid product pages
| Route | File | Notes |
| --- | --- | --- |
| `/products/notice-only` | `src/app/products/notice-only/page.tsx` | Notice Only Pack (eviction notices) |
| `/products/complete-pack` | `src/app/products/complete-pack/page.tsx` | Complete Eviction Pack |
| `/products/money-claim` | `src/app/products/money-claim/page.tsx` | Money Claim Pack |
| `/products/money-claim-pack` | `src/app/products/money-claim-pack/page.tsx` | Alias route (re-exports metadata from money-claim) |
| `/products/ast` | `src/app/products/ast/page.tsx` | Tenancy agreements (AST/PRT/Occupation Contract/NI) |

### Tenancy agreement jurisdiction pages
| Route | File | Notes |
| --- | --- | --- |
| `/tenancy-agreements/england` | `src/app/tenancy-agreements/england/page.tsx` | AST (England) |
| `/tenancy-agreements/wales` | `src/app/tenancy-agreements/wales/page.tsx` | Occupation Contract (Wales) |
| `/tenancy-agreements/scotland` | `src/app/tenancy-agreements/scotland/page.tsx` | PRT (Scotland) |
| `/tenancy-agreements/northern-ireland` | `src/app/tenancy-agreements/northern-ireland/page.tsx` | Private tenancy (NI) |
| `/tenancy-agreements/england-wales` | `src/app/tenancy-agreements/england-wales/page.tsx` | Jurisdiction selector (noindex) |

### Tools hub + tools pages
| Route | File | Notes |
| --- | --- | --- |
| `/tools` | `src/app/tools/page.tsx` | Tools hub |
| `/tools/validators` | `src/app/tools/validators/page.tsx` | Validators hub |
| `/tools/validators/section-21` | `src/app/tools/validators/section-21/page.tsx` | Section 21 validator (England) |
| `/tools/validators/section-8` | `src/app/tools/validators/section-8/page.tsx` | Section 8 validator (England) |
| `/tools/free-section-21-notice-generator` | `src/app/tools/free-section-21-notice-generator/page.tsx` (+ layout metadata) | Free generator |
| `/tools/free-section-8-notice-generator` | `src/app/tools/free-section-8-notice-generator/page.tsx` (+ layout metadata) | Free generator |
| `/tools/free-rent-demand-letter` | `src/app/tools/free-rent-demand-letter/page.tsx` (+ layout metadata) | Free generator |
| `/tools/rent-arrears-calculator` | `src/app/tools/rent-arrears-calculator/page.tsx` (+ layout metadata) | Calculator |
| `/tools/hmo-license-checker` | `src/app/tools/hmo-license-checker/page.tsx` (+ layout metadata) | Checker |

### Ask Heaven
| Route | File | Notes |
| --- | --- | --- |
| `/ask-heaven` | `src/app/ask-heaven/page.tsx` | Ask Heaven Q&A tool |

### Guides / landing pages
| Route | File | Notes |
| --- | --- | --- |
| `/how-to-evict-tenant` | `src/app/how-to-evict-tenant/page.tsx` | UK eviction guide |
| `/wales-eviction-notices` | `src/app/wales-eviction-notices/page.tsx` | Wales eviction guide (Renting Homes Act) |
| `/scotland-eviction-notices` | `src/app/scotland-eviction-notices/page.tsx` | Scotland eviction guide (Notice to Leave) |
| `/money-claim-unpaid-rent` | `src/app/money-claim-unpaid-rent/page.tsx` | MCOL + Scotland Simple Procedure guide |
| `/section-21-ban` | `src/app/section-21-ban/page.tsx` | Section 21 ban landing page |
| `/eviction-notice-template` | `src/app/eviction-notice-template/page.tsx` | Eviction notice template hub |
| `/section-21-notice-template` | `src/app/section-21-notice-template/page.tsx` | Form 6A template page |
| `/section-8-notice-template` | `src/app/section-8-notice-template/page.tsx` | Form 3 template page |
| `/rent-arrears-letter-template` | `src/app/rent-arrears-letter-template/page.tsx` | Rent demand letter template |
| `/tenancy-agreement-template` | `src/app/tenancy-agreement-template/page.tsx` | Tenancy agreement template |

### Blog entry points
| Route | File | Notes |
| --- | --- | --- |
| `/blog` | `src/app/blog/page.tsx` | Blog index (Landlord Guides) |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | Dynamic blog posts + category pages (region slugs) |

**Blog content source:** blog post content is defined in `src/lib/blog/posts.tsx` and referenced by `/blog` and `/blog/[slug]`. Category metadata and region logic live in `src/lib/blog/categories.ts`.

---

## B) SEO Metadata & Schema Audit (Ground-Truth)

### Global metadata behavior
- Default metadata (OG/Twitter/robots/canonical defaults) are set in `src/lib/seo/metadata.ts`, but individual pages frequently override metadata manually.

### Product pages
| Route | Metadata Title/Description | Canonical | Open Graph | Structured Data |
| --- | --- | --- | --- | --- |
| `/products/notice-only` | Title/description defined in page | ✅ explicit canonical | ✅ explicit OG | Product + FAQPage + BreadcrumbList |
| `/products/complete-pack` | Title/description defined in page | ✅ | ✅ | Product + FAQPage + BreadcrumbList |
| `/products/money-claim` | Title/description defined in page | ✅ | ✅ | Product + FAQPage + BreadcrumbList |
| `/products/money-claim-pack` | Re-exports metadata | ✅ (in source) | ✅ (in source) | Inherited from money-claim page |
| `/products/ast` | Title/description defined in page | ✅ | ✅ | Product + FAQPage + BreadcrumbList |

### Tenancy agreement jurisdiction pages
| Route | Metadata Title/Description | Canonical | Open Graph | Structured Data |
| --- | --- | --- | --- | --- |
| `/tenancy-agreements/england` | Title/description defined in page | ❌ (no alternates) | ✅ | FAQPage + Product schemas embedded |
| `/tenancy-agreements/wales` | Title/description defined in page | ❌ | ✅ | FAQPage + Product schemas embedded |
| `/tenancy-agreements/scotland` | Title/description defined in page | ❌ | ✅ | FAQPage + Product schemas embedded |
| `/tenancy-agreements/northern-ireland` | Title/description defined in page | ❌ | ✅ | FAQPage + Product schemas embedded |
| `/tenancy-agreements/england-wales` | Title/description, `robots: noindex` | ❌ | ❌ | None (breadcrumb-only markup) |

### Tools hub + tools pages
| Route | Metadata Title/Description | Canonical | Open Graph | Structured Data |
| --- | --- | --- | --- | --- |
| `/tools` | Title/description defined | ✅ | ✅ | None observed |
| `/tools/validators` | Title/description defined | ✅ | ✅ | None observed |
| `/tools/validators/section-21` | Title/description defined | ✅ | ✅ | FAQPage + BreadcrumbList |
| `/tools/validators/section-8` | Title/description defined | ✅ | ✅ | FAQPage + BreadcrumbList |
| `/tools/free-section-21-notice-generator` | Metadata defined in layout | ✅ | ✅ | HowTo schema (layout script) |
| `/tools/free-section-8-notice-generator` | Metadata defined in layout | ✅ | ✅ | HowTo schema (layout script) |
| `/tools/free-rent-demand-letter` | Metadata defined in layout | ✅ | ✅ | HowTo schema (layout script) |
| `/tools/rent-arrears-calculator` | Metadata defined in layout | ✅ | ✅ | HowTo schema (layout script) |
| `/tools/hmo-license-checker` | Metadata defined in layout | ✅ | ✅ | HowTo schema (layout script) |

### Ask Heaven
| Route | Metadata Title/Description | Canonical | Open Graph | Structured Data |
| --- | --- | --- | --- | --- |
| `/ask-heaven` | Title/description defined | ✅ | ✅ | FAQPage + BreadcrumbList + ItemList |

### Guides / landing pages
| Route | Metadata Title/Description | Canonical | Open Graph | Structured Data |
| --- | --- | --- | --- | --- |
| `/how-to-evict-tenant` | Title/description defined | ✅ | ✅ | FAQPage + BreadcrumbList |
| `/wales-eviction-notices` | Title/description defined | ✅ | ✅ | FAQPage + BreadcrumbList |
| `/scotland-eviction-notices` | Title/description defined | ✅ | ✅ | FAQPage + BreadcrumbList |
| `/money-claim-unpaid-rent` | Title/description defined | ✅ | ✅ | FAQPage + BreadcrumbList |
| `/section-21-ban` | Title/description defined | ❌ | ✅ (no URL set) | FAQPage |
| `/eviction-notice-template` | Title/description defined | ❌ | ✅ (no URL set) | WebPage + Product + FAQPage |
| `/section-21-notice-template` | Title/description defined | ❌ | ✅ (no URL set) | WebPage + Product + FAQPage + BreadcrumbList |
| `/section-8-notice-template` | Title/description defined | ❌ | ✅ (no URL set) | WebPage + Product + FAQPage + BreadcrumbList |
| `/rent-arrears-letter-template` | Title/description defined | ❌ | ✅ (no URL set) | WebPage + Product + FAQPage + BreadcrumbList |
| `/tenancy-agreement-template` | Title/description defined | ❌ | ✅ (no URL set) | WebPage + Product + FAQPage + BreadcrumbList |

### Blog
| Route | Metadata Title/Description | Canonical | Open Graph | Structured Data |
| --- | --- | --- | --- | --- |
| `/blog` | Title/description defined | ✅ | ✅ | Blog schema (Blog + BlogPosting list) |
| `/blog/[slug]` (posts) | `generateMetadata` uses post fields | ✅ | ✅ | BlogPosting + BreadcrumbList; FAQPage only if post has FAQs |
| `/blog/[slug]` (category pages) | `generateMetadata` uses category config | ✅ | ✅ | Collection page + BreadcrumbList |

**Metadata gaps (priority issues):**
1. Several high-intent landing pages lack explicit canonical URLs: eviction template, Section 21 template, Section 8 template, rent arrears letter template, tenancy agreement template, Section 21 ban. These pages are all marketing funnels and should declare canonicals to reduce duplicate/variant risk.
2. Tenancy agreement jurisdiction pages have OG but no canonical alternates.
3. Open Graph objects on template/ban pages don’t set URLs, which weakens sharing consistency and may reduce clarity for crawlers.

---

## C) Funnel & CTA Audit (Free → Paid, Jurisdiction clarity)

### Products
- **Notice Only / Complete Pack / Money Claim / Tenancy Agreements**: Hero CTAs lead into the wizard flow with `product` and `src=product_page` parameters. These are primary paid conversion pages.
- All product pages include jurisdiction messaging (England/Wales/Scotland/NI) and surface compliance notes within FAQ sections.
- Internal components include Ask Heaven sections and related links to tools and guides.

### Tools
- **Free Section 21/Section 8 Generators**: primary CTA is “Start Free Generator”, secondary CTA upsells to Notice Only pack (`/products/notice-only`) for court-ready output. Explicit disclaimers that free output is not court-ready.
- **Rent Arrears Calculator**: primary CTA is calculator usage; upsell to Money Claim pack and direct wizard flows per jurisdiction.
- **Free Rent Demand Letter**: upsell to Notice Only pack (template compliant) and Money Claim pack in secondary upgrade box.
- **HMO License Checker**: primary CTA is the checker; upsell to Tenancy Agreements (AST/PRT/Occupation Contract).
- **Validators hub + validator pages**: CTA is to upload and validate for free, with clear upsell messaging to paid packs and wizard flow (notice-only/complete-pack).

### Ask Heaven
- **Ask Heaven**: interactive Q&A with suggested product/validator CTAs and links to free tools. The request routing parameters are supported via `buildAskHeavenLink` (used on template/guides) and the widget itself.

### Jurisdiction clarity
- Wales: eviction pages explicitly note Section 21 does not apply and reference Renting Homes (Wales) Act.
- Scotland: eviction pages reference Notice to Leave and PRT/tribunal routes.
- England: Section 21/Section 8 and Form 6A/Form 3 are consistently used.

**Potential funnel weak points:**
- Several template/guide pages lack canonical URLs and OG URLs (see SEO gaps). These pages are high-traffic entry points for free→paid conversion.
- Some blog CTAs and Next Steps links point to validator routes that do not exist (see missing pages). That weakens free→paid routes and risks 404s.

---

## D) Internal Linking & Cannibalisation

### Internal linking map (current)
- **Central link sets:** `src/lib/seo/internal-links.ts` defines product/tool/blog/landing link groups used by template pages, product pages, and tools.
- **Product pages** link to tools, blog guides, and landing pages via `RelatedLinks`.
- **Template pages** link to products, tools, and Ask Heaven (compliance links).
- **Tools** link to products (upsell CTAs) and blogs using link groups.
- **Blog posts** include “Next Steps” CTAs that route to products and validators based on tags/slug; some links are to missing validators (`/tools/validators/tenancy-agreement`, `/tools/validators/wales-notice`, `/tools/validators/scotland-notice-to-leave`, `/tools/validators/money-claim`).

### Cannibalisation clusters (observed)
1. **Section 21 cluster**
   - Pages: `/section-21-notice-template`, `/tools/free-section-21-notice-generator`, `/tools/validators/section-21`, `/products/notice-only`, plus blog posts like `what-is-section-21-notice`, `section-21-vs-section-8`, `how-to-serve-eviction-notice`.
   - Risk: multiple pages target “Section 21 notice/template/validity” terms.
   - Suggested hierarchy (for future action):
     - Primary commercial: `/products/notice-only`.
     - Primary free landing: `/section-21-notice-template`.
     - Supportive: `/tools/free-section-21-notice-generator`, `/tools/validators/section-21`, blog posts.

2. **Section 8 cluster**
   - Pages: `/section-8-notice-template`, `/tools/free-section-8-notice-generator`, `/tools/validators/section-8`, `/products/complete-pack`, blog posts such as `section-21-vs-section-8`, `england-section-8-*`.
   - Risk: template vs validator vs blog content overlap.
   - Suggested hierarchy: `/products/complete-pack` (paid), `/section-8-notice-template` (free), then tool + blog support.

3. **Eviction guide cluster**
   - Pages: `/how-to-evict-tenant` vs multiple blog “how to” posts (eviction timeline, serving notices, etc.).
   - Risk: multiple generic “evict tenant UK” guides.
   - Suggested hierarchy: `/how-to-evict-tenant` as the canonical “pillar” guide; blog posts focus on sub-topics.

4. **Rent arrears / money claim cluster**
   - Pages: `/money-claim-unpaid-rent`, `/tools/rent-arrears-calculator`, `/tools/free-rent-demand-letter`, `/rent-arrears-letter-template`, `/products/money-claim`, and blog posts on rent arrears/MCOL.
   - Suggested hierarchy: `/products/money-claim` for commercial, `/money-claim-unpaid-rent` as informational pillar; tools and templates as supporting utility pages.

5. **Tenancy agreement cluster**
   - Pages: `/products/ast`, `/tenancy-agreement-template`, `/tenancy-agreements/{england,wales,scotland,northern-ireland}`, blog posts about AST/PRT/occupation contracts.
   - Risk: multiple overlapping tenancy agreement landing pages.
   - Suggested hierarchy: `/products/ast` as commercial hub; jurisdiction pages as authoritative region-specific; template page as free lead-in.

---

## E) Outputs & Findings

### What exists today (confirmed)
- Full set of paid product pages for eviction packs, money claim, and tenancy agreements.
- Free tools suite with generators, validators (England only), calculator, and checker.
- Ask Heaven Q&A tool with structured data and internal routing.
- Multiple long-tail landing pages (Section 21/8 templates, eviction template, rent arrears letter, tenancy agreement template, jurisdiction-specific guides).
- Blog index + dynamic blog posts stored in code (`src/lib/blog/posts.tsx`).

### What’s missing (confirmed)
Missing routes referenced in code (sitemap + blog CTAs) but **no pages exist** in `src/app`:
- `/tools/validators/wales-notice`
- `/tools/validators/scotland-notice-to-leave`
- `/tools/validators/tenancy-agreement`
- `/tools/validators/money-claim`

These missing pages appear in `validatorToolRoutes` and blog “Next Steps” CTAs, causing internal-link dead ends.

### Priority-ranked findings
1. **Fix internal-link dead ends (P0)**: validators referenced across sitemap and blog CTAs do not exist, potentially causing crawl errors and weakening funnel flows.
2. **Add canonicals to high-intent templates (P0)**: eviction template + Section 21/8 templates + rent arrears + tenancy template + Section 21 ban should explicitly set canonical URLs.
3. **Align canonical/OG coverage on jurisdiction tenancy pages (P1)**: add canonical alternates for `/tenancy-agreements/*` pages.
4. **Clarify cannibalisation hierarchy (P1)**: explicitly define which pages are “primary” vs “support” in Section 21/8, eviction, and rent arrears clusters (future internal link + canonical strategy).

---

## Appendix: Supporting Sources
- Routes + sitemap: `src/app/sitemap.ts`
- Blog posts + categories: `src/lib/blog/posts.tsx`, `src/lib/blog/categories.ts`
- Tools list + validator routes: `src/lib/tools/tools.ts`
- Internal links map: `src/lib/seo/internal-links.ts`
