import { describe, expect, it } from 'vitest';
import { evaluateNoticeCompliance } from '@/lib/notices/evaluate-notice-compliance';

/**
 * REGRESSION TEST DOCUMENTATION: Preview PDF Generation Safety
 *
 * The preview route (/api/notice-only/preview/[caseId]) has critical safety logic:
 *
 * 1. If the core notice PDF fails to generate (e.g., Puppeteer timeout), the route
 *    MUST abort and return a 503 error with code 'NOTICE_GENERATION_FAILED'
 *
 * 2. It MUST NOT return a partial preview containing only ancillary documents
 *    (service instructions, checklists) without the actual notice
 *
 * 3. The error response must include:
 *    - retryable: true (indicating the user can try again)
 *    - user_message: A friendly message explaining the issue
 *    - details: The technical error message
 *
 * This behavior is enforced by the coreNoticeGenerated flag check in route.ts:
 * - Each notice generation (Section 8, Section 21, Section 173, Notice to Leave)
 *   sets coreNoticeGenerated = true on success
 * - Before merging documents, the route checks if coreNoticeGenerated is false
 *   and aborts with a clear error if so
 *
 * Manual verification steps:
 * 1. Temporarily reduce PUPPETEER_TIMEOUT to trigger a timeout
 * 2. Submit a preview request
 * 3. Verify the response is a 503 error, NOT a partial PDF
 */

describe('notice-only preview stage behaviour', () => {
  it('blocks Section 21 when prescribed information is missing at preview', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'england',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: false,
      },
      stage: 'preview',
    });

    const failure = result.hardFailures.find((f) => f.code === 'S21-DEPOSIT-NONCOMPLIANT');
    expect(failure).toBeTruthy();
    expect(failure?.affected_question_id).toBe('prescribed_info_given');
  });

  it('fails closed for Northern Ireland notice-only', () => {
    const result = evaluateNoticeCompliance({
      jurisdiction: 'northern-ireland',
      product: 'notice_only',
      selected_route: 'section_21',
      wizardFacts: {},
      stage: 'preview',
    });

    expect(result.ok).toBe(false);
    expect(result.hardFailures[0]?.code).toBe('NI_NOTICE_UNSUPPORTED');
  });
});
