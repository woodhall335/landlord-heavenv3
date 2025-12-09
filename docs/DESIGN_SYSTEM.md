# Landlord Heaven - Design System Documentation

**Version:** 1.0
**Last Updated:** December 2025
**Status:** Production Ready

## Overview

The Landlord Heaven design system is inspired by PandaDoc's modern, professional aesthetic with a focus on lilac/purple branding for the "Ask Heaven" AI features. This system ensures consistency across all pages, components, and user interfaces.

## Design Philosophy

- **Professional yet Approachable**: Clean, modern design that inspires confidence
- **Generous Whitespace**: PandaDoc-style spacing for breathing room
- **Lilac/Purple Primary**: Ask Heaven AI branding with gradient hero sections
- **Court-Ready Aesthetics**: Professional design suitable for legal documents
- **Mobile-First**: Responsive design that works beautifully on all devices

---

## Color Palette

### Primary Colors (Lilac/Purple - Ask Heaven Branding)

```
primary-50:  #faf5ff  // Lightest lilac - backgrounds
primary-100: #f3e8ff  // Light lilac - subtle backgrounds
primary-200: #e9d5ff  // Lilac - borders, accents
primary-300: #d8b4fe
primary-400: #c084fc
primary-500: #a855f7  // MAIN BRAND COLOR
primary-600: #9333ea  // Hover states
primary-700: #7e22ce
primary-800: #6b21a8
primary-900: #581c87  // Darkest purple
```

**Usage:**
- Hero sections: `bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700`
- Buttons: `bg-primary-600 hover:bg-primary-700`
- Accents: `text-primary-600`
- Focus rings: `focus:ring-primary-200`

### Secondary Colors (Emerald Green - Success/Completion)

```
secondary-50:  #ECFDF5
secondary-100: #D1FAE5
secondary-200: #A7F3D0
secondary-500: #00A36C  // PandaDoc emerald green
secondary-600: #008C5C  // Hover state
```

**Usage:**
- Success messages
- Completed states
- Positive indicators

### Background Colors

```
lavender-50:  #FDFCFF  // Lightest lavender
lavender-100: #F3F1FF  // Light purple hero backgrounds
lavender-200: #E9E5FF  // Lavender sections

cream-50:  #FDFCFA
cream-100: #F9F7F4  // Beige/cream alternating sections
```

**Usage:**
- Hero sections (secondary variant): `bg-gradient-to-r from-lavender-100 to-lavender-200`
- Alternating sections: `bg-cream-100`

### Status Colors

```
success-500: #10b981  // Green for success
warning-500: #f59e0b  // Amber for warnings
error-500:   #ef4444  // Red for errors
```

### Neutrals (Gray Scale)

```
gray-50:  #f9fafb  // Page backgrounds
gray-100: #f3f5f6  // Card backgrounds
gray-200: #e5e7eb  // Borders
gray-300: #c8cfd3  // Disabled states
gray-500: #6b7280  // Secondary text
gray-600: #4b5563  // Body text
gray-700: #374151  // Dark body text
gray-800: #242424  // Headlines
gray-900: #111827  // Extra dark text
```

---

## Typography

### Font Families

```typescript
sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif']
display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
mono:    ['JetBrains Mono', 'Fira Code', 'monospace']
```

### Font Sizes

```
6xl:  4rem (64px)     // Hero headlines
5xl:  3.5rem (56px)   // Page hero
4xl:  2.5rem (40px)   // Section headers
3xl:  2rem (32px)     // H1
2xl:  1.625rem (26px) // H2
xl:   1.375rem (22px) // H3
lg:   1.125rem (18px) // H4, large body
base: 1rem (16px)     // Body text
sm:   0.875rem (14px) // Secondary text
xs:   0.75rem (12px)  // Captions, legal text
```

### Font Weights

```
light:     300  // Rare use, large text only
normal:    400  // Body text
medium:    500  // Emphasis, buttons
semibold:  600  // Subheadings, navigation
bold:      700  // Headlines
extrabold: 800  // Hero text, major CTAs
black:     900  // Maximum impact
```

### Line Heights

```
tight:   1.2    // Headlines
snug:    1.375  // Subheadings
normal:  1.5    // Body text
relaxed: 1.625  // Long-form content
loose:   1.75   // Legal text, disclaimers
```

---

## Spacing

### Semantic Spacing

```
hero:    5rem (80px)   // Hero section padding
section: 4rem (64px)   // Between major sections
card:    1.5rem (24px) // Inside cards
element: 1rem (16px)   // Between elements
```

### Usage Examples

```tsx
// Hero section
<section className="py-hero">

// Section spacing
<div className="py-section">

// Card padding
<div className="p-card">
```

---

## Border Radius

```
sm:   0.375rem (6px)
md:   0.5rem (8px)
lg:   0.75rem (12px)
xl:   1rem (16px)
2xl:  1.5rem (24px)
full: 9999px (fully rounded)
```

**Standard Usage:**
- Buttons: `rounded-xl` (16px)
- Cards: `rounded-2xl` (24px)
- Inputs: `rounded-lg` (12px)

---

## Shadows

```
sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
md:  0 4px 6px -1px rgb(0 0 0 / 0.1)
lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
xl:  0 20px 25px -5px rgb(0 0 0 / 0.1)
2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

**Usage:**
- Cards: `shadow-md hover:shadow-lg`
- Elevated buttons: `shadow-xl`
- Hero cards: `shadow-2xl`

---

## Components

### Hero Component

The `Hero` component provides consistent hero sections across all pages.

**Variants:**
- `primary`: Gradient purple background (default)
- `secondary`: Light lavender background (for tools/utility pages)
- `gradient`: Full gradient purple background

**Example:**

```tsx
import { Hero } from '@/components/ui/Hero';

