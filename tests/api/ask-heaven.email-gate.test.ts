/**
 * Ask Heaven Email Gate Tests
 *
 * Tests the server-side email gate enforcement in the Ask Heaven chat API.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/ask-heaven/chat/route';

// Mock rate limiter (uses 'wizard' limiter, not 'askHeaven')
vi.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    wizard: vi.fn(async () => ({ success: true, reset: Date.now() + 60000 })),
  },
}));

// Mock jsonCompletion from @/lib/ai
vi.mock('@/lib/ai', () => ({
  jsonCompletion: vi.fn(async () => ({
    json: { reply: 'Test AI response' },
  })),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

describe('Ask Heaven Email Gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns requires_email when messageCount >= 3 and emailCaptured is false', async () => {
    const request = new Request('http://localhost/api/ask-heaven/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        jurisdiction: 'england',
        messageCount: 3,
        emailCaptured: false,
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.requires_email).toBe(true);
    expect(payload.message).toBe('Enter your email to continue your conversation.');
  });

  it('returns requires_email when messageCount is 4 and emailCaptured is false', async () => {
    const request = new Request('http://localhost/api/ask-heaven/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test' }],
        jurisdiction: 'england',
        messageCount: 4,
        emailCaptured: false,
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.requires_email).toBe(true);
  });

  it('does NOT require email when messageCount >= 3 but emailCaptured is true', async () => {
    const request = new Request('http://localhost/api/ask-heaven/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test' }],
        jurisdiction: 'england',
        messageCount: 3,
        emailCaptured: true,
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.requires_email).toBeUndefined();
    expect(payload.reply).toBeDefined();
  });

  it('does NOT require email when messageCount < 3', async () => {
    const request = new Request('http://localhost/api/ask-heaven/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test' }],
        jurisdiction: 'england',
        messageCount: 2,
        emailCaptured: false,
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.requires_email).toBeUndefined();
    expect(payload.reply).toBeDefined();
  });

  it('does NOT require email when case_id is present (case review mode)', async () => {
    const request = new Request('http://localhost/api/ask-heaven/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: '00000000-0000-0000-0000-000000000001',
        messages: [{ role: 'user', content: 'Test' }],
        jurisdiction: 'england',
        messageCount: 5,
        emailCaptured: false,
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    // Should not require email because case_id is present
    expect(payload.requires_email).toBeUndefined();
    expect(payload.reply).toBeDefined();
  });

  it('is backward compatible when messageCount is not provided', async () => {
    const request = new Request('http://localhost/api/ask-heaven/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Test' }],
        jurisdiction: 'england',
        // No messageCount or emailCaptured - old client
      }),
    });

    const response = await POST(request as any);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.requires_email).toBeUndefined();
    expect(payload.reply).toBeDefined();
  });
});
