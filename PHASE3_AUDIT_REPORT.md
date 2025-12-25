# PHASE 3 AUDIT REPORT: Evidence Upload, Bundle Index & N5B Checkbox Truthfulness

**Audit Date:** 2025-12-25
**Scope:** Evidence upload pipeline, evidence retrieval, exhibit/index readiness, N5B attachment checkbox truthfulness
**Auditor:** Claude Opus 4.5 (Automated Code Audit)
**Status:** FINDINGS COMPLETE - NO CODE MODIFICATIONS

---

## EXECUTIVE SUMMARY

This audit examined the evidence handling pipeline from upload through court form generation. **Three critical issues were identified:**

| Priority | Issue | Risk Level |
|----------|-------|------------|
| **P0** | N5B attachment checkbox "Deposit Certificate (E)" ticked based on `depositPaid` boolean, NOT actual file upload | **CRITICAL - FALSE STATEMENT RISK** |
| **P0** | Evidence files use PUBLIC URLs via `getPublicUrl()` - user evidence is world-accessible | **CRITICAL - DATA EXPOSURE** |
| **P1** | No validation for file size/type limits at upload endpoint | **HIGH** |
| **P1** | EPC and Gas Safety checkboxes driven by "provided to tenant" flags, not file uploads | **HIGH - POTENTIALLY FALSE** |
| **P2** | Bundle Index framework exists but lacks exhibit mapping rules and route-specific requirements | **MEDIUM** |

**Go/No-Go for "Index + Separate Downloads":** **CONDITIONAL GO** - Data exists but exhibit mapping needs implementation.

---

## A) EVIDENCE UPLOAD AUDIT

### A.1 Entry Points

| Component | Location | Status |
|-----------|----------|--------|
| Upload API | `src/app/api/wizard/upload-evidence/route.ts` | ✅ EXISTS |
| HTTP Method | POST (multipart/form-data) | ✅ |
| Runtime | Node.js | ✅ |

### A.2 Request Parameters

| Parameter | Type | Required | Purpose |
|-----------|------|----------|---------|
| `caseId` | string | ✅ Yes | Associates upload with case |
| `questionId` | string | ✅ Yes | Maps to evidence category flags |
| `category` | string | ⚠️ Optional | Explicit category override |
| `file` | File | ✅ Yes | The actual file blob |

### A.3 Authentication & Authorization

```
Line 141-142: const supabase = createAdminClient();  // ⚠️ BYPASSES RLS
Line 144:     const user = await getServerUser();     // Cookie-based auth
```

**Authorization Flow:**
```
1. Load case record (admin client bypasses RLS)
2. IF case has user_id:
   - Check user is authenticated → 401 if not
   - Check user.id === case.user_id → 403 if mismatch
3. Anonymous cases: Allow upload if user matches or is anonymous
```

**Finding:** Authorization is manually implemented after bypassing RLS. This works but diverges from RLS-first pattern.

### A.4 Storage Configuration

| Aspect | Value | Risk |
|--------|-------|------|
| Bucket Name | `documents` | N/A |
| Storage Path | `{ownerId}/{caseId}/evidence/{uuid}-{sanitizedFilename}` | ✅ Good namespacing |
| URL Type | **PUBLIC** via `getPublicUrl()` | 🔴 **CRITICAL** |
| RLS on Bucket | Not shown in code - relies on path-based security | ⚠️ |

**CRITICAL FINDING (Line 208-211):**
```typescript
const { data: publicUrlData } = supabase.storage
  .from('documents')
  .getPublicUrl(objectKey);  // ← PUBLIC URL GENERATED
const publicUrl = publicUrlData?.publicUrl || null;
```

Evidence files containing tenant personal data, financial records, and sensitive correspondence are **world-accessible by URL**. Anyone with the URL can download without authentication.

### A.5 File Validation

| Check | Implemented | Risk |
|-------|-------------|------|
| File type validation | ❌ NO | Files of any type accepted |
| File size limit | ❌ NO | Unlimited size |
| Filename sanitization | ✅ YES (Line 14-17) | Alphanumeric, dots, underscores, hyphens |
| Virus scanning | ❌ NO | N/A for MVP |

### A.6 Database Records Created

**1. `documents` table (Line 213-225):**
```typescript
{
  user_id: caseRow.user_id || user?.id || null,
  case_id: caseId,
  document_type: 'evidence',
  document_title: file.name,
  jurisdiction: caseRow.jurisdiction,
  pdf_url: publicUrl || objectKey,  // ← PUBLIC URL STORED
  is_preview: false
}
```

