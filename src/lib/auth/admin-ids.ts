/**
 * Admin ID Utilities
 *
 * Centralized functions for parsing and checking admin user IDs from environment variables.
 * These handle whitespace trimming and empty filtering to prevent admin access issues
 * caused by stray whitespace in env var values.
 */

/**
 * Parse admin IDs from an environment variable string.
 *
 * Handles:
 * - Comma-separated UUIDs
 * - Whitespace/newlines around IDs (e.g., " uuid1, uuid2 \n")
 * - Empty segments from trailing commas
 *
 * @param envValue - The raw environment variable value (e.g., process.env.ADMIN_USER_IDS)
 * @returns Array of trimmed, non-empty admin user IDs
 *
 * @example
 * getAdminIdsFromEnv(" uuid1,\n uuid2 ,uuid3  ") // => ["uuid1", "uuid2", "uuid3"]
 * getAdminIdsFromEnv(undefined) // => []
 * getAdminIdsFromEnv("") // => []
 */
export function getAdminIdsFromEnv(envValue?: string): string[] {
  return (envValue || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Check if a user ID is in the admin allowlist.
 *
 * @param userId - The user's UUID to check
 * @param envValue - The raw environment variable value (e.g., process.env.ADMIN_USER_IDS)
 * @returns true if the user ID is in the allowlist, false otherwise
 *
 * @example
 * isAdminUserId("uuid2", " uuid1, uuid2 ") // => true
 * isAdminUserId("uuid4", " uuid1, uuid2 ") // => false
 */
export function isAdminUserId(userId: string, envValue?: string): boolean {
  return getAdminIdsFromEnv(envValue).includes(userId);
}

/**
 * Check if a user ID is an admin using the ADMIN_USER_IDS environment variable.
 * This is a convenience function for server-side use.
 *
 * @param userId - The user's UUID to check
 * @returns true if the user ID is in ADMIN_USER_IDS, false otherwise
 */
export function isAdmin(userId: string): boolean {
  return isAdminUserId(userId, process.env.ADMIN_USER_IDS);
}
