import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('checkout create route upgrade support', () => {
  it('supports the paid notice_only to complete_pack upgrade metadata and pricing path', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/app/api/checkout/create/route.ts'),
      'utf8'
    );

    expect(source).toContain("upgrade_from_product: z.enum(['notice_only']).optional()");
    expect(source).toContain("upgrade_kind: 'post_purchase_product_upgrade'");
    expect(source).toContain("getProductUpgradeAmount('notice_only', 'complete_pack')");
  });
});
