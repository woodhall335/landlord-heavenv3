/**
 * Tests for ground title formatting helper
 */

import { describe, it, expect } from 'vitest';
import { formatGroundTitle, getGroundTypeBadgeClasses, type GroundMetadata } from '@/lib/grounds/format-ground-title';

describe('formatGroundTitle', () => {
  const mockGrounds: GroundMetadata[] = [
    {
      ground: '8',
      name: 'Serious rent arrears (8 weeks/2 months)',
      type: 'mandatory',
      category: 'rent',
    },
    {
      ground: '11',
      name: 'Persistent delay in paying rent',
      type: 'discretionary',
      category: 'rent',
    },
    {
      ground: '14',
      name: 'Tenant nuisance or annoyance',
      type: 'discretionary',
      category: 'asb',
    },
    {
      ground: '14A',
      name: 'Domestic violence',
      type: 'mandatory_with_conditions',
      category: 'asb',
    },
  ];

  it('should format mandatory ground with full title', () => {
    const result = formatGroundTitle('8', mockGrounds);

    expect(result.groundNum).toBe('8');
    expect(result.name).toBe('Serious rent arrears (8 weeks/2 months)');
    expect(result.type).toBe('mandatory');
    expect(result.fullTitle).toBe('Ground 8 – Serious rent arrears (8 weeks/2 months) (Mandatory)');
  });

  it('should format discretionary ground with full title', () => {
    const result = formatGroundTitle('11', mockGrounds);

    expect(result.groundNum).toBe('11');
    expect(result.name).toBe('Persistent delay in paying rent');
    expect(result.type).toBe('discretionary');
    expect(result.fullTitle).toBe('Ground 11 – Persistent delay in paying rent (Discretionary)');
  });

  it('should handle mandatory_with_conditions as mandatory', () => {
    const result = formatGroundTitle('14A', mockGrounds);

    expect(result.groundNum).toBe('14A');
    expect(result.name).toBe('Domestic violence');
    expect(result.type).toBe('mandatory');
    expect(result.fullTitle).toBe('Ground 14A – Domestic violence (Mandatory)');
  });

  it('should handle ground number as string or number', () => {
    const resultString = formatGroundTitle('8', mockGrounds);
    const resultNumber = formatGroundTitle(8, mockGrounds);

    expect(resultString.groundNum).toBe('8');
    expect(resultNumber.groundNum).toBe('8');
    expect(resultString.fullTitle).toBe(resultNumber.fullTitle);
  });

  it('should handle lowercase ground numbers', () => {
    const result = formatGroundTitle('14a', mockGrounds);

    expect(result.groundNum).toBe('14A');
    expect(result.name).toBe('Domestic violence');
  });

  it('should fallback gracefully when ground not found', () => {
    const result = formatGroundTitle('99', mockGrounds);

    expect(result.groundNum).toBe('99');
    expect(result.name).toBe(null);
    expect(result.type).toBe(null);
    expect(result.fullTitle).toBe('Ground 99');
  });

  it('should fallback gracefully when availableGrounds is null', () => {
    const result = formatGroundTitle('8', null);

    expect(result.groundNum).toBe('8');
    expect(result.name).toBe(null);
    expect(result.type).toBe(null);
    expect(result.fullTitle).toBe('Ground 8');
  });

  it('should fallback gracefully when availableGrounds is undefined', () => {
    const result = formatGroundTitle('8', undefined);

    expect(result.groundNum).toBe('8');
    expect(result.name).toBe(null);
    expect(result.type).toBe(null);
    expect(result.fullTitle).toBe('Ground 8');
  });

  it('should handle ground without type field', () => {
    const groundsWithoutType: GroundMetadata[] = [
      {
        ground: '8',
        name: 'Serious rent arrears',
      },
    ];

    const result = formatGroundTitle('8', groundsWithoutType);

    expect(result.groundNum).toBe('8');
    expect(result.name).toBe('Serious rent arrears');
    expect(result.type).toBe(null);
    expect(result.fullTitle).toBe('Ground 8 – Serious rent arrears');
  });
});

describe('getGroundTypeBadgeClasses', () => {
  it('should return red classes for mandatory', () => {
    const classes = getGroundTypeBadgeClasses('mandatory');
    expect(classes).toBe('bg-red-100 text-red-800');
  });

  it('should return blue classes for discretionary', () => {
    const classes = getGroundTypeBadgeClasses('discretionary');
    expect(classes).toBe('bg-blue-100 text-blue-800');
  });
});