<Hero
  badge="Powered by Ask Heaven AI"
  title="Legal Documents for UK Landlords"
  description="Generate court-ready notices in minutes"
  ctaText="Get Started"
  ctaHref="/products/notice-only"
  secondaryCtaText="View Pricing"
  secondaryCtaHref="/pricing"
  variant="primary"
/>
```

### FeatureCard Component

Reusable card for displaying features, tools, or services.

**Example:**

```tsx
import { FeatureCard } from '@/components/ui/FeatureCard';

<FeatureCard
  icon={<ScaleIcon className="h-6 w-6" />}
  title="Free Section 21 Generator"
  description="Generate a basic Section 21 notice template"
  href="/tools/free-section-21-notice-generator"
/>
```

### FreeToolLayout Component

Wrapper layout for all free tools with consistent structure.

**Example:**

```tsx
import { FreeToolLayout } from '@/components/tools/FreeToolLayout';

<FreeToolLayout
  title="Free Section 21 Notice Generator"
  description="Generate a basic Section 21 notice template"
  paidVersion={{
    price: '£14.99',
    features: ['Court-ready formatting', 'AI validation', ...],
    href: '/products/notice-only?product=section21'
  }}
>
  <YourToolForm />
</FreeToolLayout>
```

---

## Button Styles

### Primary Button

```tsx
<button className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white transition-all duration-250 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200">
  Get Started
</button>
```

### Secondary Button

```tsx
<button className="inline-flex items-center justify-center rounded-xl border-2 border-primary-600 bg-white px-6 py-3 text-base font-semibold text-primary-600 transition-all duration-250 hover:bg-primary-50 focus:ring-4 focus:ring-primary-200">
  Learn More
</button>
```

### Ghost Button

```tsx
<button className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-primary-600 transition-all duration-250 hover:bg-primary-50 focus:ring-4 focus:ring-primary-200">
  View Details
</button>
```

---

## Form Inputs

### Text Input

```tsx
<input
  type="text"
  className="block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all duration-250 focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
  placeholder="Enter text"
/>
```

### Error State Input

```tsx
<input
  type="text"
  className="block w-full rounded-lg border border-error-500 px-4 py-3 transition-all duration-250 focus:border-error-500 focus:ring-4 focus:ring-error-200"
/>
```

---

## Grid System

### Container

```tsx
<div className="mx-auto max-w-7xl px-6 lg:px-8">
  {/* Content */}
</div>
```

### Column Layouts

```tsx
// 3-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// 2-column split
<div className="grid lg:grid-cols-2 gap-8">
  {/* Content */}
</div>
```

---

## Accessibility

### Focus States

All interactive elements must have visible focus states using `focus:ring-4 focus:ring-primary-200`.

### Minimum Touch Targets

- All buttons: minimum 44px × 44px
- Interactive elements: minimum 44px × 44px

### Color Contrast

- Text on white: minimum 4.5:1 contrast ratio
- Large text (18px+): minimum 3:1 contrast ratio

---

## Responsive Breakpoints

```
sm:  640px   // Small tablets
md:  768px   // Tablets
lg:  1024px  // Laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large desktops
```

---

## Animation

### Transition Duration

Default: `250ms` (use `transition-all duration-250`)

### Common Animations

```tsx
// Fade in
<div className="opacity-0 animate-fadeIn">

// Slide up
<div className="translate-y-4 opacity-0 animate-slideUp">

// Scale in
<div className="scale-95 opacity-0 animate-scaleIn">

// Hover scale
<div className="transition-transform hover:scale-105">
```

---

## Z-Index Scale

```
base:     0   // Default layer
dropdown: 10  // Dropdown menus
sticky:   20  // Sticky headers
modal:    30  // Modal overlays
popover:  40  // Popovers
tooltip:  50  // Tooltips (highest)
```

---

## Best Practices

### DO ✓

- Use consistent spacing from the design system
- Apply generous whitespace (PandaDoc-style)
- Use primary purple for Ask Heaven AI features
- Maintain 4.5:1 contrast ratio for text
- Use semantic HTML elements
- Test on mobile devices

### DON'T ✗

- Create custom colors outside the palette
- Use inline styles
- Mix multiple button variants on the same page
- Ignore focus states
- Use colors with insufficient contrast
- Skip responsive testing

---

## Quick Reference

### Common Patterns

**Hero Section:**
```tsx
<Hero variant="primary" badge="Feature" title="..." description="..." ctaText="..." ctaHref="..." />
```

**Card Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <FeatureCard icon={...} title="..." description="..." href="..." />
</div>
```

**Section Spacing:**
```tsx
<section className="bg-gray-50 py-section">
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    {/* Content */}
  </div>
</section>
```

---

## Implementation Files

- **Design System Config**: `src/styles/design-system.ts`
- **Tailwind Config**: `tailwind.config.ts`
- **Hero Component**: `src/components/ui/Hero.tsx`
- **FeatureCard Component**: `src/components/ui/FeatureCard.tsx`
- **FreeToolLayout**: `src/components/tools/FreeToolLayout.tsx`

---

## Version History

- **v1.0** (December 2025): Initial design system with PandaDoc-inspired lilac/purple branding
