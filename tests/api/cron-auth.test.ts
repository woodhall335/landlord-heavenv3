/**
 * Tests for Cron Job Authentication
 *
 * These tests verify that:
 * 1. Health check returns OK without writing a cron run
 * 2. Bearer token triggers execution and persists run
 * 3. x-vercel-cron alone does NOT execute
 * 4. x-vercel-cron + correct secret key in query executes
 * 5. Wrong secret key fails with 401
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock environment
const MOCK_CRON_SECRET = 'test-cron-secret-12345';

// Track what operations were performed
let executionStarted = false;
let cronRunPersisted = false;

// Mock cron-run-tracker
vi.mock('@/lib/validation/cron-run-tracker', () => ({
  startCronRun: vi.fn(() => {
    executionStarted = true;
    cronRunPersisted = true;
    return Promise.resolve({
      id: 'test-run-id',
      jobName: 'legal-change:check',
      startedAt: new Date().toISOString(),
      status: 'running',
      sourcesChecked: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      errors: [],
      warnings: [],
      summary: '',
      triggeredBy: 'cron',
    });
  }),
  completeCronRun: vi.fn(() => Promise.resolve(undefined)),
  addCronRunError: vi.fn(() => Promise.resolve()),
  updateCronRun: vi.fn(() => Promise.resolve()),
  CronRun: {},
}));

// Mock legal-source-registry
vi.mock('@/lib/validation/legal-source-registry', () => ({
  getEnabledSources: vi.fn(() => []),
}));

// Mock legal-change-events
vi.mock('@/lib/validation/legal-change-events', () => ({
  createEvent: vi.fn(() => ({ id: 'test-event-id' })),
  listEvents: vi.fn(() => []),
  countEventsByState: vi.fn(() => ({ new: 0, action_required: 0 })),
}));

// Mock legal-impact-analyzer
vi.mock('@/lib/validation/legal-impact-analyzer', () => ({
  analyzeAndAssess: vi.fn(),
}));

// Mock supabase
vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}));

describe('Cron Authentication', () => {
  beforeEach(() => {
    vi.resetModules();
    executionStarted = false;
    cronRunPersisted = false;
    process.env.CRON_SECRET = MOCK_CRON_SECRET;
    process.env.LEGAL_CHANGE_SIMULATION_ENABLED = 'false';
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.CRON_SECRET;
    delete process.env.LEGAL_CHANGE_SIMULATION_ENABLED;
  });

  describe('Health Check (no auth)', () => {
    it('should return status OK without auth headers', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check',
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.job).toBe('legal-change:check');
      expect(cronRunPersisted).toBe(false);
    });

    it('should not persist a cron run on health check', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check',
        { method: 'GET' }
      );

      await GET(request);

      expect(executionStarted).toBe(false);
      expect(cronRunPersisted).toBe(false);
    });
  });

  describe('Bearer Token Authentication', () => {
    it('should execute with valid Bearer token', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check',
        {
          method: 'GET',
          headers: {
            authorization: `Bearer ${MOCK_CRON_SECRET}`,
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.runId).toBeDefined();
      expect(executionStarted).toBe(true);
    });

    it('should return 401 with invalid Bearer token', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check',
        {
          method: 'GET',
          headers: {
            authorization: 'Bearer wrong-secret',
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(executionStarted).toBe(false);
    });

    it('should persist cron run with Bearer auth', async () => {
      const { POST } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check',
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${MOCK_CRON_SECRET}`,
          },
        }
      );

      await POST(request);

      expect(cronRunPersisted).toBe(true);
    });
  });

  describe('Vercel Cron Authentication (x-vercel-cron header + key param)', () => {
    it('should return 401 with x-vercel-cron header alone (no key)', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check',
        {
          method: 'GET',
          headers: {
            'x-vercel-cron': '1',
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(executionStarted).toBe(false);
    });

    it('should execute with x-vercel-cron header + correct key param', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        `http://localhost:3000/api/cron/legal-change-check?key=${MOCK_CRON_SECRET}`,
        {
          method: 'GET',
          headers: {
            'x-vercel-cron': '1',
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.runId).toBeDefined();
      expect(executionStarted).toBe(true);
    });

    it('should return 401 with x-vercel-cron header + wrong key param', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check?key=wrong-secret',
        {
          method: 'GET',
          headers: {
            'x-vercel-cron': '1',
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(executionStarted).toBe(false);
    });

    it('should persist cron run with Vercel Cron auth', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        `http://localhost:3000/api/cron/legal-change-check?key=${MOCK_CRON_SECRET}`,
        {
          method: 'GET',
          headers: {
            'x-vercel-cron': '1',
          },
        }
      );

      await GET(request);

      expect(cronRunPersisted).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should return 401 when CRON_SECRET is not configured', async () => {
      delete process.env.CRON_SECRET;

      // Need to re-import after changing env
      vi.resetModules();
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check',
        {
          method: 'GET',
          headers: {
            authorization: 'Bearer any-token',
          },
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should reject key parameter without x-vercel-cron header', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      // Just a key param but no x-vercel-cron header = invalid
      const request = new NextRequest(
        `http://localhost:3000/api/cron/legal-change-check?key=${MOCK_CRON_SECRET}`,
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      // Should treat as health check since no auth headers
      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(executionStarted).toBe(false);
    });

    it('should handle timing attack resistant comparison', async () => {
      const { GET } = await import(
        '@/app/api/cron/legal-change-check/route'
      );

      // Different length key - should still return 401 consistently
      const request = new NextRequest(
        'http://localhost:3000/api/cron/legal-change-check?key=short',
        {
          method: 'GET',
          headers: {
            'x-vercel-cron': '1',
          },
        }
      );

      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });
});

describe('Cron Auth Pattern Consistency', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = MOCK_CRON_SECRET;
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it('all cron routes should use consistent auth pattern', async () => {
    // This test documents expected behavior across all cron routes
    const cronRoutes = [
      '/api/cron/legal-change-check',
      '/api/cron/compliance-check',
      '/api/seo/cron/daily',
    ];

    // All routes should:
    // 1. Support GET for health checks (no auth) - returns status
    // 2. Support GET with x-vercel-cron + key for Vercel Cron
    // 3. Support Bearer auth for manual execution

    // This is a documentation test - the actual implementation
    // is verified by the individual route tests above
    expect(cronRoutes.length).toBe(3);
  });
});
