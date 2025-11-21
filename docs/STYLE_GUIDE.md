# 🎨 LANDLORD HEAVEN - STYLE GUIDE

**Version:** 1.0  
**Date:** November 2024  
**Inspired by:** PandaDoc's clean, modern, spacious design

---

## 🎯 DESIGN PHILOSOPHY

> "Professional, approachable, and confidence-inspiring. Make legal documents feel accessible, not intimidating."

### Core Principles:

1. **Spacious & Clean** - Generous whitespace, never cramped
2. **Bold & Clear** - Strong typography, obvious actions
3. **Mobile-First** - Touch-friendly, responsive always
4. **Trustworthy** - Professional but not stuffy
5. **Human** - Conversational, friendly, empathetic

---

## 🎨 COLOR PALETTE

### Primary Colors

```css
/* Landlord Heaven Green - Primary Brand */
--primary: #10b981; /* Emerald 500 - Trust, growth, success */
--primary-dark: #059669; /* Emerald 600 - Hover states */
--primary-light: #34d399; /* Emerald 400 - Accents */
--primary-subtle: #d1fae5; /* Emerald 100 - Backgrounds */

/* Deep Charcoal - Headlines & Important Text */
--charcoal: #1f2937; /* Gray 800 - Strong contrast */
--charcoal-light: #374151; /* Gray 700 - Body text */
```

### Secondary Colors

```css
/* Indigo - Interactive Elements */
--secondary: #6366f1; /* Indigo 500 - Links, actions */
--secondary-dark: #4f46e5; /* Indigo 600 - Hover */
--secondary-light: #a5b4fc; /* Indigo 300 - Subtle highlights */

/* Amber - Warnings & Attention */
--warning: #f59e0b; /* Amber 500 - Important notices */
--warning-light: #fef3c7; /* Amber 100 - Warning backgrounds */
```

### Status Colors

```css
/* Success */
--success: #10b981; /* Emerald 500 - Same as primary */
--success-bg: #d1fae5; /* Emerald 100 */

/* Error */
--error: #ef4444; /* Red 500 - Errors, destructive */
--error-bg: #fee2e2; /* Red 100 */

/* Info */
--info: #3b82f6; /* Blue 500 - Information */
--info-bg: #dbeafe; /* Blue 100 */
```

### Neutral Colors

```css
/* Grays for UI */
--gray-50: #f9fafb; /* Page backgrounds */
--gray-100: #f3f4f6; /* Card backgrounds */
--gray-200: #e5e7eb; /* Borders */
--gray-300: #d1d5db; /* Disabled states */
--gray-400: #9ca3af; /* Placeholder text */
--gray-500: #6b7280; /* Secondary text */
--gray-600: #4b5563; /* Body text */
--gray-700: #374151; /* Dark body text */
--gray-800: #1f2937; /* Headlines */
--gray-900: #111827; /* Extra dark text */

/* Pure */
--white: #ffffff;
--black: #000000;
```

---

## 🔤 TYPOGRAPHY

### Font Families

```css
/* Primary Font: Inter */
--font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Monospace: For code, data, legal refs */
--font-mono: "JetBrains Mono", "Fira Code", "Courier New", monospace;
```

**Why Inter?**

- Clean, modern, professional
- Excellent readability at all sizes
- Strong x-height for mobile
- Free & open source

### Type Scale

```css
/* Display - Hero Headlines */
--text-6xl: 3.75rem; /* 60px - Hero */
--text-5xl: 3rem; /* 48px - Page hero */
--text-4xl: 2.25rem; /* 36px - Section headers */

/* Headlines */
--text-3xl: 1.875rem; /* 30px - H1 */
--text-2xl: 1.5rem; /* 24px - H2 */
--text-xl: 1.25rem; /* 20px - H3 */
--text-lg: 1.125rem; /* 18px - H4, Large body */

/* Body */
--text-base: 1rem; /* 16px - Body text */
--text-sm: 0.875rem; /* 14px - Secondary text */
--text-xs: 0.75rem; /* 12px - Captions, legal */

/* Mobile Adjustments */
@media (max-width: 768px) {
  --text-6xl: 2.5rem; /* 40px */
  --text-5xl: 2rem; /* 32px */
  --text-4xl: 1.75rem; /* 28px */
}
```

### Font Weights