**2. `case_facts.facts.evidence` (via `updateWizardFacts`):**
```typescript
{
  evidence: {
    // Boolean flags (Line 249-258)
    tenancy_agreement_uploaded: true/false,
    rent_schedule_uploaded: true/false,
    correspondence_uploaded: true/false,
    damage_photos_uploaded: true/false,
    authority_letters_uploaded: true/false,
    bank_statements_uploaded: true/false,
    safety_certificates_uploaded: true/false,
    asb_evidence_uploaded: true/false,
    other_evidence_uploaded: true/false,

    // Files array (Line 261-262)
    files: [
      {
        id: uuid,
        document_id: uuid,
        question_id: string,
        category: string,
        file_name: string,
        storage_bucket: 'documents',
        storage_path: string,
        mime_type: string,
        size_bytes: number,
        uploaded_at: ISO string
      }
    ],

    // AI analysis results (optional, Line 301-302)
    analysis: { [evidenceId]: analysisResult }
  }
}
```

### A.7 AI Analysis (Optional)

Lines 283-314 show optional AI triage via OpenAI `gpt-4o-mini`:
- Extracts `detected_type`, `extracted_fields`, `confidence`, `warnings`
- Non-blocking (continues on error)
- Results stored in `evidence.analysis[evidenceId]`

---

## B) EVIDENCE RETRIEVAL READINESS

### B.1 Query Sources for Evidence per CaseId

| Source | Query | Returns |
|--------|-------|---------|
| `documents` table | `SELECT * FROM documents WHERE case_id = ? AND document_type = 'evidence'` | Individual document records with `pdf_url` |
| `case_facts.facts.evidence.files` | Load case_facts row, parse `facts.evidence.files` | Array of evidence metadata |
| `case_facts.facts.evidence.*_uploaded` | Boolean flags | Which categories have uploads |

### B.2 Evidence Presence Proof

**Can prove evidence exists from DB/storage for a caseId:** ✅ YES

```typescript
// Authoritative check for evidence presence
const facts = await getWizardFacts(caseId);
const evidenceFiles = facts?.evidence?.files || [];
const hasEvidence = evidenceFiles.length > 0;

// By category
const hasTenancyAgreement = evidenceFiles.some(f =>
  f.category === 'tenancy_agreement' ||
  f.question_id?.includes('tenancy_agreement')
);
```

### B.3 URL Safety Assessment

| URL Type | Security | Recommendation |
|----------|----------|----------------|
| Public URL (`getPublicUrl`) | 🔴 **EXPOSED** | Switch to signed URLs |
| Signed URL (`createSignedUrl`) | ✅ Safe | Use with expiry (e.g., 1 hour) |

**RECOMMENDATION:** Replace `getPublicUrl()` with `createSignedUrl()` at evidence retrieval time, not upload time.

---

## C) BUNDLE INDEX READINESS (No Merge)

### C.1 Existing Infrastructure

| Component | Location | Status |
|-----------|----------|--------|
| Bundle Types | `src/lib/bundles/types.ts` | ✅ Comprehensive |
| Section Builder | `src/lib/bundles/sections.ts` | ✅ EXISTS |
| Evidence Index Generator | `src/lib/bundles/evidence-index.ts` | ✅ EXISTS |
| Bundle Entry Point | `src/lib/bundles/index.ts` | ✅ EXISTS |

### C.2 What Data Exists Now

**Available for Index Generation:**
1. ✅ `EvidenceIndex` type with `by_category`, `by_ground`, `chronological` views
2. ✅ `IndexEntry` type with `title`, `tab`, `page`, `date`, `ground` fields
3. ✅ `generateEvidenceIndex(evidenceAnalysis, tabPrefix)` function
4. ✅ `BundleSection` type supporting `content_type: 'evidence'` and `content_type: 'index'`
5. ✅ Evidence categories from `EvidenceCategory` enum (14 categories)
6. ✅ Evidence files array in `case_facts.facts.evidence.files`

### C.3 What Is MISSING

| Missing Element | Impact | Effort |
|-----------------|--------|--------|
| **Exhibit Label Mapping** | Cannot assign A, B, B1, E, F, G labels | Medium |
| **Required Evidence per Route** | Cannot show "missing" for S21 vs S8 vs Scotland | Medium |
| **PDF Index Output** | Currently outputs text file placeholder | Low |
| **Actual File Fetching** | Sections have placeholder `pdf_data: ''` | Medium |

### C.4 Exhibit Label Mapping Required

