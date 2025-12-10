'use client';

import { useState } from 'react';
import { FreeToolLayout } from '@/components/tools/FreeToolLayout';

const COMMON_GROUNDS = [
  { id: 'ground8', name: 'Ground 8', description: 'Rent arrears (8+ weeks/2+ months)' },
  { id: 'ground10', name: 'Ground 10', description: 'Some rent arrears' },
  { id: 'ground11', name: 'Ground 11', description: 'Persistent delay in paying rent' },
  { id: 'ground12', name: 'Ground 12', description: 'Breach of tenancy agreement' },
  { id: 'ground14', name: 'Ground 14', description: 'Nuisance or annoyance to neighbors' },
  { id: 'ground17', name: 'Ground 17', description: 'False statement inducing grant of tenancy' },
];

export default function FreeSection8Tool() {
  const [formData, setFormData] = useState({
    landlordName: '',
    tenantName: '',
    propertyAddress: '',
    selectedGrounds: [] as string[],
    noticeDate: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const toggleGround = (groundId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGrounds: prev.selectedGrounds.includes(groundId)
        ? prev.selectedGrounds.filter((g) => g !== groundId)
        : [...prev.selectedGrounds, groundId],
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Import pdf-lib dynamically (client-side only)
      const { PDFDocument, rgb, StandardFonts, degrees } = await import('pdf-lib');

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size in points
      const { width, height } = page.getSize();

      // Load fonts
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yPosition = height - 80;

      // Add watermark
      page.drawText('FREE WATERMARKED VERSION - NOT COURT READY', {
        x: 50,
        y: height / 2,
        size: 40,
        font: boldFont,
        color: rgb(0.9, 0.9, 0.9),
        rotate: degrees(45),
      });

      // Title
      page.drawText('SECTION 8 NOTICE', {
        x: 50,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      page.drawText('Housing Act 1988 Section 8 - Notice Seeking Possession', {
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
      page.drawText('NOTICE SEEKING POSSESSION', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      // Grounds section
      page.drawText('GROUNDS FOR POSSESSION:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      const selectedGroundObjects = COMMON_GROUNDS.filter((g) =>
        formData.selectedGrounds.includes(g.id)
      );

      selectedGroundObjects.forEach((ground) => {
        page.drawText(`• ${ground.name}: ${ground.description}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;
      });

      yPosition -= 20;

      const noticeText = [
        'I/We give you notice that I/we intend to begin possession proceedings against you under',
        'Section 8 of the Housing Act 1988 on the grounds specified above.',
        '',
        `I/We require you to leave the property after: ${formData.noticeDate || '[Notice Date]'}`,
        '',
        'The court proceedings will not begin until after this date.',
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

      // Add disclaimer footer
      page.drawText('FREE VERSION - This is a basic template only. Upgrade for court-ready documents with evidence checklists.', {
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
      link.download = `Section-8-Notice-FREE-${Date.now()}.pdf`;
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
    formData.selectedGrounds.length > 0 &&
    formData.noticeDate;

  return (
    <FreeToolLayout
      title="Free Section 8 Notice Generator"
      description="Generate a basic Section 8 notice with grounds for possession. Upgrade for court-ready version with ground-specific legal validation."
      paidVersion={{
        price: '£14.99',
        features: [
          'Court-ready formatting for all 17 grounds',
          'Ground-specific validation and checks',
          'Ask Heaven AI guidance for each ground',
          'Evidence requirements checklist',
          'Notice period calculations',
          'Save and edit anytime',
        ],
        href: '/products/notice-only?product=section8',
      }}
    >
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Generate Your Section 8 Notice
      </h2>

      <form className="space-y-6">
        {/* Landlord Name */}
        <div>
          <label htmlFor="landlordName" className="block text-sm font-medium text-gray-700">
            Landlord Name <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="landlordName"
            value={formData.landlordName}
            onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Your full legal name"
          />
        </div>

        {/* Tenant Name */}
        <div>
          <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
            Tenant Name <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="tenantName"
            value={formData.tenantName}
            onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Tenant's full name"
          />
        </div>

        {/* Property Address */}
        <div>
          <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">
            Property Address <span className="text-error-500">*</span>
          </label>
          <textarea
            id="propertyAddress"
            value={formData.propertyAddress}
            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="Full property address including postcode"
          />
        </div>

        {/* Grounds Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Grounds for Possession <span className="text-error-500">*</span>
          </label>
          <div className="space-y-2">
            {COMMON_GROUNDS.map((ground) => (
              <label
                key={ground.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <input
                  type="checkbox"
                  checked={formData.selectedGrounds.includes(ground.id)}
                  onChange={() => toggleGround(ground.id)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{ground.name}</p>
                  <p className="text-sm text-gray-600">{ground.description}</p>
                </div>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            You can select multiple grounds. The paid version includes all 17 grounds with detailed guidance.
          </p>
        </div>

        {/* Notice Date */}
        <div>
          <label htmlFor="noticeDate" className="block text-sm font-medium text-gray-700">
            Notice Date <span className="text-error-500">*</span>
          </label>
          <input
            type="date"
            id="noticeDate"
            value={formData.noticeDate}
            onChange={(e) => setFormData({ ...formData, noticeDate: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            Notice period varies by ground (14 days to 2 months)
          </p>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating}
          className="w-full rounded-xl bg-primary-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isGenerating ? 'Generating...' : 'Generate Free Notice (Watermarked)'}
        </button>
      </form>

      {/* Educational Content */}
      <div className="mt-8 rounded-xl bg-primary-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          What is a Section 8 Notice?
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          A Section 8 notice is used when a tenant has breached their tenancy agreement. Unlike
          Section 21, you must specify grounds for possession. Notice periods range from 14 days
          (Ground 8) to 2 months (most other grounds).
        </p>
        <p className="mt-3 text-sm font-semibold text-primary-600">
          ⚠️ Important: You must prove your grounds in court. Our paid version includes
          evidence checklists and AI-powered validation for each ground.
        </p>
      </div>
    </FreeToolLayout>
  );
}
