'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout';
import { Button, Card, Container, Input } from '@/components/ui';
import { RiAlertLine } from 'react-icons/ri';
import { useEmailGate } from '@/hooks/useEmailGate';
import { ToolEmailGate } from '@/components/ui/ToolEmailGate';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { productLinks, blogLinks, toolLinks, landingPageLinks } from '@/lib/seo/internal-links';
import { ToolFunnelTracker } from '@/components/tools/ToolFunnelTracker';
import { ToolUpsellCard } from '@/components/tools/ToolUpsellCard';
import { NextStepWidget } from '@/components/journey/NextStepWidget';
import { trackToolComplete } from '@/lib/journey/events';
import { setJourneyState, type StageEstimate } from '@/lib/journey/state';
import { bucketArrears, bucketMonthsInArrears } from '@/lib/journey/stage';
import { PRODUCTS } from '@/lib/pricing/products';

const noticeOnlyPrice = PRODUCTS.notice_only.displayPrice;

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

const faqs = [
  {
    question: 'How should I evidence rent arrears for court?',
    answer:
      "Prepare a clear rent schedule showing all payments due and received, with a running balance. Attach your tenancy agreement, bank statements highlighting missed payments, and copies of all communications with the tenant about the arrears. The court wants to see that you've made reasonable attempts to resolve the issue before litigation.",
  },
  {
    question: 'Can I claim interest on rent arrears?',
    answer:
      "Yes. You may be able to claim statutory interest at 8% per annum, depending on the route and facts of the case. Interest runs from each payment's due date until it is paid or judgment is entered. You should also check whether your tenancy agreement includes a contractual interest clause.",
  },
  {
    question: 'What if my tenant disputes the arrears amount?',
    answer:
      "Ask the tenant for a detailed breakdown showing which payments they believe they made, then check your own records carefully. If there is a genuine dispute, you may want to try to resolve it before court. If the tenant simply refuses to pay without a valid reason, keep the paperwork clear and let the court decide.",
  },
  {
    question: 'Should I serve a Section 8 notice or file a money claim?',
    answer:
      'It depends on your goal. A Section 8 notice seeks possession of the property. A money claim focuses on recovering the debt, including after the tenant has left. Many landlords end up doing both: one route to regain possession, the other to pursue the unpaid balance.',
  },
  {
    question: "Is this calculator's 8% interest calculation legally accurate?",
    answer:
      "This calculator uses the standard statutory rate of 8% per annum as simple interest. While widely accepted, actual court awards may vary based on jurisdiction, the judge's discretion, and your specific tenancy agreement. If you want a fuller arrears schedule and the paperwork for the next step, move into our Money Claim Pack.",
  },
];

