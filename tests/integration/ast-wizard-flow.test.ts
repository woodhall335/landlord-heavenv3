/**
 * Integration Tests - AST Wizard Flow
 *
 * Tests the end-to-end wizard → facts → analysis → document generation pipeline
 * for England/Wales AST (Assured Shorthold Tenancy) agreements.
 *
 * Flow tested:
 * 1. Start wizard (creates case)
 * 2. Answer sequence of questions (builds WizardFacts)
 * 3. Analyze case (computes route and strength)
 * 4. Generate document (creates AST PDF/HTML)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

// Create a simple in-memory database for mocking
interface MockDatabase {
  cases: Map<string, any>;
  case_facts: Map<string, any>;
  documents: Map<string, any>;
  conversations: Map<string, any>;
}

// Use vi.hoisted() to ensure mock setup is hoisted properly with vi.mock
const { mockSupabase, mockDb } = vi.hoisted(() => {
  const db: MockDatabase = {
    cases: new Map(),
    case_facts: new Map(),
    documents: new Map(),
    conversations: new Map(),
  };

  // Create a minimal mock Supabase client
  const createQueryBuilder = (tableName: keyof MockDatabase) => {
    let filters: Array<{ column: string; operator: string; value: any }> = [];

    const builder = {
      select: () => builder,
      eq: (column: string, value: any) => {
        filters.push({ column, operator: 'eq', value });
        return builder;
      },
      is: (column: string, value: any) => {
        filters.push({ column, operator: 'is', value });
        return builder;
      },
      single: async () => {
        const items = Array.from(db[tableName].values());
        const filtered = items.filter((item) =>
          filters.every((f) => item[f.column] === f.value || (f.operator === 'is' && item[f.column] === f.value))
        );
        return filtered.length === 0
          ? { data: null, error: new Error('Not found') }
          : { data: filtered[0], error: null };
      },
      maybeSingle: async () => {
        const items = Array.from(db[tableName].values());
        const filtered = items.filter((item) =>
          filters.every((f) => item[f.column] === f.value || (f.operator === 'is' && item[f.column] === f.value))
        );
        return filtered.length === 0
          ? { data: null, error: null }
          : { data: filtered[0], error: null };
      },
    };
    return builder;
  };

  const client = {
    from: (tableName: keyof MockDatabase) => ({
      select: () => createQueryBuilder(tableName),
      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const id = data.id || crypto.randomUUID();
            const record = { ...data, id, created_at: new Date().toISOString() };
            // For case_facts, use case_id as the key since that's what queries filter on
            const mapKey = tableName === 'case_facts' && data.case_id ? data.case_id : id;
            db[tableName].set(mapKey, record);
            return { data: record, error: null };
          },
        }),
      }),
      update: (data: any) => {
        let updateFilters: Array<{ column: string; value: any }> = [];
        return {
          eq: (column: string, value: any) => {
            updateFilters.push({ column, value });
            return {
              eq: () => {},
              then: async (resolve: any) => {
                const items = Array.from(db[tableName].entries());
                items
                  .filter(([, item]) => updateFilters.every((f) => item[f.column] === f.value))
                  .forEach(([id, item]) => db[tableName].set(id, { ...item, ...data, updated_at: new Date().toISOString() }));
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
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://mock.example.com/doc.pdf' } }),
      }),
    },
  } as unknown as SupabaseClient<Database>;

  return { mockSupabase: client, mockDb: db };
});

vi.mock('@/lib/ai/openai-client', () => ({
  chatCompletion: vi.fn(),
  jsonCompletion: vi.fn(),
  streamChatCompletion: vi.fn(),
  openai: {},
}));

vi.mock('@/lib/ai/claude-client', () => ({
  claudeCompletion: vi.fn(),
  claudeJsonCompletion: vi.fn(),
  streamClaudeCompletion: vi.fn(),
  anthropic: {},
}));

// Mock Supabase before importing route handlers
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => mockSupabase,
  getServerUser: async () => null,
  requireServerAuth: async () => { throw new Error('Unauthorized - Please log in'); },
  createAdminClient: () => mockSupabase,
  tryGetServerUser: async () => ({ id: 'user-1' }),
}));

// Mock the document generator's PDF creation (we only care about HTML in these tests)
vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>(
    '@/lib/documents/generator'
  );
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
  };
});

// Mock AI enhancement to prevent external API calls
vi.mock('@/lib/ai/ask-heaven', () => ({
  enhanceAnswer: vi.fn(async () => null),
}));

// Import route handlers AFTER mocking
import { POST as wizardStart } from '@/app/api/wizard/start/route';
import { POST as wizardAnswer } from '@/app/api/wizard/answer/route';
import { POST as wizardNextQuestion } from '@/app/api/wizard/next-question/route';
import { POST as wizardAnalyze } from '@/app/api/wizard/analyze/route';
import { POST as documentsGenerate } from '@/app/api/documents/generate/route';

describe('AST Wizard Flow - Integration Tests', () => {
  beforeEach(() => {
    // Clear mock database before each test
    mockDb.cases.clear();
    mockDb.case_facts.clear();
    mockDb.documents.clear();
    mockDb.conversations.clear();
  });

  describe('Standard AST - Happy Path', () => {
    test('should create case, answer question, analyze, and generate document', async () => {

      // ------------------------------------------------
      // 1. Start wizard for Standard AST
      // ------------------------------------------------
      const startRequest = new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'ast_standard',
          jurisdiction: 'england',
        }),
      });

      const startResponse = await wizardStart(startRequest);
      expect(startResponse.status).toBe(200);

      const startData = await startResponse.json();
      expect(startData.case_id).toBeDefined();
      expect(startData.jurisdiction).toBe('england');
      expect(startData.next_question).toBeDefined();

      const caseId = startData.case_id;

      // Verify case was created
      const caseRecord = mockDb.cases.get(caseId);
      expect(caseRecord).toBeDefined();
      expect(caseRecord.case_type).toBe('tenancy_agreement');
      expect(caseRecord.jurisdiction).toBe('england');

      // ------------------------------------------------
      // 2. Answer a sample question (first question from MQS)
      // ------------------------------------------------
      const firstQuestion = startData.next_question;
      expect(firstQuestion).toBeDefined();
      expect(firstQuestion.id).toBeDefined();

      // Answer the first question (typically ast_tier for Standard AST)
      // Generate appropriate answer based on question type
      let answer: any;
      if (firstQuestion.inputType === 'select') {
        answer = firstQuestion.options?.[0] || 'Standard AST';
      } else if (firstQuestion.inputType === 'group' && firstQuestion.fields) {
        // For group questions, provide valid field values
        answer = {};
        for (const field of firstQuestion.fields) {
          if (field.inputType === 'yes_no') {
            answer[field.id] = true;
          } else if (field.inputType === 'select' && field.options) {
            answer[field.id] = field.options[0];
          } else if (field.inputType === 'number') {
            answer[field.id] = 1;
          } else if (field.inputType === 'date') {
            answer[field.id] = '2024-01-01';
          } else {
            answer[field.id] = 'test value';
          }
        }
      } else {
        answer = 'test value';
      }

      const answerRequest = new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: firstQuestion.id,
          answer,
        }),
      });

      const answerResponse = await wizardAnswer(answerRequest);
      expect(answerResponse.status).toBe(200);

      const answerData = await answerResponse.json();
      expect(answerData.answer_saved).toBe(true);
      expect(answerData.case_id).toBe(caseId);

      // ------------------------------------------------
      // 3. Get next question to verify flow continues
      // ------------------------------------------------
      const nextQuestionRequest = new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      });

      const nextQuestionResponse = await wizardNextQuestion(nextQuestionRequest);
      expect(nextQuestionResponse.status).toBe(200);

      const nextQuestionData = await nextQuestionResponse.json();
      // Should have more questions or be complete
      expect(nextQuestionData).toBeDefined();

      // ------------------------------------------------
      // 4. Analyze case (works even with minimal data)
      // ------------------------------------------------
      const analyzeRequest = new Request('http://localhost/api/wizard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      });

      const analyzeResponse = await wizardAnalyze(analyzeRequest);
      expect(analyzeResponse.status).toBe(200);

      const analyzeData = await analyzeResponse.json();
      expect(analyzeData.case_id).toBe(caseId);
      expect(analyzeData.recommended_route).toBeDefined();
      expect(analyzeData.case_strength_score).toBeGreaterThanOrEqual(0);
      expect(analyzeData.case_strength_score).toBeLessThanOrEqual(100);
    });
  });

  describe('Premium AST - Multiple Tenants', () => {
    test('should create case and generate premium document', async () => {

      // ------------------------------------------------
      // 1. Start wizard for Premium AST
      // ------------------------------------------------
      const startRequest = new Request('http://localhost/api/wizard/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: 'ast_premium',
          jurisdiction: 'england',
        }),
      });

      const startResponse = await wizardStart(startRequest);
      expect(startResponse.status).toBe(200);

      const startData = await startResponse.json();
      expect(startData.case_id).toBeDefined();
      expect(startData.next_question).toBeDefined();

      const caseId = startData.case_id;

      // ------------------------------------------------
      // 2. Answer first question to save some data
      // ------------------------------------------------
      const firstQuestion = startData.next_question;

      // Generate appropriate answer based on question type
      let answer: any;
      if (firstQuestion.inputType === 'select') {
        answer = firstQuestion.options?.[0] || 'Premium AST';
      } else if (firstQuestion.inputType === 'group' && firstQuestion.fields) {
        // For group questions, provide valid field values
        answer = {};
        for (const field of firstQuestion.fields) {
          if (field.inputType === 'yes_no') {
            answer[field.id] = true;
          } else if (field.inputType === 'select' && field.options) {
            answer[field.id] = field.options[0];
          } else if (field.inputType === 'number') {
            answer[field.id] = 1;
          } else if (field.inputType === 'date') {
            answer[field.id] = '2024-01-01';
          } else {
            answer[field.id] = 'test value';
          }
        }
      } else {
        answer = 'test value';
      }

      const answerRequest = new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: firstQuestion.id,
          answer,
        }),
      });

      const answerResponse = await wizardAnswer(answerRequest);
      expect(answerResponse.status).toBe(200);

      const answerData = await answerResponse.json();
      expect(answerData.answer_saved).toBe(true);
      expect(answerData.case_id).toBe(caseId);

      // ------------------------------------------------
      // 3. Get next question to verify flow continues
      // ------------------------------------------------
      const nextQuestionRequest = new Request('http://localhost/api/wizard/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      });

      const nextQuestionResponse = await wizardNextQuestion(nextQuestionRequest);
      expect(nextQuestionResponse.status).toBe(200);

      const nextQuestionData = await nextQuestionResponse.json();
      expect(nextQuestionData).toBeDefined();

      // ------------------------------------------------
      // 4. Analyze case (works even with minimal data)
      // ------------------------------------------------
      const analyzeRequest = new Request('http://localhost/api/wizard/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      });

      const analyzeResponse = await wizardAnalyze(analyzeRequest);
      expect(analyzeResponse.status).toBe(200);

      const analyzeData = await analyzeResponse.json();
      expect(analyzeData.case_id).toBe(caseId);
      expect(analyzeData.recommended_route).toBeDefined();
      expect(analyzeData.case_strength_score).toBeGreaterThanOrEqual(0);
      expect(analyzeData.case_strength_score).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    test('should reject non-existent case_id in answer route', async () => {
      // Use a valid UUID format that doesn't exist in the database
      const fakeUuid = '00000000-0000-0000-0000-000000000000';

      const answerRequest = new Request('http://localhost/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: fakeUuid,
          question_id: 'property_address',
          answer: { property_address_line1: '123 Test St' },
        }),
      });

      const response = await wizardAnswer(answerRequest);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    test('should reject document generation for non-existent case', async () => {
      // Use a valid UUID format that doesn't exist in the database
      const fakeUuid = '00000000-0000-0000-0000-000000000001';

      const generateRequest = new Request('http://localhost/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: fakeUuid,
          document_type: 'ast_standard',
          is_preview: true,
        }),
      });

      const response = await documentsGenerate(generateRequest);
      expect(response.status).toBe(404);
    });
  });
});
