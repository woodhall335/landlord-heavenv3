# Official Forms Maintenance Guide

## Overview

This directory contains official HMCTS (England & Wales), Scottish Courts, and Northern Ireland Courts forms used by Landlord Heaven for generating legal documents.

**CRITICAL:** Using outdated forms can result in rejected court claims, wasted time, and significant costs for users. Regular maintenance is essential.

---

## Forms Manifest

The `forms-manifest.json` file is the single source of truth for all official forms used in the platform.

### What it tracks:
- Form versions and effective dates
- SHA-256 checksums for file integrity
- Source URLs for updates
- Last verification dates
- File sizes and field counts
- Status (ACTIVE, TEMPLATE_GENERATED, REFERENCE_ONLY)

---

## Maintenance Schedule

### Quarterly Review (Every 3 Months)

**Next Review: March 11, 2026**

#### Checklist:

1. **Check Official Sources**
   - England & Wales: https://www.gov.uk/government/collections/form-finder
   - Scotland: https://www.housingandpropertychamber.scot
   - Northern Ireland: https://www.nidirect.gov.uk

2. **For Each Form:**
   - Check if new version released
   - Compare effective dates
   - Download new version if available
   - Calculate SHA-256 checksum
   - Update forms-manifest.json

3. **Test Form Filling**
   - Test PDF field mapping with new forms
   - Verify all fields still map correctly
   - Update field mappings if needed

4. **Update Documentation**
   - Update version numbers in manifest
   - Add entry to verification_history
   - Update next_review_date (+3 months)

5. **Notify Users** (if forms changed)
   - Email users with active cases
   - Provide updated documents
   - Explain changes

---

## How to Update a Form

### Step 1: Download New Version

```bash
# England & Wales - N5 example
cd /home/user/landlord-heavenv3/public/official-forms
wget https://assets.publishing.service.gov.uk/media/[new-id]/n5-eng.pdf -O n5-eng.pdf.new

# Verify it downloaded correctly
file n5-eng.pdf.new
```

### Step 2: Calculate Checksum

```bash
sha256sum n5-eng.pdf.new
# Output: abc123... n5-eng.pdf.new
```

### Step 3: Update Manifest

Edit `forms-manifest.json`:

```json
{
  "n5-eng.pdf": {
    "version": "03/26",  // NEW VERSION
    "effective_date": "2026-03-01",  // NEW DATE
    "last_verified": "2026-03-11",  // TODAY
    "checksum_sha256": "abc123...",  // NEW CHECKSUM
    "file_size_bytes": 125000  // NEW SIZE
  }
}
```

### Step 4: Add Verification Entry

```json
{
  "verification_history": [
    {
      "date": "2026-03-11",
      "verified_by": "Your Name",
      "forms_verified": ["n5-eng.pdf"],
      "checksums_calculated": true,
      "all_current": true,
      "notes": "Updated N5 to March 2026 version"
    }
  ]
}
```

### Step 5: Replace Old File

```bash
# Backup old version
mv n5-eng.pdf n5-eng.pdf.backup_$(date +%Y%m%d)

# Install new version
mv n5-eng.pdf.new n5-eng.pdf
```

### Step 6: Test

```bash
# Run form filling tests
npm run test:forms

# Or manually test with test case
npm run dev
# Navigate to wizard, complete test case, verify PDF generates correctly
```

---

## Form Sources

### England & Wales

**Main source:** https://www.gov.uk/government/collections/form-finder

**Key forms:**
- N5: Possession claim form
- N5B: Accelerated possession (Section 21 only)
- N119: Particulars of claim
- N1: Money claim form
- Form 6A: Section 21 notice

**Update frequency:** HMCTS typically updates forms annually (usually December/January)

### Scotland

**Main source:** https://www.housingandpropertychamber.scot

**Key forms:**
- Notice to Leave: PRT eviction notice
- Form E: Eviction application to tribunal
- Simple Procedure Forms: Money claims under £5,000

**Update frequency:** Less frequent than England. Check quarterly.

### Northern Ireland

**Main source:** https://www.nidirect.gov.uk

**Key forms:**
- Notice of Intention to Seek Possession

**Update frequency:** Infrequent. Check quarterly.

---

## Verifying File Integrity

Forms should match their checksums. To verify:

```bash
# Calculate current checksum
sha256sum n5-eng.pdf

# Compare to manifest
grep -A 10 "n5-eng.pdf" forms-manifest.json | grep checksum
```

If checksums don't match:
- File may be corrupted
- File may have been updated without manifest update
- Investigate immediately

---

## Breaking Changes

If a form update changes field names or structure:

### 1. Identify Changes

