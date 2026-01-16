/**
 * Products Module
 *
 * Exports product-related helpers for pack contents and next steps.
 */

export { getPackContents, isProductSupported } from './pack-contents';
export type { PackItem, PackItemCategory, GetPackContentsArgs } from './pack-contents';

export { getNextSteps } from './next-steps';
export type { NextStepsResult, GetNextStepsArgs } from './next-steps';
