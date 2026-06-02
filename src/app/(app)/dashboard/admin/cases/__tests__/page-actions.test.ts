import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(
  join(process.cwd(), 'src/app/(app)/dashboard/admin/cases/page.tsx'),
  'utf8'
);

describe('admin cases page actions', () => {
  it('surfaces started drafts and protects hard deletion with typed confirmation', () => {
    expect(pageSource).toContain('Started drafts');
    expect(pageSource).toContain('Delete case');
    expect(pageSource).toContain('Delete permanently');
    expect(pageSource).toContain('deleteConfirmationText !== "DELETE"');
    expect(pageSource).toContain('method: "DELETE"');
  });
});
