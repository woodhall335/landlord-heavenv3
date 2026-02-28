# Phase 3 Audit Report: Evidence Upload, Bundle Index & N5B Attachment Truthfulness

**Audit Date:** 2025-12-25
**Auditor:** Claude Code (Automated Audit)
**Status:** READ-ONLY AUDIT - No code changes made
**Branch:** `claude/audit-evidence-upload-LZlFg`

---

## Executive Summary

| Area | Status | Risk Level |
|------|--------|------------|
| Evidence Upload Pipeline | CONDITIONAL GO | P1 - High Risk |
| Evidence Storage Security | **NO-GO** | **P0 - Critical** |
| N5B Checkbox Truthfulness | **NO-GO** | **P0 - False Statements** |
| Court Forms vs Prescribed Notices | GO | Low Risk |
| Bundle Index Readiness | CONDITIONAL GO | P2 - Non-blocking |

### Overall Verdict: **CONDITIONAL GO**

The system requires **critical fixes** before court submission readiness:

1. **P0 BLOCKING:** Evidence storage uses public URLs - data exposure risk
2. **P0 BLOCKING:** N5B attachment checkboxes E, F, G tick based on compliance flags, not actual evidence uploads
3. **P1 HIGH:** Missing file validation (size limits, MIME types)
4. **P1 HIGH:** Notice copy (B) and Service proof (B1) checkboxes rely on user confirmation without upload verification

---

## A. Evidence Upload Audit

### A.1 Upload Pipeline

**File:** `src/app/api/wizard/upload-evidence/route.ts`

#### Authentication & Authorization

| Check | Status | Details |
|-------|--------|---------|
| User authentication | PASS | Uses `getServerUser()` for cookie-based auth |
| Case ownership validation | PASS | Verifies `caseRow.user_id === user.id` (line 184-185) |
| Admin client bypass | INFO | Uses `createAdminClient()` to bypass RLS for storage operations |
| Anonymous upload prevention | PASS | Returns 401 for owned cases without valid user |

#### Storage Configuration

| Aspect | Current Implementation | Assessment |
|--------|----------------------|-------------|
| Bucket | `documents` | Correct |
| Path structure | `{ownerId}/{caseId}/evidence/{uuid}-{safeFilename}` | Good - prevents path traversal |
| UUID prefixing | Yes | Prevents filename collisions |
| Filename sanitization | Yes (line 14-17) | Only allows `a-zA-Z0-9_.-` |

#### Database Integration

| Aspect | Status | Details |
|--------|--------|---------|
| Documents table record | PASS | Creates record with document_type='evidence' |
| Case facts update | PASS | Updates `case_facts.evidence.files[]` array |
| Evidence flags | PASS | Sets appropriate `*_uploaded` boolean flags |
| Multiple files per category | PASS | Appends to existing `files` array |

#### Metadata Written

```typescript
// Evidence entry structure (lines 232-243)
{
  id: string,           // UUID
  document_id: string,  // References documents table
  question_id: string,  // Source wizard question
  category: string,     // Evidence category
  file_name: string,    // Original filename (sanitized)
  storage_bucket: 'documents',
  storage_path: string, // Full path in bucket
  mime_type: string,
  size_bytes: number,
  uploaded_at: string   // ISO 8601
}
```

**Finding A.1.1 (P2):** AI analysis is optional and non-blocking - graceful degradation is implemented.

### A.2 Storage & Security

#### P0 CRITICAL FINDING: Public URL Exposure

**Location:** `src/app/api/wizard/upload-evidence/route.ts` lines 208-211

```typescript
const { data: publicUrlData } = supabase.storage
  .from('documents')
  .getPublicUrl(objectKey);
const publicUrl = publicUrlData?.publicUrl || null;
```

**Issue:** The system generates PUBLIC URLs for evidence files. If the Supabase storage bucket `documents` is configured as public, ALL evidence files are accessible without authentication.

