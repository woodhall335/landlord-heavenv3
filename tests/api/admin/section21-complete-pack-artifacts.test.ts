import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireServerAuth: vi.fn(async () => ({ id: 'admin-user' })),
  isAdmin: vi.fn(() => true),
  generateCompleteEvictionPack: vi.fn(async () => ({
    documents: [{ key: 'n5b_claim', filename: 'n5b.pdf' }],
    metadata: { case_id: 'EVICT-CLI-SEC21' },
  })),
  saveCompletePackArtifacts: vi.fn(async () => ({
    outputDir: '/tmp/section21-complete-pack',
    docs: [{ key: 'n5b_claim', filename: 'n5b.pdf' }],
    storage: 'local',
    zipPath: '/tmp/section21-complete-pack.zip',
  })),
  registerArtifactDownload: vi.fn(() => ({
    token: 'download-token',
    outputDir: '/tmp/section21-complete-pack',
  })),
  validateCompletePackDocuments: vi.fn(() => ({ ok: true })),
  setupTestAI: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  requireServerAuth: mocks.requireServerAuth,
}));

vi.mock('@/lib/auth', () => ({
  isAdmin: mocks.isAdmin,
}));

vi.mock('@/lib/documents/eviction-pack-generator', () => ({
  generateCompleteEvictionPack: mocks.generateCompleteEvictionPack,
}));

vi.mock('@/lib/test-artifacts/artifactDownloadStore', () => ({
  registerArtifactDownload: mocks.registerArtifactDownload,
}));

vi.mock('@/lib/test-artifacts/saveCompletePackArtifacts', () => ({
  saveCompletePackArtifacts: mocks.saveCompletePackArtifacts,
}));

vi.mock('@/lib/test-artifacts/validateCompletePackDocuments', () => ({
  validateCompletePackDocuments: mocks.validateCompletePackDocuments,
}));

vi.mock('@/lib/test-artifacts/setupTestAI', () => ({
  setupTestAI: mocks.setupTestAI,
}));

import { POST } from '@/app/api/admin/test-artifacts/complete-pack/england/section21/route';

describe('admin section21 complete pack test artifacts route', () => {
  it('returns a pack including N5B and passes required N5B answers', async () => {
    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.docs).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: 'n5b_claim' })])
    );

    expect(mocks.generateCompleteEvictionPack).toHaveBeenCalledTimes(1);
    const [facts] = mocks.generateCompleteEvictionPack.mock.calls[0];
    expect(facts).toMatchObject({
      n5b_q9a_after_feb_1997: true,
      n5b_q9b_no_notice_not_ast: true,
      n5b_q9c_no_exclusion_clause: true,
      n5b_q9d_not_agricultural_worker: true,
      n5b_q9e_not_succession_tenancy: true,
      n5b_q9f_not_former_secure: true,
      n5b_q9g_not_schedule_10: true,
      n5b_q19_prohibited_payment: false,
      n5b_q20_paper_determination: true,
    });
  });
});
