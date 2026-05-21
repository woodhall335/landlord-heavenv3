import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const MOCK_CRON_SECRET = 'test-cron-secret';

let mockCases: any[] = [];
let mockOrders: any[] = [];
let mockDocuments: any[] = [];
let mockUsers: any[] = [];
let mockEvents: any[] = [];
let sentEmails: any[] = [];
let insertedEmailEvents: any[] = [];
let createdRecoveryLinks: any[] = [];
let cronStarted = false;
let cronCompleted: Array<{ status: string; summary: string; metrics?: unknown }> = [];

function casesBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => Promise.resolve({ data: mockCases, error: null })),
  };
  return builder;
}

function ordersBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve({ data: mockOrders, error: null })),
  };
  return builder;
}

function documentsBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => builder),
    eq: vi.fn(() => Promise.resolve({ data: mockDocuments, error: null })),
  };
  return builder;
}

function usersBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => Promise.resolve({ data: mockUsers, error: null })),
  };
  return builder;
}

function emailEventsBuilder() {
  const builder: any = {
    select: vi.fn(() => builder),
    in: vi.fn(() => builder),
    gte: vi.fn(() => Promise.resolve({ data: mockEvents, error: null })),
    insert: vi.fn((payload: any) => {
      insertedEmailEvents.push(payload);
      return Promise.resolve({ data: null, error: null });
    }),
  };
  return builder;
}

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'cases') return casesBuilder();
      if (table === 'orders') return ordersBuilder();
      if (table === 'documents') return documentsBuilder();
      if (table === 'users') return usersBuilder();
      if (table === 'email_events') return emailEventsBuilder();
      throw new Error(`Unexpected table ${table}`);
    }),
  })),
}));

vi.mock('@/lib/cases/recovery-server', () => ({
  createCaseRecoveryLink: vi.fn((params: any) => {
    createdRecoveryLinks.push(params);
    return Promise.resolve({
      resumeUrl: `https://landlordheaven.co.uk/wizard/flow?case_id=${params.caseRow.id}&recovery_token=test-token`,
      productType: 'section13_standard',
      productName: 'Supported Rent Increase Pack',
    });
  }),
}));

vi.mock('@/lib/email/resend', () => ({
  sendCasePreviewRecoveryEmail: vi.fn((params: any) => {
    sentEmails.push(params);
    return Promise.resolve({ success: true });
  }),
}));

