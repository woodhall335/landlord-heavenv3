import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('generic wizard preview reached marker', () => {
  it('marks all wizard preview visits for admin preview-abandoned recovery', () => {
    const source = readSource('src/app/(app)/wizard/preview/[caseId]/page.tsx');

    expect(source).toContain(`/api/cases/${'${caseId}'}/preview-reached`);
    expect(source).toContain("source: 'wizard_preview_page'");
    expect(source).toContain('...sessionHeaders');
  });

  it('marks wizard review visits so non-Section-13 products enter preview recovery', () => {
    const source = readSource('src/app/(app)/wizard/review/page.tsx');

    expect(source).toContain(`/api/cases/${'${caseId}'}/preview-reached`);
    expect(source).toContain("source: 'wizard_review_page'");
    expect(source).toContain('...getSessionTokenHeaders()');
  });

  it('persists a preview-ready workflow marker and preview metadata', () => {
    const source = readSource('src/app/api/cases/[id]/preview-reached/route.ts');

    expect(source).toContain("workflow_status: nextWorkflowStatus");
    expect(source).toContain("wizard_progress: Math.max");
    expect(source).toContain("wizard_completed_at:");
    expect(source).toContain("preview_reached_at");
    expect(source).toContain("preview_last_viewed_at");
    expect(source).toContain("assertCaseWriteAccess");
  });
});
