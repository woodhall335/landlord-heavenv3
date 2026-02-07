import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { consumeArtifactDownload, registerArtifactDownload } from '@/lib/test-artifacts/artifactDownloadStore';

const TOKEN_TTL_MS = 10 * 60 * 1000;

describe('artifactDownloadStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('consumes tokens only once', async () => {
    const { token } = registerArtifactDownload('/tmp/test-artifacts/test.zip', '/tmp/test-artifacts');

    const first = await consumeArtifactDownload(token);
    const second = await consumeArtifactDownload(token);

    expect(first).toBeTruthy();
    expect(second).toBeNull();
  });

  it('expires tokens after the TTL', async () => {
    const { token } = registerArtifactDownload('/tmp/test-artifacts/expired.zip', '/tmp/test-artifacts');

    vi.advanceTimersByTime(TOKEN_TTL_MS + 1000);

    const entry = await consumeArtifactDownload(token);

    expect(entry).toBeNull();
  });
});
