# Checklist Templates and Notice Only Bundling Audit

**Date:** 2025-12-31
**Auditor:** Claude Code
**Scope:** Existing checklist templates, compliance documentation, and Notice Only bundling structure

---

## Executive Summary

This audit reveals that **comprehensive compliance checklists already exist** but are **NOT included in the Notice Only bundle**. The `compliance_checklist.hbs` template contains all compliance confirmations (EPC, Gas Safety, Deposit, Prescribed Info, How to Rent) but is not being merged into the Notice Only pack output.

**Key Findings:**
1. ✅ `compliance_checklist.hbs` EXISTS with detailed compliance confirmations
2. ❌ `compliance_checklist.hbs` is NOT included in Notice Only bundle
3. ✅ Service and Validity Checklists exist for all routes and jurisdictions
4. ⚠️ Section 21 checklist has compliance section inline, Section 8 does not

---

## 1. EXISTING CHECKLIST TEMPLATES

### 1.1 All Checklist Files Found

| Template | Path | Jurisdiction | Purpose |
|----------|------|--------------|---------|
| `checklist_section_8.hbs` | `uk/england/templates/eviction/` | England | S8 service & validity checklist |
| `checklist_section_21.hbs` | `uk/england/templates/eviction/` | England | S21 service & validity checklist |
| `compliance_checklist.hbs` | `uk/england/templates/eviction/` | England | **Pre-service compliance confirmations** |
| `checklist_section_173.hbs` | `uk/wales/templates/eviction/` | Wales | S173 service & validity checklist |
| `checklist_fault_based.hbs` | `uk/wales/templates/eviction/` | Wales | Fault-based service & validity checklist |
| `checklist_notice_to_leave.hbs` | `uk/scotland/templates/eviction/` | Scotland | NTL service & validity checklist |
| `pre_action_checklist.hbs` | `uk/scotland/templates/eviction/` | Scotland | Pre-action requirements checklist |
| `evidence_collection_checklist.hbs` | `shared/templates/` | All | Evidence collection guidance |

### 1.2 Compliance Files Found

| Template | Path | Purpose |
|----------|------|---------|
| `compliance_checklist.hbs` | `uk/england/templates/eviction/` | **Detailed pre-service compliance** |
| `compliance-audit.hbs` | `uk/england/templates/eviction/` | AI-powered compliance analysis |
| `compliance-audit.hbs` | `uk/scotland/templates/eviction/` | AI-powered compliance analysis |

---

## 2. TEMPLATE CONTENTS ANALYSIS

### 2.1 checklist_section_21.hbs (England)

**Purpose:** Service and Validity Checklist for Section 21 Notices

**Contains:**
1. **Notice Details** - Landlord, tenant, property, dates
2. **Service Evidence Checklist** (empty checkboxes):
   - Original signed Section 21 notice (Form 6A)
   - Copy served to tenant
   - Date/time of service recorded
   - Method of service documented
   - Proof of service evidence
   - Witness details
   - Acknowledgement correspondence
3. **Validity Requirements**:
   - Correct form (Form 6A)
   - All mandatory fields completed
   - At least two months notice
   - Possession date alignment
   - First 4 months restriction
   - Fixed term / periodic rules
   - Signed and dated
4. **⚠️ CRITICAL PRE-SERVICE COMPLIANCE** (inline):
   - Deposit protected in approved scheme
   - Prescribed information within 30 days
   - Gas safety certificate provided
   - EPC rating E or above
   - "How to Rent" guide provided
   - Property licensing if required
5. **Post-Service Actions**

**Compliance Coverage:** ✅ MENTIONS compliance items but as warning text, not as confirmations with user's answers

---

### 2.2 checklist_section_8.hbs (England)

**Purpose:** Service and Validity Checklist for Section 8 Notices

**Contains:**
1. **Notice Details** - Landlord, tenant, property, dates, grounds
2. **Service Evidence Checklist** (same as S21)
3. **Validity Requirements**:
   - Correct form (Form 3)
   - Grounds clearly stated with particulars
   - Notice period per ground (detailed matrix)
   - Fixed term / periodic rules
   - Mandatory vs discretionary grounds
