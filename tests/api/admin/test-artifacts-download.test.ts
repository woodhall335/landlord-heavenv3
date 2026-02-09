import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  requireServerAuth: vi.fn(async () => ({ id: 'user-123' })),
}));

vi.mock('@/lib/auth', () => ({
  isAdmin: vi.fn(() => false),
}));

vi.mock('@/lib/test-artifacts/artifactDownloadStore', () => ({
  consumeArtifactDownload: vi.fn(),
  cleanupArtifactDownload: vi.fn(),
}));

import { GET } from '@/app/api/admin/test-artifacts/complete-pack/download/route';

describe('admin test artifacts download route', () => {
  it('rejects non-admin users', async () => {
    const request = new Request(
      'http://localhost:3000/api/admin/test-artifacts/complete-pack/download?token=test-token'
    );

    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('Admin');
  });
});
