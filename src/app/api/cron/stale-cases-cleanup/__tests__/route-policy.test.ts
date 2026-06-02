import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const routeSource = readFileSync(
  join(process.cwd(), 'src/app/api/cron/stale-cases-cleanup/route.ts'),
  'utf8'
);

describe('stale cases cleanup policy', () => {
  it('only targets anonymous stale wizard cases and skips linked orders', () => {
    expect(routeSource).toContain(".is('user_id', null)");
    expect(routeSource).toContain("const CLEANABLE_STATUSES = ['in_progress', 'completed'] as const");
    expect(routeSource).toContain(".in('status', [...CLEANABLE_STATUSES])");
    expect(routeSource).toContain(".lt('updated_at', cutoffIso)");
    expect(routeSource).toContain(".from('orders')");
    expect(routeSource).toContain('skipped_with_orders');
  });
});
