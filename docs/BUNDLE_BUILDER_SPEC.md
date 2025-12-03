## Court & Tribunal Bundle Builder Specification

**Version:** 1.0.0
**Date:** December 3, 2025
**Module:** `src/lib/bundles/`

## Overview

The Bundle Builder is a **PURELY PRESENTATIONAL** module that assembles court and tribunal submission bundles from existing case data, decision engine outputs, and case intelligence analysis.

**CRITICAL DESIGN PRINCIPLE:**
- **NO LEGAL RULES ARE CREATED IN THIS MODULE**
- All legal determinations come from:
  - Decision engine (YAML configs)
  - Case-intel module
  - Existing form fillers
  - MQS configurations

The bundle builder's job is to **assemble and format** existing information, not to make legal decisions.

---

## Architecture

```
Bundle Builder (Presentational Layer)
├── Decision Engine (YAML) ──→ Legal rules, routes, grounds
├── Case Intel ───────────────→ Scoring, narratives, evidence analysis
├── Form Fillers ─────────────→ N5, N119, N5B, Form E PDFs
└── CaseFacts ────────────────→ Normalized case data
         ↓
    OUTPUT: Compiled PDF bundle
```

### Module Structure

```
src/lib/bundles/
├── index.ts              # Main API (generateCourtBundle, generateTribunalBundle)
├── types.ts              # TypeScript type definitions
├── sections.ts           # Section builder (assembles content)
└── evidence-index.ts     # Evidence index and timeline formatting
```

---

## Main API Functions

### 1. `generateCourtBundle()`

Generate England & Wales court bundle.

```typescript
import { generateCourtBundle } from '@/lib/bundles';

const result = await generateCourtBundle(caseFacts, {
  include_case_intel: true,
  include_timeline: true,
  include_evidence_index: true,
  include_all_evidence: false,
  output_dir: '/tmp/bundles',
  watermark: 'DRAFT',
});

if (result.success) {
  console.log('Bundle path:', result.metadata.file_path);
  console.log('Pages:', result.metadata.page_count);
  console.log('Sections:', result.metadata.sections.length);
}
```

**Returns:** `BundleResult`

```typescript
interface BundleResult {
  success: boolean;
  metadata?: BundleMetadata;
  error?: string;
  warnings?: string[];
}
```

### 2. `generateTribunalBundle()`

Generate Scotland tribunal bundle.

```typescript
import { generateTribunalBundle } from '@/lib/bundles';

const result = await generateTribunalBundle(caseFacts, {
  include_case_intel: true,
  output_dir: '/tmp/bundles',
});
```

### 3. `validateBundleReadiness()`

Check if case has required fields before generating bundle.

```typescript
import { validateBundleReadiness } from '@/lib/bundles';

const { ready, issues, warnings } = validateBundleReadiness(caseFacts);

if (!ready) {
  console.log('Cannot generate bundle:');
  issues.forEach((issue) => console.log(`  - ${issue}`));
}
```

---

## Bundle Structure

### England & Wales Court Bundle

**Sections (in order):**

| Tab | Section | Source | Content |
|-----|---------|--------|---------|
| Index | Bundle Index | Auto-generated | Table of contents with page numbers |
| A | Case Summary | Case-intel narrative | AI-generated case overview, strength score |
| B | Particulars of Claim (N119) | Case-intel narrative | Tribunal narrative formatted for N119 |
| C | Ground Particulars | Case-intel ground narratives | Specific narratives per ground |
| D | Tenancy Agreement | Document storage | AST agreement PDF |
| E | Rent Schedule | Case-intel arrears narrative | Arrears breakdown and schedule |
| F | Notices | Document generation | Section 8/21 notices |
| G | Evidence | Evidence analysis | Uploaded documents and key evidence |
| H | Chronology | Case-intel timeline | Extracted timeline of events |

### Scotland Tribunal Bundle

**Sections (in order):**

