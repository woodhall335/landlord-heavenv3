'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Container, Input } from '@/components/ui';

export const metadata = {
  title: 'Rent Arrears Calculator | Free Tool | Landlord Heaven',
  description:
    'Calculate rent arrears and simple statutory interest online. Get a clear arrears total with guidance on pre-action steps and upgrade to a court-ready Money Claim Pack for England & Wales or Scotland.',
};

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

    return schedule.reduce(
      (acc, item) => {
        const due = Number(item.dueAmount) || 0;
        const paid = Number(item.paidAmount) || 0;
        const outstanding = Math.max(due - paid, 0);
        const dueDate = item.dueDate ? new Date(item.dueDate) : today;
        const daysOutstanding = Math.max(
          0,
          Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        );

        const interest = outstanding * 0.08 * (daysOutstanding / 365);

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
              href="/wizard/flow?type=money_claim&jurisdiction=england-wales&product=money_claim_england_wales"
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-50 transition"
            >
              Upgrade to Money Claim Pack (£179.99)
            </Link>
            <Link
              href="/wizard/flow?type=money_claim&jurisdiction=scotland&product=money_claim_scotland"
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
                    <p className="text-xs text-gray-500 mt-1">Defaults to your rent amount ({frequency}).</p>
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
                    href="/wizard/flow?type=money_claim&jurisdiction=england-wales&product=money_claim_england_wales"
                    className="flex-1 text-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                  >
                    Start Money Claim (E&W)
                  </Link>
                  <Link
                    href="/wizard/flow?type=money_claim&jurisdiction=scotland&product=money_claim_scotland"
                    className="flex-1 text-center bg-white text-primary border border-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/5 transition"
                  >
                    Start Simple Procedure (Scotland)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="large" className="space-y-4">
          <h2 className="text-2xl font-semibold text-charcoal">Rent arrears deep-dive</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed text-sm md:text-base">
            <p>
              Rent arrears arise when a tenant misses one or more rental payments. The arrears figure grows with every missed
              period unless the tenant catches up, agrees a payment plan, or the landlord applies incoming payments to the
              oldest charges first. A clear ledger is critical: it shows when rent was due, what was paid, how part-payments were
              applied, and what remains outstanding today.
            </p>
            <p>
              Start by setting a reference rent amount and frequency (monthly or weekly). Every line in your ledger should show
              the due date, the amount due, what was actually paid, and the payment date or reference. If the tenant paid late,
              note the date so you can explain any goodwill you offered. Keep bank statements, standing order references, or
              portal receipts that match the ledger — this evidence is what courts look for when defendants dispute figures.
            </p>
            <p>
              In England & Wales, landlords commonly claim simple statutory interest at 8% per annum on unpaid sums (unless the
              tenancy agreement sets a higher contractual rate that is fair and enforceable). The daily interest line on the
              particulars of claim tells the judge how the figure accrues over time. In Scotland, Simple Procedure claims often
              refer to the judicial rate; if you intend to request a different rate, explain the basis clearly and be prepared
              to justify it. Always state the start date for interest — many landlords pick the oldest arrears date or a clear
              point such as the end of a payment plan.
            </p>
            <p>
              Tracking arrears is not just for court. It underpins your pre-action steps. Before issuing a claim, send a clear
              rent statement and a polite demand that invites the tenant to respond. For England & Wales, the Pre-Action
              Protocol for Debt (PAP-DEBT) expects a letter of claim with information sheet and reply forms. Scotland requires a
              fair warning letter and, in many Sheriffdoms, a second demand before lodging Form 3A. Your arrears schedule should
              accompany those letters so the tenant can see how you reached the balance.
            </p>
            <p>
              When to escalate? If arrears are increasing and the tenant is non-responsive, a money claim can secure a County
              Court Judgment (CCJ) or decree that supports enforcement or future possession proceedings. If the tenant engages
              and proposes a realistic plan, note it in writing. Courts look favourably on landlords who offered time to pay and
              explored alternatives such as mediation. Keep those messages — they become useful evidence when explaining why you
              finally issued proceedings.
            </p>
            <p>
              The Landlord Heaven Money Claim Pack is built to turn this ledger into a filing-ready bundle. It captures each
              arrears period, damages or cleaning charges, court fee estimates, and interest calculations. You choose England &
              Wales or Scotland and the wizard routes you to N1 or Form 3A. The generated particulars use neutral, judge-friendly
              wording and include the right PAP-DEBT or Scottish pre-action references. You can regenerate the pack after partial
              payments or corrections without paying again.
            </p>
            <p>
              Practical tips for keeping arrears accurate:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Apply payments to the earliest unpaid period first unless you and the tenant agree otherwise.</li>
              <li>Record housing benefit or Universal Credit payments separately so you can evidence when they were received.</li>
              <li>Document any payment plans, concessions, or rent holidays and the dates they apply.</li>
              <li>Note deposit deductions separately — they may offset damages but do not usually reduce pre-claim arrears until agreed.</li>
              <li>Keep copies of all reminders, texts, or emails; they demonstrate reasonableness and pre-action engagement.</li>
            </ul>
            <p>
              England & Wales process overview: you serve a PAP-DEBT compliant letter, wait for the response window, then issue
              N1 (often online via Money Claim Online for smaller claims). Scotland process overview: you serve demand wording,
              gather any replies, then lodge Form 3A with the Sheriff Court in the correct sheriffdom. In both jurisdictions,
              serve the claim pack and retain proof. Our filing guides in the pack give a step-by-step checklist.
            </p>
            <p>
              Once you have a judgment or decree, enforcement options include attachment of earnings, bank account arrestment,
              or instructing enforcement officers. The strength of your arrears schedule and evidence bundle makes enforcement
              smoother because it reduces scope for disputes about the balance.
            </p>
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-primary-darker">
              <p className="font-semibold">Ready to convert this calculation into a court-ready claim?</p>
              <p className="text-sm">
                Upgrade to the Money Claim Pack for a pre-filled N1 or Form 3A, PAP-DEBT/Scottish pre-action letters, and an
                evidence index tailored to your case.
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Link
                  href="/products/money-claim-pack"
                  className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-center hover:bg-primary/90"
                >
                  View Money Claim Pack
                </Link>
                <Link
                  href="/wizard?product=money_claim_england_wales"
                  className="bg-white text-primary border border-primary px-4 py-2 rounded-lg font-semibold text-center hover:bg-primary/5"
                >
                  Start claim (England & Wales)
                </Link>
                <Link
                  href="/wizard?product=money_claim_scotland"
                  className="bg-white text-primary border border-primary px-4 py-2 rounded-lg font-semibold text-center hover:bg-primary/5"
                >
                  Start claim (Scotland)
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="large" className="space-y-4">
          <h2 className="text-2xl font-semibold text-charcoal">FAQs about rent arrears and small money claims</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed text-sm md:text-base">
            <div>
              <p className="font-semibold text-charcoal">Do I have to send a pre-action letter before suing?</p>
              <p>
                Yes. England & Wales claims must follow PAP-DEBT with an information sheet and reply forms. In Scotland, send a
                clear demand (and often a second reminder) before lodging Form 3A. Our Money Claim Pack includes compliant
                letters for both.
              </p>
            </div>
            <div>
              <p className="font-semibold text-charcoal">How do I explain interest to the court?</p>
              <p>
                State whether you rely on statutory interest (8% simple in England & Wales, judicial rate guidance in Scotland)
                or a contractual rate from the tenancy. Provide the start date and daily rate so the judge can see how it
                accrues. The pack calculates and formats this for you.
              </p>
            </div>
            <div>
              <p className="font-semibold text-charcoal">Can I keep using this calculator if arrears change?</p>
              <p>
                Yes. Update the schedule anytime. When you upgrade to the Money Claim Pack you can regenerate documents whenever
                the balance moves without paying again.
              </p>
            </div>
            <div>
              <p className="font-semibold text-charcoal">What if the tenant disputes the arrears?</p>
              <p>
                Keep a precise ledger, supporting bank evidence, and communications. The evidence index in the pack highlights
                what to attach. Courts prefer clear, neutral timelines over long narratives.
              </p>
            </div>
            <div>
              <p className="font-semibold text-charcoal">Will this help with possession as well?</p>
              <p>
                A money judgment strengthens later possession proceedings by proving arrears, but possession notices have their
                own rules. Use our eviction wizards for Section 8/21 or Notice to Leave alongside this arrears evidence.
              </p>
            </div>
            <div>
              <p className="font-semibold text-charcoal">How long does it take to file once I upgrade?</p>
              <p>
                The wizard takes around 10–15 minutes. Documents download instantly. Filing times depend on your chosen court
                route (MCOL, paper, or Sheriff Court), but your paperwork will already be formatted correctly.
              </p>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
