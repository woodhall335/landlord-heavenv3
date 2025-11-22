# FULL PLATFORM BUILD - No Shortcuts

## Current Issues to Fix

### 1. Remove "Complete Pack" Concept
- ✅ Deleted `/products/complete-pack` directory
- We're NOT selling packs - we're selling individual document categories

### 2. Remove ALL "30-day money-back guarantee" References
Found in these files (must update ALL):
```
src/app/page.tsx - Homepage
src/app/refunds/page.tsx - Refunds page (maybe delete entirely?)
src/app/pricing/page.tsx - Pricing page
src/app/products/notice-only/page.tsx
src/app/products/money-claim/page.tsx
src/app/wizard/preview/[caseId]/page.tsx
src/app/help/page.tsx
src/app/terms/page.tsx
src/components/layout/Footer.tsx
src/app/contact/page.tsx
src/app/about/page.tsx
```

### 3. Remove ALL AI Mentions Site-Wide
Replace with "Curated by Landlord Heaven" or "Legally compliant"
Found in these files:
```
src/app/page.tsx
src/app/products/ast/page.tsx (DONE)
src/app/tenancy-agreements/[jurisdiction]/page.tsx
All product pages
Homepage
About page
```

---

## Proper Product Structure

### Product Categories (NOT "Complete Packs"):

#### 1. **Tenancy Agreements** ✅ COMPLETE
- England & Wales AST (Standard £39.99 / Premium £59.00)
- Scotland PRT (Standard £39.99 / Premium £59.00)
- Northern Ireland Private Tenancy (Standard £39.99 / Premium £59.00)
- Landing pages: ✅ Created
- Generators: ✅ Created
- Templates: ✅ Created

#### 2. **Eviction Forms** ❌ TO BUILD
```
Products to create:
/products/eviction/section-21 (England & Wales)
/products/eviction/section-8 (England & Wales)
/products/eviction/notice-to-leave (Scotland)
/products/eviction/notice-to-quit (Northern Ireland)

Each needs:
- Product landing page
- Wizard integration
- Handlebars template
- Generator function
- AI-assisted completion (hidden validation)
- Pricing: Individual or bundle pricing

Landing page structure:
/eviction - Main category landing page
/eviction/england-wales - Jurisdiction-specific
/eviction/scotland
/eviction/northern-ireland
```

#### 3. **Legal Proceedings / Court Forms** ❌ TO BUILD
```
Products to create:
/products/legal/possession-claim (England & Wales N5/N5B)
/products/legal/witness-statement
/products/legal/particulars-of-claim
/products/legal/tribunal-application (Scotland)
/products/legal/county-court-claim (Northern Ireland)

Each needs:
- Product landing page
- Wizard integration
- Handlebars template
- AI-assisted completion
- Court-ready validation

Landing page structure:
/legal-proceedings - Main category landing page
/legal-proceedings/possession-claim
/legal-proceedings/witness-statement
etc.
```

#### 4. **Notices** ❌ TO BUILD
```
Products to create:
/products/notices/rent-increase
/products/notices/access-notice
/products/notices/breach-notice
/products/notices/lease-addendum
/products/notices/inventory-report

Landing page structure:
/notices - Main category landing page
/notices/[type]
```

#### 5. **Money Claims** (Already exists but needs update)
```
Current: /products/money-claim
Needs:
- Remove guarantee mentions
- Remove AI mentions
- Update to match new structure
```

---

## Navigation Structure

### Main Navigation:
```
Products (Dropdown):
  ├─ Tenancy Agreements
  │   ├─ England & Wales AST
  │   ├─ Scotland PRT
  │   └─ Northern Ireland
  ├─ Eviction Forms
  │   ├─ Section 21 (England & Wales)
  │   ├─ Section 8 (England & Wales)
  │   ├─ Notice to Leave (Scotland)
  │   └─ Notice to Quit (Northern Ireland)
  ├─ Legal Proceedings
  │   ├─ Possession Claims
  │   ├─ Witness Statements
  │   └─ Court Applications
  ├─ Notices
  │   ├─ Rent Increase Notice
  │   ├─ Access Notice
  │   └─ More...
  └─ Money Claims

Resources (Dropdown):
  ├─ Help Center
  ├─ Guides
  └─ FAQs

Pricing
About
Contact
```

---

## Implementation Priority

### Phase 1: Remove Guarantees & AI Mentions (URGENT)
1. ✅ Remove complete-pack page
2. ❌ Update homepage - remove guarantee, AI mentions
3. ❌ Update pricing page - remove guarantees
4. ❌ Delete or update refunds page
5. ❌ Update footer - remove guarantee badge
6. ❌ Update all product pages
7. ❌ Update wizard preview page
8. ❌ Update help/about/contact/terms pages

