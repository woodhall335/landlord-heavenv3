/**
 * Unified Jurisdiction type covering all UK jurisdictions
 *
 * - england, wales: Individual countries (used in wizard/schema for property location)
 * - england-wales: Combined jurisdiction (used in decision engine - E&W share housing law)
 * - scotland: Separate legal system
 * - northern-ireland: Separate legal system
 */
export type Jurisdiction =
  | 'england'
  | 'wales'
  | 'scotland'
  | 'northern-ireland'
  | 'england-wales';

/**
 * Decision engine uses combined E&W jurisdiction since they share housing law
 */
export type DecisionEngineJurisdiction = 'england-wales' | 'scotland';

/**
 * Property location uses individual countries
 */
export type PropertyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';

/**
 * Money claim jurisdictions
 */
export type MoneyClaimJurisdiction = 'england-wales' | 'scotland' | 'northern-ireland';
