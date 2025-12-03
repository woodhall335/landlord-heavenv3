// src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// A permissive table type so TS never collapses to `never` while still
// allowing straightforward property access (e.g. `row.status`). We loosen
// the typing to `any` to avoid the `{}` inference issues that were causing
// dozens of "property does not exist on type '{}'" errors throughout the
// codebase when consuming Supabase query results.
export type GenericRow = any;

export interface GenericTable {
  Row: any;
  Insert: any;
  Update: any;
  Relationships: never[];
}

export interface Database {
  public: {
    Tables: {
      // We allow ANY table name and treat rows as generic objects.
      // This makes `supabase.from('whatever')` always have a usable type
      // instead of `never`, which is where all your current TS errors come from.
      [tableName: string]: GenericTable;
    };
    Views: {
      [viewName: string]: {
        Row: GenericRow;
        Relationships: never[];
      };
    };
    Functions: {
      [fnName: string]: never;
    };
    Enums: {
      [enumName: string]: string;
    };
  };
}

// =============================================================================
// STRONGLY-TYPED DATABASE INTERFACES (V1+)
// =============================================================================
// Re-exported from database-types.ts for convenience.
// Use these for new code and gradual migration from `any` types.
//
// USAGE:
// ```typescript
// import type { CaseRow, DocumentRow } from '@/lib/supabase/types';
//
// const { data } = await supabase.from('cases').select('*').single();
// const caseRow: CaseRow = data; // ✅ Typed!
// ```
//
// See docs/DB_SCHEMA_ALIGNMENT.md for full documentation.
// =============================================================================

export type {
  // Cases table
  CaseRow,
  CaseInsert,
  CaseUpdate,

  // Case facts table
  CaseFactsRow,
  CaseFactsInsert,
  CaseFactsUpdate,

  // Documents table
  DocumentRow,
  DocumentInsert,
  DocumentUpdate,

  // Conversations table
  ConversationRow,
  ConversationInsert,
  ConversationUpdate,

  // Helper types
  DatabaseRow,
  isCaseRow,
  isDocumentRow,
} from './database-types';
