import { describe, it, expect } from 'vitest';
import {
  runRules,
  getFact,
  getYesNoFact,
  hasFact,
  getMissingFacts,
  createRuleResult,
} from '../runRules';
import type { Rule, RuleContext, FactValue } from '../types';
import { VALIDATOR_RULESET_VERSION } from '../version';

describe('runRules', () => {
  const createContext = (
    facts: Record<string, FactValue | undefined> = {}
  ): RuleContext => ({
    jurisdiction: 'england',
    validatorKey: 'section_21',
    facts,
  });

  const createFact = (value: unknown, provenance: FactValue['provenance'] = 'user_confirmed'): FactValue => ({
    value,
    provenance,
    confidence: provenance === 'extracted' ? 0.8 : 1.0,
  });

  it('should return empty results for empty rules array', () => {
    const result = runRules([], createContext());
    expect(result.results).toHaveLength(0);
    expect(result.blockers).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
    expect(result.info).toHaveLength(0);
    expect(result.status).toBe('pass');
  });

  it('should include ruleset version in result', () => {
    const result = runRules([], createContext());
    expect(result.rulesetVersion).toBe(VALIDATOR_RULESET_VERSION);
  });

  it('should return pass status when all rules pass', () => {
    const rules: Rule[] = [
      {
        id: 'TEST-1',
        title: 'Test Rule 1',
        severity: 'blocker',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'TEST-1', title: 'Test Rule 1', severity: 'blocker' },
          'pass',
          'All good'
        ),
      },
      {
        id: 'TEST-2',
        title: 'Test Rule 2',
        severity: 'warning',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'TEST-2', title: 'Test Rule 2', severity: 'warning' },
          'pass',
          'All good'
        ),
      },
    ];

    const result = runRules(rules, createContext());
    expect(result.status).toBe('pass');
    expect(result.blockers).toHaveLength(1); // Still included but with pass outcome
    expect(result.warnings).toHaveLength(1);
  });

  it('should return invalid status when any blocker fails', () => {
    const rules: Rule[] = [
      {
        id: 'TEST-BLOCKER',
        title: 'Blocker Rule',
        severity: 'blocker',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'TEST-BLOCKER', title: 'Blocker Rule', severity: 'blocker' },
          'fail',
          'This is a fatal error'
        ),
      },
      {
        id: 'TEST-WARNING',
        title: 'Warning Rule',
        severity: 'warning',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'TEST-WARNING', title: 'Warning Rule', severity: 'warning' },
          'pass',
          'Warning is fine'
        ),
      },
    ];

    const result = runRules(rules, createContext());
    expect(result.status).toBe('invalid');
    expect(result.blockers.some(b => b.outcome === 'fail')).toBe(true);
  });

  it('should return needs_info status when any rule needs info (and no blockers fail)', () => {
    const rules: Rule[] = [
      {
        id: 'TEST-NEEDS-INFO',
        title: 'Needs Info Rule',
        severity: 'blocker',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'TEST-NEEDS-INFO', title: 'Needs Info Rule', severity: 'blocker' },
          'needs_info',
          'Please provide more information',
          { missingFacts: ['test_fact'] }
        ),
      },
    ];

    const result = runRules(rules, createContext());
    expect(result.status).toBe('needs_info');
  });

  it('should return warning status when warning fails but no blockers fail', () => {
    const rules: Rule[] = [
      {
        id: 'TEST-BLOCKER',
        title: 'Blocker Rule',
        severity: 'blocker',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'TEST-BLOCKER', title: 'Blocker Rule', severity: 'blocker' },
          'pass',
          'Blocker passes'
        ),
      },
      {
        id: 'TEST-WARNING',
        title: 'Warning Rule',
        severity: 'warning',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'TEST-WARNING', title: 'Warning Rule', severity: 'warning' },
          'fail',
          'This is a warning'
        ),
      },
    ];

    const result = runRules(rules, createContext());
    expect(result.status).toBe('warning');
  });

  it('should skip rules that do not apply', () => {
    const rules: Rule[] = [
      {
        id: 'TEST-SKIP',
        title: 'Should be skipped',
        severity: 'blocker',
        applies: () => false,
        evaluate: () => {
          throw new Error('Should not be called');
        },
      },
      {
        id: 'TEST-APPLY',
        title: 'Should apply',
        severity: 'blocker',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'TEST-APPLY', title: 'Should apply', severity: 'blocker' },
          'pass',
          'Applied'
        ),
      },
    ];

    const result = runRules(rules, createContext());
    expect(result.results).toHaveLength(1);
    expect(result.results[0].id).toBe('TEST-APPLY');
  });

  it('should categorize results by severity', () => {
    const rules: Rule[] = [
      {
        id: 'BLOCKER-1',
        title: 'Blocker',
        severity: 'blocker',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'BLOCKER-1', title: 'Blocker', severity: 'blocker' },
          'pass',
          'Passed'
        ),
      },
      {
        id: 'WARNING-1',
        title: 'Warning',
        severity: 'warning',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'WARNING-1', title: 'Warning', severity: 'warning' },
          'fail',
          'Failed'
        ),
      },
      {
        id: 'INFO-1',
        title: 'Info',
        severity: 'info',
        applies: () => true,
        evaluate: () => createRuleResult(
          { id: 'INFO-1', title: 'Info', severity: 'info' },
          'pass',
          'Noted'
        ),
      },
    ];

    const result = runRules(rules, createContext());
    expect(result.blockers).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.info).toHaveLength(1);
  });
});