Current N5B hardcoded labels (from `official-forms-filler.ts`):
```
A   = Tenancy Agreement
B   = Notice (Section 21)
B1  = Proof of Service
E   = Deposit Certificate
F   = EPC
G   = Gas Safety Certificate(s)
```

**Missing:** No mapping table exists to:
1. Generate exhibit labels dynamically
2. Handle multiple files in same category (G1, G2, G3...)
3. Track which exhibit labels are required vs optional per route

### C.5 Required Evidence Rules per Route

| Route | Required Evidence (N5B Checkboxes) | Currently Enforced |
|-------|-----------------------------------|-------------------|
| S21 Accelerated | A, B, B1, E (if deposit), F, G | ❌ Not validated |
| S8 Standard | A, Notice, Grounds evidence | ❌ Not validated |
| Scotland Notice to Leave | Tenancy, Notice, Pre-action proof | ❌ Not validated |

### C.6 Minimal Design for Index Output

**Recommended Structure (PDF):**
```
BUNDLE INDEX
============

COURT FORMS
  Tab A   N5B Claim Form for Accelerated Possession............pg 1

GENERATED DOCUMENTS
  Tab B   Section 21 Notice (Form 6A)..........................pg 5
  Tab C   Particulars of Claim.................................pg 8
  Tab D   Arrears Schedule.....................................pg 10

UPLOADED EVIDENCE (by Category)
  Tab E   Tenancy Agreement
          E1  tenancy-agreement-2024.pdf.......................pg 12
  Tab F   Deposit Protection
          F1  dps-certificate.pdf..............................pg 18
  Tab G   Compliance Documents
          G1  gas-safety-certificate-2024.pdf..................pg 20
          G2  epc-rating-b.pdf.................................pg 22
  Tab H   Notice & Service
          H1  section21-notice-served.pdf......................pg 24
          H2  proof-of-service-photo.jpg.......................pg 25

MISSING REQUIRED EVIDENCE (S21 Accelerated)
  ⚠️  Energy Performance Certificate not uploaded
```

---

## D) N5B ATTACHMENT CHECKBOX TRUTHFULNESS AUDIT

### D.1 Checkbox Field Mapping

From `official-forms-filler.ts` lines 172-178 and 851-880:

| Checkbox Field | Exhibit | Logic Source | Truthful? |
|----------------|---------|--------------|-----------|
| `ATTACHMENT_TENANCY` | A | `data.tenancy_agreement_uploaded === true` | ✅ YES |
| `ATTACHMENT_NOTICE` | B | `data.notice_copy_available === true` | ✅ YES |
| `ATTACHMENT_SERVICE_PROOF` | B1 | `data.service_proof_available === true` | ✅ YES |
| `ATTACHMENT_DEPOSIT_CERT` | E | `depositPaid` (i.e., `deposit_amount > 0`) | 🔴 **FALSE** |
| `ATTACHMENT_EPC` | F | `data.epc_provided === true` | ⚠️ QUESTIONABLE |
| `ATTACHMENT_GAS` | G | `data.gas_safety_provided === true` | ⚠️ QUESTIONABLE |

### D.2 CRITICAL: Deposit Certificate Checkbox (Exhibit E)

**Current Logic (Line 867-869):**
```typescript
// Deposit certificate (marked E) - only if deposit was paid
if (depositPaid) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_DEPOSIT_CERT, true, ctx);
}
```

**Problem:**
- `depositPaid` = `data.deposit_amount !== undefined && data.deposit_amount > 0`
- This checks if a deposit was **taken**, not if the **certificate was uploaded**
- The checkbox label says: *"Copy of the Tenancy Deposit Certificate marked E"*
- Ticking this declares to the court: "I am attaching a copy of the certificate"

**Result:** If landlord took a deposit but didn't upload the DPS certificate, the form **falsely claims** the certificate is attached.

### D.3 QUESTIONABLE: EPC and Gas Safety Checkboxes

**EPC (Line 873-875):**
```typescript
if (data.epc_provided === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_EPC, true, ctx);
}
```

**Gas Safety (Line 878-880):**
```typescript
if (data.gas_safety_provided === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_GAS, true, ctx);
}
```

**Problem:**
- `epc_provided` and `gas_safety_provided` are compliance flags meaning "given to tenant"
- They do NOT indicate the documents are uploaded for court attachment
- The checkbox says: "I am attaching a copy for the court"

**Result:** If landlord gave EPC to tenant but didn't upload it, form claims it's attached when it isn't.

### D.4 Correct Checkboxes (A, B, B1)

