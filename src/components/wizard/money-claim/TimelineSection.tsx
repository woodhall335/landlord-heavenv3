'use client';

import React from 'react';
import { Input } from '@/components/ui';
import type { ChangeEvent } from 'react';

type Jurisdiction = 'england' | 'wales' | 'scotland';

interface SectionProps {
  facts: any;
  jurisdiction: Jurisdiction;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const TimelineSection: React.FC<SectionProps> = ({
  facts,
  jurisdiction,
  onUpdate,
}) => {
  const tenancy = facts.tenancy || {};
  const property = facts.property || {};

  const updateTenancy = (field: string, value: any) => {
    onUpdate({
      tenancy: {
        ...tenancy,
        [field]: value,
      },
    });
  };

  const updateProperty = (field: string, value: any) => {
    onUpdate({
      property: {
        ...property,
        [field]: value,
      },
    });
  };

  const jurisdictionLabel =
    jurisdiction === 'england-wales' ? 'England & Wales' : 'Scotland';

  const handleNumber =
    (fn: (val: number | null) => void) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (!raw) {
        fn(null);
        return;
      }
      const n = Number(raw.replace(/[^\d.]/g, ''));
      fn(Number.isNaN(n) ? null : n);
    };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        These details are used to map your case onto the official court forms and
        particulars of claim. Please match what is written in your tenancy
        agreement and rent schedule as closely as possible.
      </p>

      {/* Property address */}
      <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
        <h3 className="text-sm font-medium text-charcoal">
          Property address (where the arrears arose)
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">
            Address line 1
          </label>
          <Input
            value={property.address_line1 ?? ''}
            onChange={(e) => updateProperty('address_line1', e.target.value)}
            placeholder="e.g. Flat 2, 10 Example Street"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">
            Address line 2 (optional)
          </label>
          <Input
            value={property.address_line2 ?? ''}
            onChange={(e) => updateProperty('address_line2', e.target.value)}
            placeholder="Building / estate / area (if relevant)"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Town / city</label>
            <Input
              value={property.city ?? ''}
              onChange={(e) => updateProperty('city', e.target.value)}
              placeholder="e.g. Manchester"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Postcode</label>
            <Input
              value={property.postcode ?? ''}
              onChange={(e) => updateProperty('postcode', e.target.value)}
              placeholder="e.g. M1 2AB"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          This should be the address of the let property that appears on the tenancy
          agreement and your rent schedule. We’ll map this directly into the claim
          forms and particulars.
        </p>
      </div>

      {/* Tenancy basics */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-charcoal">
          Tenancy details for {jurisdictionLabel}
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Tenancy start date
            </label>
            <Input
              type="date"
              value={tenancy.start_date ?? ''}
              onChange={(e) => updateTenancy('start_date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Tenancy end date (if fixed term)
            </label>
            <Input
              type="date"
              value={tenancy.end_date ?? ''}
              onChange={(e) => updateTenancy('end_date', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Contractual rent amount
            </label>
            <Input
              inputMode="decimal"
              value={tenancy.rent_amount ?? ''}
              onChange={handleNumber((val) => updateTenancy('rent_amount', val))}
              placeholder="e.g. 850"
            />
            <p className="text-[11px] text-gray-500">
              Enter the basic rent for the period (excluding arrears).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Rent frequency
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={tenancy.rent_frequency ?? ''}
              onChange={(e) => updateTenancy('rent_frequency', e.target.value)}
            >
              <option value="">Select frequency</option>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Day of month rent is due
            </label>
            <Input
              type="number"
              min={1}
              max={31}
              value={tenancy.rent_due_day ?? ''}
              onChange={handleNumber((val) => updateTenancy('rent_due_day', val))}
              placeholder="e.g. 1 or 25"
            />
            <p className="text-[11px] text-gray-500">
              We’ll use this to calculate arrears and timelines.
            </p>
          </div>
        </div>
      </div>

      {/* Deposit & basic compliance – useful for Ask Heaven later */}
      <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
        <h3 className="text-sm font-medium text-charcoal">
          Deposit & compliance (optional but helpful)
        </h3>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Deposit amount</label>
            <Input
              inputMode="decimal"
              value={tenancy.deposit_amount ?? ''}
              onChange={handleNumber((val) => updateTenancy('deposit_amount', val))}
              placeholder="e.g. 980"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Deposit scheme name
            </label>
            <Input
              value={tenancy.deposit_scheme_name ?? ''}
              onChange={(e) => updateTenancy('deposit_scheme_name', e.target.value)}
              placeholder="e.g. DPS, MyDeposits, TDS"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Deposit reference (if known)
            </label>
            <Input
              value={tenancy.deposit_reference ?? ''}
              onChange={(e) => updateTenancy('deposit_reference', e.target.value)}
              placeholder="Reference / certificate number"
            />
          </div>
        </div>

        <p className="text-[11px] text-gray-500">
          These fields aren&apos;t strictly required to issue a money claim, but they
          help our templates and Ask Heaven check your compliance position.
        </p>
      </div>
    </div>
  );
};
