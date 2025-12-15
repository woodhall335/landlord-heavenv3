# Single Source of Truth: /config

**All document generation must use `/config` resources.**

This document describes the enforced contract for template loading and data normalization to ensure consistent, correct document generation across all jurisdictions.

## Directory Structure

```
/config
  /mqs                          # Master Question Sets
    /complete_pack
    /money_claim
    /notice_only
  /jurisdictions                # Templates (SINGLE SOURCE OF TRUTH)
    /uk
      /england-wales
        /templates
          /eviction
            section8_notice.hbs
            section21_form6a.hbs
          /money_claims
            particulars_of_claim.hbs
            schedule_of_arrears.hbs
      /wales
        /templates
          /eviction
            section173_landlords_notice.hbs
      /scotland
        /templates
          /eviction
            notice_to_leave.hbs
          /money_claims
            simple_procedure_particulars.hbs
      /northern-ireland
        /templates
          private_tenancy_agreement.hbs
    /shared
      /templates
        eviction_roadmap.hbs
        proof_of_service.hbs
```

## Template Resolver Contract

### ✅ CORRECT - Relative to config/jurisdictions/

```typescript
// Section 8 Notice
templatePath: 'uk/england-wales/templates/eviction/section8_notice.hbs'

// Section 21 Notice
templatePath: 'uk/england-wales/templates/eviction/section21_form6a.hbs'

// Scotland Notice to Leave
templatePath: 'uk/scotland/templates/notice_to_leave.hbs'

// Wales Section 173
templatePath: 'uk/wales/templates/eviction/section173_landlords_notice.hbs'
```

### ❌ WRONG - Absolute paths

```typescript
// ❌ Will throw error
templatePath: '/full/path/to/template.hbs'
```

### ❌ WRONG - Public paths

```typescript
// ❌ Will throw error
templatePath: 'public/official-forms/england-wales/form3.pdf'
```

### ❌ WRONG - Outside config/jurisdictions

```typescript
// ❌ Will throw error
templatePath: '../some/other/template.hbs'
```

## Runtime Guards

The `loadTemplate()` function in `/src/lib/documents/generator.ts` enforces these rules:

```typescript
export function loadTemplate(templatePath: string): string {
  // Guard 1: Block legacy /public/official-forms paths
  if (templatePath.includes('official-forms') || templatePath.startsWith('public/')) {
    throw new Error(
      `[TEMPLATE GUARD] Attempted to load legacy template: ${templatePath}\n` +
      `BLOCKED: All templates must come from /config/jurisdictions`
    );
  }

  // Guard 2: Block absolute paths
  if (templatePath.startsWith('/')) {
    throw new Error(
      `[TEMPLATE GUARD] Template path must be relative to config/jurisdictions/`
    );
  }

  // Guard 3: Block directory traversal
  if (templatePath.includes('..')) {
    throw new Error(
      `[TEMPLATE GUARD] Directory traversal not allowed in template paths.`
    );
  }

  // Resolve to /config/jurisdictions
  const fullPath = join(process.cwd(), 'config', 'jurisdictions', templatePath);
  const templateContent = readFileSync(fullPath, 'utf-8');
  console.log(`[TEMPLATE] ✅ Loading from: ${fullPath}`);
  return templateContent;
}
```

## Data Normalization

The `wizardFactsToCaseFacts()` function in `/src/lib/case-facts/normalize.ts` ensures clean data for templates:

### Property Address Concatenation

```typescript
// Flat fields are concatenated into single property_address field
property_address_line1: "Flat 2"
property_address_line2: "123 Main Street"
property_address_town: "London"
property_address_postcode: "SW1A 1AA"

// ↓ Normalized to:

property_address: "Flat 2\n123 Main Street\nLondon\nSW1A 1AA"
```

### Tenant/Landlord Name Normalization

```typescript
// Nested structure
parties.tenants[0].name: "John Smith"
parties.landlord.name: "Jane Landlord"

// ↓ Also exposed as flat fields:

tenant_full_name: "John Smith"
landlord_full_name: "Jane Landlord"
```

### Object Flattening (Ask Heaven Aware)

```typescript
// Prevents [object Object] in templates
// Narrative fields (Ask Heaven) preserved:
particulars: { text: "AI-generated narrative...", confidence: 0.95 }
// ↓ Becomes:
particulars: "AI-generated narrative..."

// Non-narrative fields flattened:
some_field: { value: "foo", label: "Foo" }
// ↓ Becomes:
some_field: "foo"
```

## Ask Heaven Integration

Ask Heaven AI-generated narratives flow through:

1. `/config/mqs` → Contains AI prompts and narrative logic
2. Wizard facts → User responses + AI enhancements
3. `normalize.ts` → Preserves narrative fields
4. Case facts → Passed to templates
5. Templates → Render AI-enhanced particulars

**DO NOT bypass this flow.** AI narratives are legally required for valid notices.

### Ask Heaven Field Detection

The normalizer detects Ask Heaven fields by checking if the key contains:

- `particulars`
- `narrative`
- `explanation`
- `summary`
- `description`

These fields are preserved from objects containing `.text`, `.value`, or `.content` properties.

## Legacy Templates

`/public/official-forms.LEGACY_DO_NOT_USE` is OBSOLETE and blocked by runtime guards.

This directory contains:

1. **Court forms** (N5, N119, N1) - Used for court claim packs via `official-forms-filler.ts` (NOT notices)
2. **Duplicate notice PDFs** - OBSOLETE, do not use

Any attempt to load from `/public/official-forms` will throw:

```
[TEMPLATE GUARD] Attempted to load legacy template: public/official-forms/...
BLOCKED: All templates must come from /config/jurisdictions
```

