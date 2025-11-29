# CRITICAL: Missing Simple Procedure Claim Form (Form 3A)

## Status: PDF FILE DOES NOT EXIST

The file `simple_procedure_claim_form.pdf` is referenced in:
- `public/official-forms/scotland/forms-manifest.json`
- `src/lib/documents/scotland-forms-filler.ts` (line 376)

**BUT THE ACTUAL PDF FILE IS MISSING.**

---

## Impact

**The Scotland Money Claim Pack generator will CRASH at runtime** when trying to fill the Simple Procedure form.

Error will be:
```
Failed to load official form "simple_procedure_claim_form.pdf".
Make sure the PDF exists in /public/official-forms/scotland/.
```

---

## Solution Required

You MUST download the official Form 3A from Scottish Courts and Tribunals Service:

### Official Source:
**URL:** https://www.scotcourts.gov.uk/docs/default-source/rules-and-practice/forms/sheriff-court---ordinary-cause-rules/simple-procedure/form-3a---claim-form.pdf

**Alternative:** https://www.scotcourts.gov.uk/taking-action/simple-procedure

### Steps:
1. Download the latest version of Form 3A from the URL above
2. Save it as: `public/official-forms/scotland/simple_procedure_claim_form.pdf`
3. Verify the PDF is fillable (has form fields) using a PDF viewer
4. Test the generator by running:
   ```bash
   npm run test -- scotland-money-claim
   ```

---

## Temporary Workaround (DEVELOPMENT ONLY)

If you cannot download the official PDF immediately, you can create a minimal placeholder:

1. Create a blank PDF with the required form fields
2. Save as `simple_procedure_claim_form.pdf` in this directory
3. The filler code will attempt to populate fields (may fail gracefully if fields don't match)

**WARNING:** Do NOT ship to production without the official SCTS form.

---

## Legal Compliance Note

Using unofficial or outdated court forms is **ILLEGAL** and may result in:
- Claims being rejected by the Sheriff Court
- Wasted court fees (£21-£145 per claim)
- Professional negligence claims
- Reputational damage

**Always use the latest official form from Scottish Courts and Tribunals Service.**

---

Last checked: {{date}}
Form version required: 2024.03 or later
Status: PLACEHOLDER - ACTION REQUIRED
