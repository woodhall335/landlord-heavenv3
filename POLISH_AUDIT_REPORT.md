# UI/UX Polish Audit Report
## Landlord Heaven - Full-Site Design System Consistency Analysis

**Date:** January 2026
**Auditor:** Claude Code
**Scope:** All major page types, shared components, styling patterns

---

## Executive Summary

### Overall Visual Score: **6.5/10**

**Reasons:**
- **Strengths:** Solid color palette (#7C3AED primary), good typography foundations, well-structured design-system.ts file, consistent hero button CSS classes
- **Weaknesses:** Significant component drift across 4+ hero implementations, 5+ button patterns, 16+ card patterns; inconsistent spacing system; mixed border radius usage; form input focus states vary significantly
- **Opportunity:** The design system file exists but is underutilized—components implement their own styling rather than consuming the defined tokens

---

## Top 10 Issues by Impact

### 1. **Hero Component Fragmentation** (HIGH IMPACT)
**Files:** `src/components/ui/Hero.tsx`, `src/components/ui/HeroSection.tsx`, `src/components/ui/TealHero.tsx`, `src/components/marketing/Hero.tsx`, + 15+ inline implementations
**Problem:** 4 different hero components plus inline implementations in pages. Typography sizes range from `text-4xl` to `text-7xl`, padding varies from `pb-16` to `pb-36`.
**Impact:** Visual inconsistency across landing pages creates "different site" feel.

### 2. **Button Styling Chaos** (HIGH IMPACT)
**Files:** `src/components/ui/Button.tsx`, `src/app/globals.css` (hero-btn-*), inline Tailwind in 20+ files
**Problem:** 5 distinct button patterns - Button component rarely used on marketing pages; `.hero-btn-primary` CSS class used in 82 places; inline Tailwind buttons with different hover behaviors (inverted vs opacity vs scale).
**Impact:** CTA hierarchy unclear; hover states unpredictable.

### 3. **Card Border Radius Drift** (MEDIUM-HIGH IMPACT)
**Files:** All card-related components in `src/components/ui/`, `src/components/landing/`, `src/components/blog/`
**Problem:** Base `Card.tsx` uses `rounded-lg` (8px), but 14/16 card implementations use `rounded-2xl` (16px) or `rounded-xl` (12px).
**Impact:** Inconsistent visual weight across the site.

### 4. **Form Input Focus Ring Inconsistency** (MEDIUM IMPACT)
**Files:** `src/components/ui/Input.tsx`, `src/components/wizard/TextInput.tsx`, `src/components/wizard/sections/eviction/*.tsx`
**Problem:** 5 different focus ring patterns: `ring-1` vs `ring-2`, `ring-offset-1` vs no offset, `ring-primary/20` vs `ring-[#7C3AED]` hardcoded, `ring-primary/60` in Ask Heaven.
**Impact:** Accessibility concern; inconsistent feedback for keyboard users.

### 5. **Section Spacing Entropy** (MEDIUM IMPACT)
**Files:** All page files and section components
**Problem:** Section padding varies: `py-16`, `py-20`, `py-24` used interchangeably. Design system defines `spacing.section: 4rem` (py-16) but rarely used.
**Impact:** Uneven visual rhythm between sections.

### 6. **FAQ Implementation Fragmentation** (MEDIUM IMPACT)
**Files:** `src/components/landing/FAQ.tsx`, `src/components/marketing/FAQSection.tsx`, `src/components/value-proposition/JurisdictionAccordion.tsx`, native `<details>` in 15+ pages
**Problem:** 4 different FAQ implementations with different animations, icon libraries (react-icons vs lucide vs text character), and accessibility support.
**Impact:** Inconsistent accordion UX across product pages.

### 7. **Tools Pages Gradient Typo Bug** (MEDIUM IMPACT)
**Files:** `src/app/tools/free-section-21-notice-generator/page.tsx:247`, `src/app/tools/free-rent-demand-letter/page.tsx:384`, `src/app/tools/rent-arrears-calculator/page.tsx:347`
**Problem:** Uses `bg-linear-to-br` (invalid) instead of `bg-gradient-to-br`. May cause styling to fail.
**Impact:** Broken gradient backgrounds on 3 major tool pages.

### 8. **Auth Flow Hero Inconsistency** (MEDIUM IMPACT)
**Files:** `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx` vs `src/app/auth/forgot-password/page.tsx`, `src/app/auth/reset-password/page.tsx`, `src/app/auth/verify-email/page.tsx`
**Problem:** Login/Signup have purple gradient hero sections; password recovery flows have no hero (bare card layout).
**Impact:** Jarring visual transition during auth flow.

### 9. **Shadow System Underutilization** (LOW-MEDIUM IMPACT)
**Files:** CSS variables in `globals.css`, design-system.ts shadows, component implementations
**Problem:** Design system defines `--shadow-card` and `--shadow-card-hover` but components use `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` inconsistently.
**Impact:** Inconsistent depth perception across cards.

### 10. **Typography Weight Inconsistency** (LOW IMPACT)
**Files:** Various page components
**Problem:** H1s use `font-bold` (700), `font-extrabold` (800), or `font-black` (900) inconsistently. Hero titles range from 4xl to 7xl without clear hierarchy.
**Impact:** Subtle visual inconsistency in headline weight.

---

## Quick Wins (1-2 Hours Each)

### QW-1: Fix Gradient Typo Bug
**Files:** 3 tool pages
**Action:** Replace `bg-linear-to-br` with `bg-gradient-to-br`
**Risk:** Low
**Impact:** High (fixes broken styling)

### QW-2: Standardize Hero Section Padding
**Action:** Update all inline hero sections to use `pt-28 pb-16 md:pt-32 md:pb-36`
**Files:** ~15 page files
**Risk:** Low
**Impact:** Medium (consistent hero spacing)

### QW-3: Unify Card Border Radius
**Action:** Update design system to use `rounded-2xl` as standard (since 14/16 cards use it), update base Card.tsx
**Files:** `src/components/ui/Card.tsx`, `src/styles/design-system.ts`
**Risk:** Low
**Impact:** Medium (visual consistency)

### QW-4: Standardize Focus Ring Pattern
**Action:** Create standard focus utility: `focus:ring-2 focus:ring-offset-1 focus:ring-primary/20`
**Files:** Update `Input.tsx`, propagate to wizard inputs
**Risk:** Low
**Impact:** Medium (accessibility improvement)

### QW-5: Add Hero to Auth Recovery Pages
**Action:** Add purple gradient hero section to forgot-password, reset-password, verify-email pages
**Files:** 3 auth page files
**Risk:** Low
**Impact:** Medium (cohesive auth experience)

---

## Medium Wins (Half-Day Each)

### MW-1: Create Unified Hero Component
**Effort:** 4 hours
**Action:** Create single `StandardHero` component that accepts variant prop, deprecate TealHero, consolidate HeroSection
**Files to create:** `src/components/ui/StandardHero.tsx`
**Files to update:** All pages using inline heroes
**Risk:** Medium
**Impact:** High (eliminates hero drift)

### MW-2: Create ToolFormContainer Component
**Effort:** 3 hours
**Action:** Extract common tool page layout (hero + form card + sidebar) into reusable component
**Files to create:** `src/components/tools/ToolFormContainer.tsx`
**Risk:** Low
**Impact:** Medium (DRY tools pages)

### MW-3: Consolidate FAQ Components
**Effort:** 4 hours
**Action:** Use `FAQSection` as single source of truth; add ARIA attributes; standardize icons to Lucide
**Files to update:** All FAQ usages, `JurisdictionAccordion.tsx`
**Risk:** Medium (regression risk in accordions)
**Impact:** Medium (consistent FAQ UX)

### MW-4: Standardize Section Spacing Utility
**Effort:** 2 hours
**Action:** Create `SectionWrapper` component with standardized `py-20 md:py-24` padding
**Files to create:** `src/components/ui/SectionWrapper.tsx`
**Risk:** Low
**Impact:** Medium (visual rhythm)

### MW-5: Button Component Extension
**Effort:** 3 hours
**Action:** Add `asChild` prop to Button.tsx for Link usage; add hero variant matching `.hero-btn-primary` styling
**Files to update:** `src/components/ui/Button.tsx`
**Risk:** Low
**Impact:** High (enables single button component for all uses)

---

## Larger Improvements (1-3 Days Each)

### LI-1: Complete Design Token Migration
**Effort:** 2 days
**Action:** Audit all hardcoded colors (#7C3AED appears 100+ times), replace with Tailwind classes (text-primary, bg-primary)
**Scope:** All component files
**Risk:** Medium
**Impact:** High (maintainable theming)

### LI-2: Card Component System
**Effort:** 1.5 days
**Action:** Create card variants (feature, testimonial, product, blog) using base Card.tsx with consistent shadows, borders, hover effects
**Files to create:** Card variant exports
**Risk:** Medium
**Impact:** High (consistent card styling)

### LI-3: Form Component Unification
**Effort:** 2 days
**Action:** Migrate wizard form sections to use standard Input component; add accessibility attributes (aria-invalid, aria-describedby)
**Scope:** `src/components/wizard/sections/eviction/*.tsx`
**Risk:** High (form regression risk)
**Impact:** High (accessibility, consistency)

### LI-4: Responsive Polish Pass
**Effort:** 1.5 days
**Action:** Add tablet breakpoints (lg:) to key pages; fix Ask Heaven chat height on mobile; improve tap targets
**Scope:** All major pages
**Risk:** Low
**Impact:** Medium (mobile UX improvement)

### LI-5: Loading/Empty State System
**Effort:** 1 day
**Action:** Create consistent skeleton loaders; standardize empty state messaging; add error recovery patterns
**Files to create:** `src/components/ui/Skeleton.tsx`, `src/components/ui/EmptyState.tsx`
**Risk:** Low
**Impact:** Medium (UX polish)

---

## Recommended UI Design System Plan

### 1. Shared Hero Component
**Goal:** Single source of truth for all hero sections

```tsx
// src/components/ui/StandardHero.tsx
interface StandardHeroProps {
  variant?: 'lavender' | 'white' | 'dark';
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  align?: 'center' | 'left';
  size?: 'default' | 'compact';
}
```

**Standards:**
- Background: `bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50`
- Padding: `pt-28 pb-16 md:pt-32 md:pb-36`
- Title: `text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900`
- Badge: `bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-primary`

### 2. Shared Button Styles
**Goal:** Unify hero buttons with component buttons

**Approach:** Extend Button.tsx with additional variants:

```tsx
// Button variants
variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'heroPrimary' | 'heroSecondary'

// heroPrimary matches .hero-btn-primary
// heroPrimary: bg-primary text-white px-8 py-4 rounded-lg border-2 border-primary
//              hover:bg-transparent hover:text-primary
```

**Deprecate:** `.hero-btn-primary`, `.hero-btn-secondary` CSS classes (migrate to component)

### 3. Shared Card Component
**Goal:** Consistent card styling across all uses

```tsx
// src/components/ui/Card.tsx variants
variant: 'default' | 'feature' | 'product' | 'testimonial' | 'blog' | 'elevated'

// Standardized properties:
// - Border radius: rounded-2xl (all variants)
// - Shadow: shadow-sm → hover:shadow-lg
// - Padding: p-6 | p-8 (based on size)
// - Hover: hover:-translate-y-1 transition-all duration-300
```

### 4. Shared FAQ Component
**Goal:** Single accordion pattern

```tsx
// src/components/marketing/FAQSection.tsx (already exists, needs adoption)
interface FAQSectionProps {
  title?: string;
  badge?: string;
  intro?: string;
  faqs: { question: string; answer: string | ReactNode }[];
  showContactCTA?: boolean;
  variant?: 'default' | 'white' | 'gray';
}

// Standards:
// - Icon: ChevronDown from lucide-react (standardize on Lucide)
// - Animation: grid-rows-[1fr]/[0fr] collapse + rotate-180
// - ARIA: aria-expanded on button, aria-controls linking
```

### 5. Shared SectionHeader / Spacing Utilities

```tsx
// src/components/ui/SectionWrapper.tsx
interface SectionWrapperProps {
  children: React.ReactNode;
  variant?: 'default' | 'compact' | 'spacious';
  background?: 'white' | 'gray' | 'cream' | 'lavender';
}

// Spacing standards:
// - default: py-20 md:py-24
// - compact: py-12 md:py-16
// - spacious: py-24 md:py-32

// src/components/ui/SectionHeader.tsx
interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

// Standards:
// - Badge: text-sm font-semibold text-primary mb-4
// - Title: text-3xl md:text-4xl font-bold text-gray-900 mb-4
// - Subtitle: text-lg text-gray-600 max-w-2xl
// - Bottom margin: mb-12 md:mb-14
```

---

## Page-Specific Recommendations

### Homepage (/)
| Issue | Affected Files | Approach | Risk | UX Impact |
|-------|----------------|----------|------|-----------|
| Hero is gold standard | `src/components/landing/HomeContent.tsx` | Keep as reference | N/A | N/A |
| ProductCard uses custom styling | `HomeContent.tsx:ProductCard` | Migrate to Card component | Low | Medium |
| CostComparison gradient cards | `src/components/landing/CostComparison.tsx` | Standardize to Card variants | Low | Medium |

### Pricing (/pricing)
| Issue | Affected Files | Approach | Risk | UX Impact |
|-------|----------------|----------|------|-----------|
| Hero matches homepage | `src/app/pricing/page.tsx` | Keep | N/A | N/A |
| FAQ uses native details | `src/app/pricing/page.tsx` | Migrate to FAQSection | Low | Medium |

### Products (/products/*)
| Issue | Affected Files | Approach | Risk | UX Impact |
|-------|----------------|----------|------|-----------|
| Hero pb-24 vs pb-36 | All product pages | Standardize to pb-36 | Low | Low |
| Inline feature cards | Product pages | Extract to FeatureCard | Low | Medium |
| FAQ uses native details | Product pages | Migrate to FAQSection | Low | Medium |

### Ask Heaven (/ask-heaven)
| Issue | Affected Files | Approach | Risk | UX Impact |
|-------|----------------|----------|------|-----------|
| Chat max-height 400px on mobile | `AskHeavenPageClient.tsx` | Use vh-based height | Low | High |
| Inconsistent CTA button colors | `NextBestActionCard.tsx` | Use primary color for all CTAs | Low | Medium |
| Missing keyboard focus states | Multiple components | Add focus-visible rings | Low | High |
| Email gate no skip option | `AskHeavenPageClient.tsx` | Add "maybe later" option | Medium | High |
| Rounded corner variants (lg/xl/2xl) | Multiple components | Standardize to rounded-xl | Low | Low |

### Tools (/tools/*)
| Issue | Affected Files | Approach | Risk | UX Impact |
|-------|----------------|----------|------|-----------|
| bg-linear-to-br typo | 3 tool pages | Fix to bg-gradient-to-br | Low | High |
| No shared ToolHeroSection | Tool pages | Create component | Low | Medium |
| Inconsistent result display | Tool pages | Create ResultCard component | Low | Medium |
| Warning icon color purple | `free-rent-demand-letter/page.tsx` | Change to text-warning-700 | Low | Low |

### Blog (/blog, /blog/[category], /blog/[slug])
| Issue | Affected Files | Approach | Risk | UX Impact |
|-------|----------------|----------|------|-----------|
| Hero pb-20 vs pb-36 | Blog pages | Standardize to pb-36 | Low | Low |
| BlogCard featured vs standard drift | `src/components/blog/BlogCard.tsx` | Unify border radius | Low | Low |
| Sidebar CTA button styling | `src/components/blog/*.tsx` | Use hero-btn-primary | Low | Medium |

### Auth Pages (/auth/*)
| Issue | Affected Files | Approach | Risk | UX Impact |
|-------|----------------|----------|------|-----------|
| No hero on recovery flows | forgot-password, reset-password, verify-email | Add hero sections | Low | Medium |
| Icon sizing inconsistent (w-8 vs w-10) | Auth pages | Standardize to w-8 h-8 | Low | Low |
| Typography hierarchy broken (2xl-5xl) | Auth pages | Standardize to 3xl md:4xl | Low | Medium |
| Verify email loading state | verify-email page | Add spinner | Low | Low |

### Templates Pages (/section-21-notice-template, etc.)
| Issue | Affected Files | Approach | Risk | UX Impact |
|-------|----------------|----------|------|-----------|
| Inline buttons use rounded-xl | Template pages | Standardize to rounded-lg | Low | Low |
| Uses hover:bg-primary/90 not inverted | Template pages | Align with hero-btn pattern | Low | Low |

---

## Global Components Audit Summary

### NavBar
- **Status:** Clean, wraps NavBar component
- **Issues:** None critical
- **Note:** `.header-login-btn` uses smaller padding (py-3) than hero buttons (py-4)

### Hero Sections
- **Status:** Major drift (4+ components)
- **Priority:** High - consolidate to single StandardHero

### Buttons
- **Status:** 5 patterns in use
- **Priority:** High - extend Button component with hero variants

### Cards
- **Status:** 16+ patterns with border radius drift
- **Priority:** Medium - standardize to rounded-2xl, create variants

### Forms
- **Status:** Focus ring inconsistency
- **Priority:** Medium - standardize focus pattern

### FAQ Sections
- **Status:** 4 implementations
- **Priority:** Medium - adopt FAQSection universally

### Banners
- **Status:** Section 21 banner well-implemented in globals.css
- **Issues:** None critical

---

## Implementation Priority Matrix

```
                    HIGH IMPACT
                         │
    ┌────────────────────┼────────────────────┐
    │ LI-1 Design Tokens │ MW-1 Hero Component│
    │                    │ QW-1 Gradient Fix  │
    │                    │                    │
LOW ├────────────────────┼────────────────────┤ HIGH
EFFORT                   │                    EFFORT
    │ QW-3 Card Radius   │ LI-2 Card System   │
    │ QW-4 Focus Rings   │ LI-3 Form Unify    │
    │ QW-5 Auth Hero     │                    │
    └────────────────────┼────────────────────┘
                         │
                    LOW IMPACT
```

**Recommended Execution Order:**
1. QW-1: Fix gradient typos (immediate, 30 min)
2. QW-4: Standardize focus rings (1 hour)
3. QW-3: Unify card border radius (1 hour)
4. MW-1: Create StandardHero component (4 hours)
5. MW-5: Extend Button component (3 hours)
6. QW-5: Add hero to auth recovery (1 hour)
7. MW-3: Consolidate FAQ components (4 hours)
8. LI-2: Card component system (1.5 days)
9. LI-1: Design token migration (2 days)

---

## Appendix: Component File References

### Hero Components
- `src/components/ui/Hero.tsx`
- `src/components/ui/HeroSection.tsx`
- `src/components/ui/TealHero.tsx`
- `src/components/marketing/Hero.tsx`

### Button Styling
- `src/components/ui/Button.tsx`
- `src/app/globals.css` (lines 136-227)

### Card Components
- `src/components/ui/Card.tsx`
- `src/components/ui/FeatureCard.tsx`
- `src/components/ui/TestimonialCard.tsx`
- `src/components/ui/DashboardCard.tsx`
- `src/components/blog/BlogCard.tsx`
- `src/components/landing/HomeContent.tsx` (ProductCard, JurisdictionCard)
- `src/components/landing/CostComparison.tsx`

### FAQ Components
- `src/components/landing/FAQ.tsx`
- `src/components/marketing/FAQSection.tsx`
- `src/components/value-proposition/JurisdictionAccordion.tsx`

### Form Components
- `src/components/ui/Input.tsx`
- `src/components/wizard/TextInput.tsx`
- `src/components/wizard/DateInput.tsx`
- `src/components/wizard/CurrencyInput.tsx`

### Design System
- `src/styles/design-system.ts`
- `src/app/globals.css`

---

*End of Polish Audit Report*
