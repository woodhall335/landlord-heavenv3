/**
 * Safe Order Metadata Helpers
 *
 * These helpers provide backward-compatible access to the orders.metadata column.
 * They handle the case where the metadata column doesn't exist in production
 * (Postgres error 42703: "column does not exist").
 *
 * Usage:
 * - Use `getOrdersSelectFields()` to get safe select fields for orders queries
 * - Use `safeSelectOrder()` to query orders with automatic fallback
 * - Use `safeUpdateOrderWithMetadata()` to update orders with metadata fallback
 */

import { SupabaseClient } from '@supabase/supabase-js';

// PostgreSQL error code for "column does not exist"
const COLUMN_NOT_EXISTS_ERROR = '42703';

// Track whether metadata column exists (cached per process)
let metadataColumnExists: boolean | null = null;

/**
 * Order metadata structure for Section 21 requires_action flow
 */
export interface OrderMetadata {
  required_actions?: Array<{
    fieldKey: string;
    label: string;
    errorCode: string;
    helpText: string;
  }>;
  section21_blockers?: string[];
  blocked_documents?: Array<{
    documentType: string;
    documentTitle: string;
    blockingCodes: string[];
    reason: string;
  }>;
  total_documents?: number;
  expected_documents?: number;
  generated_documents?: number;
  validation?: 'complete' | 'incomplete' | 'requires_action';
  missing_keys?: string[];
  last_attempt?: string;
  error?: string;
  resume_attempt?: string;
  confirmations_added?: string[];
  [key: string]: any;
}

/**
 * Base fields that are always safe to select from orders table
 */
export const BASE_ORDER_SELECT_FIELDS = [
  'id',
  'case_id',
  'user_id',
  'product_type',
  'product_name',
  'amount',
  'currency',
  'total_amount',
  'payment_status',
  'stripe_payment_intent_id',
  'stripe_charge_id',
  'stripe_session_id',
  'paid_at',
  'fulfillment_status',
  'fulfilled_at',
  'created_at',
  'updated_at',
] as const;

/**
 * Returns the select fields string for orders queries.
 * Includes metadata if we know the column exists, otherwise excludes it.
 */
export function getOrdersSelectFields(options?: { includeMetadata?: boolean }): string {
  const baseFields = BASE_ORDER_SELECT_FIELDS.join(', ');

  // If explicitly requested or we know metadata exists, include it
  if (options?.includeMetadata || metadataColumnExists === true) {
    return `${baseFields}, metadata`;
  }

  // If we know metadata doesn't exist, exclude it
  if (metadataColumnExists === false) {
    return baseFields;
  }

  // Unknown state - include metadata and let the caller handle errors
  return `${baseFields}, metadata`;
}

/**
 * Check if an error is a "column does not exist" error for metadata
 */
export function isMetadataColumnMissingError(error: any): boolean {
  if (!error || error.code !== COLUMN_NOT_EXISTS_ERROR) {
    return false;
  }
  const messageContainsMetadata = error.message?.includes('metadata') ?? false;
  const detailsContainsMetadata = error.details?.includes('metadata') ?? false;
  return messageContainsMetadata || detailsContainsMetadata;
}

/**
 * Update the cached knowledge of whether metadata column exists
 */
export function setMetadataColumnExists(exists: boolean): void {
  metadataColumnExists = exists;
  if (!exists) {
    console.warn(
      '[orders] metadata column missing - using fallback mode. Run migration 013_orders_metadata.sql to fix.'
    );
  }
}

/**
 * Safe order selection result
 */
export interface SafeOrderResult<T> {
  data: T | null;
  error: any;
  metadataAvailable: boolean;
}

/**
 * Safely select an order with automatic metadata fallback.
 * If the metadata column doesn't exist, retries without it.
 */
