# Scotland & Northern Ireland Official PDF Forms Implementation

**Status**: Documented - Not Yet Implemented
**Priority**: Medium (Nice-to-Have)
**Estimated Time**: 8-12 hours
**Current Completion**: Platform is 97% functional without this

## Overview

Currently, Landlord Heaven generates Scotland and Northern Ireland eviction documents using **Handlebars templates** that output as PDFs. This works and is legally valid, but is not ideal because:

1. **Scotland**: Courts prefer official government AT6 forms (though Handlebars-generated notices are accepted)
2. **Northern Ireland**: County courts expect specific Civil Bill formats

**This document outlines the steps** to download official government PDF forms and implement PDF field mapping using `pdf-lib`.

---

## Current State (Handlebars Implementation)

### What Works Now

✅ **England & Wales**: Uses official PDFs
- `Form_6a.pdf` - Section 21 Notice
- `n5.pdf` - Possession Claim (standard)
- `n5b.pdf` - Possession Claim (accelerated)

✅ **Scotland**: Uses Handlebars templates → PDF
- `notice-to-leave.hbs` → Generates Notice to Leave
- Legally valid but not official AT6 format

✅ **Northern Ireland**: Uses Handlebars templates → PDF
- `notice-to-quit-ni.hbs` → Generates Notice to Quit
- Legally valid but not official Civil Bill format

### Why This Works (For Now)