**Risk:**
- Tenancy agreements exposed
- Personal correspondence exposed
- Bank statements exposed
- Sensitive landlord/tenant information exposed

**Recommendation:**
1. Verify bucket is set to PRIVATE in Supabase Storage settings
2. Replace `getPublicUrl()` with `createSignedUrl()` for time-limited access
3. Implement download proxy endpoint with authentication

#### Storage Path Analysis

| Check | Status |
|-------|--------|
| Cross-case access prevention | PASS - Path includes `caseId` |
| Cross-user access prevention | PASS - Path includes `ownerId` |
| Path traversal prevention | PASS - Filename sanitized, UUID prepended |

### A.3 File Validation

#### P1 HIGH RISK: Missing Validations

| Validation | Status | Risk |
|------------|--------|------|
| Maximum file size | **MISSING** | DoS via large file uploads |
| Allowed MIME types | **MISSING** | Malicious file uploads |
| File content validation | **MISSING** | MIME type spoofing |
| Filename length limit | **MISSING** | Potential buffer issues |

**Current Sanitization Only:**
```typescript
function sanitizeFilename(name: string) {
  const trimmed = name?.trim() || 'upload';
  return trimmed.replace(/[^a-zA-Z0-9_.-]+/g, '_');
}
```

**Recommendation:** Implement validation for:
- Max 10MB file size
- Allowed types: `application/pdf`, `image/jpeg`, `image/png`, `image/gif`
- Filename max 255 characters

---

## B. Court Forms vs Evidence Truthfulness

### B.1 Court Forms (N5 / N5B / N119 / N1)

**File:** `src/lib/documents/official-forms-filler.ts`

| Form | Source PDF | Status |
|------|-----------|--------|
| N5 | `public/official-forms/n5-eng.pdf` | PASS - Official HMCTS PDF |
| N5B | `public/official-forms/n5b-eng.pdf` | PASS - Official HMCTS PDF |
| N119 | `public/official-forms/n119-eng.pdf` | PASS - Official HMCTS PDF |
| N1 | `public/official-forms/N1_1224.pdf` | PASS - Official HMCTS PDF |
| Form 6A | `public/official-forms/form_6a.pdf` | PASS - Official prescribed form |

**Verification:** Only official PDFs are used, filled via pdf-lib field mapping.

### B.2 N5B Attachment Checkbox Truthfulness (CRITICAL)

**Form:** N5B - Claim for possession (accelerated procedure)
**File:** `src/lib/documents/official-forms-filler.ts` lines 844-880

#### Checkbox Analysis Matrix

| Checkbox | Exhibit | What It Claims | Current Driver | Truthful? | Risk |
|----------|---------|----------------|----------------|-----------|------|
| Copy of tenancy agreement | A | Document attached | `tenancy_agreement_uploaded === true` | **YES** | None |
| Copy of notice | B | Document attached | `notice_copy_available === true` | **CONDITIONAL** | P1 |
| Proof of service | B1 | Document attached | `service_proof_available === true` | **CONDITIONAL** | P1 |
| Deposit certificate | E | Document attached | `depositPaid` (amount > 0) | **NO** | **P0** |
| EPC | F | Document attached | `epc_provided === true` | **NO** | **P0** |
| Gas safety records | G | Document attached | `gas_safety_provided === true` | **NO** | **P0** |

#### Detailed Findings

##### P0 FALSE STATEMENT: Exhibit E (Deposit Certificate)

**Code Location:** Lines 867-870
```typescript
// Deposit certificate (marked E) - only if deposit was paid
if (depositPaid) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_DEPOSIT_CERT, true, ctx);
}
```

**Issue:** Checkbox ticks if `deposit_amount > 0`, NOT if certificate is uploaded.

**Legal Risk:** Court form claims document is attached when it may not be.

##### P0 FALSE STATEMENT: Exhibit F (EPC)

