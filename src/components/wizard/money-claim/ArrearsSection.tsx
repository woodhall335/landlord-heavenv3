'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { ArrearsScheduleStep } from '@/components/wizard/ArrearsScheduleStep';

/**
 * Arrears Section for Money Claim Wizard
 *
 * This section uses the shared ArrearsScheduleStep component (same as Section 8 eviction)
 * which provides:
 * - Pro-rata calculations for partial periods
 * - Visually richer table layout
 * - Automatic totals and balance
 * - Paid/partial/unpaid status selection
 *
 * The component ensures data is written to both:
 * - Nested path: issues.rent_arrears.arrears_items (for ArrearsScheduleStep compatibility)
 * - Top-level path: arrears_items, total_arrears (for validator compatibility)
 * - money_claim.totals.rent_arrears (for combined totals calculation)
 */

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const ArrearsSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  // Get tenancy info from both nested and top-level paths
  const tenancyStartDate = facts.tenancy_start_date || facts.tenancy?.start_date || '';
  const rentAmount = facts.rent_amount ?? facts.tenancy?.rent_amount ?? 0;
  const rentFrequency = facts.rent_frequency || facts.tenancy?.rent_frequency || 'monthly';

  // Get arrears items from either location
  const arrearsItems = useMemo(() => {
    return facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || [];
  }, [facts.arrears_items, facts.issues?.rent_arrears?.arrears_items]);

  // Check if we have the prerequisites for the schedule
  const hasPrerequisites = tenancyStartDate && rentAmount > 0 && rentFrequency;

  /**
   * Wraps the ArrearsScheduleStep's onUpdate to also write to top-level keys
   * and money_claim.totals for combined total calculation
   */
  const handleUpdate = useCallback((updates: Record<string, any>) => {
    const newUpdates = { ...updates };

    // If issues.rent_arrears is being updated, also sync to top-level keys
    if (updates.issues?.rent_arrears) {
      const rentArrears = updates.issues.rent_arrears;

      // Sync arrears_items to top-level
      if (rentArrears.arrears_items !== undefined) {
        newUpdates.arrears_items = rentArrears.arrears_items;
      }

      // Sync total_arrears to top-level
      if (rentArrears.total_arrears !== undefined) {
        newUpdates.total_arrears = rentArrears.total_arrears;

        // Also update money_claim.totals for combined total calculation
        newUpdates.money_claim = {
          ...(facts.money_claim || {}),
          totals: {
            ...(facts.money_claim?.totals || {}),
            rent_arrears: rentArrears.total_arrears,
          },
        };
      }
    }

    onUpdate(newUpdates);
  }, [facts.money_claim, onUpdate]);

  // Recalculate combined total whenever individual totals change
  useEffect(() => {
    const totals = facts.money_claim?.totals || {};
    const rentArrearsTotal = totals.rent_arrears || 0;
    const damageTotal = totals.damage || 0;
    const cleaningTotal = totals.cleaning || 0;
    const utilitiesTotal = totals.utilities || 0;
    const councilTaxTotal = totals.council_tax || 0;
    const otherTotal = totals.other || 0;

    const combinedTotal =
      rentArrearsTotal + damageTotal + cleaningTotal + utilitiesTotal + councilTaxTotal + otherTotal;

    // Only update if combined_total has changed
    if (totals.combined_total !== combinedTotal) {
      onUpdate({
        money_claim: {
          ...(facts.money_claim || {}),
          totals: {
            ...totals,
            combined_total: combinedTotal,
          },
        },
      });
    }
  }, [facts.money_claim?.totals, onUpdate, facts.money_claim]);

  return (
    <div className="space-y-6">
      {/* Prerequisites warning */}
      {!hasPrerequisites && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Complete tenancy details first:</strong> To generate your arrears schedule,
            please go back and complete the Tenancy section with:
          </p>
          <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
            {!tenancyStartDate && <li>Tenancy start date</li>}
            {!rentAmount && <li>Rent amount</li>}
            {!rentFrequency && <li>Rent frequency</li>}
          </ul>
        </div>
      )}

      {/* Use the shared ArrearsScheduleStep component */}
      <ArrearsScheduleStep
        facts={facts}
        onUpdate={handleUpdate}
        jurisdiction="england"
      />

      {/* Arrears summary for money claim context */}
      {arrearsItems.length > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="text-sm text-purple-800">
            <strong>Money Claim Note:</strong> This schedule will be attached to your N1 claim form
            as evidence of the rent arrears. The court requires a clear breakdown showing each
            period with rent due and amounts paid.
          </p>
        </div>
      )}
    </div>
  );
};
