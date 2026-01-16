'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import type { ArrearsItem, TenancyFacts } from '@/lib/case-facts/schema';
import {
  generateRentPeriods,
  computeArrears,
  createEmptyArrearsSchedule,
  updateArrearsItem,
  type ArrearsScheduleInput,
  type ComputedArrears,
} from '@/lib/arrears-engine';

interface ArrearsScheduleStepProps {
  facts: any;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
  /** Jurisdiction determines threshold terminology (England=Ground 8, Wales=Section 157) */
  jurisdiction?: 'england' | 'wales';
}

type PaymentStatus = 'paid' | 'partial' | 'unpaid';

interface PeriodRowProps {
  item: ArrearsItem;
  index: number;
  onStatusChange: (periodStart: string, status: PaymentStatus, partialAmount?: number) => void;
}

const PeriodRow: React.FC<PeriodRowProps> = ({ item, index, onStatusChange }) => {
  const amount_owed = item.amount_owed ?? (item.rent_due - item.rent_paid);
  const [showPartialInput, setShowPartialInput] = useState(
    item.rent_paid > 0 && item.rent_paid < item.rent_due
  );

  const currentStatus: PaymentStatus = useMemo(() => {
    if (item.rent_paid === 0) return 'unpaid';
    if (item.rent_paid >= item.rent_due) return 'paid';
    return 'partial';
  }, [item.rent_paid, item.rent_due]);

  const handleStatusChange = (status: PaymentStatus) => {
    if (status === 'partial') {
      setShowPartialInput(true);
      // Default to half paid
      onStatusChange(item.period_start, status, item.rent_due / 2);
    } else {
      setShowPartialInput(false);
      onStatusChange(item.period_start, status);
    }
  };

  const handlePartialAmountChange = (amount: number) => {
    onStatusChange(item.period_start, 'partial', amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
      <td className="px-3 py-2 text-sm text-gray-700">
        {formatDate(item.period_start)} - {formatDate(item.period_end)}
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 text-right">
        £{item.rent_due.toFixed(2)}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <select
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value as PaymentStatus)}
          >
            <option value="paid">Paid</option>
            <option value="partial">Part-paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          {showPartialInput && (
            <input
              type="number"
              min={0}
              max={item.rent_due}
              step="0.01"
              className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
              value={item.rent_paid}
              onChange={(e) => handlePartialAmountChange(Number(e.target.value) || 0)}
              placeholder="Amount paid"
            />
          )}
        </div>
      </td>
      <td className={`px-3 py-2 text-sm text-right font-medium ${amount_owed > 0 ? 'text-red-600' : 'text-green-600'}`}>
        £{amount_owed.toFixed(2)}
      </td>
    </tr>
  );
};