export async function safeSelectOrder<T = any>(
  supabase: SupabaseClient,
  query: {
    caseId?: string;
    userId?: string;
    orderId?: string;
    paymentStatus?: string | string[];
    fulfillmentStatus?: string | string[];
  },
  options?: {
    selectFields?: string;
    orderBy?: { column: string; ascending: boolean };
    limit?: number;
    single?: boolean;
  }
): Promise<SafeOrderResult<T>> {
  const {
    selectFields = getOrdersSelectFields({ includeMetadata: true }),
    orderBy = { column: 'created_at', ascending: false },
    limit,
    single = false,
  } = options || {};

  // Build the query - use any type for the query builder to avoid complex generic inference
  const buildQuery = (fields: string): any => {
    let q: any = supabase.from('orders').select(fields);

    if (query.caseId) q = q.eq('case_id', query.caseId);
    if (query.userId) q = q.eq('user_id', query.userId);
    if (query.orderId) q = q.eq('id', query.orderId);

    if (query.paymentStatus) {
      if (Array.isArray(query.paymentStatus)) {
        q = q.in('payment_status', query.paymentStatus);
      } else {
        q = q.eq('payment_status', query.paymentStatus);
      }
    }

    if (query.fulfillmentStatus) {
      if (Array.isArray(query.fulfillmentStatus)) {
        q = q.in('fulfillment_status', query.fulfillmentStatus);
      } else {
        q = q.eq('fulfillment_status', query.fulfillmentStatus);
      }
    }

    q = q.order(orderBy.column, { ascending: orderBy.ascending });

    if (limit) q = q.limit(limit);
    if (single) q = q.single();

    return q;
  };

  // Try with metadata first
  const { data, error } = await buildQuery(selectFields);

  if (error && isMetadataColumnMissingError(error)) {
    // Metadata column doesn't exist - retry without it
    setMetadataColumnExists(false);
    console.warn('[orders] metadata column missing - falling back', {
      route: 'safeSelectOrder',
      caseId: query.caseId,
      orderId: query.orderId,
    });

    const baseFields = BASE_ORDER_SELECT_FIELDS.join(', ');
    const fallbackResult = await buildQuery(baseFields);

    return {
      data: fallbackResult.data as T | null,
      error: fallbackResult.error,
      metadataAvailable: false,
    };
  }

  // Success or other error
  if (!error && metadataColumnExists === null) {
    setMetadataColumnExists(true);
  }

  return {
    data: data as T | null,
    error,
    metadataAvailable: metadataColumnExists !== false,
  };
}

/**
 * Safely update an order with metadata.
 * If the metadata column doesn't exist, updates without it and logs a warning.
 */
export async function safeUpdateOrderWithMetadata(
  supabase: SupabaseClient,
  orderId: string,
  update: {
    fulfillment_status?: string;
    fulfilled_at?: string;
    payment_status?: string;
  },
  metadata?: OrderMetadata | null
): Promise<{ error: any; metadataUpdated: boolean }> {
  // If we know metadata column doesn't exist, skip it
  if (metadataColumnExists === false) {
    console.warn('[orders] metadata column missing - skipping metadata update', {
      orderId,
      route: 'safeUpdateOrderWithMetadata',
      action: update.fulfillment_status || 'update',
    });

    const { error } = await supabase
      .from('orders')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return { error, metadataUpdated: false };
  }

  // Try with metadata
  const updatePayload = metadata
    ? { ...update, metadata, updated_at: new Date().toISOString() }
    : { ...update, updated_at: new Date().toISOString() };

  const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId);

  if (error && isMetadataColumnMissingError(error)) {
    // Metadata column doesn't exist - retry without it
    setMetadataColumnExists(false);
    console.warn('[orders] metadata column missing - falling back', {
      orderId,
      route: 'safeUpdateOrderWithMetadata',
      action: update.fulfillment_status || 'update',
    });

    const { error: fallbackError } = await supabase
      .from('orders')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    return { error: fallbackError, metadataUpdated: false };
  }

  // Success or other error
  if (!error && metadataColumnExists === null) {
    setMetadataColumnExists(true);
  }

  return { error, metadataUpdated: !error && !!metadata };
}

/**
 * Extract metadata from an order object, handling missing column gracefully.
 * Returns null if metadata is not available.
 */
export function extractOrderMetadata(order: any): OrderMetadata | null {
  if (!order) return null;

  // If order has metadata property, return it
  if (order.metadata && typeof order.metadata === 'object') {
    return order.metadata as OrderMetadata;
  }

  return null;
}

/**
 * Check if an order requires action based on available data.
 * Works even when metadata column is missing.
 */
export function orderRequiresAction(order: any): boolean {
  if (!order) return false;

  // Check fulfillment_status first (always available)
  if (order.fulfillment_status === 'requires_action') {
    return true;
  }

  // Check metadata if available
  const metadata = extractOrderMetadata(order);
  if (metadata?.validation === 'requires_action') {
    return true;
  }

  return false;
}

/**
 * Get required actions from an order, handling missing metadata gracefully.
 * Returns empty array if metadata is not available.
 */
export function getOrderRequiredActions(order: any): OrderMetadata['required_actions'] {
  const metadata = extractOrderMetadata(order);
  return metadata?.required_actions || [];
}

/**
 * Get blocked documents from an order, handling missing metadata gracefully.
 * Returns empty array if metadata is not available.
 */
export function getOrderBlockedDocuments(order: any): OrderMetadata['blocked_documents'] {
  const metadata = extractOrderMetadata(order);
  return metadata?.blocked_documents || [];
}
