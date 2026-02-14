# Validator Smart Analysis Audit

**Date:** 2024-12-29
**Status:** Implementation Complete

## 1. Current Pipeline Summary

```
Upload → analyzeEvidence → classifyDocument → mergeExtractedFacts
       → mapEvidenceToFacts → applyDocumentIntelligence → runLegalValidator
       → validation_summary/recommendations/next_questions
```

### Key Components

| File | Purpose |
|------|---------|
| `src/app/api/wizard/upload-evidence/route.ts` | Orchestrates pipeline |
| `src/lib/evidence/analyze-evidence.ts` | AI-powered extraction |
| `src/lib/evidence/classify-document.ts` | Keyword classification |
| `src/lib/evidence/merge-extracted-facts.ts` | Maps fields to facts |
| `src/lib/validators/run-legal-validator.ts` | Routes to validators |

## 2. Root Causes for Weak Fact Extraction

### Issue 1: No Deterministic Extraction
- AI-only extraction with global confidence
- No regex patterns for dates, amounts, postcodes
- Uncertainty in AI means all fields get low confidence

### Issue 2: Cascading Confidence Thresholds
```
analyzeEvidence → 0.68 confidence
mergeExtractedFacts → 0.65 threshold ✓
applyDocumentIntelligence → 0.72 threshold ✗
```
Result: Facts extracted but not applied.

## 3. Root Causes for Misclassification

### Issue 1: Simple Keyword Matching
- `Form 6A + Section 21` = only 60% confidence
- No recognition of strong marker combinations

### Issue 2: No Strong Markers
- Strong indicators not boosted appropriately
- Obvious documents classified with low confidence

## 4. Implementation Plan (Completed)

### Phase 1: Strong Markers ✓
- Added `STRONG_MARKER_RULES` with high-confidence patterns
- Form 6A + Section 21 → 0.92 confidence
- Form 3 + Section 8 → 0.92 confidence

### Phase 2: Deterministic Extraction ✓
- Added regex extractors for dates, amounts, postcodes
- Per-field confidence with anchors
- Merged with AI extraction

### Phase 3: Per-Field Confidence ✓
- Field-specific thresholds (dates: 0.55, compliance: 0.70)
- Regex extractions boosted
- Provenance tracking with anchors

### Phase 4: Validator Updates ✓
- Extracted facts checked before asking questions
- Confidence-based question filtering

### Phase 5: UI Panel ✓
- "What we detected" collapsible panel
- Shows facts with confidence and anchors

## 5. Files Modified

1. `src/lib/evidence/classify-document.ts` - Strong markers
2. `src/lib/evidence/analyze-evidence.ts` - Deterministic extraction
3. `src/lib/evidence/merge-extracted-facts.ts` - Per-field confidence
4. `src/lib/validators/run-legal-validator.ts` - Extracted facts filtering
5. `src/components/wizard/fields/UploadField.tsx` - Detected facts UI
6. `tests/lib/evidence/classify-document.test.ts` - Strong marker tests

## 6. Success Criteria

- Form 6A Section 21 classified at ≥85% confidence ✓
- Key fields extracted with per-field confidence ✓
- Questions only asked for missing/low-confidence facts ✓
- UI shows detected values with anchors ✓
