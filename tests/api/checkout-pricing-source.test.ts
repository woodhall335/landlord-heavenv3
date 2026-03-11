import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Checkout pricing source', () => {
  it('checkout/create route uses PRODUCTS canonical pricing for Stripe unit_amount', () => {
    const routePath = path.join(process.cwd(), 'src/app/api/checkout/create/route.ts');
    const content = fs.readFileSync(routePath, 'utf-8');

    expect(content).toContain('const product = PRODUCTS[productSku];');
    expect(content).toContain('const unitAmountPence = Math.round(product.price * 100);');
    expect(content).toContain('unit_amount: unitAmountPence');
  });
});