**Tenancy Agreement (Line 851-853):**
```typescript
if (data.tenancy_agreement_uploaded === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_TENANCY, true, ctx);
}
```
✅ This correctly checks an upload flag, not a general boolean.

**Notice Copy (Line 857-859):**
```typescript
if (data.notice_copy_available === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_NOTICE, true, ctx);
}
```
✅ User explicitly confirms notice copy is available.

**Service Proof (Line 863-865):**
```typescript
if (data.service_proof_available === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_SERVICE_PROOF, true, ctx);
}
```
✅ User explicitly confirms proof is available.

### D.5 Data Flow for Checkbox Values

```
Wizard Collection → case_facts.facts → normalize.ts → eviction-wizard-mapper.ts → CaseData → fillN5BForm()
```

**eviction-wizard-mapper.ts (Line 256-262):**
```typescript
tenancy_agreement_uploaded: facts.evidence.tenancy_agreement_uploaded || undefined,
notice_copy_available: wizardFacts.notice_copy_available || wizardFacts.notice_uploaded || undefined,
service_proof_available: wizardFacts.service_proof_available || wizardFacts.proof_of_service_uploaded || undefined,
epc_provided: facts.compliance.epc_provided || wizardFacts.epc_provided || undefined,
gas_safety_provided: facts.compliance.gas_safety_cert_provided || wizardFacts.gas_certificate_provided || undefined,
```

Note: `deposit_certificate_uploaded` is **NOT** mapped - it falls through to the `depositPaid` check.

---

## PRIORITIZED RECOMMENDATIONS

### P0 - CRITICAL (Must Fix Before Production)

#### P0.1 - Deposit Certificate Checkbox Fix

**Problem:** N5B checkbox E ticked based on `deposit_amount > 0`, not actual upload.

**Recommended Delta:**
```typescript
// In eviction-wizard-mapper.ts, add new mapping:
deposit_certificate_uploaded:
  wizardFacts.deposit_certificate_uploaded ||
  facts.evidence.deposit_certificate_uploaded ||  // Check evidence flags
  hasUploadForCategory(facts.evidence.files, 'deposit_protection_certificate') ||
  undefined,

// In official-forms-filler.ts, change line 867-869:
// FROM:
if (depositPaid) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_DEPOSIT_CERT, true, ctx);
}
// TO:
if (data.deposit_certificate_uploaded === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_DEPOSIT_CERT, true, ctx);
}
```

**New Helper Function Required:**
```typescript
function hasUploadForCategory(files: EvidenceFile[], category: string): boolean {
  return files?.some(f => f.category === category) ?? false;
}
```

#### P0.2 - Switch to Signed URLs for Evidence

**Problem:** Evidence files are publicly accessible via URL.

**Recommended Delta:**
```typescript
// In upload-evidence/route.ts, line 208-211:
// REMOVE:
const { data: publicUrlData } = supabase.storage
  .from('documents')
  .getPublicUrl(objectKey);
const publicUrl = publicUrlData?.publicUrl || null;

// REPLACE WITH: Store only the object key, generate signed URLs on retrieval
const publicUrl = null;  // Don't store public URL
// Store objectKey in pdf_url for later signed URL generation

// Create new utility: src/lib/evidence/getSignedEvidenceUrl.ts
export async function getSignedEvidenceUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresIn: number = 3600  // 1 hour
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, expiresIn);
  return error ? null : data.signedUrl;
}
```

### P1 - HIGH PRIORITY

#### P1.1 - EPC/Gas Checkbox Truthfulness

**Problem:** Checkboxes driven by "provided to tenant" flags, not uploads.

**Recommended Delta:**
```typescript
// In eviction-wizard-mapper.ts, add new evidence-based mappings:
epc_uploaded:
  hasUploadForCategory(facts.evidence.files, 'epc') ||
  wizardFacts.epc_uploaded ||
  undefined,

gas_safety_uploaded:
  hasUploadForCategory(facts.evidence.files, 'gas_safety_certificate') ||
  wizardFacts.gas_certificate_uploaded ||
  undefined,

// In official-forms-filler.ts:
// Change to check *_uploaded flags instead of *_provided
if (data.epc_uploaded === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_EPC, true, ctx);
}
if (data.gas_safety_uploaded === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_GAS, true, ctx);
}
```

#### P1.2 - Add Upload Validation

**Recommended Delta:**
```typescript
// In upload-evidence/route.ts, add after line 160:
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json(
    { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
    { status: 400 }
  );
}

if (!ALLOWED_MIME_TYPES.includes(file.type)) {
  return NextResponse.json(
    { error: `File type ${file.type} not allowed. Accepted: PDF, images, Word documents.` },
    { status: 400 }
  );
}
```

