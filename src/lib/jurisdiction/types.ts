/**
 * Unified Jurisdiction type covering all UK jurisdictions
 *
 * - england, wales: Individual countries (used in wizard/schema for property location)
 * - scotland: Separate legal system
 * - northern-ireland: Separate legal system
 */
export type Jurisdiction =
  | 'england'
  | 'wales'
  | 'scotland'
  | 'northern-ireland';

/**
 * Decision engine uses canonical jurisdictions
 */
export type DecisionEngineJurisdiction = 'england' | 'wales' | 'scotland';

/**
 * Property location uses individual countries
 */
export type PropertyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

/**
 * Money claim jurisdictions
 */
export type MoneyClaimJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';
