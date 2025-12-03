# Database Schema Alignment - December 3, 2025

**Status:** ✅ Complete
**Scope:** TypeScript type definitions aligned with supabase_schema.MD
**Reference:** V1_COMPLETION_CHECKLIST.md Section 1.2

---

## Summary

Created strongly-typed TypeScript interfaces for core database tables to replace the intentionally permissive `GenericRow = any` pattern in `src/lib/supabase/types.ts`.

**Why This Matters:**
- Type safety for database operations
- Autocomplete support in editors
- Catch type mismatches at compile time
- Prevent runtime errors from nullable columns

---

## Current State Analysis

### Existing Types (src/lib/supabase/types.ts)

**Current approach:**
```typescript
export type GenericRow = any;

export interface Database {
  public: {
    Tables: {
      [tableName: string]: GenericTable; // ANY table accepted
    };
  };
}
```

**Rationale** (from code comments):
> "A permissive table type so TS never collapses to `never` while still allowing straightforward property access (e.g. `row.status`). We loosen the typing to `any` to avoid the `{}` inference issues that were causing dozens of 'property does not exist on type {}' errors."

**Problem:**
- No type safety for database rows
- Code uses `(row as any).column_name` everywhere
- Nullable columns not enforced
- jsonb columns typed as `any`

---

## Schema vs. Types Comparison

### Table: `cases`

| Column | Schema Type | Nullable | Default | Current TS Type | Correct TS Type |
|---|---|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() | any | string |
| user_id | uuid | YES | null | any | string \| null |
| case_type | text | NO | null | any | string |
| jurisdiction | text | NO | null | any | string |
| status | text | YES | 'in_progress' | any | string \| null |
| collected_facts | jsonb | YES | '{}' | any | Json \| null |
| wizard_progress | integer | YES | 0 | any | number \| null |
| wizard_completed_at | timestamp | YES | null | any | string \| null |
| recommended_route | text | YES | null | any | string \| null |
| recommended_grounds | ARRAY | YES | null | any | string[] \| null |
| success_probability | integer | YES | null | any | number \| null |
| red_flags | jsonb | YES | '[]' | any | Json \| null |
| compliance_issues | jsonb | YES | '[]' | any | Json \| null |
| council_code | text | YES | null | any | string \| null |
| created_at | timestamp | YES | now() | any | string \| null |
| updated_at | timestamp | YES | now() | any | string \| null |

**Issues:**
- ❌ All columns typed as `any`
- ❌ Nullability not enforced
- ❌ jsonb columns not properly typed
- ❌ ARRAY columns not typed as arrays

### Table: `case_facts`

| Column | Schema Type | Nullable | Default | Current TS Type | Correct TS Type |
|---|---|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() | any | string |
| case_id | uuid | NO | null | any | string |
| facts | jsonb | NO | '{}' | any | Json |
| validated_at | timestamp | YES | null | any | string \| null |
| validation_errors | jsonb | YES | null | any | Json \| null |
| version | integer | YES | 1 | any | number \| null |
| created_at | timestamp | YES | now() | any | string \| null |
| updated_at | timestamp | YES | now() | any | string \| null |

**Issues:**
- ❌ `facts` is NOT NULL but typed as `any` (should be `Json`)
- ❌ Nullability not enforced

### Table: `documents`

| Column | Schema Type | Nullable | Default | Current TS Type | Correct TS Type |
|---|---|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() | any | string |
| user_id | uuid | YES | null | any | string \| null |
| case_id | uuid | YES | null | any | string \| null |
| document_type | text | NO | null | any | string |
| document_title | text | NO | null | any | string |
| jurisdiction | text | NO | null | any | string |
| generated_by_model | text | YES | null | any | string \| null |
| generation_tokens_used | integer | YES | null | any | number \| null |
| generation_cost_usd | numeric | YES | null | any | number \| null |
| qa_score | integer | YES | null | any | number \| null |
| qa_issues | jsonb | YES | '[]' | any | Json \| null |
| qa_passed | boolean | YES | false | any | boolean \| null |
| html_content | text | YES | null | any | string \| null |
| pdf_url | text | YES | null | any | string \| null |
| is_preview | boolean | YES | true | any | boolean \| null |
| created_at | timestamp | YES | now() | any | string \| null |
| updated_at | timestamp | YES | now() | any | string \| null |

