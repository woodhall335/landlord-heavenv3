/**
 * API Error Handling Utilities
 *
 * Properly distinguishes between different error types:
 * - 404: Resource not found
 * - 401/403: Authentication/authorization failures
 * - 502/503: Upstream/transient failures (Supabase, Cloudflare)
 */

import { PostgrestError } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export interface CaseQueryError {
  type: 'not_found' | 'unauthorized' | 'upstream_error' | 'unknown';
  statusCode: number;
  message: string;
  retryable: boolean;
  originalError?: any;
}

/**
 * Analyzes a Supabase/Postgrest error and determines the appropriate HTTP response
 */
export function classifyDatabaseError(
  error: PostgrestError | any,
  context: { operation: string; caseId?: string }
): CaseQueryError {
  // No error means no data was returned (valid 404)
  if (!error) {
    return {
      type: 'not_found',
      statusCode: 404,
      message: 'Case not found',
      retryable: false,
    };
  }

  const errorMessage = error?.message || String(error);
  const errorCode = error?.code;

  // PostgrestError PGRST116: No rows returned (legitimate not found)
  if (errorCode === 'PGRST116' || errorMessage.includes('No rows')) {
    return {
      type: 'not_found',
      statusCode: 404,
      message: 'Case not found',
      retryable: false,
      originalError: error,
    };
  }

  // Auth errors (RLS policy violations, missing JWT, etc.)
  if (
    errorCode === '42501' || // insufficient_privilege
    errorCode === 'PGRST301' || // JWT validation failed
    errorMessage.toLowerCase().includes('permission denied') ||
    errorMessage.toLowerCase().includes('rls') ||
    errorMessage.toLowerCase().includes('policy')
  ) {
    return {
      type: 'unauthorized',
      statusCode: 403,
      message: 'Access denied',
      retryable: false,
      originalError: error,
    };
  }

  // Upstream/transient errors (Cloudflare, Supabase timeouts, network issues)
  if (
    errorMessage.includes('cloudflare') ||
    errorMessage.includes('<html>') || // HTML error pages from proxy
    errorMessage.includes('500 Internal Server Error') ||
    errorMessage.includes('502 Bad Gateway') ||
    errorMessage.includes('503 Service Unavailable') ||
    errorMessage.includes('504 Gateway Timeout') ||
    errorMessage.toLowerCase().includes('timeout') ||
    errorMessage.toLowerCase().includes('connection') ||
    errorCode === '08000' || // connection_exception
    errorCode === '08003' || // connection_does_not_exist
    errorCode === '08006' || // connection_failure
    errorCode === '57014' // query_canceled (statement timeout)
  ) {
    return {
      type: 'upstream_error',
      statusCode: 503,
      message: 'Service temporarily unavailable. Please try again.',
      retryable: true,
      originalError: error,
    };
  }

  // Unknown error - log it and return 500
  console.error(`[classifyDatabaseError] Unclassified error in ${context.operation}:`, {
    errorMessage,
    errorCode,
    error,
    context,
  });

  return {
    type: 'unknown',
    statusCode: 500,
    message: 'Internal server error',
    retryable: false,
    originalError: error,
  };
}

/**
 * Creates a NextResponse with proper error details and logging
 */
export function createErrorResponse(
  classified: CaseQueryError,
  context: { operation: string; caseId?: string }
): NextResponse {
  // Only log non-404 errors to reduce noise
  if (classified.type !== 'not_found') {
    const logLevel = classified.retryable ? 'warn' : 'error';
    console[logLevel](`[${context.operation}] ${classified.type}:`, {
      caseId: context.caseId,
      message: classified.message,
      statusCode: classified.statusCode,
      retryable: classified.retryable,
    });
  }

  return NextResponse.json(
    {
      error: classified.message,
      code: classified.type.toUpperCase(),
      retryable: classified.retryable,
    },
    { status: classified.statusCode }
  );
}

/**
 * Helper to handle case fetch errors with proper classification
 */
export function handleCaseFetchError(
  error: any,
  data: any,
  operation: string,
  caseId: string
): NextResponse | null {
  // If we have data, no error
  if (data) {
    return null;
  }

  const classified = classifyDatabaseError(error, { operation, caseId });
  return createErrorResponse(classified, { operation, caseId });
}