describe('getFact', () => {
  const createContext = (facts: Record<string, FactValue | undefined>): RuleContext => ({
    jurisdiction: 'england',
    validatorKey: 'section_21',
    facts,
  });

  it('should return value for present fact', () => {
    const ctx = createContext({
      test_fact: { value: 'test_value', provenance: 'user_confirmed' },
    });
    expect(getFact(ctx, 'test_fact')).toBe('test_value');
  });

  it('should return undefined for missing fact', () => {
    const ctx = createContext({});
    expect(getFact(ctx, 'test_fact')).toBeUndefined();
  });

  it('should return undefined for fact with missing provenance', () => {
    const ctx = createContext({
      test_fact: { value: 'test', provenance: 'missing' },
    });
    expect(getFact(ctx, 'test_fact')).toBeUndefined();
  });
});

describe('getYesNoFact', () => {
  const createContext = (facts: Record<string, FactValue | undefined>): RuleContext => ({
    jurisdiction: 'england',
    validatorKey: 'section_21',
    facts,
  });

  it('should return true for boolean true', () => {
    const ctx = createContext({
      test: { value: true, provenance: 'user_confirmed' },
    });
    expect(getYesNoFact(ctx, 'test')).toBe(true);
  });

  it('should return false for boolean false', () => {
    const ctx = createContext({
      test: { value: false, provenance: 'user_confirmed' },
    });
    expect(getYesNoFact(ctx, 'test')).toBe(false);
  });

  it('should return true for string "yes"', () => {
    const ctx = createContext({
      test: { value: 'yes', provenance: 'user_confirmed' },
    });
    expect(getYesNoFact(ctx, 'test')).toBe(true);
  });

  it('should return false for string "no"', () => {
    const ctx = createContext({
      test: { value: 'no', provenance: 'user_confirmed' },
    });
    expect(getYesNoFact(ctx, 'test')).toBe(false);
  });

  it('should return undefined for missing fact', () => {
    const ctx = createContext({});
    expect(getYesNoFact(ctx, 'test')).toBeUndefined();
  });
});

describe('hasFact', () => {
  const createContext = (facts: Record<string, FactValue | undefined>): RuleContext => ({
    jurisdiction: 'england',
    validatorKey: 'section_21',
    facts,
  });

  it('should return true for present fact', () => {
    const ctx = createContext({
      test: { value: 'value', provenance: 'user_confirmed' },
    });
    expect(hasFact(ctx, 'test')).toBe(true);
  });

  it('should return false for undefined fact', () => {
    const ctx = createContext({});
    expect(hasFact(ctx, 'test')).toBe(false);
  });

  it('should return false for fact with missing provenance', () => {
    const ctx = createContext({
      test: { value: undefined, provenance: 'missing' },
    });
    expect(hasFact(ctx, 'test')).toBe(false);
  });
});

describe('getMissingFacts', () => {
  const createContext = (facts: Record<string, FactValue | undefined>): RuleContext => ({
    jurisdiction: 'england',
    validatorKey: 'section_21',
    facts,
  });

  it('should return all facts when none are present', () => {
    const ctx = createContext({});
    const missing = getMissingFacts(ctx, ['fact1', 'fact2', 'fact3']);
    expect(missing).toEqual(['fact1', 'fact2', 'fact3']);
  });

  it('should return empty array when all facts are present', () => {
    const ctx = createContext({
      fact1: { value: 'a', provenance: 'user_confirmed' },
      fact2: { value: 'b', provenance: 'user_confirmed' },
    });
    const missing = getMissingFacts(ctx, ['fact1', 'fact2']);
    expect(missing).toEqual([]);
  });

  it('should return only missing facts', () => {
    const ctx = createContext({
      fact1: { value: 'a', provenance: 'user_confirmed' },
    });
    const missing = getMissingFacts(ctx, ['fact1', 'fact2', 'fact3']);
    expect(missing).toEqual(['fact2', 'fact3']);
  });
});
