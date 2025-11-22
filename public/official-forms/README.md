# Official HMCTS Court Forms

This directory contains the official PDF forms from HM Courts & Tribunals Service.

**IMPORTANT:** These are the ACTUAL official court forms. Courts will ONLY accept these official PDFs, not custom-generated replicas.

## Required Forms

Please download and place the following official PDF forms in this directory:

### 1. N5 - Claim for possession of property
**Filename:** `n5-eng.pdf`
**Source:** https://assets.publishing.service.gov.uk/media/601bc1858fa8f53fc3d799d9/n5-eng.pdf
**Use:** Standard possession claim (Section 8 and Section 21)
**Last Updated:** October 2020

### 2. N5B - Claim for possession (accelerated procedure)
**Filename:** `n5b-eng.pdf`
**Source:** https://assets.publishing.service.gov.uk/media/5fb39bf98fa8f55de86fb3a3/n5b-eng.pdf
**Use:** Section 21 only - no hearing required if defendant doesn't respond
**Last Updated:** November 2020

### 3. N119 - Particulars of claim for possession
**Filename:** `n119-eng.pdf`
**Source:** https://assets.publishing.service.gov.uk/media/601bc1f8e90e071292663ea8/n119-eng.pdf
**Use:** Detailed particulars - must be served with N5
**Last Updated:** October 2020

### 4. N1 - Claim form (for money claims)
**Filename:** `n1-eng.pdf`
**Source:** https://assets.publishing.service.gov.uk/media/674d7ea12e91c6fb83fb5162/N1_1224.pdf
**Use:** Money claims for rent arrears and property damage
**Last Updated:** December 2024

### 5. Form 6A - Section 21 Notice (prescribed form)
**Filename:** `form-6a.pdf`
**Source:** https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/468937/form_6a.pdf
**Use:** Official Section 21 notice (no-fault possession)
**Last Updated:** October 2015

## Download Instructions

### Option 1: Manual Download
1. Click each link above
2. Download the PDF
3. Save to this directory with the exact filename shown

### Option 2: Command Line (Linux/Mac/WSL)
```bash
cd public/official-forms

# Download N5
curl -o n5-eng.pdf https://assets.publishing.service.gov.uk/media/601bc1858fa8f53fc3d799d9/n5-eng.pdf

# Download N5B
curl -o n5b-eng.pdf https://assets.publishing.service.gov.uk/media/5fb39bf98fa8f55de86fb3a3/n5b-eng.pdf

# Download N119
curl -o n119-eng.pdf https://assets.publishing.service.gov.uk/media/601bc1f8e90e071292663ea8/n119-eng.pdf

# Download N1
curl -o n1-eng.pdf https://assets.publishing.service.gov.uk/media/674d7ea12e91c6fb83fb5162/N1_1224.pdf

# Download Form 6A
curl -o form-6a.pdf https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/468937/form_6a.pdf
```

### Option 3: PowerShell (Windows)
```powershell
cd public\official-forms

# Download N5
Invoke-WebRequest -Uri "https://assets.publishing.service.gov.uk/media/601bc1858fa8f53fc3d799d9/n5-eng.pdf" -OutFile "n5-eng.pdf"

# Download N5B
Invoke-WebRequest -Uri "https://assets.publishing.service.gov.uk/media/5fb39bf98fa8f55de86fb3a3/n5b-eng.pdf" -OutFile "n5b-eng.pdf"

# Download N119
Invoke-WebRequest -Uri "https://assets.publishing.service.gov.uk/media/601bc1f8e90e071292663ea8/n119-eng.pdf" -OutFile "n119-eng.pdf"

# Download N1
Invoke-WebRequest -Uri "https://assets.publishing.service.gov.uk/media/674d7ea12e91c6fb83fb5162/N1_1224.pdf" -OutFile "n1-eng.pdf"

# Download Form 6A
Invoke-WebRequest -Uri "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/468937/form_6a.pdf" -OutFile "form-6a.pdf"
```

## Verification

After downloading, verify the files are present:

```bash
ls -la public/official-forms/
```

You should see:
- n5-eng.pdf
- n5b-eng.pdf
- n119-eng.pdf
- n1-eng.pdf
- form-6a.pdf

## Git Configuration

These PDF files should NOT be committed to git (they're large and official documents).

Add to `.gitignore`:
```
public/official-forms/*.pdf
```

But DO keep:
- This README.md file
- The .gitkeep file

## Usage in Application

These PDFs are loaded and filled programmatically by `/src/lib/documents/official-forms-filler.ts`.

The application:
1. Loads the official PDF
2. Fills in form fields with case data
3. Returns the completed official PDF

This ensures courts will accept our documents.

## Legal Compliance

✅ **These are official HMCTS forms**
✅ **Courts will accept these**
✅ **No custom formatting needed**
✅ **Always up to date when re-downloaded**

## Maintenance

Check HMCTS website periodically for updated forms:
https://www.gov.uk/government/publications?departments%5B%5D=hm-courts-and-tribunals-service

If a form is updated:
1. Download the new version
2. Replace the old PDF
3. Test form filling still works
4. Update the "Last Updated" date in this README

---

**Status:** ⏳ Waiting for PDFs to be added

Once PDFs are added, this folder will be ready for production use.
