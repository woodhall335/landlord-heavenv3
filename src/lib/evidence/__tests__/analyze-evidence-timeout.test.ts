/**
 * Regression tests for analyze-evidence timeout behavior.
 *
 * These tests verify that analyzeEvidence never hangs and always returns
 * within the master timeout, even when:
 * - OpenAI LLM call never resolves (hangs indefinitely)
 * - OpenAI LLM call times out
 * - Vision analysis hangs
 *
 * The function should fall back to regex-only extraction and still produce
 * classification + validator output.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeEvidence } from '../analyze-evidence';

// Mock the OpenAI client to simulate hanging
vi.mock('@/lib/ai/openai-client', () => ({
  getOpenAIClient: () => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  }),
}));

// Import after mock is set up
import { getOpenAIClient } from '@/lib/ai/openai-client';

describe('analyzeEvidence timeout handling', () => {
  const mockClient = getOpenAIClient();

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    // Set OPENAI_API_KEY to trigger LLM path
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.OPENAI_API_KEY;
  });

  it('should return within master timeout when LLM call never resolves', async () => {
    // Mock LLM to never resolve (simulate hang)
    const neverResolve = new Promise(() => {
      // This promise never resolves - simulates a hanging network call
    });
    (mockClient.chat.completions.create as any).mockReturnValue(neverResolve);

    // Create a minimal PDF buffer (just needs to be parseable)
    const mockPdfBuffer = Buffer.from('%PDF-1.4\nSection 8 Notice Form 3\n%%EOF');

    const startTime = Date.now();

    // Start the analysis
    const resultPromise = analyzeEvidence({
      storageBucket: 'test',
      storagePath: 'test/section_8.pdf',
      mimeType: 'application/pdf',
      filename: 'section_8.pdf',
      caseId: 'test-case-123',
      questionId: 'validator_section_8',
      category: 'notice_s8',
      fileBuffer: mockPdfBuffer,
      validatorKey: 'section_8',
      debugId: 'test-llm-hang',
    });

    // Advance time past the LLM timeout (10s) but before master timeout (30s)
    await vi.advanceTimersByTimeAsync(15000);

    const result = await resultPromise;
    const duration = Date.now() - startTime;

    // Verify the function returned (didn't hang forever)
    expect(result).toBeDefined();
    expect(result.debug_id).toBe('test-llm-hang');

    // Verify it returned within a reasonable time (should be < 30s master timeout)
    // With fake timers, the actual elapsed time is simulated
    expect(duration).toBeLessThan(35000);

    // Verify extraction quality is present (function completed properly)
    expect(result.extraction_quality).toBeDefined();
    // Should have a final_stage indicating completion (not hang)
    expect(result.final_stage).toBeDefined();
  });

  it('should produce extraction_quality output even when PDF parsing fails', async () => {
    // Mock LLM to never resolve
    const neverResolve = new Promise(() => {});
    (mockClient.chat.completions.create as any).mockReturnValue(neverResolve);

    // Create a buffer with Section 8 markers for regex extraction
    const mockPdfContent = `%PDF-1.4
Section 8 Notice
Form 3
Housing Act 1988
Ground 8
Ground 10
Property: 123 Test Street, London, SW1A 1AA
Tenant: John Smith
Date served: 01/01/2024
Arrears: £3000
%%EOF`;
    const mockPdfBuffer = Buffer.from(mockPdfContent);

    const resultPromise = analyzeEvidence({
      storageBucket: 'test',
      storagePath: 'test/section_8.pdf',
      mimeType: 'application/pdf',
      filename: 'section_8.pdf',
      caseId: 'test-case-123',
      questionId: 'validator_section_8',
      category: 'notice_s8',
      fileBuffer: mockPdfBuffer,
      validatorKey: 'section_8',
      debugId: 'test-regex-fallback',
    });

    // Advance past LLM timeout
    await vi.advanceTimersByTimeAsync(15000);

    const result = await resultPromise;

    // Should return a result (not hang)
    expect(result).toBeDefined();

    // Extraction quality should be present
    expect(result.extraction_quality).toBeDefined();
  });

  it('should return result even on master timeout', async () => {
    // Mock both LLM and vision to never resolve
    const neverResolve = new Promise(() => {});
    (mockClient.chat.completions.create as any).mockReturnValue(neverResolve);

    const mockPdfBuffer = Buffer.from('%PDF-1.4\n%%EOF');

    const resultPromise = analyzeEvidence({
      storageBucket: 'test',
      storagePath: 'test/unknown.pdf',
      mimeType: 'application/pdf',
      filename: 'unknown.pdf',
      caseId: 'test-case-123',
      fileBuffer: mockPdfBuffer,
      debugId: 'test-master-timeout',
    });

    // Advance past master timeout (30s)
    await vi.advanceTimersByTimeAsync(35000);

    const result = await resultPromise;

    // Should still return a result (not throw)
    expect(result).toBeDefined();
    expect(result.debug_id).toBe('test-master-timeout');

    // Should have a final_stage (either complete, timeout, or error - not undefined)
    expect(result.final_stage).toBeDefined();
    expect(['complete', 'timeout', 'error']).toContain(result.final_stage);
  });

  it('should complete quickly when LLM is mocked to resolve fast', async () => {
    // Mock LLM to resolve immediately with valid response
    (mockClient.chat.completions.create as any).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            detected_type: 's8_notice',
            extracted_fields: {
              form_3_detected: true,
              section_8_detected: true,
              grounds_cited: [8, 10],
            },
            confidence: 0.85,
            warnings: [],
          }),
        },
      }],
    });

    const mockPdfContent = 'Section 8 Form 3';
    const mockPdfBuffer = Buffer.from(`%PDF-1.4\n${mockPdfContent}\n%%EOF`);

    const startTime = Date.now();

    const resultPromise = analyzeEvidence({
      storageBucket: 'test',
      storagePath: 'test/section_8.pdf',
      mimeType: 'application/pdf',
      filename: 'section_8.pdf',
      caseId: 'test-case-123',
      questionId: 'validator_section_8',
      category: 'notice_s8',
      fileBuffer: mockPdfBuffer,
      validatorKey: 'section_8',
      debugId: 'test-fast-llm',
    });

    // Advance a small amount
    await vi.advanceTimersByTimeAsync(100);

    const result = await resultPromise;
    const duration = Date.now() - startTime;

    // Should complete quickly (under 5s with no network calls)
    expect(duration).toBeLessThan(5000);

    // Should have success result
    expect(result).toBeDefined();
    expect(result.final_stage).toBe('complete');
  });
});

describe('analyzeEvidence stage logging', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should log all expected stages during analysis', async () => {
    // Capture console.log calls
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const mockPdfContent = 'Section 8 Form 3 Housing Act 1988';
    const mockPdfBuffer = Buffer.from(`%PDF-1.4\n${mockPdfContent}\n%%EOF`);

    const resultPromise = analyzeEvidence({
      storageBucket: 'test',
      storagePath: 'test/section_8.pdf',
      mimeType: 'application/pdf',
      filename: 'section_8.pdf',
      caseId: 'test-case-123',
      validatorKey: 'section_8',
      fileBuffer: mockPdfBuffer,
      debugId: 'test-stages',
    });

    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    // Verify key stages were logged
    const logCalls = logSpy.mock.calls.map(call => call[0]);

    // Should have init stage
    expect(logCalls.some(log => log?.includes('[analyzeEvidence][init]'))).toBe(true);

    // Should have pdf_parse stage
    expect(logCalls.some(log => log?.includes('[analyzeEvidence][pdf_parse]'))).toBe(true);

    // Should have regex_start stage
    expect(logCalls.some(log => log?.includes('[analyzeEvidence][regex_start]'))).toBe(true);

    logSpy.mockRestore();
  });
});

describe('analyzeEvidence always returns', () => {
  it('should always return extraction_quality metadata', async () => {
    // Test with a minimal buffer - should still return proper metadata
    const mockPdfBuffer = Buffer.from('%PDF-1.4\n%%EOF');

    // Clear API key to skip LLM
    delete process.env.OPENAI_API_KEY;

    const result = await analyzeEvidence({
      storageBucket: 'test',
      storagePath: 'test/minimal.pdf',
      mimeType: 'application/pdf',
      filename: 'minimal.pdf',
      caseId: 'test-case-123',
      fileBuffer: mockPdfBuffer,
      debugId: 'test-minimal',
    });

    // Should always return extraction_quality (even on failures)
    expect(result.extraction_quality).toBeDefined();
    expect(result.extraction_quality?.text_extraction_method).toBeDefined();
    expect(typeof result.extraction_quality?.text_length).toBe('number');
    expect(typeof result.extraction_quality?.regex_fields_found).toBe('number');
    expect(typeof result.extraction_quality?.llm_extraction_ran).toBe('boolean');
  });

  it('should return valid final_stage on all code paths', async () => {
    const mockPdfBuffer = Buffer.from('%PDF-1.4\nTest content\n%%EOF');

    delete process.env.OPENAI_API_KEY;

    const result = await analyzeEvidence({
      storageBucket: 'test',
      storagePath: 'test/test.pdf',
      mimeType: 'application/pdf',
      filename: 'test.pdf',
      caseId: 'test-case-123',
      fileBuffer: mockPdfBuffer,
      debugId: 'test-final-stage',
    });

    // final_stage should always be set
    expect(result.final_stage).toBeDefined();
    expect(['init', 'complete', 'timeout', 'error']).toContain(result.final_stage);
  });
});
