'use client';

import React from 'react';

/**
 * Arrears Section for Money Claim Wizard
 *
 * This section focuses ONLY on rent arrears data:
 * - Total arrears amount
 * - Arrears schedule/items (if needed)
 *
 * NOTE: The narrative fields (basis_of_claim, other_amounts) are now handled
 * in ClaimDetailsSection (with Ask Heaven) and DamagesSection (itemized).
 * This avoids duplicate data collection.
 */

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

type ArrearsItem = {
  id: string;
  period_start?: string | null;
  period_end?: string | null;
  rent_due?: number | null;
  rent_paid?: number | null;
};

export const ArrearsSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const issues = facts.issues || {};
  const arrears = issues.rent_arrears || {};
  const arrearsItems: ArrearsItem[] = Array.isArray(arrears.arrears_items)
    ? arrears.arrears_items
    : [];

  const updateArrears = (field: string, value: any) => {
    onUpdate({
      issues: {
        ...issues,
        rent_arrears: {
          ...arrears,
          [field]: value,
        },
      },
    });
  };

  const addArrearsItem = () => {
    const newItem: ArrearsItem = {
      id: crypto.randomUUID(),
      period_start: null,
      period_end: null,
      rent_due: null,
      rent_paid: null,
    };
    updateArrears('arrears_items', [...arrearsItems, newItem]);
  };

  const updateArrearsItem = (id: string, patch: Partial<ArrearsItem>) => {
    const next = arrearsItems.map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    updateArrears('arrears_items', next);
  };

  const removeArrearsItem = (id: string) => {
    const next = arrearsItems.filter((item) => item.id !== id);
    updateArrears('arrears_items', next);
  };

  // Calculate total from items
  const calculatedTotal = arrearsItems.reduce((sum, item) => {
    const due = item.rent_due || 0;
    const paid = item.rent_paid || 0;
    return sum + (due - paid);
  }, 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Add each period where rent was unpaid or partially paid. This creates the
        Schedule of Arrears for your claim.
      </p>

      {/* Arrears Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-charcoal">Arrears Schedule</h3>
          <button
            type="button"
            onClick={addArrearsItem}
            className="rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
          >
            + Add period
          </button>
        </div>

        {arrearsItems.length === 0 && (
          <p className="text-xs text-gray-500">
            Add each rent period where money is owed. For example, if March and April
            rent was unpaid, add two entries.
          </p>
        )}

        {arrearsItems.length > 0 && (
          <div className="space-y-3">
            {arrearsItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium text-charcoal">
                    Period start
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                    value={item.period_start || ''}
                    onChange={(e) =>
                      updateArrearsItem(item.id, { period_start: e.target.value || null })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-charcoal">
                    Period end
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                    value={item.period_end || ''}
                    onChange={(e) =>
                      updateArrearsItem(item.id, { period_end: e.target.value || null })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-charcoal">
                    Rent due (£)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                    value={item.rent_due ?? ''}
                    onChange={(e) =>
                      updateArrearsItem(item.id, {
                        rent_due: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-charcoal">
                    Rent paid (£)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                    value={item.rent_paid ?? ''}
                    onChange={(e) =>
                      updateArrearsItem(item.id, {
                        rent_paid: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex items-start justify-end">
                  <button
                    type="button"
                    onClick={() => removeArrearsItem(item.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-charcoal">
            Total arrears from schedule
          </span>
          <span className="text-lg font-semibold text-charcoal">
            £{calculatedTotal.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This is calculated from the periods above (rent due minus rent paid).
        </p>
      </div>

      {/* Manual total override */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-charcoal">
          Total rent arrears (override)
        </label>
        <input
          type="number"
          min={0}
          step="0.01"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={arrears.total_arrears ?? ''}
          onChange={(e) =>
            updateArrears(
              'total_arrears',
              e.target.value === '' ? null : Number(e.target.value),
            )
          }
          placeholder={`Calculated: £${calculatedTotal.toFixed(2)}`}
        />
        <p className="text-xs text-gray-500">
          Leave blank to use the calculated total from the schedule above.
        </p>
      </div>
    </div>
  );
};
