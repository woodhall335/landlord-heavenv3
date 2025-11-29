// src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// A permissive table type so TS never collapses to `never` while still
// allowing straightforward property access (e.g. `row.status`). Using a
// string index signature keeps intellisense permissive without forcing
// callers to add manual casts everywhere.
export type GenericRow = Record<string, any>;

export interface GenericTable {
  Row: GenericRow;
  Insert: GenericRow;
  Update: GenericRow;
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
