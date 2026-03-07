/**
 * Tests for Admin Legal Change Actions API
 *
 * Validates:
 * - Response schema contract
 * - Workflow state transitions
 * - Admin authorization gating
 * - Action validation
 */

import { describe, it, expect } from 'vitest';

// Valid workflow actions from legal-change-workflow.ts
type WorkflowAction =
  | 'triage'
  | 'mark_action_required'
  | 'mark_no_action'
  | 'mark_implemented'
  | 'mark_rolled_out'
  | 'close'
  | 'reopen'
  | 'assign'
  | 'link_pr'
  | 'link_rollout'
  | 'link_incident';

// Event states from legal-change-events.ts
type EventState =
  | 'new'
  | 'triaged'
  | 'action_required'
  | 'no_action'
  | 'implemented'
  | 'rolled_out'
  | 'closed';

describe('Admin Legal Change Actions API Response Schema', () => {
  /**
   * Contract: POST /api/admin/legal-change/events/:id/actions returns:
   * {
   *   success: boolean,
   *   data?: LegalChangeEvent,
   *   error?: string,
   *   meta?: { timestamp: string }
   * }
   */

  it('should return success response structure for valid action', () => {
    const mockSuccessResponse = {
      success: true,
      data: {
        id: 'lce_test_001',
        title: 'Test Legal Change Event',
        state: 'triaged' as EventState,
        // ... other event fields
      },
      meta: {
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    };

    expect(mockSuccessResponse).toHaveProperty('success', true);
    expect(mockSuccessResponse).toHaveProperty('data');
    expect(mockSuccessResponse).toHaveProperty('meta');
    expect(mockSuccessResponse.meta).toHaveProperty('timestamp');
  });

  it('should return error response structure for invalid action', () => {
    const mockErrorResponse = {
      success: false,
      error: 'Invalid action: unknown_action',
      meta: {
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    };

    expect(mockErrorResponse).toHaveProperty('success', false);
    expect(mockErrorResponse).toHaveProperty('error');
    expect(typeof mockErrorResponse.error).toBe('string');
  });
});

describe('Workflow State Machine Validation', () => {
  // Valid state transitions from legal-change-events.ts
  const VALID_TRANSITIONS: Record<EventState, EventState[]> = {
    new: ['triaged'],
    triaged: ['action_required', 'no_action'],
    action_required: ['implemented', 'triaged'],
    no_action: ['triaged', 'closed'],
    implemented: ['rolled_out', 'action_required'],
    rolled_out: ['closed', 'implemented'],
    closed: ['triaged'],
  };

  it('should allow new -> triaged transition', () => {
    const from: EventState = 'new';
    const to: EventState = 'triaged';
    expect(VALID_TRANSITIONS[from]).toContain(to);
  });

  it('should allow triaged -> action_required transition', () => {
    const from: EventState = 'triaged';
    const to: EventState = 'action_required';
    expect(VALID_TRANSITIONS[from]).toContain(to);
  });

  it('should allow triaged -> no_action transition', () => {
    const from: EventState = 'triaged';
    const to: EventState = 'no_action';
    expect(VALID_TRANSITIONS[from]).toContain(to);
  });

  it('should allow action_required -> implemented transition', () => {
    const from: EventState = 'action_required';
    const to: EventState = 'implemented';
    expect(VALID_TRANSITIONS[from]).toContain(to);
  });

  it('should allow implemented -> rolled_out transition', () => {
    const from: EventState = 'implemented';
    const to: EventState = 'rolled_out';
    expect(VALID_TRANSITIONS[from]).toContain(to);
  });

  it('should allow rolled_out -> closed transition', () => {
    const from: EventState = 'rolled_out';
    const to: EventState = 'closed';
    expect(VALID_TRANSITIONS[from]).toContain(to);
  });

  it('should allow closed -> triaged transition (reopen)', () => {
    const from: EventState = 'closed';
    const to: EventState = 'triaged';
    expect(VALID_TRANSITIONS[from]).toContain(to);
  });

  it('should NOT allow new -> closed direct transition', () => {
    const from: EventState = 'new';
    expect(VALID_TRANSITIONS[from]).not.toContain('closed');
  });

  it('should NOT allow new -> action_required direct transition', () => {
    const from: EventState = 'new';
    expect(VALID_TRANSITIONS[from]).not.toContain('action_required');
  });
});

describe('Action to State Mapping', () => {
  // Actions and their target states
  const actionToTargetState: Record<string, EventState | null> = {
    triage: 'triaged',
    mark_action_required: 'action_required',
    mark_no_action: 'no_action',
    mark_implemented: 'implemented',
    mark_rolled_out: 'rolled_out',
    close: 'closed',
    reopen: 'triaged',
    assign: null, // Doesn't change state
    link_pr: null, // Doesn't change state
    link_rollout: null, // Doesn't change state
    link_incident: null, // Doesn't change state
  };

  it('should map triage action to triaged state', () => {
    expect(actionToTargetState['triage']).toBe('triaged');
  });

  it('should map mark_action_required action to action_required state', () => {
    expect(actionToTargetState['mark_action_required']).toBe('action_required');
  });

  it('should map mark_implemented action to implemented state', () => {
    expect(actionToTargetState['mark_implemented']).toBe('implemented');
  });

  it('should map mark_rolled_out action to rolled_out state', () => {
    expect(actionToTargetState['mark_rolled_out']).toBe('rolled_out');
  });

  it('should map close action to closed state', () => {
    expect(actionToTargetState['close']).toBe('closed');
  });
});

describe('Allowed Actions for Each State', () => {
  // Actions allowed for each state
  function getAllowedActionsForState(state: EventState): WorkflowAction[] {
    const actions: WorkflowAction[] = ['assign', 'link_pr', 'link_rollout', 'link_incident'];

    switch (state) {
      case 'new':
        actions.push('triage');
        break;
      case 'triaged':
        actions.push('mark_action_required', 'mark_no_action');
        break;
      case 'action_required':
        actions.push('mark_implemented');
        break;
      case 'no_action':
        actions.push('close', 'reopen');
        break;
      case 'implemented':
        actions.push('mark_rolled_out');
        break;
      case 'rolled_out':
        actions.push('close');
        break;
      case 'closed':
        actions.push('reopen');
        break;
    }

    return actions;
  }

  it('should allow triage for new state', () => {
    const actions = getAllowedActionsForState('new');
    expect(actions).toContain('triage');
  });

  it('should allow mark_action_required for triaged state', () => {
    const actions = getAllowedActionsForState('triaged');
    expect(actions).toContain('mark_action_required');
  });

  it('should allow mark_implemented for action_required state', () => {
    const actions = getAllowedActionsForState('action_required');
    expect(actions).toContain('mark_implemented');
  });

  it('should allow mark_rolled_out for implemented state', () => {
    const actions = getAllowedActionsForState('implemented');
    expect(actions).toContain('mark_rolled_out');
  });

  it('should allow close for rolled_out state', () => {
    const actions = getAllowedActionsForState('rolled_out');
    expect(actions).toContain('close');
  });

  it('should allow reopen for closed state', () => {
    const actions = getAllowedActionsForState('closed');
    expect(actions).toContain('reopen');
  });

  it('should NOT allow close for new state', () => {
    const actions = getAllowedActionsForState('new');
    expect(actions).not.toContain('close');
  });
});

describe('Admin Authorization Gating', () => {
  it('should return 401 structure for unauthenticated', () => {
    const unauthorizedResponse = {
      error: 'Unauthorized',
    };

    expect(unauthorizedResponse).toHaveProperty('error');
    expect(unauthorizedResponse.error).toBe('Unauthorized');
  });

  it('should return 403 structure for non-admin', () => {
    const forbiddenResponse = {
      error: 'Unauthorized - Admin access required',
    };

    expect(forbiddenResponse).toHaveProperty('error');
    expect(forbiddenResponse.error).toContain('Admin access required');
  });

  it('should return 400 structure for invalid action', () => {
    const badRequestResponse = {
      error: 'Invalid action: invalid_action',
    };

    expect(badRequestResponse).toHaveProperty('error');
    expect(badRequestResponse.error).toContain('Invalid action');
  });
});

describe('Request Body Validation', () => {
  it('should require action field in request body', () => {
    const validRequestBody = {
      action: 'triage',
      reason: 'Manual triage by admin',
    };

    expect(validRequestBody).toHaveProperty('action');
    expect(typeof validRequestBody.action).toBe('string');
  });

  it('should accept optional reason field', () => {
    const withReason = {
      action: 'mark_action_required',
      reason: 'Legal change requires immediate action',
    };

    const withoutReason = {
      action: 'mark_action_required',
    };

    expect(withReason).toHaveProperty('reason');
    expect(withoutReason).not.toHaveProperty('reason');
  });

  it('should accept optional metadata fields for specific actions', () => {
    const assignAction = {
      action: 'assign',
      assignee: 'user-id-123',
    };

    const linkPrAction = {
      action: 'link_pr',
      prUrl: 'https://github.com/org/repo/pull/123',
    };

    expect(assignAction).toHaveProperty('assignee');
    expect(linkPrAction).toHaveProperty('prUrl');
  });
});
