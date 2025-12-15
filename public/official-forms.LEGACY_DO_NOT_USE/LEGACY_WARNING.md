# ⚠️ LEGACY - DO NOT USE FOR GENERATION

**These templates are OBSOLETE and must NOT be used for document generation.**

## Source of Truth: `/config/jurisdictions`

All document generation MUST use templates from `/config/jurisdictions`.

## Runtime Protection

The `loadTemplate()` function in `/src/lib/documents/generator.ts` enforces this contract with runtime guards that will throw errors if any code attempts to load templates from this directory.

## What This Directory Contains

This directory contains legacy files that are NO LONGER USED:

1. **Court forms** (N5, N119, N1, N5B) - These are used by `official-forms-filler.ts` for court claim packs (NOT notices)
2. **Duplicate notice PDFs** (form_6a.pdf, notice_to_leave.pdf) - These are OBSOLETE duplicates
   - Use `/config/jurisdictions/uk/england-wales/templates/eviction/section21_form6a.hbs` instead
   - Use `/config/jurisdictions/uk/scotland/templates/notice_to_leave.hbs` instead

## Template Resolver Contract

All template paths passed to `generateDocument()` must be:

- ✅ Relative to `/config/jurisdictions/` (e.g., `uk/england/templates/eviction/section8_notice.hbs`)
- ❌ NOT absolute paths
- ❌ NOT `public/` paths
- ❌ NOT `official-forms` paths
- ❌ NOT outside `/config/jurisdictions`

## Error Messages

If any generator attempts to load templates from this directory, you'll see:

```
[TEMPLATE GUARD] Attempted to load legacy template: public/official-forms/...
BLOCKED: All templates must come from /config/jurisdictions
This is a legacy path and must not be used for generation.
```

## Future Cleanup

This directory can be deleted once:
1. All tests pass ✅
2. All notice generation confirmed working ✅
3. No references to these paths remain in generators ✅

## Last Updated

2025-12-15 - Renamed from `/public/official-forms` to mark as legacy
