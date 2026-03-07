/**
 * Tests for admin ID parsing and checking utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAdminIdsFromEnv, isAdminUserId, isAdmin } from '../admin-ids';

describe('getAdminIdsFromEnv', () => {
  it('parses a simple comma-separated list', () => {
    const result = getAdminIdsFromEnv('uuid1,uuid2,uuid3');
    expect(result).toEqual(['uuid1', 'uuid2', 'uuid3']);
  });

  it('trims whitespace from IDs', () => {
    const result = getAdminIdsFromEnv(' uuid1 , uuid2 , uuid3 ');
    expect(result).toEqual(['uuid1', 'uuid2', 'uuid3']);
  });

  it('handles leading and trailing whitespace', () => {
    const result = getAdminIdsFromEnv('  uuid1,uuid2  ');
    expect(result).toEqual(['uuid1', 'uuid2']);
  });

  it('handles newlines and mixed whitespace', () => {
    const result = getAdminIdsFromEnv(' uuidA,\n uuidB ,uuidC  ');
    expect(result).toEqual(['uuidA', 'uuidB', 'uuidC']);
  });

  it('handles tabs and carriage returns', () => {
    const result = getAdminIdsFromEnv('\tuuid1\t,\r\nuuid2\t');
    expect(result).toEqual(['uuid1', 'uuid2']);
  });

  it('filters out empty strings from trailing commas', () => {
    const result = getAdminIdsFromEnv('uuid1,uuid2,');
    expect(result).toEqual(['uuid1', 'uuid2']);
  });

  it('filters out empty strings from leading commas', () => {
    const result = getAdminIdsFromEnv(',uuid1,uuid2');
    expect(result).toEqual(['uuid1', 'uuid2']);
  });

  it('handles multiple empty segments', () => {
    const result = getAdminIdsFromEnv('uuid1,,uuid2,,,uuid3');
    expect(result).toEqual(['uuid1', 'uuid2', 'uuid3']);
  });

  it('handles whitespace-only segments', () => {
    const result = getAdminIdsFromEnv('uuid1,   ,uuid2');
    expect(result).toEqual(['uuid1', 'uuid2']);
  });

  it('returns empty array for undefined input', () => {
    const result = getAdminIdsFromEnv(undefined);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty string input', () => {
    const result = getAdminIdsFromEnv('');
    expect(result).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    const result = getAdminIdsFromEnv('   ');
    expect(result).toEqual([]);
  });

  it('handles single UUID', () => {
    const result = getAdminIdsFromEnv('single-uuid');
    expect(result).toEqual(['single-uuid']);
  });

  it('handles real UUID format with whitespace', () => {
    const result = getAdminIdsFromEnv(' 3b9e42af-1234-5678-9abc-def012345678 ');
    expect(result).toEqual(['3b9e42af-1234-5678-9abc-def012345678']);
  });
});

describe('isAdminUserId', () => {
  it('returns true when user ID is in the list', () => {
    const result = isAdminUserId('uuid2', 'uuid1,uuid2,uuid3');
    expect(result).toBe(true);
  });

  it('returns false when user ID is not in the list', () => {
    const result = isAdminUserId('uuid4', 'uuid1,uuid2,uuid3');
    expect(result).toBe(false);
  });

  it('returns true when user ID matches with whitespace in env', () => {
    const result = isAdminUserId('uuid2', ' uuid1, uuid2 ,uuid3');
    expect(result).toBe(true);
  });

  it('returns false for empty env var', () => {
    const result = isAdminUserId('uuid1', '');
    expect(result).toBe(false);
  });

  it('returns false for undefined env var', () => {
    const result = isAdminUserId('uuid1', undefined);
    expect(result).toBe(false);
  });

  it('is case-sensitive', () => {
    const result = isAdminUserId('UUID1', 'uuid1');
    expect(result).toBe(false);
  });

  it('handles real UUID with newline in env', () => {
    const result = isAdminUserId(
      '3b9e42af-1234-5678-9abc-def012345678',
      '3b9e42af-1234-5678-9abc-def012345678\n'
    );
    expect(result).toBe(true);
  });

  it('does not partially match', () => {
    const result = isAdminUserId('uuid', 'uuid1,uuid2');
    expect(result).toBe(false);
  });
});

describe('isAdmin', () => {
  const originalEnv = process.env.ADMIN_USER_IDS;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    process.env.ADMIN_USER_IDS = originalEnv;
  });

  it('returns true when user ID is in ADMIN_USER_IDS', () => {
    process.env.ADMIN_USER_IDS = 'uuid1,uuid2,uuid3';
    const result = isAdmin('uuid2');
    expect(result).toBe(true);
  });

  it('returns false when user ID is not in ADMIN_USER_IDS', () => {
    process.env.ADMIN_USER_IDS = 'uuid1,uuid2,uuid3';
    const result = isAdmin('uuid4');
    expect(result).toBe(false);
  });

  it('returns true with whitespace around user ID in env', () => {
    process.env.ADMIN_USER_IDS = ' uuid1 , uuid2 , uuid3 ';
    const result = isAdmin('uuid2');
    expect(result).toBe(true);
  });

  it('returns false when ADMIN_USER_IDS is undefined', () => {
    delete process.env.ADMIN_USER_IDS;
    const result = isAdmin('uuid1');
    expect(result).toBe(false);
  });

  it('returns false when ADMIN_USER_IDS is empty', () => {
    process.env.ADMIN_USER_IDS = '';
    const result = isAdmin('uuid1');
    expect(result).toBe(false);
  });
});