export const ArrearsScheduleStep: React.FC<ArrearsScheduleStepProps> = ({ facts, onUpdate, jurisdiction = 'england' }) => {
  // Extract tenancy and arrears data
  const tenancy = facts.tenancy || {};
  const issues = facts.issues || {};
  const rentArrears = issues.rent_arrears || {};

  const tenancyStartDate = tenancy.start_date || facts.tenancy_start_date || '';
  const rentAmount = tenancy.rent_amount ?? facts.rent_amount ?? 0;
  const rentFrequency = (tenancy.rent_frequency || facts.rent_frequency || 'monthly') as TenancyFacts['rent_frequency'];
  const noticeDate = facts.notice?.notice_date || facts.notice_date || '';

  // State for arrears items - sync with props on mount and when props change
  const [arrearsItems, setArrearsItems] = useState<ArrearsItem[]>(
    rentArrears.arrears_items || []
  );

  // Sync arrearsItems with props when component receives new data from parent
  // This handles cases like loading saved data or navigating back
  const prevArrearsItemsRef = useRef<ArrearsItem[] | null>(null);
  useEffect(() => {
    const propsItems = rentArrears.arrears_items || [];
    // Only sync if props items changed and we don't have local state yet
    if (propsItems.length > 0 && arrearsItems.length === 0 && prevArrearsItemsRef.current !== propsItems) {
      prevArrearsItemsRef.current = propsItems;
      setArrearsItems(propsItems);
    }
  }, [rentArrears.arrears_items, arrearsItems.length]);

  // Generate periods when tenancy data is available
  const scheduleInput: ArrearsScheduleInput = useMemo(() => ({
    tenancy_start_date: tenancyStartDate,
    rent_amount: rentAmount,
    rent_frequency: rentFrequency,
    notice_date: noticeDate || undefined,
  }), [tenancyStartDate, rentAmount, rentFrequency, noticeDate]);

  const canGeneratePeriods = tenancyStartDate && rentAmount > 0 && rentFrequency;

  // Track if we've auto-generated to prevent re-triggering
  const hasAutoGenerated = useRef(false);

  // Auto-generate schedule when prerequisites are met and no items exist
  useEffect(() => {
    if (canGeneratePeriods && arrearsItems.length === 0 && !hasAutoGenerated.current) {
      const newItems = createEmptyArrearsSchedule(scheduleInput);

      // Only mark as auto-generated if we actually got items
      if (newItems.length > 0) {
        hasAutoGenerated.current = true;
        setArrearsItems(newItems);

        // Update facts
        onUpdate({
          issues: {
            ...issues,
            rent_arrears: {
              ...rentArrears,
              arrears_items: newItems,
              has_arrears: true,
            },
          },
        });
      }
    }
    // Re-run when canGeneratePeriods changes or when scheduleInput values change
  }, [canGeneratePeriods, scheduleInput.tenancy_start_date, scheduleInput.rent_amount, scheduleInput.rent_frequency]);

  // Generate or regenerate schedule
  const handleGenerateSchedule = useCallback(() => {
    if (!canGeneratePeriods) return;

    const newItems = createEmptyArrearsSchedule(scheduleInput);
    setArrearsItems(newItems);

    // Update facts
    onUpdate({
      issues: {
        ...issues,
        rent_arrears: {
          ...rentArrears,
          arrears_items: newItems,
          has_arrears: true,
        },
      },
    });
  }, [canGeneratePeriods, scheduleInput, issues, rentArrears, onUpdate]);

  // Handle status change for a period
  const handleStatusChange = useCallback((
    periodStart: string,
    status: PaymentStatus,
    partialAmount?: number
  ) => {
    const updatedItems = arrearsItems.map((item) => {
      if (item.period_start === periodStart) {
        let rent_paid: number;
        if (status === 'paid') {
          rent_paid = item.rent_due;
        } else if (status === 'unpaid') {
          rent_paid = 0;
        } else {
          rent_paid = partialAmount ?? 0;
        }
        return {
          ...item,
          rent_paid,
          amount_owed: item.rent_due - rent_paid,
        };
      }
      return item;
    });

    setArrearsItems(updatedItems);

    // Calculate totals using canonical engine
    const computed = computeArrears(updatedItems, rentFrequency, rentAmount);

    // Update facts with new arrears items and computed total
    onUpdate({
      issues: {
        ...issues,
        rent_arrears: {
          ...rentArrears,
          arrears_items: updatedItems,
          total_arrears: computed.total_arrears,
          arrears_at_notice_date: computed.arrears_at_notice_date,
          has_arrears: computed.total_arrears > 0,
        },
      },
    });
  }, [arrearsItems, rentFrequency, rentAmount, issues, rentArrears, onUpdate]);

  // Bulk actions
  const handleMarkAllPaid = () => {
    const updatedItems = arrearsItems.map((item) => ({
      ...item,
      rent_paid: item.rent_due,
      amount_owed: 0,
    }));
    setArrearsItems(updatedItems);
    updateFacts(updatedItems);
  };

  const handleMarkAllUnpaid = () => {
    const updatedItems = arrearsItems.map((item) => ({
      ...item,
      rent_paid: 0,
      amount_owed: item.rent_due,
    }));
    setArrearsItems(updatedItems);
    updateFacts(updatedItems);
  };

  const updateFacts = (items: ArrearsItem[]) => {
    const computed = computeArrears(items, rentFrequency, rentAmount);
    onUpdate({
      issues: {
        ...issues,
        rent_arrears: {
          ...rentArrears,
          arrears_items: items,
          total_arrears: computed.total_arrears,
          arrears_at_notice_date: computed.arrears_at_notice_date,
          has_arrears: computed.total_arrears > 0,
        },
      },
    });
  };

  // Computed summary
  const computed: ComputedArrears = useMemo(() => {
    if (arrearsItems.length === 0) {
      return {
        arrears_items: [],
        total_arrears: 0,
        arrears_at_notice_date: null,
        arrears_in_months: 0,
        periods_with_arrears: 0,
        periods_fully_unpaid: 0,
        periods_partially_paid: 0,
        periods_fully_paid: 0,
        is_authoritative: false,
      };
    }
    return computeArrears(arrearsItems, rentFrequency, rentAmount);
  }, [arrearsItems, rentFrequency, rentAmount]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-charcoal mb-2">Arrears Schedule</h3>
        <p className="text-sm text-gray-600">
          Complete the schedule below to document which rent periods are paid, part-paid, or unpaid.
          This creates a detailed breakdown for court proceedings.
        </p>
      </div>

      {/* Pre-requisites warning */}
      {!canGeneratePeriods && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Missing information:</strong> To generate the arrears schedule, please ensure you have completed:
          </p>
          <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
            {!tenancyStartDate && <li>Tenancy start date</li>}
            {!rentAmount && <li>Rent amount</li>}
            {!rentFrequency && <li>Rent frequency</li>}
          </ul>
        </div>
      )}

      {/* Generate schedule button */}
      {canGeneratePeriods && arrearsItems.length === 0 && (
        <button
          type="button"
          onClick={handleGenerateSchedule}
          className="rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean/90 transition-colors"
        >
          Generate Rent Periods
        </button>
      )}

      {/* Schedule table */}
      {arrearsItems.length > 0 && (
        <>
          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Quick actions:</span>
            <button
              type="button"
              onClick={handleMarkAllPaid}
              className="rounded border border-green-300 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
            >
              Mark all paid
            </button>
            <button
              type="button"
              onClick={handleMarkAllUnpaid}
              className="rounded border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Mark all unpaid
            </button>
            <button
              type="button"
              onClick={handleGenerateSchedule}
              className="rounded border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Regenerate periods
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Rent Due
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Amount Owed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {arrearsItems.map((item, index) => (
                  <PeriodRow
                    key={item.period_start}
                    item={item}
                    index={index}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-charcoal mb-3">Summary (Read-only)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total periods:</span>
                <span className="ml-2 font-medium">{arrearsItems.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Periods with arrears:</span>
                <span className="ml-2 font-medium">{computed.periods_with_arrears}</span>
              </div>
              <div>
                <span className="text-gray-600">Fully paid:</span>
                <span className="ml-2 font-medium text-green-600">{computed.periods_fully_paid}</span>
              </div>
              <div>
                <span className="text-gray-600">Partially paid:</span>
                <span className="ml-2 font-medium text-amber-600">{computed.periods_partially_paid}</span>
              </div>
              <div>
                <span className="text-gray-600">Fully unpaid:</span>
                <span className="ml-2 font-medium text-red-600">{computed.periods_fully_unpaid}</span>
              </div>
              <div>
                <span className="text-gray-600">Arrears in months:</span>
                <span className="ml-2 font-medium">{computed.arrears_in_months.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-charcoal">Total Arrears:</span>
                <span className="text-xl font-bold text-red-600">
                  £{computed.total_arrears.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Threshold eligibility indicator - jurisdiction-aware */}
          {computed.arrears_in_months >= 2 ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                ✓ {jurisdiction === 'wales' ? 'Section 157' : 'Ground 8'} Threshold Met
              </p>
              <p className="text-sm text-green-700 mt-1">
                {jurisdiction === 'wales' ? (
                  <>
                    Arrears of {computed.arrears_in_months.toFixed(2)} months meet the Section 157 threshold
                    for serious rent arrears under the Renting Homes (Wales) Act 2016.
                  </>
                ) : (
                  <>
                    Arrears of {computed.arrears_in_months.toFixed(2)} months meet the Ground 8 threshold
                    (minimum 2 months required).
                  </>
                )}
              </p>
            </div>
          ) : computed.arrears_in_months > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                ⚠ {jurisdiction === 'wales' ? 'Section 157' : 'Ground 8'} Threshold Not Met
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {jurisdiction === 'wales' ? (
                  <>
                    Arrears of {computed.arrears_in_months.toFixed(2)} months do not meet the Section 157 threshold
                    (minimum 2 months required). You can still use Section 159 for smaller arrears claims.
                  </>
                ) : (
                  <>
                    Arrears of {computed.arrears_in_months.toFixed(2)} months do not meet the Ground 8 threshold
                    (minimum 2 months required). You can still use Grounds 10 or 11 for arrears claims.
                  </>
                )}
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ArrearsScheduleStep;