```bash
# Use PDF tools to compare field names
pdftk n5-eng.pdf dump_data_fields > fields_old.txt
pdftk n5-eng.pdf.new dump_data_fields > fields_new.txt
diff fields_old.txt fields_new.txt
```

### 2. Update Field Mappings

Edit relevant generator:
- `src/lib/documents/official-forms-filler.ts` (England & Wales)
- `src/lib/documents/scotland-forms-filler.ts` (Scotland)

### 3. Update Tests

Update field mapping tests:
- `tests/documents/pdf-fill.test.ts`

### 4. Version Bump

Increment platform version:
```json
{
  "version": "1.1.0",  // Breaking change = minor version bump
  "breaking_changes": {
    "n5_fields": "Updated N5 field mappings for March 2026 version"
  }
}
```

---

## Critical Dates to Watch

### England & Wales
- **December/January:** Annual form updates typically released
- **Budget announcements:** May affect court fees (forms may change)
- **Legislative changes:** Housing Acts, court procedure rules

### Scotland
- **April:** Financial year - potential updates
- **Check Scottish Parliament:** Private Housing (Tenancies) Act amendments

### Northern Ireland
- **Quarterly:** No specific update cycle, check regularly

---

## Emergency Form Updates

If HMCTS/Courts release emergency form updates:

### 1. Assess Urgency
- Are old forms still accepted? (Usually 30-day grace period)
- Is there a hard deadline?

### 2. Expedite Update
- Download immediately
- Fast-track testing
- Deploy within 24-48 hours if critical

### 3. User Communication
```
Subject: URGENT: Court Form Update Required

Dear Landlord Heaven users,

HMCTS has released an updated [form name] form effective [date].

ACTION REQUIRED:
- If you have NOT yet filed: Download updated pack from your dashboard
- If you HAVE filed with old form: [guidance based on court rules]

What changed: [brief explanation]

Questions? Reply to this email.
```

---

## Compliance & Legal

### Crown Copyright
All forms are Crown Copyright, used under Open Government Licence v3.0.

**License:** https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

**Permitted use:**
✅ Copy and distribute
✅ Adapt and modify (for form filling)
✅ Use commercially

**Requirements:**
- Acknowledge source (Crown Copyright)
- Provide link to OGL
- Do not claim official endorsement

### Liability
Using outdated forms can result in:
- Rejected court claims
- Wasted court fees (£325-£455)
- Delays (3-6 months)
- User complaints and refunds

**Our responsibility:** Ensure forms are current and clearly labeled with version/date.

---

## Monitoring & Alerts

### Set Up Alerts

1. **HMCTS Form Finder RSS** (if available)
2. **Google Alerts:**
   - "HMCTS form update"
   - "N5 form new version"
   - "court form changes"

3. **Scottish Courts Updates:**
   - Subscribe to tribunal updates
   - Check website monthly

### Quarterly Calendar Reminder

Add to team calendar:
- **March 11:** Quarterly form review
- **June 11:** Quarterly form review
- **September 11:** Quarterly form review
- **December 11:** Quarterly form review + annual check

---

## Troubleshooting

### Problem: Form won't fill

**Causes:**
- PDF is corrupted
- Field names changed
- PDF is scanned image (not fillable)

**Solution:**
1. Re-download from official source
2. Verify checksum
3. Check field names with `pdftk dump_data_fields`
4. Update field mappings if needed

### Problem: User reports rejected form

**Investigation:**
1. Check form version user received
2. Check effective date
3. Compare to current official version
4. If outdated, issue refund/replacement

**Prevention:**
- Quarterly reviews
- Version tracking in manifest
- Clear version labeling in generated PDFs

---

## Contact & Escalation

### Form Issues
If you discover form issues or updates needed:

1. **Document the issue** in `forms-manifest.json` → `known_issues`
2. **Create GitHub issue** with label `critical:forms`
3. **Notify team** via email/Slack
4. **Update within 48 hours** if users affected

### Emergency Contact
For critical form issues affecting live users:
- Priority: IMMEDIATE
- Response time: <24 hours
- Update timeline: <48 hours

---

## Best Practices

✅ **DO:**
- Review forms quarterly
- Calculate and verify checksums
- Test after every update
- Document all changes
- Keep backups of old versions
- Communicate changes to users

❌ **DON'T:**
- Skip quarterly reviews
- Update forms without testing
- Delete old versions (keep for reference)
- Update without manifest entry
- Assume forms haven't changed

---

## Version History

| Date | Action | Forms Updated | Notes |
|------|--------|---------------|-------|
| 2025-12-11 | Initial manifest created | All | Comprehensive audit for Option B launch |
| 2026-03-11 | Next review scheduled | TBD | Quarterly review |

---

**Last Updated:** 2025-12-11
**Next Review:** 2026-03-11
**Maintained by:** Landlord Heaven Development Team
