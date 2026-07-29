import { createHash } from 'node:crypto';
import {
  hasCompletedStructuredInventory,
  normalizeInventoryRooms,
} from './inventory-completeness';

export { hasCompletedStructuredInventory } from './inventory-completeness';

export type InventoryLifecycleState =
  | 'attached_completed'
  | 'template_included'
  | 'separate_later';

export type InventorySignatureState =
  | 'unsigned'
  | 'landlord_signed'
  | 'tenant_signed'
  | 'fully_signed';

export type InventoryReasonCode =
  | 'completed_structured_inventory'
  | 'delivery_selected_for_later'
  | 'no_meaningful_structured_rows'
  | 'partial_structured_rows'
  | 'legacy_attachment_flag_ignored'
  | 'signature_evidence_absent'
  | 'historical_paid_snapshot_preserved';

export interface CanonicalInventoryState {
  version: 'inventory-state.v1';
  lifecycleState: InventoryLifecycleState;
  signatureState: InventorySignatureState;
  includedInAgreement: false;
  separateInventoryFileIncluded: true;
  completionDate: string | null;
  dueDeliveryDate: string | null;
  structuredDataComplete: boolean;
  inventoryDocumentId: string;
  inventoryContentHash: string;
  reasonCodes: InventoryReasonCode[];
  warnings: string[];
  blockingErrors: string[];
}

type AnyRecord = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function deriveSignatureState(facts: AnyRecord): InventorySignatureState {
  const landlordSigned = Boolean(
    text(facts.inventory_landlord_signature) &&
      text(facts.inventory_landlord_signature_date)
  );
  const tenantSigned = Boolean(
    text(facts.inventory_tenant_signature) &&
      text(facts.inventory_tenant_signature_date)
  );
  if (landlordSigned && tenantSigned) return 'fully_signed';
  if (landlordSigned) return 'landlord_signed';
  if (tenantSigned) return 'tenant_signed';
  return 'unsigned';
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as AnyRecord)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, stableValue(nested)])
    );
  }
  return value;
}

export function deriveCanonicalInventoryState(
  facts: AnyRecord,
  options: { documentSeed?: string } = {}
): CanonicalInventoryState {
  const normalizedRooms = normalizeInventoryRooms(facts);
  const structuredDataComplete = hasCompletedStructuredInventory(facts);
  const deliveryMethod = text(facts.inventory_delivery_method);
  const dueDeliveryDate = text(facts.inventory_due_date) || null;
  const warnings: string[] = [];
  const blockingErrors: string[] = [];
  const reasonCodes: InventoryReasonCode[] = [];

  let lifecycleState: InventoryLifecycleState;
  if (deliveryMethod === 'later') {
    lifecycleState = 'separate_later';
    reasonCodes.push('delivery_selected_for_later');
    if (!dueDeliveryDate) blockingErrors.push('INVENTORY_DUE_DATE_REQUIRED');
  } else if (structuredDataComplete) {
    lifecycleState = 'attached_completed';
    reasonCodes.push('completed_structured_inventory');
  } else {
    lifecycleState = 'template_included';
    reasonCodes.push(
      normalizedRooms.length ? 'partial_structured_rows' : 'no_meaningful_structured_rows'
    );
  }

  if (
    facts.inventory_attached === true ||
    facts.inventory_provided === true ||
    facts.inventoryIncluded === true
  ) {
    if (!structuredDataComplete) {
      warnings.push('LEGACY_INVENTORY_ATTACHMENT_FLAG_IGNORED');
      reasonCodes.push('legacy_attachment_flag_ignored');
    }
  }

  const signatureState = deriveSignatureState(facts);
  if (signatureState === 'unsigned') reasonCodes.push('signature_evidence_absent');

  const canonicalPayload = stableValue({
    lifecycleState,
    signatureState,
    dueDeliveryDate,
    completionDate: text(facts.inventory_completion_date) || null,
    rooms: normalizedRooms,
    meterReadings: {
      gas: text(facts.meter_reading_gas),
      electricity: text(facts.meter_reading_electric),
      water: text(facts.meter_reading_water),
    },
    keys: {
      front: facts.number_of_front_door_keys ?? null,
      back: facts.number_of_back_door_keys ?? null,
      windows: facts.number_of_window_keys ?? null,
      mailbox: facts.number_of_mailbox_keys ?? null,
      accessDevices: facts.access_cards_fobs ?? null,
    },
  });
  const inventoryContentHash = createHash('sha256')
    .update(JSON.stringify(canonicalPayload))
    .digest('hex');
  const documentSeed =
    options.documentSeed || text(facts.document_id) || 'UNASSIGNED';

  return {
    version: 'inventory-state.v1',
    lifecycleState,
    signatureState,
    includedInAgreement: false,
    separateInventoryFileIncluded: true,
    completionDate: text(facts.inventory_completion_date) || null,
    dueDeliveryDate,
    structuredDataComplete,
    inventoryDocumentId: `${documentSeed}-INV-${inventoryContentHash.slice(0, 12).toUpperCase()}`,
    inventoryContentHash,
    reasonCodes: [...new Set(reasonCodes)],
    warnings,
    blockingErrors,
  };
}

export function inventoryCustomerStatus(state: CanonicalInventoryState): string {
  if (state.lifecycleState === 'template_included') {
    return 'Inventory template included for completion and signature';
  }
  if (state.lifecycleState === 'separate_later') {
    return `No - completed inventory to be supplied separately by ${
      state.dueDeliveryDate || '[date required]'
    }`;
  }
  if (state.signatureState === 'fully_signed') {
    return 'Yes - completed and signed inventory supplied';
  }
  return 'Completed inventory supplied; signatures pending';
}
