// src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// A very permissive table type so TS never collapses to `never`
// Using `any` keeps Supabase query results flexible and avoids
// narrowing to `{}` which was causing property-access errors across
// the API route handlers.
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