### P2 - MEDIUM PRIORITY

#### P2.1 - Exhibit Label Mapping

**Recommended New File:** `src/lib/bundles/exhibit-mapping.ts`

```typescript
export const N5B_EXHIBIT_MAP = {
  'tenancy_agreement': { label: 'A', required: true },
  'notice_copy': { label: 'B', required: true },
  'service_proof': { label: 'B1', required: true },
  'deposit_protection_certificate': { label: 'E', required: 'if_deposit' },
  'epc': { label: 'F', required: true },
  'gas_safety_certificate': { label: 'G', required: 'if_has_gas', multiple: true },
};

export function getExhibitLabel(category: string, index: number = 0): string {
  const mapping = N5B_EXHIBIT_MAP[category];
  if (!mapping) return `Z${index + 1}`; // Fallback

  if (mapping.multiple && index > 0) {
    return `${mapping.label}${index + 1}`; // G1, G2, G3...
  }
  return mapping.label;
}

export function getRequiredEvidence(route: 'S21' | 'S8' | 'Scotland'): string[] {
  // Return list of required evidence categories for route
}
```

#### P2.2 - Bundle Index PDF Generator

**Recommended Enhancement:** Use pdf-lib to generate proper PDF index instead of text file placeholder in `src/lib/bundles/index.ts`.

---

## FINDINGS TABLE

| Area | Status | Risk Level | Evidence |
|------|--------|------------|----------|
| Upload Entry Point | ✅ Exists | Low | `route.ts` line 138 |
| Upload Authentication | ⚠️ Manual (bypasses RLS) | Medium | Lines 141-187 |
| File Validation | ❌ Missing | High | No size/type checks |
| Storage URL Type | 🔴 Public URLs | **Critical** | Line 208-211 `getPublicUrl()` |
| Evidence DB Storage | ✅ Dual storage | Low | `documents` + `case_facts` |
| Evidence Retrieval | ✅ Queryable | Low | Both sources available |
| Bundle Types | ✅ Comprehensive | None | `src/lib/bundles/types.ts` |
| Bundle Index Generator | ✅ Exists | Low | `evidence-index.ts` |
| Exhibit Label Mapping | ❌ Missing | Medium | Hardcoded in N5B only |
| Required Evidence Rules | ❌ Missing | Medium | No route-specific validation |
| N5B Checkbox A (Tenancy) | ✅ Truthful | None | Checks `uploaded` flag |
| N5B Checkbox B (Notice) | ✅ Truthful | None | Checks `available` flag |
| N5B Checkbox B1 (Service) | ✅ Truthful | None | Checks `available` flag |
| N5B Checkbox E (Deposit) | 🔴 **FALSE** | **Critical** | Checks `depositPaid` not upload |
| N5B Checkbox F (EPC) | ⚠️ Questionable | High | Checks `provided` not `uploaded` |
| N5B Checkbox G (Gas) | ⚠️ Questionable | High | Checks `provided` not `uploaded` |

---

## GO/NO-GO DECISION

### For "Index + Separate Downloads" Feature:

**CONDITIONAL GO** ✅

**Rationale:**
1. Evidence data IS queryable from `case_facts.facts.evidence.files`
2. Evidence categories ARE defined in `EvidenceCategory` enum
3. Bundle index types and generators exist
4. Missing pieces (exhibit mapping, required rules) are additive, not blocking

**Prerequisites Before Launch:**
1. ✅ Implement exhibit label mapping (P2.1)
2. ✅ Fix signed URL generation (P0.2) - cannot serve public URLs in downloads
3. ⚠️ Optionally add "required evidence" validation

---

## APPENDIX: Key File Locations

| Purpose | File |
|---------|------|
| Upload API | `src/app/api/wizard/upload-evidence/route.ts` |
| Evidence Schema | `src/lib/evidence/schema.ts` |
| Case Facts Schema | `src/lib/case-facts/schema.ts` |
| N5B Form Filler | `src/lib/documents/official-forms-filler.ts` |
| Wizard Mapper | `src/lib/documents/eviction-wizard-mapper.ts` |
| Pack Generator | `src/lib/documents/eviction-pack-generator.ts` |
| Bundle Types | `src/lib/bundles/types.ts` |
| Evidence Index | `src/lib/bundles/evidence-index.ts` |
| Database Schema | `supabase/schema.sql` |

---

**End of Phase 3 Audit Report**
