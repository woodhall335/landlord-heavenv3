// src/components/wizard/money-claim/DamagesSection.tsx

'use client';

import React from 'react';
import { AskHeavenInlineEnhancer } from '@/components/wizard/AskHeavenInlineEnhancer';

interface SectionProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

type DamageItem = {
  id: string;
  category?: string | null;
  description?: string | null;
  amount?: number | null;
};

export const DamagesSection: React.FC<SectionProps> = ({ facts, onUpdate }) => {
  const moneyClaim = facts.money_claim || {};
  const items: DamageItem[] = Array.isArray(moneyClaim.damage_items)
    ? moneyClaim.damage_items
    : [];

  const otherCostsNotes = moneyClaim.other_costs_notes || '';

  const persist = (nextItems: DamageItem[]) => {
    onUpdate({
      money_claim: {
        ...moneyClaim,
        damage_items: nextItems,
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
    persist([...items, newItem]);
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