**Code Location:** Lines 872-875
```typescript
// EPC (marked F) - only if user confirmed EPC was provided
if (data.epc_provided === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_EPC, true, ctx);
}
```

**Issue:** `epc_provided` is a compliance flag meaning "EPC was provided to tenant", NOT "EPC copy uploaded for court".

**Data Source:** `CaseFacts.compliance.epc_provided` (schema.ts line 336)

##### P0 FALSE STATEMENT: Exhibit G (Gas Safety Records)

**Code Location:** Lines 877-880
```typescript
// Gas safety records (marked G) - only if user confirmed gas cert was provided
if (data.gas_safety_provided === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_GAS, true, ctx);
}
```

**Issue:** `gas_safety_provided` is a compliance flag, not an upload flag.

**Data Source:** `CaseFacts.compliance.gas_safety_cert_provided` (schema.ts line 335)

##### P1 CONDITIONAL RISK: Exhibits B and B1

**Code Location:** Lines 857-865
```typescript
// Notice copy (marked B) - required attachment
if (data.notice_copy_available === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_NOTICE, true, ctx);
}

// Proof of service (marked B1) - required attachment
if (data.service_proof_available === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_SERVICE_PROOF, true, ctx);
}
```

**Issue:** These flags are user confirmations collected in wizard, not verified uploads.

**Risk Level:** Lower than E/F/G because:
1. Notice copy is often the system-generated Form 6A (available)
2. Proof of service may be completed at time of service

**Recommendation:** Require explicit upload or confirmation step that distinguishes "I have this" from "I've uploaded this".

#### Truthful Checkbox: Exhibit A

**Code Location:** Lines 849-853
```typescript
// Tenancy agreement (marked A) - required attachment
if (data.tenancy_agreement_uploaded === true) {
  setCheckbox(form, N5B_CHECKBOXES.ATTACHMENT_TENANCY, true, ctx);
}
```

**Assessment:** TRUTHFUL - `tenancy_agreement_uploaded` is set by actual file upload in `upload-evidence/route.ts` line 77-78.

---

## C. Prescribed Notices (HBS-Generated)

### Treatment Assessment

| Notice Type | Template Location | Treatment | Correct? |
|-------------|------------------|-----------|----------|
| Section 21 (Form 6A) | `config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs` | HBS template, PDF generated | **YES** |
| Section 8 (Form 3) | `config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs` | HBS template, PDF generated | **YES** |
| Wales RHW forms | `config/jurisdictions/uk/wales/templates/notice_only/*.hbs` | HBS templates | **YES** |
| Scotland Notice to Leave | `config/jurisdictions/uk/scotland/templates/notice_only/*.hbs` | HBS templates | **YES** |

### Verification Points

1. **NOT filled via official-forms-filler.ts:** Confirmed - these templates are in `/config/jurisdictions/` not used by `fillOfficialForm()`

2. **Treated as served notices:** Confirmed - the Form 6A template (line 424-430) matches prescribed wording:
   ```html
   <h1>Notice Requiring Possession of a Property in England<br>
   Let on an Assured Shorthold Tenancy</h1>
   ```

3. **Included as evidence:** When generated, would be stored as evidence copy, not court form.

4. **N5B "notice copy" checkbox:** Uses `notice_copy_available` flag which correctly refers to the served notice.

### Finding: CORRECT IMPLEMENTATION

Prescribed notices are:
- Generated via HBS templates with correct legal wording
- Treated as copies of served documents
- Not misrepresented as "official court forms"
- Courts require Form 6A wording, not an official PDF - this is satisfied

---

## D. Evidence Retrieval Readiness

### Database Query Capability

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Retrieve by caseId | PASS | `case_facts.evidence.files` contains all evidence for case |
| Group by category | PASS | Each file has `category` field |
| Multiple files per category | PASS | Array structure supports N files |
| Evidence flags | PASS | Boolean flags track presence by type |

