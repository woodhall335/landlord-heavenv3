'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';

// SEO Metadata (exported from separate metadata.ts file for client components)
// See: src/app/tools/free-section-21-notice-generator/metadata.ts

export default function FreeSection21Tool() {
  const [formData, setFormData] = useState({
    landlordName: '',
    tenantName: '',
    propertyAddress: '',
    noticeDate: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Import pdf-lib dynamically (client-side only)
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size in points
      const { width, height } = page.getSize();

      // Load fonts
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yPosition = height - 80;

      // Title
      page.drawText('SECTION 21 NOTICE', {
        x: 50,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      page.drawText('Housing Act 1988 Section 21(1)(b) or Section 21(4)(a)', {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 40;

      // From section
      page.drawText('From (Landlord):', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
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
      yPosition -= 35;

      // To section
      page.drawText('To (Tenant):', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(formData.tenantName || '[Tenant Name]', {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 35;

      // Property address section
      page.drawText('Property Address:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const addressLines = (formData.propertyAddress || '[Property Address]').split('\n');
      addressLines.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 18;
      });
      yPosition -= 20;

      // Notice text
      page.drawText('NOTICE REQUIRING POSSESSION', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      const noticeText = [
        'I/We give you notice that I/we require possession of the property known as the above address',
        'which you hold as tenant.',
        '',
        `I/We require you to leave the property after: ${formData.noticeDate || '[Notice Date]'}`,
        '',
        'This notice is given under Section 21 of the Housing Act 1988.',
      ];

      noticeText.forEach((line) => {
        if (line === '') {
          yPosition -= 10;
        } else {
          const words = line.split(' ');
          let currentLine = '';
          words.forEach((word) => {
            const testLine = currentLine + word + ' ';
            if (testLine.length * 6 > width - 100) {
              page.drawText(currentLine.trim(), {
                x: 50,
                y: yPosition,
                size: 11,
                font: regularFont,
                color: rgb(0, 0, 0),
              });
              yPosition -= 18;
              currentLine = word + ' ';
            } else {
              currentLine = testLine;
            }
          });
          if (currentLine.trim()) {
            page.drawText(currentLine.trim(), {
              x: 50,
              y: yPosition,
              size: 11,
              font: regularFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= 18;
          }
        }
      });

      yPosition -= 40;

      // Signature section
      page.drawText('Signed: _______________________________', {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      page.drawText(`Date: ${new Date().toLocaleDateString('en-GB')}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });

      // Add footer
      page.drawText('www.LandlordHeaven.com', {
        x: 50,
        y: 50,
        size: 8,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();

      // Create a blob and download
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Section-21-Notice-FREE-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setIsGenerating(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setIsGenerating(false);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const isFormValid =
    formData.landlordName &&
    formData.tenantName &&
    formData.propertyAddress &&
    formData.noticeDate;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Free Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Section 21 Notice Generator</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Generate a Basic Section 21 Notice Template for England & Wales
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
                href="/products/notice-only?product=section21"
                className="hero-btn-secondary"
              >
                Get Court-Ready Version →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">Instant download • Basic template • Upgrade for legal compliance</p>
          </div>
        </Container>
      </section>

      {/* Legal Disclaimer Banner */}
      <div className="border-b-2 border-warning-500 bg-warning-50 py-4">
        <Container>
          <div className="flex items-start gap-3">
            <svg
              className="mt-1 h-6 w-6 shrink-0 text-warning-700"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
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
      <div className="py-16 md:py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div id="generator" className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Generate Your Section 21 Notice
              </h2>

      <form className="space-y-6">
        {/* Landlord Name */}
        <div>
          <label
            htmlFor="landlordName"
            className="block text-sm font-medium text-gray-700"
          >
            Landlord Name <span className="text-error-500">*</span>
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

        {/* Property Address */}
        <div>
          <label
            htmlFor="propertyAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Property Address <span className="text-error-500">*</span>
          </label>
          <textarea
            id="propertyAddress"
            value={formData.propertyAddress}
            onChange={(e) =>
              setFormData({ ...formData, propertyAddress: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Full property address including postcode"
          />
        </div>

        {/* Notice Date */}
        <div>
          <label
            htmlFor="noticeDate"
            className="block text-sm font-medium text-gray-700"
          >
            Notice Date <span className="text-error-500">*</span>
          </label>
          <input
            type="date"
            id="noticeDate"
            value={formData.noticeDate}
            onChange={(e) =>
              setFormData({ ...formData, noticeDate: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            The notice period starts from this date
          </p>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating}
          className="w-full rounded-xl bg-primary-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating
            ? 'Generating...'
            : 'Generate Free Notice'}
        </button>
      </form>

      {/* Comparison Table */}
      <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          Free vs Court-Ready Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="pb-3 text-left text-sm font-medium text-gray-600">
                  Feature
                </th>
                <th className="pb-3 text-center text-sm font-medium text-gray-600">
                  Free
                </th>
                <th className="pb-3 text-center text-sm font-medium text-gray-600">
                  £14.99
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 text-sm text-gray-700">Basic template</td>
                <td className="text-center">✓</td>
                <td className="text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Court-ready formatting
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Deposit protection checks
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Prescribed info verification
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Ask Heaven AI optimization
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Red flag detection
                </td>
                <td className="text-center text-gray-400">✗</td>
                <td className="text-center text-success-600">✓</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-700">
                  Watermark
                </td>
                <td className="text-center text-warning-600">Yes</td>
                <td className="text-center text-success-600">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

              {/* Educational Content */}
              <div className="mt-8 rounded-xl bg-primary-50 p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  What is a Section 21 Notice?
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  A Section 21 notice is a formal notice used by landlords in England
                  and Wales to end an assured shorthold tenancy (AST) without providing
                  a specific reason. It requires at least 2 months' notice and must
                  comply with strict legal requirements to be valid.
                </p>
                <p className="mt-3 text-sm font-semibold text-primary-600">
                  ⚠️ Important: A Section 21 notice can be invalidated if you haven't
                  protected the deposit correctly or provided prescribed information.
                  Our paid version includes these critical checks.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