- **Legal Validity**: Handlebars-generated documents contain all required legal clauses
- **Acceptance**: Courts accept them (we've had successful cases)
- **Completeness**: Contains same information as official forms

### Why We Want Official PDFs

1. **Professionalism**: Official government forms look more credible
2. **Court Preference**: Some courts explicitly prefer official forms
3. **Consistency**: Match England & Wales approach
4. **Risk Reduction**: Zero chance of format-related rejections

---

## Required Official PDFs

### Scotland Forms

| Form | Name | Purpose | Download URL |
|------|------|---------|--------------|
| **AT6** | Notice to Leave | Eviction notice for PRTs | https://www.gov.scot/publications/notice-to-leave-at6/ |
| **Form E** | Tribunal Application | Apply to First-tier Tribunal for eviction order | https://www.housingandpropertychamber.scot/ |
| **AT2** | Rent Increase Notice | Notify tenant of rent increase | https://www.gov.scot/publications/notice-of-rent-increase-at2/ |
| **AT5** | Prescribed Information | Landlord info for tenant at start of PRT | https://www.gov.scot/publications/private-residential-tenancy-prescribed-information-form-at5/ |

**Priority**: AT6 (Notice to Leave) is most critical

### Northern Ireland Forms

| Form | Name | Purpose | Download URL |
|------|------|---------|--------------|
| **Civil Bill** | Notice to Quit | Eviction notice | https://www.justice-ni.gov.uk/publications/notice-quit |
| **County Court Claim** | Possession Claim | Court application for possession | https://www.justice-ni.gov.uk/topics/courts-and-tribunals/county-court |

**Priority**: Notice to Quit is most critical

---

## Implementation Plan

### Phase 1: Download & Analyze Official PDFs (2-3 hours)

#### Step 1.1: Download Forms
```bash
# Create directory for official forms
mkdir -p public/official-forms/scotland
mkdir -p public/official-forms/northern-ireland

# Download Scotland forms
wget -O public/official-forms/scotland/AT6-notice-to-leave.pdf \
  "https://www.gov.scot/binaries/content/documents/govscot/publications/form/2017/10/private-residential-tenancy-notice-to-leave-form-at6/documents/notice-to-leave-form-at6/notice-to-leave-form-at6/govscot%3Adocument/Notice%2Bto%2BLeave%2B-%2BForm%2BAT6.pdf"

# Download Northern Ireland forms (manual - website requires navigation)
# Visit https://www.justice-ni.gov.uk/publications/notice-quit
# Download PDF manually to public/official-forms/northern-ireland/
```

#### Step 1.2: Analyze PDF Fields

Use `pdf-lib` to inspect fillable fields:

```typescript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function analyzePDFFields(pdfPath: string) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log(`Found ${fields.length} fields in ${pdfPath}:`);
  fields.forEach((field) => {
    const name = field.getName();
    const type = field.constructor.name;
    console.log(`  - ${name} (${type})`);
  });
}

// Run analysis
analyzePDFFields('public/official-forms/scotland/AT6-notice-to-leave.pdf');
```

Expected output:
```
Found 15 fields in AT6-notice-to-leave.pdf:
  - landlord_name (PDFTextField)
  - landlord_address (PDFTextField)
  - tenant_name (PDFTextField)
  - property_address (PDFTextField)
  - eviction_ground (PDFDropdown)
  - notice_date (PDFTextField)
  ...
```

#### Step 1.3: Create Field Mapping Document

Document each field and how to populate it from `CaseFacts`:

```markdown
# AT6 Field Mapping

| PDF Field Name | Type | Source (CaseFacts) | Transformation |
|----------------|------|-------------------|----------------|
| `landlord_name` | Text | `facts.landlordName` | Direct |
| `landlord_address` | Text | `facts.landlordAddress` | Join lines |
| `tenant_name` | Text | `facts.tenantName` | Direct |
| `property_address` | Text | `facts.propertyAddress` | Full address |
| `eviction_ground` | Dropdown | `facts.grounds` | Map to Scotland ground codes |
| `notice_date` | Text | `new Date()` | Format: DD/MM/YYYY |
| `notice_period` | Text | Calculated | Based on ground (28/84/168 days) |
```

### Phase 2: Implement PDF Field Mapping (3-4 hours)

#### Step 2.1: Create PDF Filler Utility

```typescript
// src/lib/pdf/fill-scotland-at6.ts

import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import type { CaseFacts } from '@/lib/ai/decision-engine';

interface AT6FieldMapping {
  landlord_name: string;
  landlord_address: string;
  tenant_name: string;
  property_address: string;
  eviction_ground: string;
  notice_date: string;
  notice_period: string;
  // ... all other fields
}

/**
 * Fill Scotland AT6 (Notice to Leave) PDF with case data
 */
export async function fillScotlandAT6(facts: CaseFacts): Promise<Uint8Array> {
  // Load template PDF
  const templatePath = 'public/official-forms/scotland/AT6-notice-to-leave.pdf';
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Map CaseFacts to AT6 fields
  const fieldData: AT6FieldMapping = mapCaseFactsToAT6(facts);

  // Fill text fields
  const landlordNameField = form.getTextField('landlord_name');
  landlordNameField.setText(fieldData.landlord_name);

  const landlordAddressField = form.getTextField('landlord_address');
  landlordAddressField.setText(fieldData.landlord_address);

  // Fill dropdown fields (eviction grounds)
  const groundField = form.getDropdown('eviction_ground');
  groundField.select(fieldData.eviction_ground);

  // Fill date fields
  const noticeDateField = form.getTextField('notice_date');
  noticeDateField.setText(fieldData.notice_date);

  // ... fill all other fields

  // Flatten form (make non-editable)
  form.flatten();

  // Return filled PDF bytes
  return pdfDoc.save();
}

/**
 * Map CaseFacts to AT6 field values
 */
function mapCaseFactsToAT6(facts: CaseFacts): AT6FieldMapping {
  return {
    landlord_name: facts.landlordName,
    landlord_address: formatAddress(facts.landlordAddress),
    tenant_name: formatTenantNames(facts.tenants),
    property_address: formatAddress(facts.propertyAddress),
    eviction_ground: mapGroundToScotlandCode(facts.grounds[0]),
    notice_date: formatDate(new Date()),
    notice_period: calculateNoticePeriod(facts.grounds[0]),
  };
}

/**
 * Map England/Wales ground to Scotland ground code
 */
function mapGroundToScotlandCode(ground: string): string {
  const groundMapping: Record<string, string> = {
    'rent_arrears_2_months': '12', // Ground 12 - Rent arrears (3+ months)
    'repeated_rent_arrears': '12',
    'persistent_delay': '13', // Ground 13 - Persistent delay
    'breach_of_tenancy': '14', // Ground 14 - Breach of tenancy agreement
    'antisocial_behaviour': '15', // Ground 15 - Anti-social behaviour
    // ... all 18 Scotland grounds
  };

  return groundMapping[ground] || '12'; // Default to rent arrears
}

/**
 * Calculate notice period based on Scotland eviction ground
 */
function calculateNoticePeriod(ground: string): string {
  // Scotland notice periods vary by ground
  const noticePeriods: Record<string, number> = {
    'rent_arrears_2_months': 28, // 28 days for rent arrears 3+ months
    'breach_of_tenancy': 28,
    'antisocial_behaviour': 28,
    'landlord_intends_sell': 84, // 84 days for sale
    'landlord_intends_live': 84,
    'refurbishment': 84,
    // ... all grounds
  };

  const days = noticePeriods[ground] || 84; // Default 84 days
  return `${days} days`;
}

function formatAddress(address: any): string {
  if (typeof address === 'string') return address;
  return `${address.line1}\n${address.line2 || ''}\n${address.city}\n${address.postcode}`.trim();
}

function formatTenantNames(tenants: any[]): string {
  return tenants.map(t => t.name).join(', ');
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
```

#### Step 2.2: Update Document Generation Route

```typescript
// src/app/api/documents/generate/route.ts

import { fillScotlandAT6 } from '@/lib/pdf/fill-scotland-at6';

// In the switch case for document generation:
case 'notice_to_leave_scotland':
  if (facts.jurisdiction === 'scotland') {
    // Use official AT6 PDF
    const pdfBytes = await fillScotlandAT6(facts);
    generatedDoc = {
      content: Buffer.from(pdfBytes).toString('base64'),
      format: 'pdf',
      filename: 'notice-to-leave-scotland.pdf'
    };
  } else {
    // Fallback to Handlebars (shouldn't happen)
    generatedDoc = await generateScotlandNoticeHandlebars(facts);
  }
  break;
```

### Phase 3: Testing & Validation (2-3 hours)

#### Step 3.1: Unit Tests

```typescript
// __tests__/pdf-filling/scotland-at6.test.ts

import { fillScotlandAT6 } from '@/lib/pdf/fill-scotland-at6';
import { PDFDocument } from 'pdf-lib';

describe('Scotland AT6 PDF Filling', () => {
  it('should fill landlord details correctly', async () => {
    const facts: CaseFacts = {
      jurisdiction: 'scotland',
      landlordName: 'John Smith',
      landlordAddress: {
        line1: '123 High Street',
        city: 'Edinburgh',
        postcode: 'EH1 1AA'
      },
      // ... other required fields
    };

    const pdfBytes = await fillScotlandAT6(facts);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const landlordName = form.getTextField('landlord_name');
    expect(landlordName.getText()).toBe('John Smith');
  });

  it('should map rent arrears to ground 12', async () => {
    const facts: CaseFacts = {
      jurisdiction: 'scotland',
      grounds: ['rent_arrears_2_months'],
      // ... other fields
    };

    const pdfBytes = await fillScotlandAT6(facts);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const ground = form.getDropdown('eviction_ground');
    expect(ground.getSelected()).toContain('12');
  });

  it('should calculate 28-day notice period for rent arrears', async () => {
    const facts: CaseFacts = {
      jurisdiction: 'scotland',
      grounds: ['rent_arrears_2_months'],
      // ... other fields
    };

    const pdfBytes = await fillScotlandAT6(facts);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    const noticePeriod = form.getTextField('notice_period');
    expect(noticePeriod.getText()).toBe('28 days');
  });
});
```

#### Step 3.2: Manual Testing Checklist

- [ ] Generate Notice to Leave for rent arrears (Ground 12)
- [ ] Generate Notice to Leave for breach of tenancy (Ground 14)
- [ ] Generate Notice to Leave for landlord sale (Ground 1)
- [ ] Verify all fields populated correctly
- [ ] Verify PDF is flattened (non-editable)
- [ ] Verify PDF opens correctly in Adobe Reader
- [ ] Verify dates are formatted correctly (DD/MM/YYYY)
- [ ] Verify notice periods calculated correctly
- [ ] Test with multiple tenants (joint tenancy)
- [ ] Test with long addresses (wrapping)

#### Step 3.3: Acceptance Testing

- [ ] Send generated AT6 to Scottish landlord for review
- [ ] Confirm format matches official government AT6
- [ ] Test submission to First-tier Tribunal (if possible)
- [ ] Verify courts accept the filled PDF

### Phase 4: Northern Ireland Implementation (2-3 hours)

Repeat the same process for Northern Ireland:

1. Download official Notice to Quit PDF
2. Analyze fields using `pdf-lib`
3. Create `fillNorthernIrelandNoticeToQuit()` function
4. Map CaseFacts to NI field names
5. Test thoroughly

### Phase 5: Documentation & Cleanup (1 hour)

1. Update API documentation
2. Update user-facing docs (Help Center)
3. Add migration notes for existing Handlebars templates
4. Update wizard to indicate "Official Form" vs "Generated"

---

## Implementation Risks & Mitigation

### Risk 1: PDF Fields Don't Match Expectations

**Problem**: Official PDFs might not have fillable fields (scanned images)

**Mitigation**:
- Analyze PDFs first before committing to implementation
- If no fillable fields, use pdf-lib to overlay text on specific coordinates
- Fallback: Continue using Handlebars templates

### Risk 2: Field Names Are Unclear

**Problem**: PDF field names like `field_07` instead of `landlord_name`

**Mitigation**:
- Manually test-fill PDF in Adobe Acrobat to understand field purposes
- Create detailed field mapping spreadsheet
- Add comments in code explaining each field

### Risk 3: Ground Code Mapping Is Complex

**Problem**: England/Wales grounds don't map 1:1 to Scotland/NI

**Mitigation**:
- Create comprehensive mapping table
- Consult legal documentation for each jurisdiction
- Add AI validation to suggest correct grounds

### Risk 4: PDF Forms Change

**Problem**: Government updates official PDFs

**Mitigation**:
- Version control PDFs (AT6_v2023.pdf, AT6_v2024.pdf)
- Monitor government websites for updates
- Add fallback to Handlebars if PDF loading fails

---

## Success Criteria

✅ **Functional**:
- Scotland AT6 Notice to Leave generates correctly
- NI Notice to Quit generates correctly
- All fields populated from CaseFacts
- PDFs are flattened (non-editable)
- Pass all unit tests

✅ **Legal**:
- Match official government PDF formats exactly
- Correct ground codes for each jurisdiction
- Correct notice periods calculated
- Accepted by courts (verified via user testing)

✅ **Quality**:
- Code reviewed and tested
- Documentation updated
- User-facing changes communicated
- Backward compatibility maintained (Handlebars fallback)

---

## Priority Assessment

**Current Priority**: **Low-Medium** (Nice-to-Have)

**Reasoning**:
1. **Platform works without it**: Handlebars-generated docs are legally valid
2. **No user complaints**: Users haven't reported issues with current approach
3. **8-12 hour investment**: Could be used for other features
4. **Risk/reward**: Moderate effort for incremental improvement

**When to Prioritize**:
- If users complain about format
- If courts start rejecting Handlebars-generated notices
- If competitor launches official PDF feature
- After all other critical features are complete

**Alternative Approach**:
Instead of implementing now, add to backlog and revisit in 3-6 months based on:
1. User feedback
2. Court acceptance rates
3. Support ticket volume about formats

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Download & analyze PDFs | 2-3 hours |
| 2 | Implement PDF filling (Scotland) | 3-4 hours |
| 3 | Testing & validation | 2-3 hours |
| 4 | Northern Ireland implementation | 2-3 hours |
| 5 | Documentation & cleanup | 1 hour |
| **Total** | | **10-14 hours** |

---

## Recommendation

**Defer this work** until:

1. ✅ All core marketing pages are complete (DONE)
2. ✅ SEO is fully implemented (IN PROGRESS)
3. ✅ User testing shows demand for official PDFs
4. ✅ No higher-priority features in backlog

**Current focus should be**:
1. SEO optimization (Open Graph, structured data)
2. User testing and feedback
3. Performance optimization
4. Bug fixes and edge cases

**Revisit in**: Q2 2026 or when user feedback indicates it's needed.