export default function RentArrearsCalculator() {
  const [rentAmount, setRentAmount] = useState(750);
  const [frequency, setFrequency] = useState<'month' | 'week'>('month');
  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultSchedule);

  const upsellConfig = {
    toolName: 'Rent Arrears Calculator',
    toolType: 'calculator' as const,
    productName: 'Money Claim Pack',
    ctaLabel: `Upgrade to full money claim pack - ${noticeOnlyPrice}`,
    ctaHref: '/products/money-claim',
    jurisdiction: 'uk',
    freeIncludes: [
      'Arrears and interest totals',
      'Basic schedule PDF export',
      'No court filing pack',
    ],
    paidIncludes: [
      'Pre-filled claim forms',
      'PAP/Pre-action letters bundle',
      'Evidence-ready arrears schedule',
    ],
    description:
      'Move from a rough arrears calculation to the full money claim bundle with the forms and evidence templates you need if the debt is still unpaid.',
  };

  const totals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return schedule.reduce(
      (acc, item) => {
        const due = Number(item.dueAmount) || 0;
        const paid = Number(item.paidAmount) || 0;
        const outstanding = Math.max(due - paid, 0);
        const dueDate = item.dueDate ? new Date(`${item.dueDate}T00:00:00`) : today;
        const daysOutstanding = Math.max(
          0,
          Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        );

        const interest =
          outstanding > 0 && daysOutstanding > 0
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

  const completionTrackedRef = useRef(false);

  const arrearsBand = useMemo(() => bucketArrears(totals.totalOutstanding), [totals.totalOutstanding]);
  const monthsInArrearsBand = useMemo(
    () => bucketMonthsInArrears(totals.totalOutstanding, rentAmount),
    [rentAmount, totals.totalOutstanding],
  );

  const stageHint: StageEstimate = useMemo(() => {
    const months = rentAmount > 0 ? totals.totalOutstanding / rentAmount : 0;
    return months >= 2 ? 'notice_ready' : 'early_arrears';
  }, [rentAmount, totals.totalOutstanding]);

  useEffect(() => {
    if (totals.totalOutstanding <= 0) {
      completionTrackedRef.current = false;
      return;
    }

    setJourneyState(
      {
        stage_estimate: stageHint,
        arrears_band: arrearsBand,
        months_in_arrears_band: monthsInArrearsBand,
        last_touch: {
          type: 'tool',
          id: 'rent-arrears-calculator',
          ts: Date.now(),
        },
      },
      'rent_arrears_calculator_complete',
    );

    if (!completionTrackedRef.current) {
      completionTrackedRef.current = true;
      trackToolComplete({
        tool_name: 'rent_arrears_calculator',
        context: {
          journey_state: {
            arrears_band: arrearsBand,
            months_in_arrears_band: monthsInArrearsBand,
            stage_estimate: stageHint,
          },
        },
      });
    }
  }, [arrearsBand, monthsInArrearsBand, stageHint, totals.totalOutstanding]);

  const calculateEnhancedInterest = () => {
    if (totals.totalOutstanding <= 0) return { interest: 0, daysOutstanding: 0, fromDate: '' };

    let earliestDueDate: Date | null = null;
    for (const item of schedule) {
      const due = Number(item.dueAmount) || 0;
      const paid = Number(item.paidAmount) || 0;
      const outstanding = due - paid;

      if (outstanding > 0 && item.dueDate) {
        const dueDate = new Date(`${item.dueDate}T00:00:00`);
        if (!earliestDueDate || dueDate < earliestDueDate) {
          earliestDueDate = dueDate;
        }
      }
    }

    if (!earliestDueDate) return { interest: 0, daysOutstanding: 0, fromDate: '' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysOutstanding = Math.max(
      0,
      Math.floor((today.getTime() - earliestDueDate.getTime()) / (1000 * 60 * 60 * 24)),
    );

    if (daysOutstanding <= 0) {
      return {
        interest: 0,
        daysOutstanding: 0,
        fromDate: earliestDueDate.toISOString().split('T')[0],
      };
    }

    const annualRate = 0.08;
    const dailyRate = annualRate / 365;
    const interest = totals.totalOutstanding * dailyRate * daysOutstanding;

    return {
      interest: Math.max(0, interest),
      daysOutstanding,
      fromDate: earliestDueDate.toISOString().split('T')[0],
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

  const generatePDF = useCallback(async () => {
    if (schedule.length === 0 || totals.totalOutstanding === 0) {
      alert('Please add at least one arrears period first');
      return;
    }

    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = 780;

      page.drawText('RENT ARREARS SCHEDULE', {
        x: 50,
        y,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      y -= 30;

      page.drawText(`Generated: ${new Date().toLocaleDateString('en-GB')}`, {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });

      y -= 40;

      page.drawText(`Monthly Rent: £${rentAmount}`, {
        x: 50,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      y -= 35;

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
          const dueDate = item.dueDate
            ? new Date(`${item.dueDate}T00:00:00`).toLocaleDateString('en-GB')
            : 'N/A';
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
            pdfDoc.addPage([595, 842]);
            y = 780;
          }
        }
      });

      y -= 25;

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

  const gate = useEmailGate({
    source: 'tool:rent-arrears-calculator',
    onProceed: generatePDF,
  });

  const handleSavePDF = () => {
    gate.checkGateAndProceed();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderConfig mode="autoOnScroll" />
      <ToolFunnelTracker
        toolName={upsellConfig.toolName}
        toolType={upsellConfig.toolType}
        jurisdiction={upsellConfig.jurisdiction}
      />
      <UniversalHero
        badge="Free Tool"
        title="Rent Arrears Calculator"
        subtitle="Work out how much rent is outstanding and build a clearer arrears picture before you decide what to do next."
        align="center"
        hideMedia
        showReviewPill={false}
        showTrustPositioningBar
        showUsageCounter
        primaryCta={{ label: 'Start Free Calculator ->', href: '#calculator' }}
        secondaryCta={{ label: 'See the Money Claim Pack ->', href: '/products/money-claim' }}
      >
        <p className="mt-4 text-sm text-white/90">
          Instant calculation • Clear arrears summary • Built to help landlords prepare the next move
        </p>
      </UniversalHero>

      <Container className="py-12 space-y-8">
        <Card id="calculator" padding="large">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-charcoal">Enter rent details</h2>
              <p className="text-gray-600">
                Add each rent period so you can see the arrears position more clearly.
              </p>
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
                Keep adding rent periods until the arrears total matches your own ledger.
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
                    <strong>From:</strong>{' '}
                    {interestFromDate
                      ? new Date(`${interestFromDate}T00:00:00`).toLocaleDateString('en-GB')
                      : 'N/A'}{' '}
                    to {new Date().toLocaleDateString('en-GB')} ({daysOutstanding} days)
                  </p>
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-warning-300">
                    <RiAlertLine className="h-4 w-4 text-[#7C3AED] shrink-0 mt-0.5" />
                    <p className="text-warning-800 font-medium">
                      <strong>Important:</strong> We use a simple 8% per annum rate on any outstanding
                      balance from its due date up to today. Actual court awards may differ depending
                      on the route, the facts, and the judge.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSavePDF}
              disabled={totals.totalOutstanding === 0}
              className="hero-btn-primary mt-6 w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Schedule as PDF
            </button>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-charcoal mb-2">How we calculate interest</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  We use a simple 8% per annum rate on any outstanding balance from its due date up to
                  today. Treat the result as a practical estimate rather than a guaranteed court figure.
                </p>
              </div>
            </div>

            {totals.totalOutstanding > 0 && (
              <NextStepWidget stageHint={stageHint} location="tool_result" />
            )}

            <div className="mt-8">
              <ToolUpsellCard {...upsellConfig} />
            </div>
          </div>
        </Card>

        <Card padding="large">
          <h2 className="text-2xl font-semibold text-charcoal mb-4">
            How to Calculate and Evidence Rent Arrears
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Keep Accurate Records</h3>
              <p>
                Keep a clear rent ledger showing every payment due and every payment received. Bank
                statements help, but a proper schedule is easier for a landlord, tenant, or court to
                follow.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Evidence You'll Need</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Tenancy agreement showing the rent amount and payment frequency</li>
                <li>Complete rent schedule with all due dates and payments received</li>
                <li>Bank statements showing missed or partial payments</li>
                <li>Messages or letters about the arrears</li>
                <li>Any payment plans or agreements already discussed</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Interest on Rent Arrears</h3>
              <p>
                You may be able to claim interest on arrears depending on the legal route and the
                wording of your tenancy agreement. If you plan to ask for interest, make that clear in
                your pre-action correspondence.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Before You Start a Claim</h3>
              <p>
                Send a clear demand or letter before action first, giving the tenant a final chance to
                pay. That helps show you acted reasonably before moving into notice or court action.
              </p>
            </div>
          </div>
        </Card>
      </Container>

      <FAQSection
        title="Rent Arrears Calculator FAQs For Landlords"
        faqs={faqs}
        showContactCTA={false}
        variant="white"
      />

      <Container className="pb-12">
        <RelatedLinks
          title="Related Resources"
          links={[
            productLinks.moneyClaim,
            productLinks.completePack,
            toolLinks.section8Generator,
            blogLinks.rentArrearsEviction,
            landingPageLinks.rentArrearsTemplate,
          ]}
        />
      </Container>

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
