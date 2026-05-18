import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const pageSource = fs.readFileSync(
  path.join(process.cwd(), 'src/app/(app)/dashboard/admin/cases/page.tsx'),
  'utf8'
);

describe('admin cases preview-abandoned recovery UI contract', () => {
  it('exposes the preview-abandoned preset and manual restart action', () => {
    expect(pageSource).toContain('preview_abandoned');
    expect(pageSource).toContain('Preview abandoned');
    expect(pageSource).toContain('Send restart link');
  });

  it('only renders the manual restart action when the API marks a case as eligible', () => {
    expect(pageSource).toContain('caseItem.can_send_restart_link');
    expect(pageSource).toContain('Restart email available');
  });
});
