# Commercial Linking System

## Overview

The Commercial Linking System automatically enforces site-wide internal linking to ensure that any page discussing core commercial topics links to the appropriate product page. This centralizes internal link equity to our four most important commercial endpoints.

## Core Product Pages (Locked Targets)

These are the PRIMARY commercial destinations. All internal authority should flow to these pages:

| Intent | Target URL | Allowed Jurisdictions |
|--------|------------|----------------------|
| Tenancy Agreements | `/products/ast` | All UK (England, Wales, Scotland, NI) |
| Eviction Notices | `/products/notice-only` | England, Wales, Scotland |
| Eviction Packs/Bundles | `/products/complete-pack` | England only |
| Money Claims | `/products/money-claim` | England only |

## How It Works

### 1. Content Analysis

When a page renders, the system analyzes:
- Page pathname
- Metadata (title, description)
- First H1/heading
- Body text (fallback, limited)

### 2. Intent Detection

The system detects commercial intent based on keyword matching:

**Tenancy Agreement Intent:**
- tenancy agreement, AST, assured shorthold tenancy
- PRT, private residential tenancy
- occupation contract, tenancy template

**Eviction Notice Intent:**
- eviction notice, Section 21, Section 8
- notice to leave, Section 173
- possession notice, evict tenant

**Eviction Pack Intent:**
- eviction pack, eviction bundle
- complete eviction, court bundle
- N5B form, accelerated possession

**Money Claim Intent:**
- money claim, rent arrears
- MCOL, county court claim
- N1 form, recover rent

### 3. Jurisdiction Enforcement

The system detects jurisdiction from content and enforces strict rules:

| Jurisdiction | Tenancy | Eviction Notice | Eviction Pack | Money Claim |
|--------------|---------|-----------------|---------------|-------------|
| England | Yes | Yes | Yes | Yes |
| Wales | Yes | Yes | No | No |
| Scotland | Yes | Yes | No | No |
| Northern Ireland | Yes | No* | No | No |

*For Northern Ireland eviction pages, a disclaimer is shown instead of CTAs.

### 4. CTA Rendering

If commercial intent is detected and allowed for the jurisdiction, the system renders contextual CTAs using the `<CommercialWizardLinks>` component.

## File Structure

```
src/
├── lib/seo/
│   ├── commercial-linking.ts      # Core configuration & detection
│   └── blog-commercial-linking.ts # Blog-specific helpers
├── components/seo/
│   ├── CommercialWizardLinks.tsx  # CTA component
│   ├── ContentLinker.tsx          # Wrapper component
│   └── index.ts                   # Exports
└── lib/seo/__tests__/
    └── commercial-linking.test.ts # Automated tests
```

## Usage

### In Server Components (Recommended)

```tsx
import { analyzeContent } from '@/lib/seo/commercial-linking';
import { CommercialWizardLinks } from '@/components/seo';

export default function MyPage() {
  const result = analyzeContent({
    pathname: '/blog/my-post',
    title: 'My Page Title',
    description: 'Page description',
  });

  return (
    <div>
      <CommercialWizardLinks
        result={result}
        variant="inline"
        maxLinks={2}
      />
      {/* Page content */}
    </div>
  );
}
```

### In Client Components

```tsx
'use client';

import { useCommercialLinking, CommercialWizardLinks } from '@/components/seo';

function MyComponent({ pathname, title }) {
  const result = useCommercialLinking({
    pathname,
    title,
    description: 'Description',
  });

  return <CommercialWizardLinks result={result} variant="card" />;
}
```

### Using ContentLinker Wrapper

```tsx
import { ContentLinker } from '@/components/seo';

<ContentLinker
  pathname="/blog/post"
  title="Post Title"
  variant="inline"
  position="before"
>
  <article>{content}</article>
</ContentLinker>
```

## Component Variants

The `CommercialWizardLinks` component supports these variants:

| Variant | Use Case |
|---------|----------|
| `card` | Large prominent cards for main content areas |
| `inline` | Compact boxes within prose content |
| `sidebar` | For sticky sidebars |
| `minimal` | Just text links |

## Anchor Text (Strict Rules)

These anchor texts are locked and should NOT be changed:

- **Tenancy:** "Create a legally valid tenancy agreement"
- **Eviction Notice:** "Create a legally compliant eviction notice"
- **Eviction Pack:** "Get the full eviction pack (England)"
- **Money Claim:** "Claim rent arrears through the county court (England)"

Never use generic phrases like "Learn More" or "Click Here".

## Eligible Pages

Commercial linking is applied to:
- `/blog/*` - Blog posts
- `/ask-heaven` - Q&A page
- `/tools/*` - Free tools
- `/guides/*` - Guides
- `/how-to-*` - How-to pages

## Excluded Pages

Commercial linking is NOT applied to:
- `/products/*` - Product pages themselves
- `/wizard/*` - Checkout flow
- `/auth/*` - Authentication
- `/dashboard/*` - User dashboard
- `/checkout`, `/payment`, `/success`
- `/privacy`, `/terms`, `/legal`

## Opting Out

For edge cases, pass `optOut: true`:

```tsx
analyzeContent({
  pathname: '/special-page',
  optOut: true,
});
```

## Testing

Tests are located at `src/lib/seo/__tests__/commercial-linking.test.ts`.

Run tests:
```bash
npm test -- commercial-linking
```

The tests enforce:
1. Pages mentioning core terms link to appropriate products
2. Jurisdiction rules are never violated
3. Northern Ireland never links to eviction products
4. Scotland/Wales never link to complete-pack or money-claim
5. Product pages never have commercial links

## Anti-Cannibalization

If a page is NOT one of the 4 core product pages but targets similar head terms:
- It MUST link OUT to the appropriate wizard page
- It must NOT compete with the product page for the same term

## Maintenance

### Adding New Keywords

Edit `KEYWORD_GROUPS` in `src/lib/seo/commercial-linking.ts`:

```typescript
{
  intent: 'eviction_notice',
  keywords: [
    'eviction notice',
    'section 21',
    // Add new keywords here
  ],
  phrases: [...],
  pathPatterns: [...],
}
```

### Adding New Jurisdictions

This requires careful consideration. Contact SEO team first.

### Changing Product URLs

Update `COMMERCIAL_LINK_TARGETS` - these are the source of truth.

## Troubleshooting

### Links not showing

1. Check if path is eligible (`isEligiblePath`)
2. Check if intent was detected (`detectIntent`)
3. Check if link is allowed for jurisdiction (`isLinkAllowed`)
4. Check for opt-out flag

### Wrong jurisdiction detected

Override with explicit jurisdiction:

```tsx
analyzeContent({
  pathname: '/page',
  jurisdiction: 'scotland',
});
```

### Tests failing

Run the full test suite and check which assertions fail:

```bash
npm test -- commercial-linking.test.ts --reporter=verbose
```

## SEO Impact

This system ensures:
1. Core product pages receive maximum internal link equity
2. Every relevant content page links to the appropriate commercial endpoint
3. Google understands the site hierarchy and commercial intent
4. No jurisdiction-inappropriate links that could harm trust
