import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const pageSource = fs.readFileSync(
  path.join(process.cwd(), 'src/app/(app)/dashboard/admin/cases/page.tsx'),
  'utf8'
);
const apiSource = fs.readFileSync(
  path.join(process.cwd(), 'src/app/api/admin/cases/route.ts'),
  'utf8'
);
const failedPaymentsPageSource = fs.readFileSync(
  path.join(process.cwd(), 'src/app/(app)/dashboard/admin/failed-payments/page.tsx'),
  'utf8'
);
const failedPaymentsButtonSource = fs.readFileSync(
  path.join(process.cwd(), 'src/app/(app)/dashboard/admin/failed-payments/RecoveryEmailButton.tsx'),
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

  it('shows production proof for preview-abandoned recovery emails', () => {
    expect(apiSource).toContain('CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES');
    expect(apiSource).toContain('recovery_last_event_at');
    expect(apiSource).toContain('recovery_emails_sent_30d');
    expect(apiSource).toContain('hasPreviewDocuments: previewDocumentCount > 0');
    expect(pageSource).toContain('Recovery Sent 30d');
    expect(pageSource).toContain('caseItem.recovery_last_event_at');
    expect(pageSource).toContain('Day 1');
    expect(pageSource).toContain('Day 7');
  });

  it('supports selecting multiple preview-abandoned cases for restart emails', () => {
    expect(pageSource).toContain('selectedCaseIds');
    expect(pageSource).toContain('Bulk preview recovery');
    expect(pageSource).toContain('Select restartable on page');
    expect(pageSource).toContain('handleBulkRestartLinks');
    expect(pageSource).toContain('/send-restart-link');
  });

  it('shows failed-checkout recovery status on the failed payments screen', () => {
    expect(failedPaymentsPageSource).toContain('checkout_recovery_sent');
    expect(failedPaymentsPageSource).toContain('Recovery sent');
    expect(failedPaymentsPageSource).toContain('Recovery failed');
    expect(failedPaymentsPageSource).toContain('recovery_last_event_at');
    expect(failedPaymentsPageSource).toContain('Recovery Sent');
    expect(failedPaymentsButtonSource).toContain('initialStatus');
  });
});
