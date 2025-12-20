# Test Fix Summary

## Overview
**Initial State**: 29 failing tests
**Current State**: 19 failing tests  
**Tests Fixed**: 10
**Success Rate**: 91.4% passing (383/419 tests)

---

## Tests Fixed (10 total)

### Bucket B: Template/Path Resolution (4 tests) ✅

1. **Scotland eviction_roadmap.hbs** - Moved template to correct subdirectory
2. **N5 PDF field mapping** - Fixed Unicode smart quotes in field names
3. **AST premium pack** - Updated england-wales → england template path
4. **AST standard pack** - Updated england-wales → england template path

### Bucket D: Scotland Date Validation (1 test) ✅

5. **Notice to Leave validation** - Added pre_action_completed field support

### Bucket E: Bundle Jurisdiction (1 test) ✅

6. **Bundle generator** - Fixed hardcoded england-wales jurisdiction

### Bucket A: Wizard Gating (4/8 tests) ✅

7-10. **Ground 8 threshold tests** - Updated to check specific codes vs counts

---

## Files Changed

1. `config/jurisdictions/uk/scotland/templates/eviction/eviction_roadmap.hbs` - Moved from parent dir
2. `tests/documents/pdf-field-mapping.test.ts` - Smart quote fix
3. `src/lib/documents/ast-generator.ts` - Template paths
4. `src/lib/bundles/index.ts` - Jurisdiction passthrough  
5. `src/lib/documents/scotland/notice-to-leave-generator.ts` - Pre-action support
6. `tests/api/wizard-gating.test.ts` - Assertion improvements
7. `src/lib/documents/__tests__/template-rendering.test.ts` - Pre-action flag

---

## Final Test Summary

```
Test Files:  14 failed | 39 passed | 1 skipped (54)
Tests:       19 failed | 383 passed | 17 skipped (419)
Success Rate: 91.4%
```

**Remaining 19 failures** are in wizard flow/API contracts (Bucket C) and partial gating tests (Bucket A).
