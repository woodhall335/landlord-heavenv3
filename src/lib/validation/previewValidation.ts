/**
 * Preview Validation Helper
 *
 * Wraps validateFlow for preview endpoints with consistent error handling.
 */

import { NextResponse } from 'next/server';
import { validateFlow, create422Response, type FlowValidationInput } from './validateFlow';
import type { Jurisdiction, Product } from '../jurisdictions/capabilities/matrix';

export interface PreviewValidationInput {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  facts: Record<string, unknown>;
  caseId?: string;
}

/**
 * Validate a flow for preview stage
 *
 * Returns NextResponse if validation fails (422 LEGAL_BLOCK or 422 NOT_SUPPORTED)
 * Returns null if validation passes (caller should proceed with preview generation)
 */
export function validateForPreview(input: PreviewValidationInput): NextResponse | null {
  const validationInput: FlowValidationInput = {
    ...input,
    stage: 'preview',
  };

  const result = validateFlow(validationInput);

  if (!result.ok) {
    const payload = create422Response(result);

    return NextResponse.json(payload, { status: 422 });
  }

  // Validation passed - return null to signal caller should continue
  return null;
}

/**
 * Validate a flow for generate stage
 *
 * Returns NextResponse if validation fails
 * Returns null if validation passes
 */
export function validateForGenerate(input: PreviewValidationInput): NextResponse | null {
  const validationInput: FlowValidationInput = {
    ...input,
    stage: 'generate',
  };

  const result = validateFlow(validationInput);

  if (!result.ok) {
    const payload = create422Response(result);

    return NextResponse.json(payload, { status: 422 });
  }

  return null;
}