## Generator Examples

### Section 8 Notice

```typescript
import { generateSection8Notice } from '@/lib/documents/section8-generator';

const notice = await generateSection8Notice({
  landlord_full_name: "Jane Landlord",
  tenant_full_name: "John Smith",
  property_address: "123 Main St, London SW1A 1AA",
  grounds: [buildGround(8, "Rent arrears of £2,400...")],
  // ... other fields
}, false); // isPreview = false

// ✅ Uses: uk/england-wales/templates/eviction/section8_notice.hbs
```

### Section 21 Notice

```typescript
import { generateSection21Notice } from '@/lib/documents/section21-generator';

const notice = await generateSection21Notice({
  landlord_full_name: "Jane Landlord",
  tenant_full_name: "John Smith",
  property_address: "123 Main St, London SW1A 1AA",
  tenancy_start_date: "2023-01-01",
  // ... other fields
}, false);

// ✅ Uses: uk/england-wales/templates/eviction/section21_form6a.hbs
```

### Scotland Notice to Leave

```typescript
import { generateNoticeToLeave } from '@/lib/documents/scotland/notice-to-leave-generator';

const notice = await generateNoticeToLeave({
  landlord_full_name: "Sarah MacDonald",
  tenant_full_name: "James Murray",
  property_address: "45 Rose Street, Edinburgh EH2 2NG",
  grounds: [buildGround(1, "Rent arrears of £3,600...")],
  // ... other fields
}, false);

// ✅ Uses: uk/scotland/templates/notice_to_leave.hbs
```

### Wales Section 173

```typescript
import { generateWalesSection173Notice } from '@/lib/documents/wales-section173-generator';

const notice = await generateWalesSection173Notice({
  landlord_full_name: "David Jones",
  contract_holder_full_name: "Emma Williams",
  property_address: "10 High Street, Cardiff CF10 1AA",
  wales_contract_category: "standard",
  // ... other fields
}, false);

// ✅ Uses: uk/wales/templates/eviction/section173_landlords_notice.hbs
```

## Verification Checklist

When generating documents, verify:

- ✅ Console shows `[TEMPLATE] ✅ Loading from: .../config/jurisdictions/...`
- ✅ No `[object Object]` in generated PDFs
- ✅ Property addresses are fully formatted (no `undefined`)
- ✅ Tenant/landlord names are present
- ✅ Ask Heaven narratives appear (not placeholder text)
- ✅ No runtime errors about legacy templates
- ✅ Dates formatted correctly (DD/MM/YYYY for UK)
- ✅ Currency formatted correctly (£X.XX)

## Console Output (Expected)

```
[TEMPLATE] ✅ Loading from: /home/user/landlord-heavenv3/config/jurisdictions/uk/england-wales/templates/eviction/section8_notice.hbs
[Normalize] Property address concatenated: 4 parts
[Normalize] Tenant name: John Smith
[Normalize] Landlord name: Jane Landlord
[Normalize] Case facts normalization complete
```

## Console Output (Errors to Watch For)

```
❌ [TEMPLATE GUARD] Attempted to load legacy template: public/official-forms/...
❌ [Normalize] Found object for key "property_address" (should be string)
❌ Failed to load template uk/england/templates/... (file not found)
```

## MQS Loader (DO NOT MODIFY)

The MQS loader in `/src/lib/wizard/mqs-loader.ts` already works correctly. Do not:

- ❌ Modify MQS loader behavior
- ❌ Change which YAML files are selected
- ❌ Create new MQS files (use existing)
- ❌ Duplicate templates

## Document Generation Pipeline (DO NOT CHANGE)

The existing pipeline is:

1. User answers MQS questions
2. `normalize.ts` converts to case facts
3. Templates render with Handlebars
4. Puppeteer converts HTML → PDF

**Do not:**

- ❌ Change PDF generation library
- ❌ Modify output formats
- ❌ Remove Ask Heaven integration
- ❌ Bypass normalization

## Success Criteria

The system is working correctly when:

1. ✅ All generators use `/config/jurisdictions` paths
2. ✅ Runtime guard prevents `/public/official-forms` loading
3. ✅ Property addresses concatenated
4. ✅ Objects flattened to strings (Ask Heaven preserved)
5. ✅ All tests pass
6. ✅ No `[object Object]` in generated documents
7. ✅ No `undefined` fields in generated documents
8. ✅ Console logs show `/config/jurisdictions` paths
9. ✅ Ask Heaven narratives preserved
10. ✅ No route-selection question for notice_only

## Troubleshooting

### Problem: `[object Object]` in PDF

**Cause:** Object not flattened in `normalize.ts`

**Fix:** Check object flattening logic preserves Ask Heaven fields

### Problem: Missing property address

**Cause:** Address parts not concatenated

**Fix:** Verify address concatenation in `normalize.ts` runs before template rendering

### Problem: Template not found

**Cause:** Incorrect template path (not relative to `/config/jurisdictions`)

**Fix:** Use relative path like `uk/england-wales/templates/eviction/section8_notice.hbs`

### Problem: Legacy template error

**Cause:** Code trying to load from `/public/official-forms`

**Fix:** Update generator to use `/config/jurisdictions` path

## Related Files

- `/src/lib/documents/generator.ts` - Template loader with runtime guards
- `/src/lib/case-facts/normalize.ts` - Data normalization
- `/config/jurisdictions/**` - Template source of truth
- `/config/mqs/**` - Question sets with Ask Heaven prompts
- `/public/official-forms.LEGACY_DO_NOT_USE/` - Obsolete (DO NOT USE)

## Last Updated

2025-12-15 - Initial documentation after enforcing single source of truth