| Tab | Section | Source | Content |
|-----|---------|--------|---------|
| Index | Bundle Index | Auto-generated | Table of contents with page numbers |
| 1 | Case Summary | Case-intel narrative | AI-generated case overview, strength score |
| 2 | Form E Application | Case-intel narrative | Tribunal narrative formatted for Form E |
| 3 | Ground Particulars | Case-intel ground narratives | Specific narratives per ground |
| 4 | Tenancy Agreement | Document storage | PRT agreement PDF |
| 5 | Rent Schedule | Case-intel arrears narrative | Arrears breakdown and schedule |
| 6 | Notice to Leave | Document generation | Notice to Leave document |
| 7 | Pre-Action Evidence | Conditional (Ground 1) | Pre-action requirement compliance |
| 8 | Supporting Evidence | Evidence analysis | Uploaded documents and key evidence |
| 9 | Timeline | Case-intel timeline | Extracted timeline of events |

---

## Cover Page

The cover page includes:

1. **Bundle Type** (Court / Tribunal)
2. **Jurisdiction** (England & Wales / Scotland)
3. **Case ID**
4. **Generation Timestamp**
5. **Parties:**
   - Claimant / Applicant (Landlord)
   - Defendant / Respondent (Tenant)
6. **Property Address**
7. **Case Overview:**
   - Recommended routes (from decision engine)
   - Recommended grounds (from decision engine)
   - Case strength score (from case-intel)
8. **Important Notes:**
   - Blocking issues (from decision engine)
   - Warnings (from decision engine)
9. **Watermark** (if specified, e.g., "DRAFT")

**Example Cover Page:**

```
================================================================================
COURT BUNDLE
================================================================================

Jurisdiction: ENGLAND-WALES
Case Type: Possession / Eviction
Case ID: case-12345
Generated: 03/12/2025 14:30:00

================================================================================
PARTIES
================================================================================

CLAIMANT:
  John Smith

DEFENDANT:
  Jane Doe

PROPERTY:
  123 High Street
  London, E1 1AA

================================================================================
CASE OVERVIEW
================================================================================

Route(s): SECTION_8
Ground(s): 8 (Serious Rent Arrears - 2+ months)

Case Strength: 85/100

================================================================================
IMPORTANT NOTES
================================================================================

Warnings:
  • Notice period adequate for Ground 8
  • Evidence completeness: 80%

This bundle has been prepared using Landlord Heaven's automated system.
All legal determinations are based on the decision engine and case intelligence.
```

---

## Evidence Index

The evidence index categorizes and lists all evidence items.

**Format:**

```
Evidence Index
==============

Total Evidence Items: 12

BY CATEGORY
-----------

ARREARS (5 items)
  E1. Total arrears: £4,500.00
  E2. Period 2025-09-01 to 2025-09-30: £1,500.00
  E3. Period 2025-10-01 to 2025-10-31: £1,500.00
  E4. Bank statements uploaded
  E5. Arrears breakdown narrative

COMPLIANCE (4 items)
  E6. Deposit protected: Yes
  E7. Prescribed info given: Yes
  E8. Gas safety cert: Yes
  E9. EPC provided: Yes

COMMUNICATIONS (3 items)
  E10. Correspondence uploaded
  E11. Notice service record
  E12. Tenant contact attempts

BY GROUND
---------

Ground 8 (5 items)
  E1. Total arrears: £4,500.00
  E2. Period 2025-09-01 to 2025-09-30: £1,500.00
  E3. Period 2025-10-01 to 2025-10-31: £1,500.00
  E4. Bank statements uploaded
  E5. Arrears breakdown narrative
```

**Generated From:**
- Case-intel evidence analysis
- `generateEvidenceIndex()` function
- Linked to grounds from decision engine

---

## Timeline

Chronological list of key events extracted from case data.

**Format:**

```
Chronology of Events
====================

Period: 2023-01-15 to 2025-10-15

[PROCEDURAL]
2023-01-15 - Tenancy started
2025-10-01 - Notice served (hand)
2025-10-15 - Notice expires

[ARREARS]
2025-09-01 - Arrears accrued: £1,500.00
2025-10-01 - Arrears accrued: £1,500.00
2025-11-01 - Arrears accrued: £1,500.00

[COMPLIANCE]
2023-01-15 - Deposit protected
2023-01-15 - Gas safety certificate provided
```

**Generated From:**
- Case-intel `extracted_timeline`
- `generateBundleTimeline()` function
- Categories: procedural, arrears, asb, breach, compliance

