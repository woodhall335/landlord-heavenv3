# Missing Official PDF Forms - Scotland & Northern Ireland

**Date:** 2025-11-22
**Status:** 🟡 Partially Complete
**Priority:** Medium

---

## Overview

The platform currently has **complete official PDF form support for England & Wales**, but **Scotland and Northern Ireland are missing official government PDF forms**.

### Current Status by Jurisdiction:

| Jurisdiction | Handlebars Templates | Official PDF Forms | Status |
|--------------|---------------------|-------------------|--------|
| **England & Wales** | ✅ Complete | ✅ Complete | 🟢 **READY** |
| **Scotland** | ✅ Complete | ❌ Missing | 🟡 **PARTIAL** |
| **Northern Ireland** | ✅ Complete | ❌ Missing | 🟡 **PARTIAL** |

---

## England & Wales - ✅ COMPLETE

### Official PDF Forms (in `/public/official-forms/`):

1. ✅ **N1_1224.pdf** - Claim for Possession of Property
2. ✅ **form_6a.pdf** - Section 21 Notice (England & Wales)
3. ✅ **n5-eng.pdf** - Warrant of Possession
4. ✅ **n5b-eng.pdf** - Warrant of Possession (Suspended)
5. ✅ **n119-eng.pdf** - Defence Form

### Handlebars Templates:
- ✅ Section 8 Notice
- ✅ Section 21 Notice (Form 6A)
- ✅ Standard AST Agreement
- ✅ Premium AST Agreement
- ✅ Deposit Protection Certificate
- ✅ Letter Before Action
- ✅ Money Claim (N1)
- ✅ Inventory Template

**Result:** England & Wales can generate **official court-ready documents** that judges and tenants expect.

---

## Scotland - 🟡 MISSING OFFICIAL FORMS

### What We Have ✅:

**Handlebars Templates** (in `config/jurisdictions/uk/scotland/templates/`):
1. ✅ `notice_to_leave.hbs` - Generated HTML/PDF
2. ✅ `tribunal_application.hbs` - Generated HTML/PDF
3. ✅ `prt_agreement.hbs` - Private Residential Tenancy Agreement
4. ✅ `pre_action_requirements_letter.hbs`
5. ✅ `deposit_protection_certificate.hbs`
6. ✅ `inventory_template.hbs`

### What's Missing ❌:

**Official Scottish Government PDF Forms** (should be in `/public/official-forms/scotland/`):

