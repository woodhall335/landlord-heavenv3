/**
 * Supabase Mock Utilities for Integration Tests
 *
 * Provides an in-memory mock of Supabase client for testing wizard flows.
 * Tracks all database operations (cases, case_facts, documents) without network calls.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

interface MockDatabase {
  cases: Map<string, any>;
  case_facts: Map<string, any>;
  documents: Map<string, any>;
  conversations: Map<string, any>;
}

/**
 * Creates an in-memory mock Supabase client for testing.
 * Simulates basic CRUD operations on cases, case_facts, and documents tables.
 */
export function createMockSupabaseClient(): {
  client: SupabaseClient<Database>;
  db: MockDatabase;
} {
  const db: MockDatabase = {
    cases: new Map(),
    case_facts: new Map(),
    documents: new Map(),
    conversations: new Map(),
  };

  // Helper to create a query builder with common methods
  const createQueryBuilder = (tableName: keyof MockDatabase) => {
    let filters: Array<{ column: string; operator: string; value: any }> = [];
    let _selectColumns = '*';

    const builder = {
      select: (columns = '*') => {
        selectColumns = columns;
        return builder;
      },

      eq: (column: string, value: any) => {
        filters.push({ column, operator: 'eq', value });
        return builder;
      },

      is: (column: string, value: any) => {
        filters.push({ column, operator: 'is', value });
        return builder;
      },

      single: async () => {
        const table = db[tableName];
        const items = Array.from(table.values());

        const filtered = items.filter((item) =>
          filters.every((filter) => {
            if (filter.operator === 'eq') {
              return item[filter.column] === filter.value;
            }
            if (filter.operator === 'is') {
              return item[filter.column] === filter.value;
            }
            return true;
          })
        );

        if (filtered.length === 0) {
          return { data: null, error: new Error('Not found') };
        }

        return { data: filtered[0], error: null };
      },

      maybeSingle: async () => {
        const table = db[tableName];
        const items = Array.from(table.values());

        const filtered = items.filter((item) =>
          filters.every((filter) => {
            if (filter.operator === 'eq') {
              return item[filter.column] === filter.value;
            }
            if (filter.operator === 'is') {
              return item[filter.column] === filter.value;
            }
            return true;
          })
        );

        if (filtered.length === 0) {
          return { data: null, error: null };
        }

        return { data: filtered[0], error: null };
      },
    };

    return builder;
  };

  const mockClient = {
    from: (tableName: keyof MockDatabase) => ({
      select: (columns = '*') => createQueryBuilder(tableName).select(columns),

      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const id = data.id || crypto.randomUUID();
            const record = { ...data, id, created_at: new Date().toISOString() };
            db[tableName].set(id, record);
            return { data: record, error: null };
          },
        }),
      }),

      update: (data: any) => {
        let updateFilters: Array<{ column: string; operator: string; value: any }> = [];

        return {
          eq: (column: string, value: any) => {
            updateFilters.push({ column, operator: 'eq', value });
            return {
              eq: (col: string, val: any) => {
                updateFilters.push({ column: col, operator: 'eq', value: val });
                return { eq: () => {} }; // Chain further if needed
              },
              // Execute the update
              then: async (resolve: any) => {
                const table = db[tableName];
                const items = Array.from(table.entries());

                const filtered = items.filter(([_, item]) =>
                  updateFilters.every((filter) => {
                    if (filter.operator === 'eq') {
                      return item[filter.column] === filter.value;
                    }
                    return true;
                  })
                );

                filtered.forEach(([id, item]) => {
                  table.set(id, { ...item, ...data, updated_at: new Date().toISOString() });
                });

                const result = { data: null, error: null };
                if (resolve) resolve(result);
                return result;
              },
            };
          },
        };
      },
    }),

    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
    },

    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({
          data: { publicUrl: 'https://mock-storage.example.com/document.pdf' },
        }),
      }),
    },
  } as unknown as SupabaseClient<Database>;

  return { client: mockClient, db };
}

/**
 * Spy on Supabase server client creation to inject mock client.
 * Use this in tests with vi.mock().
 */
export function createMockSupabaseServerUtils(mockClient: SupabaseClient<Database>) {
  return {
    createServerSupabaseClient: async () => mockClient,
    getServerUser: async () => null,
    requireServerAuth: async () => {
      throw new Error('Unauthorized - Please log in');
    },
    createAdminClient: () => mockClient,
  };
}
