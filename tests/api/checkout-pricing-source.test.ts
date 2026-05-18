import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Checkout pricing source', () => {
  it('checkout/create route uses PRODUCTS canonical pricing for Stripe unit_amount', () => {
    const routePath = path.join(process.cwd(), 'src/app/api/checkout/create/route.ts');
    const content = fs.readFileSync(routePath, 'utf-8');

    expect(content).toContain('const product = PRODUCTS[productSku];');
    expect(content).toContain('let primaryChargeAmount = product.price;');
    expect(content).toContain('primaryChargeAmount = upgradeAmount;');
    expect(content).toContain('unit_amount: Math.round(primaryChargeAmount * 100)');
  });

  it('checkout/create uses payload-aware Stripe idempotency keys', () => {
    const routePath = path.join(process.cwd(), 'src/app/api/checkout/create/route.ts');
    const content = fs.readFileSync(routePath, 'utf-8');

    expect(content).toContain('checkout:v2:');
    expect(content).toContain('checkoutPayload: checkoutSessionPayload');
    expect(content).toContain('orderId: (order as any).id');
    expect(content).toContain('stableStringify(checkoutPayload)');
    expect(content).toContain('Reusing pending order without saved Stripe session for checkout retry');
  });
});