vi.mock('@/lib/validation/cron-run-tracker', () => ({
  startCronRun: vi.fn(() => {
    cronStarted = true;
    return Promise.resolve({
      id: 'case-preview-recovery-run-id',
      jobName: 'case-preview:recover-abandoned',
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
  completeCronRun: vi.fn((_id: string, status: string, summary: string, metrics?: unknown) => {
    cronCompleted.push({ status, summary, metrics });
    return Promise.resolve(undefined);
  }),
}));

function request(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(url, { method: 'GET', headers });
}

describe('case preview recovery cron', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = MOCK_CRON_SECRET;
    mockCases = [];
    mockOrders = [];
    mockDocuments = [];
    mockUsers = [];
    mockEvents = [];
    sentEmails = [];
    insertedEmailEvents = [];
    createdRecoveryLinks = [];
    cronStarted = false;
    cronCompleted = [];
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    vi.clearAllMocks();
  });

  it('returns a health check without starting the cron run', async () => {
    const { GET } = await import('@/app/api/cron/case-preview-recovery/route');

    const response = await GET(request('http://localhost/api/cron/case-preview-recovery'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.job).toBe('case-preview:recover-abandoned');
    expect(data.day_1_age_hours).toBe(24);
    expect(cronStarted).toBe(false);
  });

  it('sends a day-1 restart email for a preview-abandoned case', async () => {
    mockCases = [
      {
        id: 'case-1',
        user_id: null,
        case_type: 'rent_increase',
        jurisdiction: 'england',
        status: 'in_progress',
        workflow_status: 'preview_ready',
        wizard_progress: 90,
        wizard_completed_at: null,
        collected_facts: {
          section13: {
            selectedPlan: 'section13_standard',
            landlord: { landlordEmail: 'alex@example.com', landlordName: 'Alex Landlord' },
          },
        },
        created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { GET } = await import('@/app/api/cron/case-preview-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/case-preview-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(1);
    expect(createdRecoveryLinks[0]).toEqual(
      expect.objectContaining({
        email: 'alex@example.com',
        stage: 'day_1',
        source: 'case-preview:recover-abandoned',
      })
    );
    expect(sentEmails[0]).toEqual(
      expect.objectContaining({
        to: 'alex@example.com',
        customerName: 'Alex Landlord',
        productName: 'Supported Rent Increase Pack',
        stage: 'day_1',
      })
    );
    expect(insertedEmailEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'alex@example.com',
          event_type: 'case_preview_recovery_day_1_attempted',
          event_data: expect.objectContaining({ case_id: 'case-1', status: 'attempted' }),
        }),
        expect.objectContaining({
          email: 'alex@example.com',
          event_type: 'case_preview_recovery_day_1_sent',
          event_data: expect.objectContaining({ case_id: 'case-1', status: 'sent' }),
        }),
      ])
    );
    expect(cronCompleted[0].status).toBe('success');
  });

  it('skips a case when the matching stage email was already attempted', async () => {
    mockCases = [
      {
        id: 'case-1',
        user_id: null,
        case_type: 'rent_increase',
        jurisdiction: 'england',
        status: 'in_progress',
        workflow_status: 'preview_ready',
        wizard_progress: 90,
        wizard_completed_at: null,
        collected_facts: {
          section13: {
            selectedPlan: 'section13_standard',
            landlord: { landlordEmail: 'alex@example.com', landlordName: 'Alex Landlord' },
          },
        },
        created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      },
    ];
    mockEvents = [
      {
        event_type: 'case_preview_recovery_day_1_attempted',
        event_data: { case_id: 'case-1' },
      },
    ];

    const { GET } = await import('@/app/api/cron/case-preview-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/case-preview-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(0);
    expect(sentEmails).toEqual([]);
    expect(insertedEmailEvents).toEqual([]);
  });

  it('skips a case when the matching stage email was already sent', async () => {
    mockCases = [
      {
        id: 'case-1',
        user_id: null,
        case_type: 'rent_increase',
        jurisdiction: 'england',
        status: 'in_progress',
        workflow_status: 'preview_ready',
        wizard_progress: 90,
        wizard_completed_at: null,
        collected_facts: {
          section13: {
            selectedPlan: 'section13_standard',
            landlord: { landlordEmail: 'alex@example.com', landlordName: 'Alex Landlord' },
          },
        },
        created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      },
    ];
    mockEvents = [
      {
        event_type: 'case_preview_recovery_day_1_sent',
        event_data: { case_id: 'case-1' },
      },
    ];

    const { GET } = await import('@/app/api/cron/case-preview-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/case-preview-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.emails_sent).toBe(0);
    expect(sentEmails).toEqual([]);
    expect(insertedEmailEvents).toEqual([]);
  });

  it('sends day-1 first for an older case that has not had the first recovery email', async () => {
    mockCases = [
      {
        id: 'case-older-no-day1',
        user_id: null,
        case_type: 'rent_increase',
        jurisdiction: 'england',
        status: 'in_progress',
        workflow_status: 'preview_ready',
        wizard_progress: 90,
        wizard_completed_at: null,
        collected_facts: {
          section13: {
            selectedPlan: 'section13_standard',
            landlord: { landlordEmail: 'older@example.com', landlordName: 'Older Landlord' },
          },
        },
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const { GET } = await import('@/app/api/cron/case-preview-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/case-preview-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );

    expect(response.status).toBe(200);
    expect(createdRecoveryLinks[0]).toEqual(expect.objectContaining({ stage: 'day_1' }));
    expect(insertedEmailEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_type: 'case_preview_recovery_day_1_attempted',
          event_data: expect.objectContaining({ case_id: 'case-older-no-day1' }),
        }),
        expect.objectContaining({
          event_type: 'case_preview_recovery_day_1_sent',
          event_data: expect.objectContaining({ case_id: 'case-older-no-day1' }),
        }),
      ])
    );
  });

  it('sends a day-7 follow-up after the day-1 email has already been sent', async () => {
    mockCases = [
      {
        id: 'case-older-day7',
        user_id: null,
        case_type: 'rent_increase',
        jurisdiction: 'england',
        status: 'in_progress',
        workflow_status: 'preview_ready',
        wizard_progress: 90,
        wizard_completed_at: null,
        collected_facts: {
          section13: {
            selectedPlan: 'section13_standard',
            landlord: { landlordEmail: 'day7@example.com', landlordName: 'Day Seven' },
          },
        },
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    mockEvents = [
      {
        event_type: 'case_preview_recovery_day_1_sent',
        event_data: { case_id: 'case-older-day7' },
      },
    ];

    const { GET } = await import('@/app/api/cron/case-preview-recovery/route');
    const response = await GET(
      request('http://localhost/api/cron/case-preview-recovery', {
        authorization: `Bearer ${MOCK_CRON_SECRET}`,
      })
    );

    expect(response.status).toBe(200);
    expect(createdRecoveryLinks[0]).toEqual(expect.objectContaining({ stage: 'day_7' }));
    expect(insertedEmailEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          event_type: 'case_preview_recovery_day_7_attempted',
          event_data: expect.objectContaining({ case_id: 'case-older-day7' }),
        }),
        expect.objectContaining({
          event_type: 'case_preview_recovery_day_7_sent',
          event_data: expect.objectContaining({ case_id: 'case-older-day7' }),
        }),
      ])
    );
  });
});
