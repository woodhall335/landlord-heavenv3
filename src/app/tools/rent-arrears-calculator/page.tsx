'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Container, Input } from '@/components/ui';

// Note: Metadata moved to layout.tsx (client components cannot export metadata)

type ScheduleItem = {
  id: string;
  dueDate: string;
  dueAmount: number;
  paidAmount: number;
  paymentDate: string;
};

const defaultSchedule: ScheduleItem[] = [
  {
    id: crypto.randomUUID(),
    dueDate: new Date().toISOString().split('T')[0],
    dueAmount: 750,
    paidAmount: 0,
    paymentDate: '',
  },
];

export default function RentArrearsCalculator() {
  const [rentAmount, setRentAmount] = useState(750);
  const [frequency, setFrequency] = useState<'month' | 'week'>('month');
  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultSchedule);

  const totals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    return schedule.reduce(
      (acc, item) => {
        const due = Number(item.dueAmount) || 0;
        const paid = Number(item.paidAmount) || 0;
        const outstanding = Math.max(due - paid, 0);

        // Parse due date correctly (add 'T00:00:00' to avoid timezone issues)
        const dueDate = item.dueDate ? new Date(item.dueDate + 'T00:00:00') : today;

        // Calculate days outstanding (only positive values for overdue amounts)
        const daysOutstanding = Math.max(
          0,
          Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        );

        // Calculate simple interest: Principal × Rate × Time
        // Interest only applies to outstanding amounts that are overdue
        const interest = outstanding > 0 && daysOutstanding > 0
          ? outstanding * 0.08 * (daysOutstanding / 365)
          : 0;

        acc.totalDue += due;
        acc.totalPaid += paid;
        acc.totalOutstanding += outstanding;
        acc.totalInterest += interest;

        return acc;
      },
      { totalDue: 0, totalPaid: 0, totalOutstanding: 0, totalInterest: 0 },
    );
  }, [schedule]);

  const handleScheduleChange = (id: string, key: keyof ScheduleItem, value: string) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]: key === 'dueAmount' || key === 'paidAmount' ? Number(value) : value,
            }
          : item,
      ),
    );
  };

  const addScheduleRow = () => {
    setSchedule((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        dueDate: prev[prev.length - 1]?.dueDate || new Date().toISOString().split('T')[0],
        dueAmount: rentAmount,
        paidAmount: 0,
        paymentDate: '',
      },
    ]);
  };

  const removeScheduleRow = (id: string) => {
    setSchedule((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-br from-blue-700 to-indigo-700 text-white py-16">
        <Container className="text-center max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wide mb-3">Free landlord tool</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Rent Arrears Calculator</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Quickly calculate outstanding rent and a simple 8% statutory interest estimate. Download a summary with a
            clear watermark before you decide to issue a court claim.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/wizard/flow?type=money_claim&jurisdiction=england-wales&product=money_claim&product_variant=money_claim_england_wales"
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-50 transition"
            >
              Upgrade to Money Claim Pack (£179.99)
            </Link>
            <Link
              href="/wizard/flow?type=money_claim&jurisdiction=scotland&product=money_claim&product_variant=money_claim_scotland"
              className="bg-white/15 text-white px-6 py-3 rounded-lg font-semibold border border-white/40 hover:bg-white/25 transition"
            >
              Scotland Simple Procedure Pack
            </Link>
          </div>
        </Container>
      </div>

      <Container className="py-12 space-y-8">
        <Card padding="large">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-charcoal">Enter rent details</h2>
              <p className="text-gray-600">Add each rent period to calculate arrears and interest.</p>
            </div>
            <div className="flex gap-3">
              <div>
                <label className="text-sm text-gray-600 font-medium">Rent amount</label>
                <Input
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(Number(e.target.value) || 0)}
                  className="mt-1"
                  min={0}
                  step={0.01}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Frequency</label>
                <select
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'month' | 'week')}
                >
                  <option value="month">Monthly</option>
                  <option value="week">Weekly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {schedule.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div>
                  <label className="text-sm text-gray-600 font-medium">Due date</label>
                  <Input
                    type="date"
                    value={item.dueDate}
                    onChange={(e) => handleScheduleChange(item.id, 'dueDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Rent due (£)</label>
                  <Input
                    type="number"
                    value={item.dueAmount}
                    onChange={(e) => handleScheduleChange(item.id, 'dueAmount', e.target.value)}
                    className="mt-1"
                    min={0}
                    step={0.01}
                  />
                  {index === 0 && (
                    <p className="text-xs text-gray-500 mt-1 leading-tight">Default: {frequency === 'month' ? 'monthly' : 'weekly'} rent</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Paid (£)</label>
                  <Input
                    type="number"
                    value={item.paidAmount}
                    onChange={(e) => handleScheduleChange(item.id, 'paidAmount', e.target.value)}
                    className="mt-1"
                    min={0}
                    step={0.01}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium">Payment date</label>
                  <Input
                    type="date"
                    value={item.paymentDate}
                    onChange={(e) => handleScheduleChange(item.id, 'paymentDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 md:justify-end">
                  <Button variant="secondary" onClick={() => handleScheduleChange(item.id, 'paidAmount', String(item.dueAmount))}>
                    Mark paid
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeScheduleRow(item.id)}
                    disabled={schedule.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={addScheduleRow}>
                + Add another period
              </Button>
              <p className="text-sm text-gray-600">
                Tip: Keep adding rent periods until the arrears total matches your ledger.
              </p>
            </div>
          </div>
        </Card>

        <Card padding="large" className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
            <div className="text-4xl font-black text-gray-700 rotate-[-15deg]">NOT COURT-READY – FOR INFORMATION ONLY</div>
          </div>
          <div className="relative">
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Summary</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Total rent due</p>
                <p className="text-2xl font-bold text-charcoal mt-1">£{totals.totalDue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Total paid</p>
                <p className="text-2xl font-bold text-charcoal mt-1">£{totals.totalPaid.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Outstanding arrears</p>
                <p className="text-2xl font-bold text-red-600 mt-1">£{totals.totalOutstanding.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Estimated 8% interest</p>
                <p className="text-2xl font-bold text-charcoal mt-1">£{totals.totalInterest.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Simple statutory rate – not compounded.</p>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-charcoal mb-2">How we calculate interest</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  We use a simple 8% per annum rate on any outstanding balance from its due date up to today. Actual court awards
                  may differ depending on jurisdiction and judge discretion. Use this as a directional estimate only.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-charcoal mb-2">Need a court-ready pack?</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Upgrade to the Money Claim Pack for a pre-filled claim form, particulars of claim, PAP/Pre-action letters, and
                  an arrears schedule you can file immediately.
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Link
                    href="/wizard/flow?type=money_claim&jurisdiction=england-wales&product=money_claim&product_variant=money_claim_england_wales"
                    className="flex-1 text-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                  >
                    Start Money Claim (E&W)
                  </Link>
                  <Link
                    href="/wizard/flow?type=money_claim&jurisdiction=scotland&product=money_claim&product_variant=money_claim_scotland"
                    className="flex-1 text-center bg-white text-primary border border-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/5 transition"
                  >
                    Start Simple Procedure (Scotland)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="large">
          <h2 className="text-2xl font-semibold text-charcoal mb-4">How to Calculate and Evidence Rent Arrears</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Keep Accurate Records</h3>
              <p>
                Maintain a detailed rent ledger showing every payment due and received. Include dates, amounts, and payment methods.
                Bank statements alone are not enough—courts prefer a clear schedule showing the running balance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Evidence You'll Need</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Tenancy agreement showing the rent amount and payment frequency</li>
                <li>Complete rent payment schedule with all due dates and payments received</li>
                <li>Bank statements showing missed or partial payments</li>
                <li>Communication with tenant about arrears (emails, letters, texts)</li>
                <li>Any payment plans or agreements made</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Statutory Interest on Rent Arrears</h3>
              <p>
                Under the Late Payment of Commercial Debts (Interest) Act 1998, you may claim interest at 8% per annum on
                outstanding rent. This is simple interest, calculated from the due date to the date of payment or judgment.
                Always state in your pre-action letter that you intend to claim interest.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Pre-Action Protocol</h3>
              <p>
                Before starting court proceedings, send a formal letter before action giving the tenant a final opportunity
                to pay. Include the total arrears, interest claimed, and a deadline (typically 14 days). This demonstrates
                to the court that you've tried to resolve the matter without litigation.
              </p>
            </div>
          </div>
        </Card>

        <Card padding="large">
          <h2 className="text-2xl font-semibold text-charcoal mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <p className="font-semibold text-gray-900 text-lg mb-2">How should I evidence rent arrears for court?</p>
              <p>
                Prepare a clear rent schedule showing all payments due and received, with a running balance. Attach your
                tenancy agreement, bank statements highlighting missed payments, and copies of all communications with the
                tenant about the arrears. The court wants to see you've made reasonable attempts to resolve the issue
                before litigation.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 text-lg mb-2">Can I claim interest on rent arrears?</p>
              <p>
                Yes. You can claim statutory interest at 8% per annum under the Late Payment of Commercial Debts (Interest)
                Act 1998. Interest runs from each payment's due date until it's paid or judgment is entered. You must state
                your intention to claim interest in your pre-action letter. Some tenancy agreements include contractual
                interest clauses—check yours carefully.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 text-lg mb-2">What if my tenant disputes the arrears amount?</p>
              <p>
                Request a detailed breakdown from the tenant showing which payments they believe they've made. Check your
                records carefully—mistakes happen. If there's a genuine dispute, consider mediation before court. If the
                tenant simply refuses to pay without valid reason, proceed with your money claim and let the court decide.
                Keep all communication professional and documented.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 text-lg mb-2">Should I serve a Section 8 notice or file a money claim?</p>
              <p>
                It depends on your goal. A Section 8 notice (Ground 8 requires 8+ weeks arrears) seeks possession of the
                property. A money claim pursues the debt even after the tenant has left. Many landlords do both: serve a
                Section 8 to regain possession, then file a money claim for any remaining debt. Our Complete Pack guides
                you through both processes.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 text-lg mb-2">Is this calculator's 8% interest calculation legally accurate?</p>
              <p>
                This calculator uses the standard statutory rate of 8% per annum as simple interest. While widely accepted,
                actual court awards may vary based on jurisdiction, the judge's discretion, and your specific tenancy
                agreement. For a court-ready arrears schedule with jurisdiction-specific calculations and full legal
                validation, upgrade to our Money Claim Pack.
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