4. **Post-Service Actions**

**Compliance Coverage:** ❌ Does NOT include pre-service compliance section (EPC, Gas, Deposit, etc.)

---

### 2.3 compliance_checklist.hbs (England) - **THE KEY TEMPLATE**

**Purpose:** Detailed Pre-Service Compliance Confirmations

**Contains:**
1. **Deposit Protection Section**:
   - Shows COMPLIANT/NOT COMPLIANT status from `{{deposit.protected}}`
   - Displays deposit amount, scheme name, protection date
   - Shows prescribed info status from `{{deposit.prescribed_info_given}}`
   - Section 21 blocking warning if not compliant
   - Evidence required list

2. **Gas Safety Certificate Section**:
   - Shows COMPLIANT/NOT COMPLIANT status from `{{compliance.gas_cert_provided}}`
   - Displays expiry date if available
   - Section 21 blocking warning if not compliant
   - Evidence required list

3. **Energy Performance Certificate Section**:
   - Shows status from `{{compliance.epc_provided}}`
   - Displays EPC rating from `{{compliance.epc_rating}}`
   - F/G rating warning (MEES violation)
   - Section 21 blocking warning if not compliant
   - Evidence required list

4. **How to Rent Guide Section**:
   - Shows status from `{{compliance.how_to_rent_given}}`
   - Section 21 blocking warning if not compliant
   - Evidence required list

5. **HMO License Section** (conditional):
   - Only shown if `{{compliance.hmo_license_required}}`
   - Shows license validity status
   - Blocking warning if not licensed

6. **Summary Checklist**:
   - All items listed with checkboxes
   - Section 21 REQUIRED labels
   - Final check warning

**Data Dependencies:**
- `deposit.protected`
- `deposit.amount`
- `deposit.scheme_name`
- `deposit.protection_date`
- `deposit.prescribed_info_given`
- `compliance.gas_cert_provided`
- `compliance.gas_cert_expiry`
- `compliance.epc_provided`
- `compliance.epc_rating`
- `compliance.how_to_rent_given`
- `compliance.hmo_license_required`
- `compliance.hmo_license_valid`
- `selected_notice_route`

---

### 2.4 checklist_section_173.hbs (Wales)

**Purpose:** Service and Validity Checklist for Section 173 (No-Fault) Notices

**Contains:**
1. **Notice Details** - Contract-holder terminology
2. **Service Evidence Checklist**
3. **Validity Requirements**:
   - At least 6 months notice
   - Not in first 6 months (prohibited period)
   - Standard occupation contract
   - **Rent Smart Wales registration required**
   - **Deposit protected if taken**
4. **Post-Service Actions**

**Compliance Coverage:** ⚠️ Mentions Rent Smart Wales and deposit inline, but no detailed confirmations

---

### 2.5 checklist_notice_to_leave.hbs (Scotland)

**Purpose:** Service and Validity Checklist for Notice to Leave (PRT)

**Contains:**
1. **Notice Details** - Including grounds
2. **Service Evidence Checklist** (includes sheriff officer option)
3. **Validity Requirements**:
   - Prescribed form
   - Eviction grounds from Schedule 3
   - Notice period (28 days or 84 days for Ground 1)
   - PRT tenancy type
4. **Ground 1 Pre-Action Requirements** (conditional):
   - Written arrears information
   - Reasonable discussion efforts
   - Debt advice signposting
   - Reasonable time to access assistance
   - Consideration of tenant circumstances
5. **Post-Service Actions** (Tribunal-specific)

**Compliance Coverage:** ⚠️ Has Ground 1 pre-action requirements, but no general compliance confirmations

---

## 3. NOTICE ONLY BUNDLE STRUCTURE

### 3.1 What's Currently Generated

**API Endpoint:** `GET /api/notice-only/preview/[caseId]`
**File:** `src/app/api/notice-only/preview/[caseId]/route.ts`

