/**
 * Legal Compliance Error Classes
 *
 * Provides typed error handling for legal compliance violations
 * and validation failures across the notice system.
 */

export class LegalComplianceError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'LegalComplianceError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * API error response handler
 * Converts errors into consistent API response format
 */
export function handleLegalError(error: Error) {
  if (error instanceof LegalComplianceError) {
    return {
      error: error.code,
      message: error.message,
      type: 'legal_compliance',
      can_retry: false,
    };
  }

  if (error instanceof ValidationError) {
    return {
      error: 'VALIDATION_ERROR',
      message: error.message,
      type: 'validation',
      can_retry: true,
    };
  }

  // Generic error
  return {
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    type: 'system',
    can_retry: true,
  };
}
