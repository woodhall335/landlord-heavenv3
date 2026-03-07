// src/components/wizard/money-claim/DamagesSection.tsx

'use client';

import React, { useCallback } from 'react';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';
import { trackMoneyClaimLineItemAdded, type MoneyClaimReason } from '@/lib/analytics';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /** Optional: jurisdiction for analytics tracking */
  jurisdiction?: string;
}

type DamageItem = {
  id: string;
  category?: string | null;
  description?: string | null;
  amount?: number | null;
};

export const DamagesSection: React.FC<SectionProps> = ({ facts, onUpdate, jurisdiction }) => {
  const moneyClaim = facts.money_claim || {};
  const items: DamageItem[] = Array.isArray(moneyClaim.damage_items)
    ? moneyClaim.damage_items
    : [];

  const otherCostsNotes = moneyClaim.other_costs_notes || '';

  // Helper to get current claim reasons for analytics
  const getClaimReasons = useCallback((): MoneyClaimReason[] => {
    const reasons: MoneyClaimReason[] = [];
    if (facts.claiming_rent_arrears === true) reasons.push('rent_arrears');
    const otherTypes: string[] = facts.money_claim?.other_amounts_types || [];
    if (otherTypes.includes('property_damage')) reasons.push('property_damage');
    if (otherTypes.includes('cleaning')) reasons.push('cleaning');
    if (otherTypes.includes('unpaid_utilities')) reasons.push('unpaid_utilities');
    if (otherTypes.includes('unpaid_council_tax')) reasons.push('unpaid_council_tax');
    if (facts.claiming_other === true || otherTypes.includes('other_charges')) reasons.push('other_tenant_debt');
    return reasons;
  }, [facts]);

  /**
   * Calculate subtotals by category from damage items
   */
  const calculateCategoryTotals = (itemsList: DamageItem[]) => {
    const totals = {
      damage: 0,
      cleaning: 0,
      utilities: 0,
      council_tax: 0,
      other: 0,
    };

    itemsList.forEach((item) => {
      const amount = item.amount || 0;
      switch (item.category) {
        case 'property_damage':
          totals.damage += amount;
          break;
        case 'cleaning':
          totals.cleaning += amount;
          break;
        case 'unpaid_utilities':
          totals.utilities += amount;
          break;
        case 'unpaid_council_tax':
          totals.council_tax += amount;
          break;
        case 'legal_costs':
        case 'other':
        default:
          totals.other += amount;
          break;
      }
    });

    return totals;
  };

  /**
   * Persist damage items and update money_claim.totals for combined total calculation
   */
  const persist = (nextItems: DamageItem[]) => {
    const categoryTotals = calculateCategoryTotals(nextItems);
    const existingTotals = moneyClaim.totals || {};

    // Calculate new combined total
    const rentArrearsTotal = existingTotals.rent_arrears || facts.total_arrears || 0;
    const combinedTotal =
      rentArrearsTotal +
      categoryTotals.damage +
      categoryTotals.cleaning +
      categoryTotals.utilities +
      categoryTotals.council_tax +
      categoryTotals.other;

    onUpdate({
      money_claim: {
        ...moneyClaim,
        damage_items: nextItems,
        totals: {
          ...existingTotals,
          ...categoryTotals,
          combined_total: combinedTotal,
        },
      },
    });
  };

  const addItem = () => {
    const newItem: DamageItem = {
      id: crypto.randomUUID(),
      category: '',
      description: '',
      amount: null,
    };
    const nextItems = [...items, newItem];
    persist(nextItems);

    // Track line item added (category will be set later when user selects)
    trackMoneyClaimLineItemAdded({
      category: 'new_item',
      reasons: getClaimReasons(),
      jurisdiction: jurisdiction || facts.__meta?.jurisdiction || 'unknown',
      item_count: nextItems.length,
    });
  };

  const updateItem = (id: string, patch: Partial<DamageItem>) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );
    persist(next);
  };

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    persist(next);
  };

  const handleNotesChange = (value: string) => {
    onUpdate({
      money_claim: {
        ...moneyClaim,
        other_costs_notes: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Use this section to itemise any damage, cleaning, utilities, or other costs you
        want the court to order the tenant to pay. We&apos;ll turn this into a structured
        schedule of damages in your claim pack.
      </p>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-charcoal">
          Damages &amp; costs you are claiming
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
        >
          + Add item
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-gray-500">
          Add each type of damage or cost you are claiming, one line at a time.
        </p>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,0.8fr)_auto]"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-charcoal">
                  Category
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                  value={item.category || ''}
                  onChange={(e) =>
                    updateItem(item.id, { category: e.target.value || null })
                  }
                >
                  <option value="">Select</option>
                  <option value="property_damage">Property damage</option>
                  <option value="cleaning">Cleaning / rubbish removal</option>
                  <option value="unpaid_utilities">Unpaid utilities</option>
                  <option value="unpaid_council_tax">Unpaid council tax</option>
                  <option value="legal_costs">Legal / tracing costs</option>
                  <option value="other">Other loss</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-charcoal">
                  Short description
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                  value={item.description || ''}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value })
                  }
                  placeholder="E.g. Replace damaged bedroom carpet"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-charcoal">
                  Amount (£)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                  value={item.amount ?? ''}
                  onChange={(e) =>
                    updateItem(item.id, {
                      amount:
                        e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-start justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Total summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-charcoal">
                Total damages & costs
              </span>
              <span className="text-lg font-semibold text-charcoal">
                £{items.reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is the sum of all itemised amounts above.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-charcoal">
          Anything else the court should know about these amounts?
        </label>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[100px] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
          value={otherCostsNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="For example: some figures are estimates pending final contractor invoices, or you agreed a reduced amount with the tenant but they still did not pay."
        />

        {/* Ask Heaven Inline Enhancer */}
        <AskHeavenInlineEnhancer
          questionId="other_costs_notes"
          questionText="Additional notes about damages and costs claimed"
          answer={otherCostsNotes}
          onApply={(newText) => handleNotesChange(newText)}
          context={{ product: 'money_claim', damage_items: items }}
          apiMode="generic"
        />

        <p className="text-xs text-gray-500">
          This helps explain your schedule of damages and can be used in the particulars
          of claim.
        </p>
      </div>
    </div>
  );
};