**Important:** This endpoint calls `assertPaidEntitlement()` at line 71 - it's the **POST-PAYMENT** final document generation, not a preview!

#### England Bundle (Section 8):
| Document | Template | Category |
|----------|----------|----------|
| Section 8 Notice (Form 3) | `uk/england/templates/notice_only/form_3_section8/notice.hbs` | notice |
| Service Instructions | `uk/england/templates/eviction/service_instructions_section_8.hbs` | guidance |
| Service and Validity Checklist | `uk/england/templates/eviction/checklist_section_8.hbs` | checklist |

#### England Bundle (Section 21):
| Document | Template | Category |
|----------|----------|----------|
| Section 21 Notice (Form 6A) | `uk/england/templates/notice_only/form_6a_section21/notice.hbs` | notice |
| Service Instructions | `uk/england/templates/eviction/service_instructions_section_21.hbs` | guidance |
| Service and Validity Checklist | `uk/england/templates/eviction/checklist_section_21.hbs` | checklist |

#### Wales Bundle (Section 173):
| Document | Template | Category |
|----------|----------|----------|
| Section 173 Notice (RHW16/17) | Via `generateWalesSection173Notice()` | notice |
| Service Instructions | `uk/wales/templates/eviction/service_instructions_section_173.hbs` | guidance |
| Service and Validity Checklist | `uk/wales/templates/eviction/checklist_section_173.hbs` | checklist |

#### Wales Bundle (Fault-Based):
| Document | Template | Category |
|----------|----------|----------|
| RHW23 Notice | `uk/wales/templates/notice_only/rhw23.../notice.hbs` | notice |
| Service Instructions | `uk/wales/templates/eviction/service_instructions_fault_based.hbs` | guidance |
| Service and Validity Checklist | `uk/wales/templates/eviction/checklist_fault_based.hbs` | checklist |

#### Scotland Bundle (Notice to Leave):
| Document | Template | Category |
|----------|----------|----------|
| Notice to Leave (PRT) | `uk/scotland/templates/notice_only/notice_to_leave_prt_2017/notice.hbs` | notice |
| Service Instructions | `uk/scotland/templates/eviction/service_instructions_notice_to_leave.hbs` | guidance |
| Service and Validity Checklist | `uk/scotland/templates/eviction/checklist_notice_to_leave.hbs` | checklist |

### 3.2 What's NOT Included

| Template | Exists? | In Bundle? | Issue |
|----------|---------|------------|-------|
| `compliance_checklist.hbs` | ✅ YES | ❌ NO | **Critical gap - not merged into pack** |
| `pre_action_checklist.hbs` (Scotland) | ✅ YES | ❌ NO | Not included in NTL bundle |
| `evidence_collection_checklist.hbs` | ✅ YES | ❌ NO | Not included in any bundle |

---

## 4. GAP ANALYSIS

### 4.1 Compliance Questions vs Documentation

| Compliance Item | Captured in Wizard? | In Service Checklist? | In compliance_checklist.hbs? | In Notice Only Bundle? |
|-----------------|---------------------|----------------------|------------------------------|------------------------|
| EPC provided | ✅ `epc_provided` | ⚠️ S21 only (warning) | ✅ Full details | ❌ NOT INCLUDED |
| Gas Safety Certificate | ✅ `gas_safety_certificate` | ⚠️ S21 only (warning) | ✅ Full details | ❌ NOT INCLUDED |
| Deposit protected | ✅ `deposit_protected` | ⚠️ S21 only (warning) | ✅ Full details | ❌ NOT INCLUDED |
| Prescribed info given | ✅ `prescribed_info_given` | ⚠️ S21 only (warning) | ✅ Full details | ❌ NOT INCLUDED |
| How to Rent guide | ✅ `how_to_rent_provided` | ⚠️ S21 only (warning) | ✅ Full details | ❌ NOT INCLUDED |
| Rent Smart Wales | ✅ `rent_smart_wales_registered` | ⚠️ Mentioned | ❌ Not in template | ❌ NOT INCLUDED |
| Landlord registered (Scotland) | ✅ `landlord_registered` | ❌ Not mentioned | ❌ Not in template | ❌ NOT INCLUDED |

