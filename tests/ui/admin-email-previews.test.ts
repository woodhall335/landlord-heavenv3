import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const sourcePath = join(
  process.cwd(),
  'src/app/(app)/dashboard/admin/email-previews/page.tsx'
);
const source = readFileSync(sourcePath, 'utf8');

describe('admin email previews source contract', () => {
  it('includes checkout and preview-abandoned recovery system emails', () => {
    expect(source).toContain('id: "checkout-recovery"');
    expect(source).toContain('id: "case-preview-recovery-manual"');
    expect(source).toContain('id: "case-preview-recovery-day-1"');
    expect(source).toContain('id: "case-preview-recovery-day-7"');
    expect(source).toContain('id: "section13-recovery-link"');
  });

  it('renders recovery preview copy and resume links', () => {
    expect(source).toContain('Finish Your Document Pack');
    expect(source).toContain('Resume Your Landlord Heaven Draft');
    expect(source).toContain('getCasePreviewRecoveryPreviewBody');
    expect(source).toContain('recovery_token=example-token');
    expect(source).toContain('Resume My Draft');
    expect(source).toContain('Resume Your Section 13 Wizard Draft');
    expect(source).toContain('Resume Section 13 Wizard');
  });
});