### Evidence Schema (from `src/lib/case-facts/schema.ts`)

```typescript
interface EvidenceFacts {
  tenancy_agreement_uploaded: boolean;
  rent_schedule_uploaded: boolean;
  correspondence_uploaded: boolean;
  damage_photos_uploaded: boolean;
  authority_letters_uploaded: boolean;
  bank_statements_uploaded: boolean;
  safety_certificates_uploaded?: boolean;
  asb_evidence_uploaded?: boolean;
  other_evidence_uploaded: boolean;
  missing_evidence_notes: string[];
  analysis?: Record<string, any>;
}
```

### Download Link Security

| Aspect | Current | Required |
|--------|---------|----------|
| URL type | Public URLs | Signed URLs |
| Expiration | None | 15-60 minutes |
| Authentication | None | Required |
| Audit logging | Not implemented | Recommended |

---

## E. Bundle Index Readiness (No Merge)

### Existing Infrastructure

**Files Analyzed:**
- `src/lib/bundles/index.ts` - Main bundle generation
- `src/lib/bundles/evidence-index.ts` - Evidence indexing
- `src/lib/bundles/sections.ts` - Section builders
- `src/lib/bundles/types.ts` - Type definitions

### Current Capabilities

| Feature | Status | Notes |
|---------|--------|-------|
| Bundle index structure | EXISTS | `EvidenceIndex` interface defined |
| Court forms listed | EXISTS | Sections include form references |
| Generated documents listed | EXISTS | Notices, narratives included |
| Uploaded evidence listed | EXISTS | Evidence section with items |
| Category grouping | EXISTS | `by_category` field in index |
| Chronological ordering | EXISTS | `chronological` field |
| Tab/page numbering | EXISTS | Placeholder values, needs PDF assembly |

### Evidence Index Structure (from `types.ts`)

```typescript
interface EvidenceIndex {
  title: string;
  by_category: { [category: string]: EvidenceIndexItem[] };
  by_ground: { [ground: string]: EvidenceIndexItem[] };
  chronological: EvidenceIndexItem[];
  total_count: number;
}
```

### Missing Evidence Highlighting

**File:** `src/lib/case-intel/evidence.ts` function `identifyMissingEvidence()`

Routes covered:
- Section 21: Gas safety, EPC, How to Rent
- Section 8 Grounds: Bank statements, ASB logs, photos, correspondence
- Scotland: Pre-action requirements

### What Exists Today

1. Index generation via `generateEvidenceIndex()`
2. Section builders for England/Wales and Scotland
3. Evidence categorization by type and ground
4. Missing evidence identification per route
5. Timeline extraction from case facts

### What Is Missing (Additive)

| Feature | Status | Effort |
|---------|--------|--------|
| PDF index generation | Placeholder only | Medium |
| Actual page numbers | Placeholder values | Medium |
| Download links in index | Not implemented | Low |
| Separate file downloads UI | Not audited | Medium |

### What Is Unsafe/Misleading

1. **P0:** If index references evidence that uses public URLs, those links expose files
2. **P1:** Page numbers are hardcoded placeholders, not actual values

---

## Prioritized Findings Summary

### P0 - Critical / False Statements / Data Exposure

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| P0-1 | Evidence storage uses PUBLIC URLs | `upload-evidence/route.ts:208-211` | All evidence files potentially world-accessible |
| P0-2 | N5B Exhibit E checkbox falsely ticks based on deposit amount | `official-forms-filler.ts:867-870` | False court statement |
| P0-3 | N5B Exhibit F checkbox falsely ticks based on compliance flag | `official-forms-filler.ts:872-875` | False court statement |
| P0-4 | N5B Exhibit G checkbox falsely ticks based on compliance flag | `official-forms-filler.ts:877-880` | False court statement |