---

## File Structure

**Output Location:**

```
/tmp/bundles/
└── {case_id}/
    ├── bundle.txt        # Bundle content (text format in current implementation)
    └── metadata.json     # Bundle metadata
```

**Metadata Structure:**

```json
{
  "bundle_id": "case-12345-1733234567890",
  "case_id": "case-12345",
  "jurisdiction": "england-wales",
  "type": "court",
  "generated_at": "2025-12-03T14:30:00.000Z",
  "file_path": "/tmp/bundles/case-12345/bundle.txt",
  "file_size": 45678,
  "page_count": 52,
  "sections": [
    {
      "tab": "A",
      "title": "Case Summary",
      "start_page": 2,
      "page_count": 3
    },
    {
      "tab": "B",
      "title": "Particulars of Claim (N119)",
      "start_page": 5,
      "page_count": 5
    }
    // ... more sections
  ]
}
```

---

## How Legal Rules Are Used (NOT Created)

### Decision Engine Integration

The bundle builder **reads** decision engine outputs but **never creates** legal rules.

**What the bundle builder reads:**

```typescript
interface DecisionOutput {
  recommended_routes: string[];         // → Shown on cover page
  recommended_grounds: GroundRecommendation[];  // → Used for section ordering
  blocking_issues: BlockingIssue[];     // → Shown as warnings on cover
  warnings: string[];                    // → Included in notes
  analysis_summary: string;              // → May be included in narrative
}
```

**Example Usage:**

```typescript
// ✅ CORRECT: Read decision engine output
const decisionOutput = runDecisionEngine(decisionInput);
const grounds = decisionOutput.recommended_grounds;

// Display grounds in bundle
for (const ground of grounds) {
  bundleContent += `Ground ${ground.code}: ${ground.title}\n`;
}

// ❌ WRONG: Create new legal rule
if (arrears > 2000) {  // DON'T DO THIS!
  grounds.push({ code: '8', title: 'Ground 8' });
}
```

### Case Intelligence Integration

The bundle builder uses case-intel for **narratives and formatting only**.

**What the bundle builder reads:**

```typescript
interface CaseIntelligence {
  score_report: CaseStrengthScore;      // → Shown on cover
  narrative: CaseNarrative;              // → Used in sections
  evidence: EvidenceAnalysis;            // → Evidence index source
  inconsistencies: ConsistencyReport;    // → May trigger warnings
  decision_engine_output: DecisionOutput; // → Pass-through from decision engine
}
```

**Example Usage:**

```typescript
// ✅ CORRECT: Use generated narrative
const caseIntel = await analyzeCase(caseFacts);
bundleContent += caseIntel.narrative.case_summary;

// ✅ CORRECT: Use evidence analysis
const evidenceIndex = generateEvidenceIndex(caseIntel.evidence);

// ❌ WRONG: Override decision engine
if (caseIntel.score_report.score < 50) {  // DON'T DO THIS!
  decisionOutput.recommended_routes = [];
}
```

---

## Bundle Generation Options

```typescript
interface BundleOptions {
  /** Include case intelligence analysis (narratives, scoring) */
  include_case_intel?: boolean;  // Default: true

  /** Include timeline section */
  include_timeline?: boolean;    // Default: true

  /** Include evidence index */
  include_evidence_index?: boolean;  // Default: true

  /** Include ALL uploaded evidence (may be large) */
  include_all_evidence?: boolean;  // Default: false

  /** Custom text for cover page */
  cover_page_text?: string;

  /** Output directory */
  output_dir?: string;  // Default: /tmp/bundles

  /** Watermark text (e.g., "DRAFT") */
  watermark?: string;
}
```

---

## Current Implementation vs Production

### Current Implementation

The current implementation generates **text files** as placeholders for PDF generation.

**Features:**
- ✅ All sections assembled correctly
- ✅ Cover page generated
- ✅ Evidence index formatted
- ✅ Timeline extracted
- ✅ Metadata JSON saved
- ⚠️ Output is `.txt` file (not PDF)
- ⚠️ No actual form filling (placeholders)
- ⚠️ No uploaded document inclusion

### Production Requirements

For production deployment, implement:

1. **PDF Generation**
   - Use library like `pdfkit` or `pdf-lib`
   - Proper page numbering
   - Headers and footers
   - Tab markers/dividers

2. **Form Filling**
   - Integrate with existing form fillers (N5, N119, N5B, Form E)
   - Embed filled forms as sections
   - Maintain field data integrity

3. **Document Assembly**
   - Fetch tenancy agreements from storage
   - Fetch uploaded evidence from storage
   - Merge all PDFs into single bundle
   - Maintain original pagination

4. **Bundle Optimization**
   - Compress images
   - Optimize PDF size
   - OCR for searchability
   - Bookmarks for navigation

5. **Security**
   - Watermarking (if draft)
   - Password protection (optional)
   - Audit trail of who generated bundle

---

## Example Usage

### Generate Court Bundle for Submission

```typescript
import { generateCourtBundle, validateBundleReadiness } from '@/lib/bundles';
import { normalizeCaseFacts } from '@/lib/case-facts/normalize';
import { getWizardFacts } from '@/lib/case-facts/store';

// Get case data
const wizardFacts = await getWizardFacts(caseId);
const caseFacts = normalizeCaseFacts(wizardFacts);

// Validate readiness
const validation = validateBundleReadiness(caseFacts);
if (!validation.ready) {
  console.error('Cannot generate bundle:', validation.issues);
  return;
}

// Generate bundle
const result = await generateCourtBundle(caseFacts, {
  include_case_intel: true,
  include_timeline: true,
  include_evidence_index: true,
  output_dir: '/var/bundles',
});

if (result.success) {
  console.log('✓ Bundle generated successfully');
  console.log('  Path:', result.metadata.file_path);
  console.log('  Pages:', result.metadata.page_count);
  console.log('  Size:', (result.metadata.file_size / 1024).toFixed(2), 'KB');

  // Store metadata in database
  await supabase.from('bundles').insert({
    case_id: caseId,
    bundle_id: result.metadata.bundle_id,
    file_path: result.metadata.file_path,
    metadata: result.metadata,
  });
} else {
  console.error('✗ Bundle generation failed:', result.error);
}
```

### Generate Draft Bundle for Review

```typescript
const result = await generateCourtBundle(caseFacts, {
  watermark: 'DRAFT - FOR REVIEW ONLY',
  include_case_intel: true,
  cover_page_text: 'This is a draft bundle for client review. Do not submit to court.',
});
```

### Generate Minimal Bundle (Fast)

```typescript
const result = await generateCourtBundle(caseFacts, {
  include_case_intel: false,  // Skip AI narrative generation
  include_timeline: false,
  include_evidence_index: false,
});

// Much faster (no OpenAI API calls)
```

---

## API Endpoint Integration

### Suggested Endpoint: `/api/bundles/generate`

```typescript
// src/app/api/bundles/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateCourtBundle, generateTribunalBundle } from '@/lib/bundles';
import { normalizeCaseFacts } from '@/lib/case-facts/normalize';
import { getWizardFacts } from '@/lib/case-facts/store';

export async function POST(request: NextRequest) {
  const { case_id, options } = await request.json();

  // Get case data
  const wizardFacts = await getWizardFacts(case_id);
  const caseFacts = normalizeCaseFacts(wizardFacts);

  // Determine jurisdiction
  const jurisdiction = caseFacts.meta.jurisdiction;

  // Generate appropriate bundle
  let result;
  if (jurisdiction === 'scotland') {
    result = await generateTribunalBundle(caseFacts, options);
  } else if (jurisdiction === 'england-wales') {
    result = await generateCourtBundle(caseFacts, options);
  } else {
    return NextResponse.json(
      { error: 'Unsupported jurisdiction' },
      { status: 400 }
    );
  }

  if (result.success) {
    return NextResponse.json({
      success: true,
      bundle_id: result.metadata.bundle_id,
      file_path: result.metadata.file_path,
      metadata: result.metadata,
    });
  } else {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }
}
```

### Suggested Endpoint: `/api/bundles/download`

