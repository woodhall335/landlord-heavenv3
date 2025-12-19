/**
 * Tests for nested path helper functions used in StructuredWizard (Task A)
 */

import { describe, it, expect } from 'vitest';

// ====================================================================================
// HELPER FUNCTIONS (copied from StructuredWizard.tsx for testing)
// ====================================================================================

/**
 * Sets a value at a nested path in an object, creating intermediate objects as needed.
 */
function setValueAtPath(obj: any, path: string, value: string): any {
  if (!path) return obj;

  const parts = path.split('.');
  const result = typeof obj === 'object' && obj !== null ? { ...obj } : {};

  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    } else {
      current[part] = { ...current[part] };
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

/**
 * Gets a value at a nested path in an object.
 */
function getValueAtPath(obj: any, path: string): string | null {
  if (!path || !obj || typeof obj !== 'object') return null;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return typeof current === 'string' ? current : null;
}

// ====================================================================================
// TESTS
// ====================================================================================

describe('setValueAtPath', () => {
  it('should set a simple nested path', () => {
    const result = setValueAtPath({}, 'ground_8.summary', 'Test text');
    expect(result).toEqual({
      ground_8: {
        summary: 'Test text',
      },
    });
  });

  it('should set a deeply nested path', () => {
    const result = setValueAtPath({}, 'a.b.c.d', 'deep value');
    expect(result).toEqual({
      a: {
        b: {
          c: {
            d: 'deep value',
          },
        },
      },
    });
  });

  it('should update existing nested structure without mutating', () => {
    const original = {
      ground_8: {
        summary: 'Original text',
        evidence: 'Some evidence',
      },
      ground_11: {
        summary: 'Ground 11 text',
      },
    };

    const result = setValueAtPath(original, 'ground_8.summary', 'Updated text');

    // Original should not be mutated
    expect(original.ground_8.summary).toBe('Original text');

    // Result should have updated value
    expect(result.ground_8.summary).toBe('Updated text');

    // Other fields should be preserved
    expect(result.ground_8.evidence).toBe('Some evidence');
    expect(result.ground_11.summary).toBe('Ground 11 text');
  });

  it('should create intermediate objects as needed', () => {
    const original = {
      ground_8: {
        evidence: 'Existing',
      },
    };

    const result = setValueAtPath(original, 'ground_11.summary', 'New ground');

    expect(result).toEqual({
      ground_8: {
        evidence: 'Existing',
      },
      ground_11: {
        summary: 'New ground',
      },
    });
  });

  it('should handle empty path', () => {
    const original = { foo: 'bar' };
    const result = setValueAtPath(original, '', 'value');
    expect(result).toEqual(original);
  });

  it('should handle null/undefined input object', () => {
    const result1 = setValueAtPath(null, 'a.b', 'value');
    expect(result1).toEqual({ a: { b: 'value' } });

    const result2 = setValueAtPath(undefined, 'a.b', 'value');
    expect(result2).toEqual({ a: { b: 'value' } });
  });

  it('should work with real ground_particulars structure', () => {
    const groundParticulars = {
      ground_8: {
        summary: 'Tenant owes £3000 in rent arrears from Oct-Dec 2025',
        evidence: 'Rent ledger, bank statements',
      },
      shared_arrears: {
        amount: '3000',
        period: 'October 2025 - December 2025',
      },
    };

    // Update ground_8 summary
    const updated = setValueAtPath(
      groundParticulars,
      'ground_8.summary',
      'Rewritten by Ask Heaven: Tenant has accrued £3000 in rent arrears for the period October to December 2025.',
    );

    expect(updated.ground_8.summary).toContain('Rewritten by Ask Heaven');
    expect(updated.ground_8.evidence).toBe('Rent ledger, bank statements');
    expect(updated.shared_arrears.amount).toBe('3000');
  });

  it('should add new ground summary to existing structure', () => {
    const groundParticulars = {
      ground_8: {
        summary: 'Ground 8 text',
      },
      shared_arrears: {
        amount: '3000',
        period: 'Oct-Dec 2025',
      },
    };

    const updated = setValueAtPath(
      groundParticulars,
      'ground_11.summary',
      'Ground 11: Persistent rent arrears',
    );

    expect(updated.ground_11.summary).toBe('Ground 11: Persistent rent arrears');
    expect(updated.ground_8.summary).toBe('Ground 8 text');
    expect(updated.shared_arrears).toEqual(groundParticulars.shared_arrears);
  });
});

describe('getValueAtPath', () => {
  it('should get a simple nested value', () => {
    const obj = {
      ground_8: {
        summary: 'Test text',
      },
    };

    const result = getValueAtPath(obj, 'ground_8.summary');
    expect(result).toBe('Test text');
  });

  it('should get a deeply nested value', () => {
    const obj = {
      a: {
        b: {
          c: {
            d: 'deep value',
          },
        },
      },
    };

    const result = getValueAtPath(obj, 'a.b.c.d');
    expect(result).toBe('deep value');
  });

  it('should return null for non-existent path', () => {
    const obj = {
      ground_8: {
        summary: 'Test',
      },
    };

    expect(getValueAtPath(obj, 'ground_11.summary')).toBeNull();
    expect(getValueAtPath(obj, 'ground_8.evidence')).toBeNull();
    expect(getValueAtPath(obj, 'foo.bar.baz')).toBeNull();
  });

  it('should return null for empty path', () => {
    const obj = { foo: 'bar' };
    expect(getValueAtPath(obj, '')).toBeNull();
  });

  it('should return null for null/undefined object', () => {
    expect(getValueAtPath(null, 'a.b')).toBeNull();
    expect(getValueAtPath(undefined, 'a.b')).toBeNull();
  });

  it('should return null for non-string values', () => {
    const obj = {
      ground_8: {
        summary: 'String value',
        count: 42,
        active: true,
        metadata: { foo: 'bar' },
      },
    };

    expect(getValueAtPath(obj, 'ground_8.summary')).toBe('String value');
    expect(getValueAtPath(obj, 'ground_8.count')).toBeNull();
    expect(getValueAtPath(obj, 'ground_8.active')).toBeNull();
    expect(getValueAtPath(obj, 'ground_8.metadata')).toBeNull();
  });

  it('should work with real ground_particulars structure', () => {
    const groundParticulars = {
      ground_8: {
        summary: 'Tenant owes £3000 in rent arrears from Oct-Dec 2025',
        evidence: 'Rent ledger, bank statements',
      },
      ground_11: {
        summary: 'Persistent arrears for more than 3 months',
      },
      shared_arrears: {
        amount: '3000',
        period: 'October 2025 - December 2025',
      },
    };

    expect(getValueAtPath(groundParticulars, 'ground_8.summary')).toBe(
      'Tenant owes £3000 in rent arrears from Oct-Dec 2025',
    );
    expect(getValueAtPath(groundParticulars, 'ground_8.evidence')).toBe(
      'Rent ledger, bank statements',
    );
    expect(getValueAtPath(groundParticulars, 'ground_11.summary')).toBe(
      'Persistent arrears for more than 3 months',
    );

    // Non-existent ground
    expect(getValueAtPath(groundParticulars, 'ground_10.summary')).toBeNull();

    // shared_arrears fields are not strings, should return null
    expect(getValueAtPath(groundParticulars, 'shared_arrears.amount')).toBe('3000');
  });
});

describe('setValueAtPath and getValueAtPath integration', () => {
  it('should roundtrip correctly', () => {
    const original = {
      ground_8: {
        summary: 'Original text',
      },
    };

    const newText = 'Updated by Ask Heaven';
    const updated = setValueAtPath(original, 'ground_8.summary', newText);
    const retrieved = getValueAtPath(updated, 'ground_8.summary');

    expect(retrieved).toBe(newText);
  });

  it('should handle multiple updates to different grounds', () => {
    let state = {};

    // Add ground 8
    state = setValueAtPath(state, 'ground_8.summary', 'Ground 8 summary');
    expect(getValueAtPath(state, 'ground_8.summary')).toBe('Ground 8 summary');

    // Add ground 11
    state = setValueAtPath(state, 'ground_11.summary', 'Ground 11 summary');
    expect(getValueAtPath(state, 'ground_11.summary')).toBe('Ground 11 summary');
    expect(getValueAtPath(state, 'ground_8.summary')).toBe('Ground 8 summary');

    // Update ground 8
    state = setValueAtPath(state, 'ground_8.summary', 'Updated ground 8');
    expect(getValueAtPath(state, 'ground_8.summary')).toBe('Updated ground 8');
    expect(getValueAtPath(state, 'ground_11.summary')).toBe('Ground 11 summary');
  });
});