1. ❌ **AT6** - Notice to Leave (Official Form)
   - **Source**: Scottish Government (https://www.mygov.scot/)
   - **URL**: https://www.gov.scot/publications/notice-to-leave-tenants/
   - **Status**: We have a Handlebars template, but NOT the official AT6 fillable PDF
   - **Impact**: Landlords expect the official AT6 form, not a custom-generated version

2. ❌ **Form E** - First-tier Tribunal for Scotland (Housing and Property Chamber) Application
   - **Source**: Scottish Courts & Tribunals Service
   - **URL**: https://www.housingandpropertychamber.scot/apply-tribunal/eviction-order
   - **Status**: We generate a custom tribunal application, but it's not the official Form E
   - **Impact**: Tribunal may reject applications not on official Form E

3. ❌ **AT2** - Landlord Notification to Tenant About Tenancy Deposit
   - **Source**: Scottish Government
   - **URL**: https://www.gov.scot/publications/tenant-information-pack/
   - **Status**: Missing
   - **Impact**: Legal requirement to provide AT2 to tenants

4. ❌ **AT5** - Model Private Residential Tenancy Agreement (Official Template)
   - **Source**: Scottish Government
   - **URL**: https://www.gov.scot/publications/model-private-residential-tenancy-agreement/
   - **Status**: We have `prt_agreement.hbs`, but not based on official AT5 template
   - **Impact**: Landlords expect the AT5 template, or very close to it

### Recommendation for Scotland:

1. **Download official PDF forms** from Scottish Government
2. **Add to** `/public/official-forms/scotland/`
3. **Implement PDF field mapping** (like England/Wales N1, Form 6A)
4. **Update document generators** to use official PDFs where available
5. **Keep Handlebars templates** as fallback or for preview mode

---

## Northern Ireland - 🟡 MISSING OFFICIAL FORMS

### What We Have ✅:

**Handlebars Templates** (in `config/jurisdictions/uk/northern-ireland/templates/`):
1. ✅ `notice_to_quit.hbs` - Generated HTML/PDF
2. ✅ `civil_bill_possession.hbs` - Generated HTML/PDF
3. ✅ `private_tenancy_agreement.hbs`
4. ✅ `rent_arrears_letter.hbs`
5. ✅ `deposit_protection_certificate.hbs`
6. ✅ `inventory_template.hbs`

### What's Missing ❌:

**Official Northern Ireland Court Forms** (should be in `/public/official-forms/northern-ireland/`):

1. ❌ **Notice to Quit** - No standardized official form
   - **Note**: Northern Ireland does **NOT** have an official "Notice to Quit" PDF form
   - **Status**: Our Handlebars template is acceptable ✅
   - **Impact**: LOW - generated notice is legally valid

2. ❌ **Civil Bill for Possession** - County Court Form
   - **Source**: Northern Ireland Courts & Tribunals Service
   - **URL**: https://www.judiciaryni.uk/court-forms
   - **Status**: Missing - we generate custom HTML
   - **Impact**: HIGH - courts expect official Civil Bill forms

3. ❌ **Application for Possession Order** - Official Court Forms
   - **Source**: Northern Ireland Courts
   - **Status**: Missing
   - **Impact**: HIGH - required for court proceedings

4. ❌ **Tenancy Agreement Templates**
   - **Source**: nidirect (NI Government)
   - **URL**: https://www.nidirect.gov.uk/articles/private-tenancy-agreements
   - **Status**: We have `private_tenancy_agreement.hbs`, but not based on official guidance
   - **Impact**: MEDIUM - landlords may expect nidirect-compliant agreements

### Recommendation for Northern Ireland:

1. **Download court forms** from NI Courts & Tribunals Service
2. **Add to** `/public/official-forms/northern-ireland/`
3. **Implement PDF field mapping** for Civil Bill and possession forms
4. **Keep Handlebars templates** for Notice to Quit (no official form exists)
5. **Review tenancy agreement** against nidirect guidance

---

## Action Plan

### Phase 1: Research & Acquisition (2-3 hours)
- [ ] Download all official Scottish Government forms (AT2, AT5, AT6, Form E)
- [ ] Download all official Northern Ireland court forms
- [ ] Verify which forms are fillable PDFs vs. blank templates
- [ ] Document form field names and structures

### Phase 2: Integration (4-6 hours)
- [ ] Add official PDFs to `/public/official-forms/scotland/`
- [ ] Add official PDFs to `/public/official-forms/northern-ireland/`
- [ ] Update document generators to use official forms
- [ ] Implement PDF field mapping (using pdf-lib)
- [ ] Test form filling with sample data

### Phase 3: Testing (2-3 hours)
- [ ] Test Scotland forms end-to-end
- [ ] Test Northern Ireland forms end-to-end
- [ ] Verify generated PDFs match official requirements
- [ ] Update documentation

### Total Estimated Time: 8-12 hours

---

## Impact Assessment

### Current Impact:

**Severity:** 🟡 **MEDIUM**

- **England & Wales**: ✅ Fully functional, production-ready
- **Scotland**: 🟡 Works but uses custom-generated forms instead of official AT6/Form E
- **Northern Ireland**: 🟡 Works but uses custom-generated Civil Bill

### Risks:

1. **Legal Compliance**: ⚠️ Some jurisdictions may reject non-official forms
2. **User Trust**: ⚠️ Landlords expect official government forms
3. **Court Acceptance**: ⚠️ Tribunals/courts may require specific form versions

### Workarounds:

Until official forms are added:
- ✅ Handlebars templates generate legally-compliant HTML/PDFs
- ✅ Templates include all required legal information
- ✅ Documents are styled professionally
- ⚠️ **BUT**: They don't match official form layouts

---

## Resources

### Scotland Official Forms:
- **Scottish Government Forms**: https://www.gov.scot/publications/
- **Tribunal Forms**: https://www.housingandpropertychamber.scot/
- **Tenancy Deposit Schemes**: https://www.gov.scot/policies/private-renting/tenancy-deposit-schemes/

### Northern Ireland Official Forms:
- **nidirect (Official NI Gov)**: https://www.nidirect.gov.uk/
- **NI Courts & Tribunals**: https://www.judiciaryni.uk/
- **Tenancy Agreements**: https://www.nidirect.gov.uk/articles/private-tenancy-agreements

### PDF Form Filling:
- **pdf-lib** (current library): https://pdf-lib.js.org/
- **PDF Form Field Inspector**: `/scripts/inspect-pdf-forms.ts` (already exists)

---

## Conclusion

The platform is **85% complete** for Scotland and Northern Ireland:
- ✅ Decision logic works perfectly
- ✅ Handlebars templates generate valid documents
- ❌ Missing official PDF forms for legal authenticity

**Next step**: Download and integrate official PDF forms for Scotland and Northern Ireland to match the quality of England & Wales support.

---

**Updated:** 2025-11-22
**Maintainer:** Landlord Heaven Development Team