### 4.2 The Problem

**The `compliance_checklist.hbs` template exists and contains exactly what's needed, but it's never generated or included in the Notice Only bundle!**

The Notice Only API (`src/app/api/notice-only/preview/[caseId]/route.ts`) generates:
1. Notice
2. Service Instructions
3. Service and Validity Checklist

But **NEVER generates or includes** `compliance_checklist.hbs`.

---

## 5. BUNDLING COMPARISON

| Product | Preview Format | Final Format | Documents |
|---------|---------------|--------------|-----------|
| Notice Only | Single merged PDF (Table of Contents + 3 docs) | Same as preview (payment gates the endpoint) | 3 docs: Notice + Service Instructions + Validity Checklist |
| Complete Pack | Separate PDFs | Separate PDFs | 10-15 docs including compliance audit (AI) |
| Money Claim | HTML preview | ZIP of PDFs | 13 docs |
| AST | Single merged PDF | Single merged PDF | 7-12 templates |

---

## 6. TEMPLATE STRUCTURE FOR ALL JURISDICTIONS

### England Templates (15 total)
```
uk/england/templates/
├── eviction/
│   ├── checklist_section_8.hbs          ✅ In bundle (S8)
│   ├── checklist_section_21.hbs         ✅ In bundle (S21)
│   ├── compliance_checklist.hbs         ❌ NOT in bundle
│   ├── compliance-audit.hbs             (Complete Pack only)
│   ├── service_instructions.hbs         (fallback)
│   ├── service_instructions_section_8.hbs ✅ In bundle (S8)
│   ├── service_instructions_section_21.hbs ✅ In bundle (S21)
│   ├── witness-statement.hbs            (Complete Pack only)
│   ├── risk-report.hbs                  (Complete Pack only)
│   └── ... (court forms, guidance)
├── notice_only/
│   ├── form_3_section8/notice.hbs       ✅ In bundle (S8)
│   └── form_6a_section21/notice.hbs     ✅ In bundle (S21)
└── ... (AST, money claims)
```

### Wales Templates (10 total)
```
uk/wales/templates/
├── eviction/
│   ├── checklist_section_173.hbs        ✅ In bundle (S173)
│   ├── checklist_fault_based.hbs        ✅ In bundle (Fault)
│   ├── service_instructions_section_173.hbs ✅ In bundle (S173)
│   ├── service_instructions_fault_based.hbs ✅ In bundle (Fault)
│   └── ... (other guidance)
└── notice_only/
    ├── rhw16_.../notice.hbs             ✅ Via generator
    ├── rhw17_.../notice.hbs             ✅ Via generator
    └── rhw23_.../notice.hbs             ✅ In bundle (Fault)
```

### Scotland Templates (12 total)
```
uk/scotland/templates/
├── eviction/
│   ├── checklist_notice_to_leave.hbs    ✅ In bundle
│   ├── pre_action_checklist.hbs         ❌ NOT in bundle
│   ├── compliance-audit.hbs             (Complete Pack only)
│   ├── service_instructions_notice_to_leave.hbs ✅ In bundle
│   └── ... (tribunal guides, witness statement)
└── notice_only/
    └── notice_to_leave_prt_2017/notice.hbs ✅ In bundle
```

### Shared Templates (9 total)
```
shared/templates/
├── evidence_collection_checklist.hbs    ❌ NOT in any bundle
├── proof_of_service.hbs                 (Complete Pack only)
├── eviction_roadmap.hbs                 (Complete Pack only)
└── ... (AST templates)
```

---

## 7. RECOMMENDATIONS

### 7.1 Immediate Fix - Add Compliance Checklist to Bundle

**Priority: HIGH**

The `compliance_checklist.hbs` template already exists and contains all needed compliance confirmations. Simply add it to the Notice Only bundle generation.

