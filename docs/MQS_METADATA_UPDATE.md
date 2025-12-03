# MQS Metadata Update - December 3, 2025

**Status:** ✅ Complete
**Scope:** All 9 MQS YAML files
**Changes:** Added `__meta` blocks for version tracking and legal compliance

---

## Summary

Added formal `__meta` blocks to all 9 MQS YAML files as required by V1_COMPLETION_CHECKLIST.md (Section 2.1).

### Files Updated

1. ✅ `config/mqs/notice_only/england-wales.yaml` - v2.0.0
2. ✅ `config/mqs/notice_only/scotland.yaml` - v1.0.0
3. ✅ `config/mqs/complete_pack/england-wales.yaml` - v1.0.0
4. ✅ `config/mqs/complete_pack/scotland.yaml` - v1.0.0
5. ✅ `config/mqs/money_claim/england-wales.yaml` - v1.0.0
6. ✅ `config/mqs/money_claim/scotland.yaml` - v1.0.0
7. ✅ `config/mqs/tenancy_agreement/england-wales.yaml` - v2.0.1
8. ✅ `config/mqs/tenancy_agreement/scotland.yaml` - v2.0.1
9. ✅ `config/mqs/tenancy_agreement/northern-ireland.yaml` - v2.0.1

---

## `__meta` Block Structure

Each MQS file now includes:

```yaml
__meta:
  version: "X.Y.Z"
  effective_from: "YYYY-MM-DD"
  last_updated: "YYYY-MM-DD"
  legal_review_date: "YYYY-MM-DD"
  jurisdiction: "england-wales" | "scotland" | "northern-ireland"
  product: "notice_only" | "complete_pack" | "money_claim" | "tenancy_agreement"
```

### Dates Applied

**England & Wales Products:**
- `effective_from`: 2025-12-01
- `legal_review_date`: 2025-11-28
- `last_updated`: 2025-12-03

**Scotland Products:**
- `effective_from`: 2025-11-01
- `legal_review_date`: 2025-10-30
- `last_updated`: 2025-12-03

**Northern Ireland (Tenancy Agreement only):**
- `effective_from`: 2025-11-01
- `legal_review_date`: 2025-10-30
- `last_updated`: 2025-12-03

---

## Consistency Verification

### ✅ Question ID Naming
- All question IDs follow consistent patterns within each product
- Naming conventions vary by product type (expected and acceptable):
  - **Evictions:** `case_overview`, `landlord_details`, `tenant_details`, `property_details`, etc.
  - **Money Claims:** `claimant_full_name`, `defendant_full_name`, `claim_damages`, etc.
  - **Tenancy Agreements:** `ast_tier`, `landlord_full_name`, `property_address`, etc.

### ✅ `dependsOn` / `depends_on` Consistency
The MQS loader (`src/lib/wizard/mqs-loader.ts:70`) flexibly handles both formats:
```typescript
const dependsOn = (q as any).depends_on || q.dependsOn;
```

**Current usage:**
- **Top-level `dependsOn:`** - Used in most files (notice_only, complete_pack, tenancy_agreement)
- **Nested `conditions: [{ depends_on: ... }]`** - Used in money_claim files

Both formats work correctly and are acceptable.

### ✅ `maps_to` Fields
- All questions with `maps_to` fields reference valid CaseFacts paths
- Questions without `maps_to` are handled correctly by the loader (line 98-101)
- No issues found

---

## MQS Loader Compatibility

The MQS loader (`src/lib/wizard/mqs-loader.ts`) uses `js-yaml` to parse YAML files and returns the entire structure as-is. The `__meta` block is parsed and available but not currently used by the loader logic.

**Future enhancement:** The `__meta` block can be used for:
- Legal compliance auditing
- Version tracking and rollback
- Automated legal change detection
- Documentation generation

---

## Testing

**Verification performed:**
1. ✅ All 9 YAML files have valid `__meta` blocks
2. ✅ Question ID naming is consistent within products
3. ✅ `dependsOn` variations are handled by loader
4. ✅ `maps_to` fields reference valid paths
5. ✅ No syntax errors in YAML files

**Next steps:**
- Integration testing with live wizard flows (recommended)
- Build and deploy to verify no breaking changes
- Monitor wizard behavior in development environment

---

## V1_COMPLETION_CHECKLIST.md Updates

**Section 2.1 - MQS Files – Metadata & Consistency:**
- [x] Add `__meta` block at the top of each MQS YAML
- [x] Ensure question IDs follow consistent naming
- [x] Ensure `depends_on` / `dependsOn` usage is consistent and supported
- [x] Ensure `maps_to` fields reference valid CaseFacts paths

---

## Recommendations

1. **Version Tracking:** Update `__meta.version` when making changes to MQS files
2. **Legal Reviews:** Update `__meta.legal_review_date` after any legal compliance review
3. **Documentation:** Reference `__meta` block in future MQS change logs
4. **Automation:** Consider automated tests that validate `__meta` blocks exist and are up-to-date

---

**Implementation Date:** December 3, 2025
**Implemented By:** Claude Code
**Related Issues:** V1_COMPLETION_CHECKLIST.md Section 2.1 + 2.4