```typescript
// src/app/api/bundles/download/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bundleId = searchParams.get('bundle_id');

  // Fetch bundle metadata from database
  const { data: bundle } = await supabase
    .from('bundles')
    .select('*')
    .eq('bundle_id', bundleId)
    .single();

  if (!bundle) {
    return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
  }

  // Read file
  const fileBuffer = fs.readFileSync(bundle.file_path);

  // Return file
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bundle-${bundleId}.pdf"`,
    },
  });
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('validateBundleReadiness', () => {
  it('should pass for valid case', () => {
    const result = validateBundleReadiness(validCase);
    expect(result.ready).toBe(true);
  });

  it('should fail when landlord name missing', () => {
    const result = validateBundleReadiness(invalidCase);
    expect(result.issues).toContain('Landlord name is required');
  });
});

describe('generateEvidenceIndex', () => {
  it('should categorize evidence correctly', () => {
    const index = generateEvidenceIndex(evidenceAnalysis);
    expect(index.by_category.arrears.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe('generateCourtBundle', () => {
  it('should generate complete bundle for minimal case', async () => {
    const result = await generateCourtBundle(minimalCase);
    expect(result.success).toBe(true);
    expect(result.metadata.sections.length).toBeGreaterThan(5);
  });

  it('should handle missing evidence gracefully', async () => {
    const result = await generateCourtBundle(caseWithoutEvidence);
    expect(result.success).toBe(true);
    // Should complete despite missing evidence
  });
});
```

---

## Future Enhancements

### Phase 2 (PDF Generation)

1. **Real PDF Output**
   - Integrate `pdfkit` or `pdf-lib`
   - Proper formatting and styling
   - Page numbers, headers, footers

2. **Form Filling Integration**
   - Embed N5, N119, N5B forms
   - Embed Form E for Scotland
   - Pre-fill all fields from CaseFacts

3. **Document Merging**
   - Fetch and merge tenancy agreements
   - Include uploaded evidence PDFs
   - Maintain document integrity

### Phase 3 (Advanced Features)

1. **Interactive Bundles**
   - Hyperlinked index
   - Bookmarks for easy navigation
   - Cross-references between sections

2. **Bundle Comparison**
   - Compare draft vs final
   - Track changes between versions
   - Audit trail

3. **Smart Assembly**
   - Auto-detect duplicate evidence
   - Optimize page order for presentation
   - Suggest missing documents

4. **Multi-Format Support**
   - PDF (standard)
   - HTML (web preview)
   - DOCX (editable)

---

## Troubleshooting

### Common Issues

**Issue:** Bundle generation fails with "Landlord name is required"

**Solution:** Ensure all required fields are populated before calling `generateCourtBundle()`. Use `validateBundleReadiness()` first.

---

**Issue:** Bundle only contains placeholders for forms

**Solution:** Current implementation uses placeholders. Production version will integrate actual form fillers.

---

**Issue:** Evidence section is empty

**Solution:** Check that `caseIntel.evidence.summary` contains items. Ensure evidence has been uploaded and linked to case.

---

**Issue:** Timeline is empty or incomplete

**Solution:** Timeline is extracted from dates in arrears items, ASB incidents, and notice records. Ensure these have dates populated.

---

## Change Log

### v1.0.0 (2025-12-03)
- Initial implementation of Bundle Builder
- England & Wales court bundles
- Scotland tribunal bundles
- Evidence index and timeline generation
- Text file output (PDF placeholder)
- Comprehensive tests and documentation

---

## Support and Maintenance

### Adding New Sections

To add a new section to bundles:

1. Add section builder function to `sections.ts`
2. Update `buildEnglandWalesSections()` or `buildScotlandSections()`
3. Increment section order numbers
4. Update tests

**Example:**

```typescript
function buildNewSection(caseIntel: CaseIntelligence, tab: string): BundleSection {
  return {
    id: 'new_section',
    title: 'New Section Title',
    tab,
    content_type: 'narrative',
    content: {
      type: 'narrative',
      text: 'New section content...',
    },
    order: 11, // Insert at appropriate position
  };
}
```

### Modifying Section Order

Edit the `order` property in section definitions. Sections are sorted by `order` before assembly.

### Updating Cover Page Format

Edit `generateCoverPage()` function in `index.ts`.

---

**Document Version:** 1.0
**Last Updated:** December 3, 2025
**Maintainer:** Landlord Heaven Engineering Team