**File to modify:** `src/app/api/notice-only/preview/[caseId]/route.ts`

**Location:** After generating the Service and Validity Checklist (lines 593-612 for S8, similar for S21)

**Suggested code addition:**
```typescript
// 4. Generate compliance checklist (with user's compliance confirmations)
console.log(`[NOTICE-PREVIEW-API] Generating compliance checklist`);
try {
  const complianceDoc = await generateDocument({
    templatePath: `uk/england/templates/eviction/compliance_checklist.hbs`,
    data: templateData,
    outputFormat: 'pdf',
  });

  if (complianceDoc.pdf) {
    documents.push({
      title: `Pre-Service Compliance Checklist`,
      category: 'checklist',
      pdf: complianceDoc.pdf,
    });
  }
} catch (err) {
  console.error(`[NOTICE-PREVIEW-API] Compliance checklist generation failed:`, err);
}
```

### 7.2 Create Wales Compliance Checklist

**Priority: MEDIUM**

Create `uk/wales/templates/eviction/compliance_checklist.hbs` with:
- Rent Smart Wales registration status
- Deposit protection status (Welsh schemes)
- Written statement provided

### 7.3 Create Scotland Compliance Checklist

**Priority: MEDIUM**

Create `uk/scotland/templates/eviction/compliance_checklist.hbs` with:
- Landlord registration status
- Deposit protection status (SafeDeposits Scotland)
- Pre-action requirements confirmation (for Ground 1)

### 7.4 Consider Adding pre_action_checklist.hbs to Scotland Bundle

**Priority: LOW**

The Scotland `pre_action_checklist.hbs` exists but isn't in the bundle. Consider adding for Ground 1 cases.

---

## 8. SUMMARY TABLES

### Existing Templates Summary

| Template | Path | Includes Compliance Confirmations? | In Bundle? |
|----------|------|-----------------------------------|------------|
| `checklist_section_21.hbs` | England | ⚠️ Warning text only | ✅ Yes |
| `checklist_section_8.hbs` | England | ❌ No | ✅ Yes |
| `compliance_checklist.hbs` | England | ✅ **Full details with PASS/FAIL** | ❌ **NO** |
| `checklist_section_173.hbs` | Wales | ⚠️ Mentions Rent Smart Wales | ✅ Yes |
| `checklist_fault_based.hbs` | Wales | ❌ No | ✅ Yes |
| `checklist_notice_to_leave.hbs` | Scotland | ⚠️ Ground 1 pre-action only | ✅ Yes |
| `pre_action_checklist.hbs` | Scotland | ✅ Ground 1 requirements | ❌ No |

### Notice Only Bundle Structure

```
Notice Only Pack (Single PDF)
├── [Table of Contents]
├── 1. Notice (Form 3/6A/RHW/NTL)
├── 2. Service Instructions
├── 3. Service and Validity Checklist
└── ❌ MISSING: Compliance Checklist with user's confirmations
```

### Action Items

| Action | Priority | Effort | Impact |
|--------|----------|--------|--------|
| Add `compliance_checklist.hbs` to England bundle | HIGH | 1 hour | Provides court evidence of compliance confirmations |
| Create Wales compliance checklist template | MEDIUM | 2 hours | Complete Wales compliance documentation |
| Create Scotland compliance checklist template | MEDIUM | 2 hours | Complete Scotland compliance documentation |
| Add `pre_action_checklist.hbs` to Scotland Ground 1 cases | LOW | 1 hour | Extra evidence for rent arrears cases |

---

## Conclusion

**The compliance checklist template already exists (`compliance_checklist.hbs`) with all the compliance confirmations we need.** The only issue is that it's not being included in the Notice Only bundle.

This is a **simple fix** - just add the template to the document generation loop in the Notice Only API. The template already uses the correct data fields (`deposit.protected`, `compliance.gas_cert_provided`, etc.) and displays PASS/FAIL status based on the user's wizard answers.

**Estimated fix time:** 1 hour to add to England bundle, 2-3 additional hours for Wales/Scotland templates.
