/**
 * Auth Module
 *
 * Centralized authentication and authorization guards.
 */

export { requireUser, tryGetUser } from './requireUser';
export type { RequireUserResult } from './requireUser';

export { requireCaseOwner, checkCaseOwnership } from './requireCaseOwner';
export type { RequireCaseOwnerInput, RequireCaseOwnerResult } from './requireCaseOwner';

export { logMutation, getMutationLogs } from './audit-log';
export type { MutationLogEntry, LogMutationInput } from './audit-log';
