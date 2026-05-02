import { describe, expect, it } from 'vitest';
import { selectActiveCaseOrder } from '../active-order';

describe('selectActiveCaseOrder', () => {
  it('prefers the latest paid order over a newer pending order', () => {
    const order = selectActiveCaseOrder([
      {
        payment_status: 'pending',
        created_at: '2026-05-02T12:00:00Z',
      },
      {
        payment_status: 'paid',
        paid_at: '2026-05-02T11:30:00Z',
        created_at: '2026-05-02T11:00:00Z',
      },
    ]);

    expect(order?.payment_status).toBe('paid');
    expect(order?.paid_at).toBe('2026-05-02T11:30:00Z');
  });

  it('returns the most recent paid order when multiple paid orders exist', () => {
    const order = selectActiveCaseOrder([
      {
        payment_status: 'paid',
        paid_at: '2026-05-01T10:00:00Z',
      },
      {
        payment_status: 'paid',
        paid_at: '2026-05-02T10:00:00Z',
      },
    ]);

    expect(order?.paid_at).toBe('2026-05-02T10:00:00Z');
  });

  it('falls back to the latest created order when nothing is paid', () => {
    const order = selectActiveCaseOrder([
      {
        payment_status: 'failed',
        created_at: '2026-05-01T10:00:00Z',
      },
      {
        payment_status: 'pending',
        created_at: '2026-05-02T10:00:00Z',
      },
    ]);

    expect(order?.payment_status).toBe('pending');
    expect(order?.created_at).toBe('2026-05-02T10:00:00Z');
  });
});
