import { RequirementsResult, ValidationContext } from './index';
import { FlowCapability } from '../capabilities/matrix';

export function getNoticeOnlyRequirements(
  _ctx: ValidationContext & { flow: FlowCapability }
): RequirementsResult {
  return { requiredNow: new Set(), warnNow: new Set(), derived: new Set() };
}
