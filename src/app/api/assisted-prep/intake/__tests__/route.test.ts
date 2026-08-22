import { beforeEach, describe, expect, it, vi } from 'vitest';

const { single, sendAssistedPrepConsultationRequest } = vi.hoisted(() => ({
  single: vi.fn(),
  sendAssistedPrepConsultationRequest: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ single })),
      })),
    })),
  })),
  requireServerAuth: vi.fn(async () => ({ id: 'user-123' })),
}));

vi.mock('@/lib/email/resend', () => ({
  sendAssistedPrepConsultationRequest,
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn() },
}));

import { POST } from '../route';

const validRequest = () => new Request('http://localhost/api/assisted-prep/intake', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    service: 'section8',
    name: 'Jane Landlord',
    email: 'jane@example.com',
    phone: '07123456789',
    property_address: '1 Example Street, London, E1 1AA',
    tenant_names: 'Sam Tenant',
    urgency: 'This week',
    overview: 'The tenant has not paid rent for two months and I need a Section 8 notice.',
    authority_confirmed: true,
    responsibility_confirmed: true,
    section8_reason: 'Rent arrears',
    section8_notice_already_served: 'no',
  }),
});

describe('POST /api/assisted-prep/intake', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    single.mockResolvedValue({
      data: { id: '11111111-1111-1111-1111-111111111111' },
      error: null,
    });
    sendAssistedPrepConsultationRequest.mockResolvedValue({ success: true });
  });

  it('requires a meaningful summary of the current issue', async () => {
    const request = new Request('http://localhost/api/assisted-prep/intake', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        service: 'section8',
        name: 'Jane Landlord',
        email: 'jane@example.com',
        phone: '07123456789',
        property_address: '1 Example Street, London, E1 1AA',
        overview: 'Help',
        authority_confirmed: true,
        responsibility_confirmed: true,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('reports when the consultation confirmation email was sent', async () => {
    const response = await POST(validRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(sendAssistedPrepConsultationRequest).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'jane@example.com' })
    );
    expect(body.confirmation_email_sent).toBe(true);
  });
});
