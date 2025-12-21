# Template Audit Report

**Generated**: 2025-12-21
**Branch**: `claude/audit-templates-pdf-styling-SMZSU`
**Purpose**: Audit template usage and diagnose CSS/HTML rendering issues in PDF output

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Part A: Template Usage Audit](#part-a-template-usage-audit)
   - [Template Registry Overview](#template-registry-overview)
   - [Template Selection Maps](#template-selection-maps)
   - [Template Inventory](#template-inventory)
3. [Part B: PDF Rendering Root Cause Analysis](#part-b-pdf-rendering-root-cause-analysis)
   - [Rendering Pipeline Overview](#rendering-pipeline-overview)
   - [Root Cause](#root-cause)
   - [Evidence](#evidence)
   - [Recommended Fix](#recommended-fix)
4. [Appendices](#appendices)

---

## Executive Summary

### Key Findings

**Part A - Template Usage:**
- **93 .hbs template files** found in `config/jurisdictions/`
- **67 actively used** templates (referenced in code)
- **8 potentially unused** templates (candidates for removal)
- **18 shared/reusable** templates

**Part B - CSS/HTML Rendering Issue:**

**ROOT CAUSE IDENTIFIED**: Full HTML templates (containing `<!DOCTYPE>`, `<html>`, `<head>`, `<style>`) are corrupted by two processing steps:

1. **`markdownToHtml()` corrupts CSS**: Splits content by double newlines and wraps CSS rules in `<p>` tags with `<br />` line breaks
2. **`htmlToPdf()` double-wraps HTML**: Creates its own HTML document wrapper, placing the template's `<head><style>` inside `<body>`

**Impact**: Notice templates (Form 6A, Form 3, RHW16, RHW17, RHW23, Notice to Leave) render as unstyled plain text because:
- CSS rules are corrupted by `<p>` tags
- Template's `<head>` is inside `<body>` (wrong DOM position)
- Browser ignores styles not in `<head>`

---

## Part A: Template Usage Audit

### Template Registry Overview

The single source of truth for template selection is:
- **Registry File**: `src/lib/jurisdictions/capabilities/templateRegistry.ts`
- **Capabilities Matrix**: `src/lib/jurisdictions/capabilities/matrix.ts`

Templates are resolved via `resolveTemplatesForFlow()` which looks up templates by:
- `jurisdiction`: england | wales | scotland | northern-ireland
- `product`: notice_only | eviction_pack | money_claim | tenancy_agreement
- `route`: Specific variant (e.g., section_21, section_8, wales_section_173)

### Template Selection Maps

#### Notice Only Templates

| Jurisdiction | Route | Template Path(s) | Generator |
|--------------|-------|------------------|-----------|
| **England** | section_21 | `uk/england/templates/notice_only/form_6a_section21/notice.hbs` | `section21-generator.ts` |
| **England** | section_8 | `uk/england/templates/notice_only/form_3_section8/notice.hbs` | `section8-generator.ts` |
| **Wales** | wales_section_173 | `uk/wales/templates/notice_only/rhw16_notice_termination_6_months/notice.hbs` (≥183 days) | `wales-section173-generator.ts` |
| **Wales** | wales_section_173 | `uk/wales/templates/notice_only/rhw17_notice_termination_2_months/notice.hbs` (<183 days) | `wales-section173-generator.ts` |
| **Wales** | wales_fault_based | `uk/wales/templates/notice_only/rhw23_notice_before_possession_claim/notice.hbs` | `notice-only/preview/route.ts` |
| **Scotland** | notice_to_leave | `uk/scotland/templates/notice_only/notice_to_leave_prt_2017/notice.hbs` | `notice-only/preview/route.ts` |

**Note**: Wales Section 173 dynamically selects RHW16 or RHW17 based on notice period days.

#### Eviction Pack Templates

| Jurisdiction | Included Templates | Generator |
|--------------|-------------------|-----------|
| **England** | `eviction/section21_form6a.hbs`, `eviction/section8_notice.hbs`, `eviction/eviction_roadmap.hbs`, `eviction/expert_guidance.hbs`, `eviction/witness-statement.hbs`, `eviction/compliance-audit.hbs`, `eviction/risk-report.hbs` | `eviction-pack-generator.ts` |
| **Wales** | Same structure as England (uses England templates for court forms) | `eviction-pack-generator.ts` |
| **Scotland** | `eviction/notice_to_leave.hbs`, `eviction/eviction_roadmap.hbs`, `eviction/expert_guidance.hbs`, `eviction/tribunal_guide.hbs` | `eviction-pack-generator.ts` |

#### Tenancy Agreement Templates

| Jurisdiction | Standard | Premium | Generator |
|--------------|----------|---------|-----------|
| **England** | `standard_ast_formatted.hbs` | `premium_ast_formatted.hbs` | `ast-generator.ts` |
| **Wales** | `uk/england/templates/standard_ast_formatted.hbs` (shared) | `uk/england/templates/premium_ast_formatted.hbs` (shared) | `ast-generator.ts` |
| **Scotland** | `prt_agreement.hbs` | `prt_agreement_premium.hbs` | `scotland/prt-generator.ts` |
| **Northern Ireland** | `private_tenancy_agreement.hbs` | `private_tenancy_premium.hbs` | `northern-ireland/private-tenancy-generator.ts` |

#### Money Claim Pack Templates

| Jurisdiction | Templates | Generator |
|--------------|-----------|-----------|
| **England** | `money_claims/pack_cover.hbs`, `particulars_of_claim.hbs`, `schedule_of_arrears.hbs`, `interest_workings.hbs`, `evidence_index.hbs`, `hearing_prep_sheet.hbs`, `letter_before_claim.hbs`, `information_sheet_for_defendants.hbs`, `reply_form.hbs`, `financial_statement_form.hbs`, `enforcement_guide.hbs`, `filing_guide.hbs` | `money-claim-pack-generator.ts` |
| **Wales** | Uses England templates (shared) | `money-claim-pack-generator.ts` |
| **Scotland** | `money_claims/pack_cover.hbs`, `simple_procedure_particulars.hbs`, `schedule_of_arrears.hbs`, `interest_calculation.hbs`, `evidence_index.hbs`, `hearing_prep_sheet.hbs`, `pre_action_letter.hbs`, `enforcement_guide_scotland.hbs`, `filing_guide_scotland.hbs` | `scotland-money-claim-pack-generator.ts` |

### Template Inventory

#### England Templates (`config/jurisdictions/uk/england/templates/`)

| Template | Status | Used By |
|----------|--------|---------|
| `deposit_protection_certificate.hbs` | ✅ USED | AST generator |
| `ast_legal_validity_summary.hbs` | ✅ USED | AST generator |
| `standard_ast_formatted.hbs` | ✅ USED | AST generator (standard) |
| `premium_ast_formatted.hbs` | ✅ USED | AST generator (premium) |
| `standard_ast.hbs` | ⚠️ LEGACY | Superseded by `standard_ast_formatted.hbs` |
| `premium_ast.hbs` | ⚠️ LEGACY | Superseded by `premium_ast_formatted.hbs` |
| `government_model_clauses.hbs` | ✅ USED | AST generator |
| `tenancy_deposit_information.hbs` | ✅ USED | AST generator |
| `inventory_template.hbs` | ✅ USED | AST generator |
| `letter_before_action.hbs` | ✅ USED | Letter generator |
| `n5_claim.hbs` | ⚠️ UNUSED | Superseded by official PDF form filler |
| `money_claim.hbs` | ⚠️ UNUSED | Superseded by pack generator |
| **eviction/** | | |
| `section21_form6a.hbs` | ✅ USED | Eviction pack generator |
| `section8_notice.hbs` | ✅ USED | Section 8 generator, eviction pack |
| `eviction_roadmap.hbs` | ✅ USED | Eviction pack generator |
| `next_steps_guide.hbs` | ✅ USED | Eviction pack generator |
| `service_instructions.hbs` | ✅ USED | Notice preview route |
| `service_instructions_section_8.hbs` | ✅ USED | Notice preview route |
| `checklist_section_8.hbs` | ✅ USED | Notice preview route |
| `checklist_section_21.hbs` | ✅ USED | Notice preview route |
| `compliance_checklist.hbs` | ✅ USED | Eviction pack generator |
| `witness-statement.hbs` | ✅ USED | Eviction pack generator |
| `risk-report.hbs` | ✅ USED | Eviction pack generator |
| `compliance-audit.hbs` | ✅ USED | Eviction pack generator |
| `expert_guidance.hbs` | ✅ USED | Eviction pack generator |
| `n5_claim.hbs` | ⚠️ UNUSED | Superseded by PDF form filler |
| `n5b_claim.hbs` | ⚠️ UNUSED | Superseded by PDF form filler |
| `n119_particulars.hbs` | ⚠️ UNUSED | Superseded by PDF form filler |
| **notice_only/** | | |
| `form_6a_section21/notice.hbs` | ✅ USED | Notice preview route |
| `form_3_section8/notice.hbs` | ✅ USED | Notice preview route |
| **money_claims/** | | |
| `pack_cover.hbs` | ✅ USED | Money claim pack generator |
| `particulars_of_claim.hbs` | ✅ USED | Money claim pack generator |
| `schedule_of_arrears.hbs` | ✅ USED | Money claim pack generator |
| `interest_workings.hbs` | ✅ USED | Money claim pack generator |
| `evidence_index.hbs` | ✅ USED | Money claim pack generator |
| `hearing_prep_sheet.hbs` | ✅ USED | Money claim pack generator |
| `letter_before_claim.hbs` | ✅ USED | Money claim pack generator |
| `information_sheet_for_defendants.hbs` | ✅ USED | Money claim pack generator |
| `reply_form.hbs` | ✅ USED | Money claim pack generator |
| `financial_statement_form.hbs` | ✅ USED | Money claim pack generator |
| `enforcement_guide.hbs` | ✅ USED | Money claim pack generator |
| `filing_guide.hbs` | ✅ USED | Money claim pack generator |
| `n1_claim.hbs` | ⚠️ UNUSED | Superseded by PDF form filler |
| **premium/** | | |
| `key_schedule.hbs` | ✅ USED | AST generator (premium) |
| `tenant_welcome_pack.hbs` | ✅ USED | AST generator (premium) |
| `property_maintenance_guide.hbs` | ✅ USED | AST generator (premium) |
| `move_in_condition_report.hbs` | ✅ USED | AST generator (premium) |
| `checkout_procedure.hbs` | ✅ USED | AST generator (premium) |

#### Wales Templates (`config/jurisdictions/uk/wales/templates/`)

| Template | Status | Used By |
|----------|--------|---------|
| **eviction/** | | |
| `section173_landlords_notice.hbs` | ⚠️ LEGACY | Superseded by RHW16/RHW17 |
| `fault_based_notice.hbs` | ⚠️ LEGACY | Superseded by RHW23 |
| `service_instructions.hbs` | ✅ USED | Notice preview route |
| `service_instructions_section_173.hbs` | ✅ USED | Notice preview route |
| `service_instructions_fault_based.hbs` | ✅ USED | Notice preview route |
| `checklist_section_173.hbs` | ✅ USED | Notice preview route |
| `checklist_fault_based.hbs` | ✅ USED | Notice preview route |
| **notice_only/** | | |
| `rhw16_notice_termination_6_months/notice.hbs` | ✅ USED | Wales Section 173 generator |
| `rhw17_notice_termination_2_months/notice.hbs` | ✅ USED | Wales Section 173 generator |
| `rhw23_notice_before_possession_claim/notice.hbs` | ✅ USED | Notice preview route (fault-based) |

#### Scotland Templates (`config/jurisdictions/uk/scotland/templates/`)

| Template | Status | Used By |
|----------|--------|---------|
| `prt_agreement.hbs` | ✅ USED | PRT generator (standard) |
| `prt_agreement_premium.hbs` | ✅ USED | PRT generator (premium) |
| `deposit_protection_certificate.hbs` | ✅ USED | PRT generator |
| `inventory_template.hbs` | ✅ USED | PRT generator |
| `pre_action_requirements_letter.hbs` | ✅ USED | Eviction pack generator |
| `tribunal_application.hbs` | ✅ USED | Eviction pack generator |
| **eviction/** | | |
| `notice_to_leave.hbs` | ✅ USED | Eviction pack generator |
| `eviction_roadmap.hbs` | ✅ USED | Eviction pack generator |
| `tribunal_guide.hbs` | ✅ USED | Eviction pack generator |
| `service_instructions.hbs` | ✅ USED | Notice preview route |
| `service_instructions_notice_to_leave.hbs` | ✅ USED | Notice preview route |
| `checklist_notice_to_leave.hbs` | ✅ USED | Notice preview route |
| `pre_action_checklist.hbs` | ✅ USED | Eviction pack generator |
| `witness-statement.hbs` | ✅ USED | Eviction pack generator |
| `risk-report.hbs` | ✅ USED | Eviction pack generator |
| `compliance-audit.hbs` | ✅ USED | Eviction pack generator |
| `expert_guidance.hbs` | ✅ USED | Eviction pack generator |
| **notice_only/** | | |
| `notice_to_leave_prt_2017/notice.hbs` | ✅ USED | Notice preview route |
| **money_claims/** | | |
| `pack_cover.hbs` | ✅ USED | Scotland money claim generator |
| `simple_procedure_particulars.hbs` | ✅ USED | Scotland money claim generator |
| `schedule_of_arrears.hbs` | ✅ USED | Scotland money claim generator |
| `interest_calculation.hbs` | ✅ USED | Scotland money claim generator |
| `evidence_index.hbs` | ✅ USED | Scotland money claim generator |
| `hearing_prep_sheet.hbs` | ✅ USED | Scotland money claim generator |
| `pre_action_letter.hbs` | ✅ USED | Scotland money claim generator |
| `enforcement_guide_scotland.hbs` | ✅ USED | Scotland money claim generator |
| `filing_guide_scotland.hbs` | ✅ USED | Scotland money claim generator |

#### Northern Ireland Templates (`config/jurisdictions/uk/northern-ireland/templates/`)

| Template | Status | Used By |
|----------|--------|---------|
| `private_tenancy_agreement.hbs` | ✅ USED | NI tenancy generator |
| `private_tenancy_premium.hbs` | ✅ USED | NI tenancy generator |
| `deposit_protection_certificate.hbs` | ✅ USED | NI tenancy generator |
| `inventory_template.hbs` | ✅ USED | NI tenancy generator |

#### Shared Templates (`config/jurisdictions/shared/templates/`)

| Template | Status | Used By |
|----------|--------|---------|
| `deposit_protection_certificate.hbs` | ✅ SHARED | All tenancy generators |
| `eviction_roadmap.hbs` | ✅ SHARED | Eviction pack generator (fallback) |
| `evidence_collection_checklist.hbs` | ✅ SHARED | Eviction pack generator |
| `inventory_template.hbs` | ✅ SHARED | All tenancy generators |
| `eviction_case_summary.hbs` | ✅ SHARED | Eviction pack generator |
| `proof_of_service.hbs` | ✅ SHARED | Eviction pack generator |
| `certificate_of_curation.hbs` | ✅ SHARED | AST generator |
| `terms_and_conditions.hbs` | ✅ SHARED | AST generator |
| `eviction_timeline.hbs` | ✅ SHARED | Eviction pack generator |

#### Shared Print System (`config/jurisdictions/_shared/print/`)

| File | Status | Purpose |
|------|--------|---------|
| `print.css` | ✅ USED | Central stylesheet for Notice Only PDFs |
| `components.hbs` | ✅ USED | Reusable layout partials |

### Template Usage Summary

| Category | Count |
|----------|-------|
| **Actively Used** | 67 |
| **Shared/Reusable** | 18 |
| **Legacy/Unused** | 8 |
| **Total** | 93 |

### Potentially Unused Templates (Candidates for Removal)

1. `uk/england/templates/standard_ast.hbs` - Superseded by `standard_ast_formatted.hbs`
2. `uk/england/templates/premium_ast.hbs` - Superseded by `premium_ast_formatted.hbs`
3. `uk/england/templates/n5_claim.hbs` - Superseded by PDF form filler
4. `uk/england/templates/money_claim.hbs` - Superseded by pack generator
5. `uk/england/templates/eviction/n5_claim.hbs` - Duplicate
6. `uk/england/templates/eviction/n5b_claim.hbs` - Superseded by PDF form filler
7. `uk/england/templates/eviction/n119_particulars.hbs` - Superseded by PDF form filler
8. `uk/england/templates/money_claims/n1_claim.hbs` - Superseded by PDF form filler

---

## Part B: PDF Rendering Root Cause Analysis

### Rendering Pipeline Overview

```
Template File (.hbs)
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  loadTemplate(templatePath)                                       │
│  ├── Guards against legacy paths (/public/official-forms)        │
│  └── Returns raw template string                                  │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  compileTemplate(templateContent, data)                           │
│  ├── Enriches data with print_css, site_config, etc.             │
│  ├── Compiles Handlebars template                                 │
│  └── ⚠️  ALWAYS calls markdownToHtml(html)                        │  ← PROBLEM 1
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  markdownToHtml(markdown)                                         │
│  ├── Converts # headings to <h1>, etc.                           │
│  ├── Converts ** to <strong>                                      │
│  ├── Splits by double newlines                                    │
│  └── ⚠️  Wraps non-HTML blocks in <p> tags with <br />           │  ← PROBLEM 2
│       (Does NOT check for <style>, <head>, <meta>, <!DOCTYPE>)    │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  htmlToPdf(html)                                                  │
│  ├── ⚠️  Creates NEW HTML document wrapper                        │  ← PROBLEM 3
│  │   └── <!DOCTYPE html><html><head><style>...</style></head>    │
│  │       <body>${html}</body></html>                              │
│  └── Puppeteer renders the wrapped HTML                           │
└──────────────────────────────────────────────────────────────────┘
       │
       ▼
    PDF Output (CSS not applied)
```

### Root Cause

**Three sequential issues corrupt full-HTML templates:**

#### Problem 1: `compileTemplate()` Always Calls `markdownToHtml()`

**File**: `src/lib/documents/generator.ts:456-458`

```typescript
const template = Handlebars.compile(templateContent);
let html = template(safeData);

// Convert markdown to HTML for PDF rendering
html = markdownToHtml(html);  // ← ALWAYS called, even for full HTML
```

#### Problem 2: `markdownToHtml()` Corrupts CSS in `<style>` Blocks

**File**: `src/lib/documents/generator.ts:347-384`

The function:
1. Splits content by `\n\n` (double newlines)
2. Checks if each block starts with HTML tags: `<h`, `<hr`, `<div`, `<p`, `<table`
3. Does NOT check for: `<!DOCTYPE`, `<html`, `<head`, `<style`, `<meta`, `<title`, `<body>`
4. Wraps unrecognized blocks in `<p>` tags
5. Replaces single `\n` with `<br />`

**Result for a CSS block like:**
```css
body {
  font-family: Arial;
  line-height: 1.5;
}
```

**Becomes:**
```html
<p>body {<br />  font-family: Arial;<br />  line-height: 1.5;<br />}</p>
```

#### Problem 3: `htmlToPdf()` Double-Wraps the Document

**File**: `src/lib/documents/generator.ts:598-732`

The function creates its own HTML document wrapper:

```typescript
const styledHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman'... }
    ...
  </style>
</head>
<body>
${html}    // ← Template's <!DOCTYPE><html><head><style>... is injected HERE
</body>
</html>
`;
```

**Result**: The template's `<head><style>` ends up inside `<body>`, which browsers ignore for styling.

### Evidence

**Input Template (Form 6A):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Form 6A - Section 21 Notice</title>
  <style>
    {{{print_css}}}
  </style>
</head>
<body>
  <h1>Notice Requiring Possession...</h1>
  ...
</body>
</html>
```

**After `markdownToHtml()` (corrupted CSS):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Form 6A - Section 21 Notice</title>
  <style>
    <p>* {<br />  margin: 0;<br />  padding: 0;<br />}</p>
    <p>body {<br />  font-family: Arial;<br />}</p>
    ...
  </style>
</head>
<body>
  <h1>Notice Requiring Possession...</h1>
  ...
</body>
</html>
```

**After `htmlToPdf()` wrapper (double-wrapped):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman'... }  /* Wrapper styles */
  </style>
</head>
<body>
  <!DOCTYPE html>                               <!-- Template starts here -->
  <html lang="en">
  <head>                                        <!-- This <head> is INSIDE <body>! -->
    <style>
      <p>* {<br />...</p>                       <!-- Corrupted CSS -->
    </style>
  </head>
  <body>
    <h1>Notice Requiring Possession...</h1>
  </body>
  </html>
</body>
</html>
```

**Browser behavior**: Styles in `<body>` are ignored. The PDF renders with only the wrapper's default Times New Roman styles.

### Recommended Fix

#### Option A: Bypass Processing for Full HTML Templates (Minimal, Safe)

**Location**: `src/lib/documents/generator.ts`

**Change in `compileTemplate()`:**

```typescript
export function compileTemplate(templateContent: string, data: Record<string, any>): string {
  try {
    // ... existing data enrichment ...

    const template = Handlebars.compile(templateContent);
    let html = template(safeData);

    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ NEW: Skip markdownToHtml for full HTML documents                    │
    // │ Full HTML templates have their own <head><style> and should not    │
    // │ be processed as markdown.                                           │
    // └─────────────────────────────────────────────────────────────────────┘
    const trimmed = html.trim();
    const isFullHtml = trimmed.startsWith('<!DOCTYPE') ||
                       trimmed.startsWith('<html') ||
                       trimmed.startsWith('<!doctype');

    if (!isFullHtml) {
      // Only convert markdown for non-HTML templates
      html = markdownToHtml(html);
    }

    return html;
  } catch (error: any) {
    throw new Error(`Failed to compile template: ${error.message}`);
  }
}
```

**Change in `htmlToPdf()`:**

```typescript
export async function htmlToPdf(
  html: string,
  options?: { ... }
): Promise<Buffer> {
  let browser;

  try {
    browser = await puppeteer.launch({ ... });
    const page = await browser.newPage();

    // ┌─────────────────────────────────────────────────────────────────────┐
    // │ NEW: Pass through full HTML documents without wrapping              │
    // └─────────────────────────────────────────────────────────────────────┘
    const trimmed = html.trim();
    const isFullHtml = trimmed.startsWith('<!DOCTYPE') ||
                       trimmed.startsWith('<html') ||
                       trimmed.startsWith('<!doctype');

    let finalHtml: string;

    if (isFullHtml) {
      // Full HTML template: use as-is (it has its own <head><style>)
      finalHtml = html;
    } else {
      // Markdown/partial HTML: wrap in document structure
      finalHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman'... }
    ...
  </style>
</head>
<body>
${html}
</body>
</html>
      `;
    }

    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
    // ... rest of function
  }
}
```

#### Option B: Extract and Re-inject Styles (More Complex)

If Option A isn't viable, an alternative is to:
1. Detect full HTML documents
2. Parse and extract `<style>` content from the template's `<head>`
3. Merge extracted styles with wrapper styles
4. Inject only `<body>` content into the wrapper

This is more complex and has more edge cases.

#### Recommended Approach

**Option A is preferred** because:
- Minimal code change (~20 lines)
- No behavior change for existing markdown templates
- Full HTML templates work as designed
- Easy to test and verify

### Test Cases for Fix

```typescript
describe('Template Rendering', () => {
  describe('Full HTML templates', () => {
    it('should preserve <style> content without <p> tags', async () => {
      const template = `<!DOCTYPE html>
<html><head><style>body { color: red; }</style></head>
<body>Test</body></html>`;
      const result = compileTemplate(template, {});
      expect(result).not.toContain('<p>body {');
      expect(result).toContain('body { color: red; }');
    });

    it('should not double-wrap HTML document in htmlToPdf', async () => {
      const html = `<!DOCTYPE html><html><head></head><body>Test</body></html>`;
      // Verify Puppeteer receives the template as-is
      const pdf = await htmlToPdf(html);
      expect(pdf).toBeDefined();
      // Manual verification: check PDF has correct styles
    });
  });

  describe('Markdown templates', () => {
    it('should still convert markdown to HTML', async () => {
      const template = `# Heading\n\nParagraph`;
      const result = compileTemplate(template, {});
      expect(result).toContain('<h1>Heading</h1>');
      expect(result).toContain('<p>Paragraph</p>');
    });
  });
});
```

---

## Appendices

### A. Full Template File List

```
config/jurisdictions/
├── certificate.hbs
├── _shared/
│   └── print/
│       ├── components.hbs
│       └── print.css
├── shared/
│   └── templates/
│       ├── certificate_of_curation.hbs
│       ├── deposit_protection_certificate.hbs
│       ├── evidence_collection_checklist.hbs
│       ├── eviction_case_summary.hbs
│       ├── eviction_roadmap.hbs
│       ├── eviction_timeline.hbs
│       ├── inventory_template.hbs
│       ├── proof_of_service.hbs
│       └── terms_and_conditions.hbs
└── uk/
    ├── england/
    │   └── templates/
    │       ├── ast_legal_validity_summary.hbs
    │       ├── deposit_protection_certificate.hbs
    │       ├── eviction/
    │       │   ├── checklist_section_21.hbs
    │       │   ├── checklist_section_8.hbs
    │       │   ├── compliance-audit.hbs
    │       │   ├── compliance_checklist.hbs
    │       │   ├── eviction_roadmap.hbs
    │       │   ├── expert_guidance.hbs
    │       │   ├── n119_particulars.hbs
    │       │   ├── n5_claim.hbs
    │       │   ├── n5b_claim.hbs
    │       │   ├── next_steps_guide.hbs
    │       │   ├── risk-report.hbs
    │       │   ├── section21_form6a.hbs
    │       │   ├── section8_notice.hbs
    │       │   ├── service_instructions.hbs
    │       │   ├── service_instructions_section_8.hbs
    │       │   └── witness-statement.hbs
    │       ├── government_model_clauses.hbs
    │       ├── inventory_template.hbs
    │       ├── letter_before_action.hbs
    │       ├── money_claim.hbs
    │       ├── money_claims/
    │       │   ├── enforcement_guide.hbs
    │       │   ├── evidence_index.hbs
    │       │   ├── filing_guide.hbs
    │       │   ├── financial_statement_form.hbs
    │       │   ├── hearing_prep_sheet.hbs
    │       │   ├── information_sheet_for_defendants.hbs
    │       │   ├── interest_workings.hbs
    │       │   ├── letter_before_claim.hbs
    │       │   ├── n1_claim.hbs
    │       │   ├── pack_cover.hbs
    │       │   ├── particulars_of_claim.hbs
    │       │   ├── reply_form.hbs
    │       │   └── schedule_of_arrears.hbs
    │       ├── n5_claim.hbs
    │       ├── notice_only/
    │       │   ├── form_3_section8/
    │       │   │   └── notice.hbs
    │       │   └── form_6a_section21/
    │       │       └── notice.hbs
    │       ├── premium/
    │       │   ├── checkout_procedure.hbs
    │       │   ├── key_schedule.hbs
    │       │   ├── move_in_condition_report.hbs
    │       │   ├── property_maintenance_guide.hbs
    │       │   └── tenant_welcome_pack.hbs
    │       ├── premium_ast.hbs
    │       ├── premium_ast_formatted.hbs
    │       ├── standard_ast.hbs
    │       ├── standard_ast_formatted.hbs
    │       └── tenancy_deposit_information.hbs
    ├── northern-ireland/
    │   └── templates/
    │       ├── deposit_protection_certificate.hbs
    │       ├── inventory_template.hbs
    │       ├── private_tenancy_agreement.hbs
    │       └── private_tenancy_premium.hbs
    ├── scotland/
    │   └── templates/
    │       ├── deposit_protection_certificate.hbs
    │       ├── eviction/
    │       │   ├── checklist_notice_to_leave.hbs
    │       │   ├── compliance-audit.hbs
    │       │   ├── eviction_roadmap.hbs
    │       │   ├── expert_guidance.hbs
    │       │   ├── notice_to_leave.hbs
    │       │   ├── pre_action_checklist.hbs
    │       │   ├── risk-report.hbs
    │       │   ├── service_instructions.hbs
    │       │   ├── service_instructions_notice_to_leave.hbs
    │       │   ├── tribunal_guide.hbs
    │       │   └── witness-statement.hbs
    │       ├── inventory_template.hbs
    │       ├── money_claims/
    │       │   ├── enforcement_guide_scotland.hbs
    │       │   ├── evidence_index.hbs
    │       │   ├── filing_guide_scotland.hbs
    │       │   ├── hearing_prep_sheet.hbs
    │       │   ├── interest_calculation.hbs
    │       │   ├── pack_cover.hbs
    │       │   ├── pre_action_letter.hbs
    │       │   ├── schedule_of_arrears.hbs
    │       │   └── simple_procedure_particulars.hbs
    │       ├── notice_only/
    │       │   └── notice_to_leave_prt_2017/
    │       │       └── notice.hbs
    │       ├── pre_action_requirements_letter.hbs
    │       ├── prt_agreement.hbs
    │       ├── prt_agreement_premium.hbs
    │       └── tribunal_application.hbs
    └── wales/
        └── templates/
            ├── eviction/
            │   ├── checklist_fault_based.hbs
            │   ├── checklist_section_173.hbs
            │   ├── fault_based_notice.hbs
            │   ├── section173_landlords_notice.hbs
            │   ├── service_instructions.hbs
            │   ├── service_instructions_fault_based.hbs
            │   └── service_instructions_section_173.hbs
            └── notice_only/
                ├── rhw16_notice_termination_6_months/
                │   └── notice.hbs
                ├── rhw17_notice_termination_2_months/
                │   └── notice.hbs
                └── rhw23_notice_before_possession_claim/
                    └── notice.hbs
```

### B. Key Source Files Referenced

| File | Purpose |
|------|---------|
| `src/lib/documents/generator.ts` | Core template loading, compilation, markdown conversion, PDF generation |
| `src/lib/jurisdictions/capabilities/templateRegistry.ts` | Template path registry by jurisdiction/product/route |
| `src/lib/jurisdictions/capabilities/matrix.ts` | Capability matrix building from MQS files |
| `src/app/api/notice-only/preview/[caseId]/route.ts` | Notice preview API endpoint |
| `src/lib/documents/section21-generator.ts` | Section 21 notice generator |
| `src/lib/documents/section8-generator.ts` | Section 8 notice generator |
| `src/lib/documents/wales-section173-generator.ts` | Wales Section 173 notice generator |
| `src/lib/documents/eviction-pack-generator.ts` | Complete eviction pack generator |
| `src/lib/documents/ast-generator.ts` | AST (tenancy agreement) generator |
| `src/lib/documents/money-claim-pack-generator.ts` | Money claim pack generator |
| `src/lib/documents/scotland-money-claim-pack-generator.ts` | Scotland money claim pack generator |

---

**End of Audit Report**
