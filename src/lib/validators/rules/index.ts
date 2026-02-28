/**
 * Rules Engine Module
 *
 * Exports all types, utilities, and functions for the deterministic
 * legal validation rules engine.
 */

export * from './types';
export * from './version';
export * from './dateUtils';
export * from './runRules';
export { SECTION21_RULES, SECTION21_REQUIRED_FACTS } from './section21.rules';
export { SECTION8_RULES, SECTION8_REQUIRED_FACTS } from './section8.rules';