### P1 - High Risk / Misleading

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| P1-1 | No file size limit on uploads | `upload-evidence/route.ts` | DoS risk |
| P1-2 | No MIME type validation | `upload-evidence/route.ts` | Security risk |
| P1-3 | N5B Exhibit B/B1 rely on user confirmation | `official-forms-filler.ts:857-865` | Potential false statement if user error |

### P2 - Missing But Non-Blocking

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| P2-1 | Bundle index outputs text file, not PDF | `bundles/index.ts:260-261` | Production readiness |
| P2-2 | Page numbers are placeholder values | `bundles/sections.ts:278-294` | Index accuracy |
| P2-3 | No download audit logging | N/A | Compliance |

---

## Recommendations for Phase 3 Build

### Must Fix Before Go-Live (P0)

1. **Storage Security:**
   - Verify Supabase `documents` bucket is PRIVATE
   - Replace `getPublicUrl()` with `createSignedUrl()` with 15-minute expiry
   - Create authenticated download endpoint

2. **N5B Checkbox Truthfulness:**
   - Create new evidence flags: `deposit_certificate_uploaded`, `epc_uploaded`, `gas_safety_uploaded`
   - Update upload mapping to set these flags
   - Update `fillN5BForm()` to check upload flags, not compliance flags
   - Only tick checkboxes when actual evidence file exists

### Should Fix (P1)

3. **File Validation:**
   - Add max file size check (10MB recommended)
   - Validate MIME types against allowlist
   - Consider antivirus scanning for uploads

4. **Notice/Service Proof:**
   - Add upload requirement or explicit confirmation step
   - Consider auto-generating proof of service template

### Nice to Have (P2)

5. **Bundle Index:**
   - Implement PDF generation for index
   - Calculate actual page numbers during PDF assembly
   - Add signed download links to index entries

---

## Test Cases for Phase 3 Validation

### Evidence Upload Tests

```
TEST-1: Upload file, verify signed URL returned (not public)
TEST-2: Upload >10MB file, verify rejection
TEST-3: Upload .exe file, verify rejection
TEST-4: Upload to another user's case, verify 403
TEST-5: Verify evidence flags set correctly per category
```

### N5B Truthfulness Tests

```
TEST-6: Case with deposit but no certificate upload → Exhibit E NOT ticked
TEST-7: Case with EPC compliance flag but no EPC upload → Exhibit F NOT ticked
TEST-8: Case with gas safety flag but no certificate upload → Exhibit G NOT ticked
TEST-9: Case with tenancy agreement upload → Exhibit A ticked
TEST-10: Full upload set → All checkboxes correctly reflect uploads
```

### Bundle Index Tests

```
TEST-11: Generate index, verify all evidence categories listed
TEST-12: Verify missing evidence highlighted by route
TEST-13: Verify download links are signed, not public
```

---

## Appendix: File Reference

| File | Purpose |
|------|---------|
| `src/app/api/wizard/upload-evidence/route.ts` | Evidence upload API |
| `src/lib/documents/official-forms-filler.ts` | Court form filling |
| `src/lib/bundles/index.ts` | Bundle generation |
| `src/lib/bundles/evidence-index.ts` | Evidence index generation |
| `src/lib/bundles/sections.ts` | Bundle section builders |
| `src/lib/bundles/types.ts` | Bundle type definitions |
| `src/lib/case-facts/schema.ts` | Case facts schema |
| `src/lib/case-intel/evidence.ts` | Evidence analysis |
| `supabase/schema.sql` | Database schema |
| `config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs` | Section 21 template |
| `config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs` | Section 8 template |

---

## Conclusion

This audit confirms that the system has a solid foundation for evidence handling but contains **critical truthfulness issues** in N5B form generation and **potential data exposure** in evidence storage.

**Before Phase 3 implementation:**
1. Fix P0 issues (storage security, N5B checkboxes)
2. Address P1 issues (file validation, notice confirmation)

**The system is NOT court-ready until P0 issues are resolved.**

---

*End of Audit Report*