**Issues:**
- ❌ All columns typed as `any`
- ❌ Boolean columns not properly typed
- ❌ Numeric columns not typed as numbers

### Table: `conversations`

| Column | Schema Type | Nullable | Default | Current TS Type | Correct TS Type |
|---|---|---|---|---|---|
| id | uuid | NO | uuid_generate_v4() | any | string |
| case_id | uuid | NO | null | any | string |
| role | text | NO | null | any | string |
| content | text | NO | null | any | string |
| model | text | YES | null | any | string \| null |
| tokens_used | integer | YES | null | any | number \| null |
| question_id | text | YES | null | any | string \| null |
| input_type | text | YES | null | any | string \| null |
| user_input | jsonb | YES | null | any | Json \| null |
| created_at | timestamp | YES | now() | any | string \| null |

**Issues:**
- ❌ All columns typed as `any`
- ❌ NOT NULL columns not enforced

---

## Solution

Created `src/lib/supabase/database-types.ts` with strongly-typed interfaces:

```typescript
// Row types (database rows as returned by SELECT)
export interface CaseRow {
  id: string;
  user_id: string | null;
  case_type: string;
  jurisdiction: string;
  status: string | null;
  collected_facts: Json | null;
  wizard_progress: number | null;
  wizard_completed_at: string | null;
  recommended_route: string | null;
  recommended_grounds: string[] | null;
  success_probability: number | null;
  red_flags: Json | null;
  compliance_issues: Json | null;
  council_code: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Insert types (columns required for INSERT)
export interface CaseInsert {
  id?: string;
  user_id?: string | null;
  case_type: string;
  jurisdiction: string;
  status?: string | null;
  collected_facts?: Json | null;
  wizard_progress?: number | null;
  wizard_completed_at?: string | null;
  recommended_route?: string | null;
  recommended_grounds?: string[] | null;
  success_probability?: number | null;
  red_flags?: Json | null;
  compliance_issues?: Json | null;
  council_code?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Update types (all columns optional for UPDATE)
export interface CaseUpdate {
  user_id?: string | null;
  case_type?: string;
  jurisdiction?: string;
  status?: string | null;
  collected_facts?: Json | null;
  wizard_progress?: number | null;
  wizard_completed_at?: string | null;
  recommended_route?: string | null;
  recommended_grounds?: string[] | null;
  success_probability?: number | null;
  red_flags?: Json | null;
  compliance_issues?: Json | null;
  council_code?: string | null;
  updated_at?: string | null;
}
```

---

## Migration Strategy

**IMPORTANT:** We keep the existing permissive types to avoid breaking existing code.

**Approach:**
1. ✅ Create new strongly-typed interfaces in `database-types.ts`
2. ✅ Export both permissive and strict types from `types.ts`
3. 🔄 Gradually adopt strict types in new code
4. 🔄 Refactor existing code over time (NOT in V1)

**V1 Scope:**
- ✅ Document the type mismatches
- ✅ Create correct TypeScript interfaces
- ✅ Make strict types available for import
- ❌ DO NOT refactor all existing code (too risky for V1)

**V2+ Scope:**
- Refactor API routes to use strict types
- Add runtime validation with Zod
- Remove `as any` casts throughout codebase

---

## Key Findings

### 1. Nullability Issues

**Schema says NOT NULL, but TS allows null:**
- `cases.case_type` (NOT NULL) → should be `string` not `string | null`
- `cases.jurisdiction` (NOT NULL) → should be `string` not `string | null`
- `case_facts.facts` (NOT NULL) → should be `Json` not `Json | null`
- `case_facts.case_id` (NOT NULL) → should be `string` not `string | null`
- `documents.document_type` (NOT NULL) → should be `string` not `string | null`
- `conversations.role` (NOT NULL) → should be `string` not `string | null`
- `conversations.content` (NOT NULL) → should be `string` not `string | null`

### 2. JSON vs. JSONB

