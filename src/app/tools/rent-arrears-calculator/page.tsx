'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, Container, Input } from '@/components/ui';
import { RiAlertLine } from 'react-icons/ri';
import { useEmailGate } from '@/hooks/useEmailGate';
import { ToolEmailGate } from '@/components/ui/ToolEmailGate';

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

  // Calculate interest using 8% per annum simple interest from earliest unpaid due date
  // Formula: Principal × Annual Rate × (Days Outstanding ÷ 365)
  const calculateEnhancedInterest = () => {
    if (totals.totalOutstanding <= 0) return { interest: 0, daysOutstanding: 0, fromDate: '' };

    // Find the earliest due date that has outstanding balance
    let earliestDueDate = null;
    for (const item of schedule) {
      const due = Number(item.dueAmount) || 0;
      const paid = Number(item.paidAmount) || 0;
      const outstanding = due - paid;

      if (outstanding > 0 && item.dueDate) {
        const dueDate = new Date(item.dueDate + 'T00:00:00');
        if (!earliestDueDate || dueDate < earliestDueDate) {
          earliestDueDate = dueDate;
        }
      }
    }

    if (!earliestDueDate) return { interest: 0, daysOutstanding: 0, fromDate: '' };

    // Normalize dates to start of day to avoid timezone issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate days outstanding
    const daysOutstanding = Math.max(0,
      Math.floor((today.getTime() - earliestDueDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    if (daysOutstanding <= 0) return { interest: 0, daysOutstanding: 0, fromDate: earliestDueDate.toISOString().split('T')[0] };

    // 8% per annum simple interest
    const annualRate = 0.08;
    const dailyRate = annualRate / 365;

    // Interest = Principal × Daily Rate × Days
    const interest = totals.totalOutstanding * dailyRate * daysOutstanding;

    return {
      interest: Math.max(0, interest),
      daysOutstanding,
      fromDate: earliestDueDate.toISOString().split('T')[0]
    };
  };

  const enhancedInterestData = calculateEnhancedInterest();
  const estimatedInterest = enhancedInterestData.interest;
  const daysOutstanding = enhancedInterestData.daysOutstanding;
  const interestFromDate = enhancedInterestData.fromDate;

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

  // PDF generation function (called after email captured)
  const generatePDF = useCallback(async () => {
    if (schedule.length === 0 || totals.totalOutstanding === 0) {
      alert('Please add at least one arrears period first');
      return;
    }

    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = 780;

      // Title
      page.drawText('RENT ARREARS SCHEDULE', {
        x: 50,
        y,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      y -= 30;

      // Date
      page.drawText(`Generated: ${new Date().toLocaleDateString('en-GB')}`, {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });

      y -= 40;

      // Monthly rent
      page.drawText(`Monthly Rent: £${rentAmount}`, {
        x: 50,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      y -= 35;

      // Arrears breakdown
      page.drawText('ARREARS BREAKDOWN:', {
        x: 50,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      y -= 25;

      schedule.forEach((item, index) => {
        const due = Number(item.dueAmount) || 0;
        const paid = Number(item.paidAmount) || 0;
        const outstanding = due - paid;

        if (outstanding > 0) {
          const dueDate = item.dueDate ? new Date(item.dueDate + 'T00:00:00').toLocaleDateString('en-GB') : 'N/A';
          const line = `${dueDate}: £${outstanding.toFixed(2)} outstanding`;
          page.drawText(line, {
            x: 70,
            y,
            size: 11,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          y -= 20;

          if (y < 100 && index < schedule.length - 1) {
            // Add new page if needed
            pdfDoc.addPage([595, 842]);
            y = 780;
          }
        }
      });

      y -= 25;

      // Totals section
      page.drawText('SUMMARY:', {
        x: 50,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      y -= 25;

      page.drawText(`Total Arrears: £${totals.totalOutstanding.toFixed(2)}`, {
        x: 70,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      y -= 20;

      if (estimatedInterest > 0) {
        page.drawText(`Interest (8% p.a. for ${daysOutstanding} days): £${estimatedInterest.toFixed(2)}`, {
          x: 70,
          y,
          size: 11,
          font,
          color: rgb(0, 0, 0),
        });

        y -= 20;

        page.drawText(`TOTAL CLAIM: £${(totals.totalOutstanding + estimatedInterest).toFixed(2)}`, {
          x: 70,
          y,
          size: 14,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        y -= 30;

        // Disclaimer
        page.drawText('Note: Interest calculated at 8% per annum simple interest from last payment date.', {
          x: 70,
          y,
          size: 9,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });

        y -= 12;

        page.drawText('Actual court awards may differ. This is a directional estimate only.', {
          x: 70,
          y,
          size: 9,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      } else {
        page.drawText(`TOTAL CLAIM: £${totals.totalOutstanding.toFixed(2)}`, {
          x: 70,
          y,
          size: 14,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
      }

      // NO WATERMARK - Full value free tool

      const pdfBytes = await pdfDoc.save();

const safeBytes = new Uint8Array(pdfBytes);
const blob = new Blob([safeBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

const link = document.createElement('a');
link.href = url;
      link.download = `Rent-Arrears-Schedule-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }, [schedule, totals, rentAmount, estimatedInterest, daysOutstanding]);

  // Email gate hook - requires email before PDF download
  const gate = useEmailGate({
    source: 'tool:rent-arrears-calculator',
    onProceed: generatePDF,
  });

  // Handler that checks gate before generating
  const handleSavePDF = () => {
    gate.checkGateAndProceed();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Free Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Rent Arrears Calculator</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Calculate Outstanding Rent and Statutory Interest
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">FREE</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#calculator"
                className="hero-btn-primary"
              >
                Start Free Calculator →
              </a>
              <Link
                href="/products/money-claim"
                className="hero-btn-secondary"
              >
                Upgrade to Money Claim Pack →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">Instant calculation • Professional summary • Upgrade for court claims</p>
          </div>
        </Container>
      </section>

      <Container className="py-12 space-y-8">
        <Card id="calculator" padding="large">
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
            {schedule.map((item) => (
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

        <Card padding="large">
          <div>
            <h2 className="text-2xl font-semibold text-charcoal mb-4">Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
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
            </div>

            {estimatedInterest > 0 && (
              <div className="rounded-lg bg-warning-50 border-2 border-warning-200 p-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-900">
                    Estimated Interest (8% p.a.)
                  </span>
                  <span className="text-xl font-bold text-warning-700">
                    £{estimatedInterest.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  <p>
                    <strong>Calculation:</strong> £{totals.totalOutstanding.toFixed(2)} × 8% × ({daysOutstanding} days ÷ 365) = £{estimatedInterest.toFixed(2)}
                  </p>
                  <p>
                    <strong>From:</strong> {interestFromDate ? new Date(interestFromDate + 'T00:00:00').toLocaleDateString('en-GB') : 'N/A'} to {new Date().toLocaleDateString('en-GB')} ({daysOutstanding} days)
                  </p>
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-warning-300">
                    <RiAlertLine className="h-4 w-4 text-[#7C3AED] shrink-0 mt-0.5" />
                    <p className="text-warning-800 font-medium">
                      <strong>Important:</strong> We use a simple 8% per annum rate on any outstanding balance from its due date up to today. Actual court awards may differ depending on jurisdiction and judge discretion. Use this as a directional estimate only.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSavePDF}
              disabled={totals.totalOutstanding === 0}
              className="mt-6 w-full rounded-xl bg-primary-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Schedule as PDF
            </button>

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
                    className="flex-1 text-center bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Start Money Claim (E&W)
                  </Link>
                  <Link
                    href="/wizard/flow?type=money_claim&jurisdiction=scotland&product=money_claim&product_variant=money_claim_scotland"
                    className="flex-1 text-center bg-white text-primary border-2 border-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
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

      {/* Email Gate Modal */}
      {gate.showGate && (
        <ToolEmailGate
          toolName="Rent Arrears Schedule"
          source={gate.source}
          onEmailCaptured={gate.handleSuccess}
          onClose={gate.handleClose}
        />
      )}
    </div>
  );
}
