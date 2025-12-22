# Assets Audit

**Date:** 2025-12-22
**Purpose:** Document how assets are used in the application.

---

## 1. Directory Structure

### No `src/components/assets` Directory

The application does **NOT** have a dedicated component-based assets directory at `src/components/assets`.

### Public Directory (`/public`)

All static assets are served from the `/public` directory:

```
/public
├── logo.png           (~29.8 KB) - Main header logo
├── headerlogo.png     (~9 KB)    - Header alternative
├── footerlogo.png     (~8.3 KB)  - Footer branding
├── favicon.png        (~9.6 KB)  - Browser tab icon
├── gb-eng.svg         (176 B)    - England flag icon
├── gb-wls.svg         (192 B)    - Wales flag icon
├── gb-sct.svg         (192 B)    - Scotland flag icon
├── gb-nir.svg         (~55 KB)   - Northern Ireland flag icon
├── lgb.svg            (553 B)    - UK coverage badge
├── globe.svg          (1 KB)     - Globe icon
├── file.svg           (391 B)    - File/document icon
├── window.svg                    - Window icon
├── next.svg                      - Next.js logo
├── vercel.svg                    - Vercel logo
└── official-forms/               - Official form PDFs and manifests
```

---

## 2. Import Patterns

### Standard Pattern

All images use the Next.js `Image` component:

```typescript
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Landlord Heaven"
  width={280}
  height={50}
  className="h-10 w-auto"
/>
```

### Priority Optimization (LCP Images)

Only critical above-the-fold images use `priority`:

```typescript
<Image
  src="/logo.png"
  alt="..."
  width={280}
  height={50}
  priority
  className="h-10 w-auto"
/>
```

### Small Icons

```typescript
<Image
  src="/gb-eng.svg"
  alt="England"
  width={16}
  height={16}
  className="w-4 h-4"
/>
```

---

## 3. Files Using Images

| File | Images Used |
|------|-------------|
| `src/components/layout/Footer.tsx` | Footer logo + regional icons (5 images) |
| `src/components/ui/NavBar.tsx` | Header logo with priority optimization |
| `src/components/ui/TestimonialCard.tsx` | Optional avatar images |
| `src/app/about/page.tsx` | Regional icons (4 images) |
| `src/app/help/page.tsx` | Regional icons (4 images) |
| `src/app/products/notice-only/page.tsx` | Regional icons + coverage icon |
| `src/app/products/complete-pack/page.tsx` | Coverage icon |
| `src/app/products/ast/page.tsx` | Regional icons (4 images) + coverage icon |
| `src/app/wizard/page.tsx` | Image component imported |

---

## 4. Notable Patterns

### What IS Used:
- `next/image` component for all images
- Static file paths from `/public` directory (e.g., `/logo.png`)
- Responsive sizing with Tailwind classes
- Semantic alt text on all images

### What is NOT Used:
- No inline SVG components
- No SVGR or other SVG loaders
- No CSS-in-JS background images
- No dynamic SVG imports
- No custom SVG component wrappers

---

## 5. Next.js Configuration

The `next.config.ts` has **no custom Image configuration**, using Next.js defaults for:
- Automatic image optimization
- WebP format conversion
- Responsive image serving
- On-demand image optimization

---

## 6. Relevance to Current Task

For the watermark removal task:
- **No SVG watermark assets exist** in `/public`
- **All watermarks are code-generated** (CSS injection or PDF-lib drawing)
- **No image-based watermarks** to remove from asset directories
