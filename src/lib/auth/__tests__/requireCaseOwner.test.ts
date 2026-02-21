/**
 * Tests for requireCaseOwner auth guard - Type definitions
 *
 * Note: Full integration tests for requireCaseOwner should be run against a
 * test database. Unit tests here focus on type interfaces and structure.
 */

import { describe, it, expect } from 'vitest';
import type { RequireCaseOwnerInput, RequireCaseOwnerResult } from '../requireCaseOwner';

describe('requireCaseOwner types', () => {
  it('RequireCaseOwnerInput has correct shape', () => {
    const input: RequireCaseOwnerInput = {
      caseId: 'case-123',
      userId: 'user-123',
    };

    expect(input.caseId).toBe('case-123');
    expect(input.userId).toBe('user-123');
  });

  it('RequireCaseOwnerResult has correct shape', () => {
    const result: RequireCaseOwnerResult = {
      caseId: 'case-123',
      userId: 'user-123',
      isAnonymousCase: false,
    };

    expect(result.caseId).toBe('case-123');
    expect(result.userId).toBe('user-123');
    expect(result.isAnonymousCase).toBe(false);
  });

  it('RequireCaseOwnerResult can represent anonymous case', () => {
    const result: RequireCaseOwnerResult = {
      caseId: 'case-123',
      userId: 'user-123',
      isAnonymousCase: true,
    };

    expect(result.isAnonymousCase).toBe(true);
  });
});
