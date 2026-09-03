import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { runRecoveryOrchestrator } = vi.hoisted(() => ({
  runRecoveryOrchestrator: vi.fn(() => Promise.resolve({
    success: true,
    emails_sent: 0,
    skipped: 0,
    failed: 0,
  })),
}));

vi.mock('@/lib/recovery/orchestrator', () => ({
  getRecoveryOrchestratorConfig: vi.fn(() => ({ batch_limit: 50 })),
  runRecoveryOrchestrator,
}));

import { GET as checkoutRecoveryGet } from '@/app/api/cron/checkout-recovery/route';
import { GET as previewRecoveryGet } from '@/app/api/cron/case-preview-recovery/route';
import { GET as wizardRecoveryGet } from '@/app/api/cron/wizard-abandonment-recovery/route';

const compatibilityRoutes = [
  ['checkout', checkoutRecoveryGet],
  ['preview', previewRecoveryGet],
  ['wizard', wizardRecoveryGet],
] as const;

describe('legacy recovery cron compatibility routes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-cron-secret';
  });

  it.each(compatibilityRoutes)('%s delegates authenticated execution to the unified orchestrator', async (routeName, get) => {
    const request = new NextRequest(`http://localhost/api/cron/${routeName}-recovery`, {
      headers: { authorization: 'Bearer test-cron-secret' },
    });

    const response = await get(request);

    expect(response.status).toBe(200);
    expect(runRecoveryOrchestrator).toHaveBeenCalledTimes(1);
  });
});
