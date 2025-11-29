// src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// A very permissive table type so TS never collapses to `never`
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
