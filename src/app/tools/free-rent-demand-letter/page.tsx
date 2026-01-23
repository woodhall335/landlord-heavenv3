'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { RiAlertLine, RiInformationLine, RiExternalLinkLine } from 'react-icons/ri';
import { useEmailGate } from '@/hooks/useEmailGate';
import { ToolEmailGate } from '@/components/ui/ToolEmailGate';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { ToolFunnelTracker } from '@/components/tools/ToolFunnelTracker';
import { ToolUpsellCard } from '@/components/tools/ToolUpsellCard';

export default function RentDemandLetterGenerator() {
  const [formData, setFormData] = useState({
    landlordName: '',
    landlordAddress: '',
    tenantName: '',
    tenantAddress: '',
    amountOwed: '',
    rentAmount: '',
    periodsCovered: '',
    paymentDeadline: '',
    includeLegalWarning: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const upsellConfig = {
    toolName: 'Free Rent Demand Letter Generator',
    toolType: 'generator' as const,
    productName: 'Money Claim Pack',
    ctaLabel: 'Upgrade to court-ready pack — £99.99',
    ctaHref: '/products/money-claim',
    jurisdiction: 'uk',
    freeIncludes: [
      'Basic demand letter PDF',
      'Manual arrears follow-up',
      'No court filing pack',
    ],
    paidIncludes: [
      'Pre-filled claim forms',
      'PAP/Pre-action letters bundle',
      'Evidence-ready arrears schedule',
    ],
    description:
      'If the tenant does not pay, upgrade for a court-ready money claim bundle with forms and evidence templates.',
  };

  // Set default payment deadline to 14 days from today
  useEffect(() => {
    const defaultDeadline = new Date();
    defaultDeadline.setDate(defaultDeadline.getDate() + 14);
    const formattedDate = defaultDeadline.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, paymentDeadline: formattedDate }));
  }, []);

  // PDF generation function (called after email captured)
  const generatePDF = useCallback(async () => {
    // Validate all required fields
    if (!formData.landlordName?.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!formData.landlordAddress?.trim()) {
      alert('Please enter your address');
      return;
    }
    if (!formData.tenantName?.trim()) {
      alert('Please enter tenant name');
      return;
    }
    if (!formData.tenantAddress?.trim()) {
      alert('Please enter tenant address');
      return;
    }
    if (!formData.amountOwed || parseFloat(formData.amountOwed) <= 0) {
      alert('Please enter a valid amount owed');
      return;
    }

    setIsGenerating(true);

    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();

      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yPosition = height - 80;

      // Date
      const todayDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      page.drawText(todayDate, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 40;

      // Landlord details
      const landlordLines = formData.landlordAddress.split('\n').filter((line) => line.trim());

      page.drawText(formData.landlordName || '[Landlord Name]', {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;

      landlordLines.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 18;
      });
      yPosition -= 25;

      // Tenant details
      const tenantLines = formData.tenantAddress.split('\n').filter((line) => line.trim());

      page.drawText(formData.tenantName || '[Tenant Name]', {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;

      tenantLines.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 18;
      });
      yPosition -= 30;

      // Salutation
      page.drawText(`Dear ${formData.tenantName || '[Tenant Name]'},`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      // Subject line
      page.drawText('FORMAL DEMAND FOR PAYMENT OF RENT ARREARS', {
        x: 50,
        y: yPosition,
        size: 13,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      // Letter body
      const wrapText = (text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine + word + ' ';
          if (testLine.length * 6 > maxWidth) {
            if (currentLine) lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine.trim()) lines.push(currentLine.trim());
        return lines;
      };

      // Paragraph 1
      const para1 = `I am writing to you regarding the outstanding rent arrears on the property located at ${formData.tenantAddress || '[Property Address]'}.`;
      const para1Lines = wrapText(para1, width - 100);

      para1Lines.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 18;
      });
      yPosition -= 15;

      // Arrears summary section
      page.drawText('ARREARS SUMMARY:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(`Monthly Rent: £${formData.rentAmount || '[amount]'}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;

      page.drawText(`Period: ${formData.periodsCovered || '[periods]'}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 18;

      page.drawText(`Total Outstanding: £${formData.amountOwed || '[amount]'}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: rgb(0.8, 0.1, 0.1),
      });
      yPosition -= 30;

      // Payment required section
      page.drawText('PAYMENT REQUIRED:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const deadlineDate = formData.paymentDeadline
        ? new Date(formData.paymentDeadline).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '[Payment Deadline]';

      const para2 = `You are required to pay the outstanding amount of £${formData.amountOwed || '[amount]'} by ${deadlineDate}.`;
      const para2Lines = wrapText(para2, width - 100);

      para2Lines.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 18;
      });
      yPosition -= 15;

      // Legal warning (if included)
      if (formData.includeLegalWarning) {
        const legalWarning = `If payment is not received by ${deadlineDate}, I will have no option but to commence legal proceedings to recover the arrears. This may include serving a Section 8 notice seeking possession of the property and/or pursuing a money claim through the courts. You will be liable for all legal costs incurred.`;
        const warningLines = wrapText(legalWarning, width - 100);

        warningLines.forEach((line) => {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= 18;
        });
        yPosition -= 15;
      }

      // Financial difficulties paragraph
      const para3 = 'If you are experiencing financial difficulties, please contact me immediately to discuss payment arrangements. I am willing to work with you to resolve this matter, but I must receive payment or hear from you by the deadline specified above.';
      const para3Lines = wrapText(para3, width - 100);

      para3Lines.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 18;
      });
      yPosition -= 30;

      // Closing
      page.drawText('Yours sincerely,', {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 40;

      // Signature line
      page.drawText('_______________________________', {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(formData.landlordName || '[Landlord Name]', {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      // Footer
      page.drawText(`Generated: ${new Date().toLocaleDateString('en-GB')} | www.LandlordHeaven.co.uk`, {
        x: 50,
        y: 50,
        size: 8,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Save and download
const pdfBytes = await pdfDoc.save();

// ✅ Make a "real" Uint8Array backed by a normal ArrayBuffer (not SharedArrayBuffer/ArrayBufferLike)
const safeBytes = new Uint8Array(pdfBytes);

const blob = new Blob([safeBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

const link = document.createElement('a');
link.href = url;
link.download = 'rent-demand-letter.pdf';
document.body.appendChild(link);
link.click();
link.remove();
URL.revokeObjectURL(url);


      setGenerated(true);
      setIsGenerating(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setIsGenerating(false);
      alert('Failed to generate PDF. Please try again.');
    }
  }, [formData]);

  // Email gate hook - requires email before PDF download
  const gate = useEmailGate({
    source: 'tool:rent-demand-letter',
    onProceed: generatePDF,
  });

  // Handler that checks gate before generating
  const handleGenerate = () => {
    gate.checkGateAndProceed();
  };

  const isFormValid =
    formData.landlordName &&
    formData.landlordAddress &&
    formData.tenantName &&
    formData.tenantAddress &&
    formData.amountOwed &&
    formData.rentAmount &&
    formData.periodsCovered &&
    formData.paymentDeadline;

  return (
    <div className="min-h-screen bg-gray-50">
      <ToolFunnelTracker
        toolName={upsellConfig.toolName}
        toolType={upsellConfig.toolType}
        jurisdiction={upsellConfig.jurisdiction}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-36">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Free Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Rent Demand Letter Generator</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Generate a Professional Rent Demand Letter for Unpaid Arrears
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">FREE</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#generator"
                className="hero-btn-primary"
              >
                Start Free Generator →
              </a>
              <Link
                href="/products/notice-only?product=demand_letter"
                className="hero-btn-secondary"
              >
                Get Court-Ready Version →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">Instant download • Basic template • Upgrade for legal compliance</p>
            <div className="mt-6">
              <SocialProofCounter variant="today" className="mx-auto" />
            </div>
          </div>
        </Container>
      </section>

      {/* Legal Disclaimer Banner */}
      <div className="border-b-2 border-warning-500 bg-warning-50 py-4">
        <Container>
          <div className="flex items-start gap-3">
            <RiAlertLine className="mt-1 h-6 w-6 shrink-0 text-[#7C3AED]" />
            <div>
              <p className="text-sm font-semibold text-warning-900">
                Legal Disclaimer
              </p>
              <p className="text-sm text-warning-800">
                This free version is not court-ready and is provided for general informational use only. It is not legal advice. For legally validated, court-ready documents, upgrade to the paid version.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <div className="py-20 md:py-24">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div id="generator" className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Generate Your Rent Demand Letter
              </h2>

      <div className="mb-6 rounded-lg border-2 border-primary-200 bg-primary-50 p-5">
        <div className="flex items-start gap-3">
          <RiInformationLine className="mt-0.5 h-6 w-6 shrink-0 text-[#7C3AED]" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Need to calculate arrears first?
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Use our Rent Arrears Calculator to generate a detailed breakdown with interest calculations,
              then come back here to create the formal demand letter.
            </p>
            <a
              href="/tools/rent-arrears-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-600 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 transition-all"
            >
              Open Arrears Calculator
              <RiExternalLinkLine className="h-4 w-4 text-[#7C3AED]" />
            </a>
          </div>
        </div>
      </div>

      <form className="space-y-6">
        {/* Landlord Name */}
        <div>
          <label
            htmlFor="landlordName"
            className="block text-sm font-medium text-gray-700"
          >
            Your Name (Landlord) <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="landlordName"
            value={formData.landlordName}
            onChange={(e) =>
              setFormData({ ...formData, landlordName: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Your full legal name"
          />
        </div>

        {/* Landlord Address */}
        <div>
          <label
            htmlFor="landlordAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Your Address (Landlord) <span className="text-error-500">*</span>
          </label>
          <textarea
            id="landlordAddress"
            value={formData.landlordAddress}
            onChange={(e) =>
              setFormData({ ...formData, landlordAddress: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Your address including postcode"
          />
        </div>

        {/* Tenant Name */}
        <div>
          <label
            htmlFor="tenantName"
            className="block text-sm font-medium text-gray-700"
          >
            Tenant Name <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="tenantName"
            value={formData.tenantName}
            onChange={(e) =>
              setFormData({ ...formData, tenantName: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Tenant's full name"
          />
        </div>

        {/* Tenant Address (Property Address) */}
        <div>
          <label
            htmlFor="tenantAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Property Address <span className="text-error-500">*</span>
          </label>
          <textarea
            id="tenantAddress"
            value={formData.tenantAddress}
            onChange={(e) =>
              setFormData({ ...formData, tenantAddress: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Full property address including postcode"
          />
          <p className="mt-1 text-xs text-gray-500">
            The address of the rental property where arrears accrued
          </p>
        </div>

        {/* Monthly Rent Amount */}
        <div>
          <label
            htmlFor="rentAmount"
            className="block text-sm font-medium text-gray-700"
          >
            Monthly Rent Amount (£) <span className="text-error-500">*</span>
          </label>
          <input
            type="number"
            id="rentAmount"
            value={formData.rentAmount}
            onChange={(e) =>
              setFormData({ ...formData, rentAmount: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="e.g., 1200"
            min="0"
            step="0.01"
          />
        </div>

        {/* Amount Owed */}
        <div>
          <label
            htmlFor="amountOwed"
            className="block text-sm font-medium text-gray-700"
          >
            Total Amount Owed (£) <span className="text-error-500">*</span>
          </label>
          <input
            type="number"
            id="amountOwed"
            value={formData.amountOwed}
            onChange={(e) =>
              setFormData({ ...formData, amountOwed: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="e.g., 3600"
            min="0"
            step="0.01"
          />
        </div>

        {/* Periods Covered */}
        <div>
          <label
            htmlFor="periodsCovered"
            className="block text-sm font-medium text-gray-700"
          >
            Rental Periods Covered <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="periodsCovered"
            value={formData.periodsCovered}
            onChange={(e) =>
              setFormData({ ...formData, periodsCovered: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="e.g., October 2024 to December 2024"
          />
          <p className="mt-1 text-xs text-gray-500">
            Specify which months/periods the arrears relate to
          </p>
        </div>

        {/* Payment Deadline */}
        <div>
          <label
            htmlFor="paymentDeadline"
            className="block text-sm font-medium text-gray-700"
          >
            Payment Deadline <span className="text-error-500">*</span>
          </label>
          <input
            type="date"
            id="paymentDeadline"
            value={formData.paymentDeadline}
            onChange={(e) =>
              setFormData({ ...formData, paymentDeadline: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            Typically 14 days from today (pre-filled)
          </p>
        </div>

        {/* Include Legal Warning */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="includeLegalWarning"
            checked={formData.includeLegalWarning}
            onChange={(e) =>
              setFormData({ ...formData, includeLegalWarning: e.target.checked })
            }
            className="mt-1 mr-3"
          />
          <label htmlFor="includeLegalWarning" className="text-sm text-gray-700">
            <span className="font-medium">Include legal warning</span>
            <span className="block text-xs text-gray-500 mt-1">
              Warns tenant of potential legal proceedings if payment not received
            </span>
          </label>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating}
          className="hero-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating
            ? 'Generating Letter...'
            : 'Generate Free Letter'}
        </button>

        {generated && (
          <div className="rounded-lg bg-success-50 border border-success-200 p-4">
            <p className="text-sm text-success-800 font-medium">
              ✓ Demand letter generated successfully! Your PDF has been downloaded.
            </p>
            <div className="mt-4">
              <ToolUpsellCard {...upsellConfig} />
            </div>
          </div>
        )}
      </form>

      <div className="mt-8">
        <ToolUpsellCard {...upsellConfig} />
      </div>

      {/* Educational Content */}
      <div className="mt-12 space-y-8">
        {/* Section 1 */}
        <div className="rounded-xl bg-primary-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            When to Send a Rent Demand Letter
          </h3>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              A rent demand letter (also called an arrears demand letter or formal rent demand) is a
              written notice to your tenant requesting payment of overdue rent. It's an important
              first step before taking legal action.
            </p>
            <p>
              <strong>You should send a demand letter:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Before serving Section 8 notice:</strong> If you're using grounds 8, 10, or 11
                (rent arrears grounds), it's good practice to demand payment first
              </li>
              <li>
                <strong>Before money claim:</strong> The Pre-Action Protocol for Debt Claims requires
                you to give the tenant a chance to pay before starting court proceedings
              </li>
              <li>
                <strong>As evidence for court:</strong> If the case goes to court, the demand letter
                shows you tried to resolve the matter before legal action
              </li>
              <li>
                <strong>To maintain good relations:</strong> Sometimes tenants have genuine reasons for
                late payment. A formal letter gives them a chance to explain or arrange payment
              </li>
            </ul>
            <p className="text-primary-700 font-semibold mt-4">
              💡 Tip: Always keep proof of service (recorded delivery receipt, email confirmation, or
              witness statement if hand-delivered). This evidence may be crucial in court.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="rounded-xl bg-blue-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            How to Serve a Demand Letter
          </h3>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              Proper service is crucial. The tenant must actually receive the letter for it to be
              effective. Here are the recommended methods:
            </p>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                1. First Class Post or Recorded Delivery (Recommended)
              </h4>
              <p>
                Send the letter by first class post or, better yet, recorded delivery. Keep the proof
                of postage receipt. The letter is deemed served 2 days after posting (if first class).
                Recorded delivery gives you proof of delivery.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                2. Email (If Tenancy Agreement Allows)
              </h4>
              <p>
                Check if your tenancy agreement specifies that notices can be served by email. If so,
                send the letter as a PDF attachment and keep a copy of the sent email. Consider
                requesting a read receipt.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                3. Hand Delivery
              </h4>
              <p>
                You can hand-deliver the letter to the tenant personally or through the letterbox.
                If possible, take a witness with you who can sign a statement confirming delivery.
                Take a dated photo of the letter going through the letterbox if hand-delivering.
              </p>
            </div>

            <p className="text-warning-700 font-semibold mt-4">
              ⚠️ Important: Always keep copies of the demand letter and proof of service. You may
              need these as evidence if you proceed to Section 8 notice or money claim proceedings.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-6 text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Is a rent demand letter legally required?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                A demand letter is not strictly legally required before serving a Section 8 notice,
                but it's strongly recommended. However, if you're planning to pursue a money claim
                through the courts, the Pre-Action Protocol for Debt Claims requires you to give the
                debtor (tenant) notice and an opportunity to pay before starting proceedings. Failing
                to follow the protocol can result in cost penalties.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                How long should I give the tenant to pay?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                14 days is standard and reasonable for a rent demand letter. This gives the tenant
                time to arrange payment or contact you to discuss the situation. If you're following
                the Pre-Action Protocol for a money claim, you should give at least 30 days before
                starting court proceedings, but your initial demand can be 14 days.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                What if the tenant ignores the demand letter?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                If the tenant doesn't respond or pay by the deadline, you have several options:
                (1) Serve a Section 8 notice seeking possession based on rent arrears grounds 8, 10,
                or 11. (2) Start a money claim through the courts to recover the debt (without seeking
                possession). (3) Continue to pursue payment informally while considering your options.
                Our Complete Eviction Pack (£149.99) includes Section 8 notices with compliance checks.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Can I charge interest on rent arrears?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Only if your tenancy agreement specifically includes a clause allowing you to charge
                interest on late rent payments. Check your AST carefully. Even if your agreement
                includes an interest clause, the rate must be reasonable (typically 3-5% above Bank of
                England base rate). If there's no interest clause in your tenancy agreement, you
                cannot charge interest unless and until you obtain a county court judgment (CCJ).
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Should I send a demand letter before a Section 8 notice?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Yes, it's good practice to send a demand letter before serving a Section 8 notice.
                Here's why: (1) It gives the tenant a chance to pay and avoid eviction proceedings.
                (2) It shows the court you tried to resolve the matter reasonably. (3) The tenant may
                have a genuine reason for non-payment (e.g., benefits delay) and may be able to pay
                quickly once reminded. (4) It strengthens your case if you proceed to court. Many
                judges look favorably on landlords who've tried to work with tenants before legal action.
              </p>
            </div>
          </div>
        </div>
      </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Email Gate Modal */}
      {gate.showGate && (
        <ToolEmailGate
          toolName="Rent Demand Letter"
          source={gate.source}
          onEmailCaptured={gate.handleSuccess}
          onClose={gate.handleClose}
        />
      )}
    </div>
  );
}