**All jsonb columns should be typed as `Json` (from types.ts):**
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
```

**Affected columns:**
- `cases.collected_facts` → `Json | null`
- `cases.red_flags` → `Json | null`
- `cases.compliance_issues` → `Json | null`
- `case_facts.facts` → `Json` (NOT NULL)
- `case_facts.validation_errors` → `Json | null`
- `documents.qa_issues` → `Json | null`
- `conversations.user_input` → `Json | null`

### 3. Array Columns

**PostgreSQL ARRAY columns should be typed as TypeScript arrays:**
- `cases.recommended_grounds` → `string[] | null`

### 4. Boolean Columns

**Boolean columns need explicit boolean type:**
- `documents.qa_passed` → `boolean | null`
- `documents.is_preview` → `boolean | null`

### 5. Numeric Columns

**PostgreSQL `numeric` and `integer` → TypeScript `number`:**
- `cases.wizard_progress` → `number | null`
- `cases.success_probability` → `number | null`
- `case_facts.version` → `number | null`
- `documents.generation_tokens_used` → `number | null`
- `documents.generation_cost_usd` → `number | null`
- `documents.qa_score` → `number | null`
- `conversations.tokens_used` → `number | null`

### 6. Timestamp Columns

**PostgreSQL `timestamp with time zone` → TypeScript `string` (ISO 8601):**
- All `created_at`, `updated_at`, `wizard_completed_at`, etc. → `string | null`

---

## Usage Examples

### Before (using permissive types):

```typescript
const { data: cases } = await supabase.from('cases').select('*');

// ❌ No type safety
const status = (cases[0] as any).status;
const wizardProgress = (cases[0] as any).wizard_progress;
```

### After (using strict types):

```typescript
import type { CaseRow } from '@/lib/supabase/database-types';

const { data: cases } = await supabase.from('cases').select('*');

// ✅ Typed rows
const casesTyped = cases as CaseRow[];
const status = casesTyped[0].status; // string | null (autocomplete works!)
const wizardProgress = casesTyped[0].wizard_progress; // number | null
```

### Inserting with strict types:

```typescript
import type { CaseInsert } from '@/lib/supabase/database-types';

const newCase: CaseInsert = {
  case_type: 'eviction', // ✅ Required
  jurisdiction: 'england-wales', // ✅ Required
  user_id: userId, // ✅ Optional
  status: 'in_progress', // ✅ Optional (has default)
};

await supabase.from('cases').insert(newCase);
```

---

## File Changes Summary

**New Files:**
1. `src/lib/supabase/database-types.ts` (NEW)
   - CaseRow, CaseInsert, CaseUpdate
   - CaseFactsRow, CaseFactsInsert, CaseFactsUpdate
   - DocumentRow, DocumentInsert, DocumentUpdate
   - ConversationRow, ConversationInsert, ConversationUpdate

**Modified Files:**
2. `src/lib/supabase/types.ts`
   - Re-exported strict types for convenience
   - Kept permissive Database interface (backward compatibility)

**Documentation:**
3. `docs/DB_SCHEMA_ALIGNMENT.md` (this file)
4. `docs/V1_COMPLETION_CHECKLIST.md`
   - Section 1.2: Marked complete

---

## Testing Recommendations

**Manual Testing:**
1. Import strict types in a test file
2. Query a table and cast to strict type
3. Verify autocomplete works in IDE
4. Verify TypeScript catches type errors

**Example:**
```typescript
import type { CaseRow } from '@/lib/supabase/database-types';

const { data } = await supabase.from('cases').select('*').single();
const caseRow: CaseRow = data;

// ✅ TypeScript autocomplete for all columns
console.log(caseRow.case_type);
console.log(caseRow.jurisdiction);

// ✅ TypeScript error if you try to assign wrong type
// caseRow.wizard_progress = "invalid"; // ❌ Type error!
```

---

## Next Steps

**Immediate (V1):**
- ✅ Document type mismatches
- ✅ Create strict type interfaces
- ✅ Export from types.ts

**Future (V2+):**
- Refactor API routes to use strict types
- Replace `(row as any).column` with typed access
- Add Zod schemas for runtime validation
- Remove permissive `GenericRow = any` pattern

---

**Implementation Date:** December 3, 2025
**Implemented By:** Claude Code
**Scope:** Core tables (cases, case_facts, documents, conversations)
**Impact:** Type safety foundation for V2+ refactoring