### Phase 2: Build Eviction Forms Category
1. ❌ Create `/app/eviction/page.tsx` - Main landing page
2. ❌ Create `/app/eviction/england-wales/page.tsx`
3. ❌ Create `/app/eviction/scotland/page.tsx`
4. ❌ Create `/app/eviction/northern-ireland/page.tsx`
5. ❌ Create `/app/products/eviction/section-21/page.tsx`
6. ❌ Create `/app/products/eviction/section-8/page.tsx`
7. ❌ Create `/app/products/eviction/notice-to-leave/page.tsx`
8. ❌ Create `/app/products/eviction/notice-to-quit/page.tsx`
9. ❌ Build wizards for each
10. ❌ Build generators for each
11. ❌ Create handlebars templates for each
12. ❌ Add AI-assisted completion (hidden)

### Phase 3: Build Legal Proceedings Category
1. ❌ Create `/app/legal-proceedings/page.tsx` - Main landing page
2. ❌ Create `/app/products/legal/possession-claim/page.tsx`
3. ❌ Create `/app/products/legal/witness-statement/page.tsx`
4. ❌ Create `/app/products/legal/particulars-of-claim/page.tsx`
5. ❌ Build wizards, generators, templates for each
6. ❌ Add AI validation layer

### Phase 4: Build Notices Category
1. ❌ Create `/app/notices/page.tsx` - Main landing page
2. ❌ Create individual notice product pages
3. ❌ Build wizards, generators, templates

### Phase 5: Update Site-Wide Components
1. ❌ Update main navigation header
2. ❌ Update footer navigation
3. ❌ Update homepage hero
4. ❌ Update product cards
5. ❌ Update all CTAs

---

## File Structure After Complete Build

```
src/app/
├── (marketing pages)
│   ├── page.tsx (Homepage - remove AI, guarantee)
│   ├── about/page.tsx (remove guarantee)
│   ├── pricing/page.tsx (remove guarantee)
│   ├── contact/page.tsx (remove guarantee)
│   ├── help/page.tsx (remove guarantee)
│   └── terms/page.tsx (update refund policy)
│
├── tenancy-agreements/ ✅ COMPLETE
│   ├── england-wales/page.tsx
│   ├── scotland/page.tsx
│   └── northern-ireland/page.tsx
│
├── eviction/ ❌ TO BUILD
│   ├── page.tsx (Main landing)
│   ├── england-wales/page.tsx
│   ├── scotland/page.tsx
│   └── northern-ireland/page.tsx
│
├── legal-proceedings/ ❌ TO BUILD
│   └── page.tsx (Main landing)
│
├── notices/ ❌ TO BUILD
│   └── page.tsx (Main landing)
│
└── products/
    ├── ast/page.tsx ✅ UPDATED
    ├── eviction/
    │   ├── section-21/page.tsx ❌
    │   ├── section-8/page.tsx ❌
    │   ├── notice-to-leave/page.tsx ❌
    │   └── notice-to-quit/page.tsx ❌
    ├── legal/
    │   ├── possession-claim/page.tsx ❌
    │   ├── witness-statement/page.tsx ❌
    │   └── particulars-of-claim/page.tsx ❌
    ├── notices/
    │   ├── rent-increase/page.tsx ❌
    │   └── [more]/page.tsx ❌
    ├── money-claim/page.tsx (UPDATE)
    └── notice-only/page.tsx (UPDATE or DELETE)
```

---

## Messaging Guidelines (Site-Wide)

### DO SAY:
- "Curated by Landlord Heaven"
- "Legally compliant"
- "Court-ready documents"
- "Professional templates"
- "Expert-crafted"
- "Instant download"
- "No subscription required"

### DO NOT SAY:
- "AI-generated"
- "Claude Sonnet"
- "30-day money-back guarantee"
- "Money-back guarantee"
- "Complete pack"
- "Bundle" (unless specifically a bundle product)

---

## Pricing Structure (Simplified)

### Individual Products:
- Tenancy Agreements: £39.99 (Standard) / £59.00 (Premium)
- Eviction Forms: £29.99 each
- Legal Proceedings: £49.99 each
- Notices: £19.99 each
- Money Claims: £129.99

### Bundles (If offering):
- Eviction + Court Forms Bundle: £149.99
- Full Landlord Toolkit: £299.99

---

This is the comprehensive roadmap. Every file must be updated, every AI mention removed, every guarantee removed, and proper category structure built.
