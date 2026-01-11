/**
 * Tests for mutation audit logging - getChangedKeys utility
 *
 * Note: Integration tests for logMutation should be run against a real
 * database or with proper E2E mocking. Unit tests here focus on the
 * pure getChangedKeys function.
 */

import { describe, it, expect } from 'vitest';
import { getChangedKeys } from '../audit-log';

describe('getChangedKeys', () => {
  it('detects added keys', () => {
    const before = { a: 1 };
    const after = { a: 1, b: 2 };

    const result = getChangedKeys(before, after);

    expect(result).toContain('b');
  });

  it('detects removed keys', () => {
    const before = { a: 1, b: 2 };
    const after = { a: 1 };

    const result = getChangedKeys(before, after);

    expect(result).toContain('b');
  });

  it('detects changed values', () => {
    const before = { a: 1, b: 'old' };
    const after = { a: 1, b: 'new' };

    const result = getChangedKeys(before, after);

    expect(result).toEqual(['b']);
    expect(result).not.toContain('a');
  });

  it('handles nested object changes', () => {
    const before = { nested: { a: 1 } };
    const after = { nested: { a: 2 } };

    const result = getChangedKeys(before, after);

    expect(result).toContain('nested');
  });

  it('returns empty array when no changes', () => {
    const before = { a: 1, b: 'test' };
    const after = { a: 1, b: 'test' };

    const result = getChangedKeys(before, after);

    expect(result).toEqual([]);
  });

  it('handles empty objects', () => {
    const result = getChangedKeys({}, {});

    expect(result).toEqual([]);
  });

  it('handles completely different objects', () => {
    const before = { a: 1, b: 2 };
    const after = { c: 3, d: 4 };

    const result = getChangedKeys(before, after);

    expect(result).toContain('a');
    expect(result).toContain('b');
    expect(result).toContain('c');
    expect(result).toContain('d');
    expect(result.length).toBe(4);
  });

  it('handles array values', () => {
    const before = { arr: [1, 2, 3] };
    const after = { arr: [1, 2, 4] };

    const result = getChangedKeys(before, after);

    expect(result).toContain('arr');
  });

  it('does not detect array changes when content is same', () => {
    const before = { arr: [1, 2, 3] };
    const after = { arr: [1, 2, 3] };

    const result = getChangedKeys(before, after);

    expect(result).toEqual([]);
  });
});