```css
--font-light: 300; /* Rare use, large text only */
--font-normal: 400; /* Body text */
--font-medium: 500; /* Emphasis, buttons */
--font-semibold: 600; /* Subheadings */
--font-bold: 700; /* Headlines */
--font-extrabold: 800; /* Hero text, major CTAs */
```

### Line Heights

```css
--leading-tight: 1.2; /* Headlines */
--leading-snug: 1.375; /* Large body */
--leading-normal: 1.5; /* Body text */
--leading-relaxed: 1.625; /* Long-form content */
--leading-loose: 2; /* Spaced captions */
```

---

## 🧩 COMPONENTS

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  /* Minimum touch target: 44x44px */
  min-height: 44px;
  min-width: 120px;
}

.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--charcoal);
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 2px solid var(--gray-300);
  cursor: pointer;
  transition: all 150ms ease;
  min-height: 44px;
}

.btn-secondary:hover {
  border-color: var(--gray-400);
  background: var(--gray-50);
}

/* Large Button (Hero CTA) */
.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 0.75rem;
  min-height: 56px;
}
```

### Cards

```css
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--charcoal);
  margin-bottom: 0.75rem;
}

.card-body {
  font-size: 1rem;
  color: var(--gray-600);
  line-height: 1.5;
}
```

### Input Fields

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--gray-800);
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: 0.5rem;
  transition: all 150ms ease;
  min-height: 44px;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input:disabled {
  background: var(--gray-100);
  color: var(--gray-400);
  cursor: not-allowed;
}

.input-error {
  border-color: var(--error);
}

/* Input Label */
.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

/* Input Helper Text */
.input-help {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-top: 0.5rem;
}

.input-error-message {
  font-size: 0.875rem;
  color: var(--error);
  margin-top: 0.5rem;
}
```

---

## 📏 SPACING & LAYOUT

### Spacing Scale

```css
/* Tailwind-inspired 4px base */
--space-0: 0;
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
```

### Container Widths

```css
/* Max Content Widths */
--container-sm: 640px; /* Single column content */
--container-md: 768px; /* Forms, narrow content */
--container-lg: 1024px; /* Standard pages */
--container-xl: 1280px; /* Wide layouts */
--container-2xl: 1536px; /* Max width (rare) */
```

---

## 🎭 SHADOWS

```css
/* Elevation Scale */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.15);

/* Interactive Shadow */
--shadow-focus: 0 0 0 3px rgba(16, 185, 129, 0.1);
--shadow-error: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First Approach */
--breakpoint-sm: 640px; /* Large phone */
--breakpoint-md: 768px; /* Tablet */
--breakpoint-lg: 1024px; /* Small laptop */
--breakpoint-xl: 1280px; /* Desktop */
--breakpoint-2xl: 1536px; /* Large desktop */

/* Usage */
@media (min-width: 768px) {
  /* Tablet and up */
}

@media (min-width: 1024px) {
  /* Desktop and up */
}
```

---

## ✅ ACCESSIBILITY

### Focus States

```css
*:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Color Contrast

- **Body text:** Minimum 4.5:1 contrast ratio
- **Large text (18px+):** Minimum 3:1 contrast ratio
- **Interactive elements:** Minimum 3:1 contrast ratio

### Touch Targets

- **Minimum size:** 44x44px (iOS) / 48x48px (Android)
- **Spacing:** Minimum 8px between targets

---

## 🎯 HMO PRO BADGE

```css
/* HMO Pro Badge (Subscription indicator) */
.hmo-pro-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.hmo-pro-badge::before {
  content: "⭐";
}
```

---

## 📦 USAGE GUIDELINES

### DO's ✅

- Use generous whitespace
- Stick to the color palette
- Use Inter font family
- Follow mobile-first approach
- Maintain 44px minimum touch targets
- Use semantic HTML
- Include alt text for images
- Test with screen readers
- Ensure 4.5:1 contrast ratios

### DON'Ts ❌

- Don't use colors outside the palette
- Don't use fonts other than Inter
- Don't ignore mobile experience
- Don't make touch targets < 44px
- Don't use color alone to convey info
- Don't forget focus states
- Don't use low-contrast text
- Don't create complex layouts on mobile

---

**END OF STYLE GUIDE**

This guide ensures consistent, professional, and accessible design across all Landlord Heaven touchpoints.
