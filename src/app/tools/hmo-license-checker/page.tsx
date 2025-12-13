'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import councilsData from '@/config/jurisdictions/uk/england-wales/councils.json';

// Function to lookup council by postcode
function getCouncilByPostcode(postcode: string): { name: string; website: string } | null {
  // Extract postcode area (e.g., "M1 5AB" -> "M1", "SW1A 2AA" -> "SW1A")
  const postcodeArea = postcode.trim().split(' ')[0].toUpperCase();

  // Find council that has this postcode area
  const council = councilsData.councils.find((c: any) =>
    c.postcode_areas?.includes(postcodeArea)
  );

  return council ? { name: council.name, website: council.website } : null;
}

export default function HMOLicenseChecker() {
  const [formData, setFormData] = useState({
    postcode: '',
    numOccupants: '',
    numHouseholds: '',
    propertyType: '',
    hasSharedFacilities: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Import pdf-lib dynamically (client-side only)
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      // Lookup council info
      const councilInfo = getCouncilByPostcode(formData.postcode);

      // Calculate likelihood
      const numOccupantsInt = parseInt(formData.numOccupants) || 0;
      const numHouseholdsInt = parseInt(formData.numHouseholds) || 0;

      const isLikelyHMO = (
        numHouseholdsInt >= 2 ||
        numOccupantsInt >= 5 ||
        formData.hasSharedFacilities === 'yes'
      );

      const likelihood = isLikelyHMO ? 'HIGH' :
                         numOccupantsInt >= 3 ? 'MEDIUM' : 'LOW';

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size in points
      const { height } = page.getSize();

      // Load fonts
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yPosition = height - 80;

      // Title
      page.drawText('HMO LICENSE ASSESSMENT', {
        x: 50,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      page.drawText('House in Multiple Occupation License Checker', {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 40;

      // Property Details Section
      page.drawText('PROPERTY DETAILS', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      page.drawText(`Postcode: ${formData.postcode.toUpperCase()}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      // Add council information if found
      if (councilInfo) {
        page.drawText(`Local Council: ${councilInfo.name}`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        page.drawText(`Council Website: ${councilInfo.website}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 25;
      }

      page.drawText(`Number of Occupants: ${formData.numOccupants}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(`Number of Households: ${formData.numHouseholds}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const propertyTypeLabels: Record<string, string> = {
        'house': 'House',
        'flat': 'Flat',
        'converted': 'Converted Building',
        'purpose_built': 'Purpose-Built HMO',
      };

      page.drawText(`Property Type: ${propertyTypeLabels[formData.propertyType] || formData.propertyType}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(`Shared Facilities: ${formData.hasSharedFacilities === 'yes' ? 'Yes' : 'No'}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 40;

      // Likelihood Assessment
      page.drawText('LIKELIHOOD ASSESSMENT', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      const likelihoodColor = likelihood === 'HIGH' ? rgb(0.8, 0.1, 0.1) :
                               likelihood === 'MEDIUM' ? rgb(0.9, 0.6, 0) :
                               rgb(0.1, 0.6, 0.1);

      page.drawText(`HMO License Likelihood: ${likelihood}`, {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: likelihoodColor,
      });
      yPosition -= 30;

      // Basic HMO Definition
      page.drawText('WHAT IS AN HMO?', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const hmoDefinition = [
        'A House in Multiple Occupation (HMO) is a property where:',
        '• 3 or more tenants live together',
        '• They form 2 or more separate households',
        '• They share kitchen, bathroom, or toilet facilities',
        '',
        'Standard Test: 5+ people, 2+ households = HMO license required',
        'Additional Test: Some councils require licensing for 3+ people',
      ];

      hmoDefinition.forEach((line) => {
        if (line === '') {
          yPosition -= 10;
        } else {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 10,
            font: regularFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= 16;
        }
      });

      yPosition -= 20;

      // Local Council Lookup
      page.drawText('NEXT STEPS', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const postcodeArea = formData.postcode.replace(/\s/g, '').match(/^[A-Z]{1,2}\d{1,2}/)?.[0] || formData.postcode;

      page.drawText(`Based on postcode area: ${postcodeArea}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 16;

      page.drawText('Contact your local council to confirm specific requirements.', {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 16;

      page.drawText('Many councils have additional or selective licensing schemes.', {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      // Penalties Warning
      page.drawText('PENALTIES FOR UNLICENSED HMOs', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.8, 0.1, 0.1),
      });
      yPosition -= 20;

      const penalties = [
        '• Unlimited fines (up to £30,000+)',
        '• Rent repayment orders (up to 12 months rent)',
        '• Cannot serve Section 21 notices',
        '• Criminal prosecution possible',
      ];

      penalties.forEach((line) => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 16;
      });

      // Footer
      page.drawText(`Generated: ${new Date().toLocaleDateString('en-GB')} | www.LandlordHeaven.com`, {
        x: 50,
        y: 50,
        size: 8,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();

      // Create a blob and download
      const safeBytes = new Uint8Array(pdfBytes);
      const blob = new Blob([safeBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `HMO-License-Assessment-FREE-${Date.now()}.pdf`;
      link.click();

      URL.revokeObjectURL(url);


      setGenerated(true);
      setIsGenerating(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setIsGenerating(false);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const isFormValid =
    formData.postcode &&
    formData.numOccupants &&
    formData.numHouseholds &&
    formData.propertyType &&
    formData.hasSharedFacilities;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-purple-50 via-purple-100 to-purple-50 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">Free Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">HMO License Checker</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-600">
              Check if Your Rental Property Requires HMO Licensing
            </p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl md:text-6xl font-bold text-gray-900">FREE</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#checker"
                className="hero-btn-primary"
              >
                Start Free Checker →
              </a>
              <Link
                href="/products/ast"
                className="hero-btn-secondary"
              >
                Get HMO Tenancy Agreement →
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600">Instant assessment • HMO guidance • Upgrade for professional agreements</p>
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
            <div id="checker" className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Check Your HMO License Requirements
              </h2>

      <form className="space-y-6">
        {/* Postcode */}
        <div>
          <label
            htmlFor="postcode"
            className="block text-sm font-medium text-gray-700"
          >
            Property Postcode <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            id="postcode"
            value={formData.postcode}
            onChange={(e) =>
              setFormData({ ...formData, postcode: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="e.g., SW1A 1AA"
          />
          <p className="mt-1 text-xs text-gray-500">
            Used to identify local council requirements
          </p>
        </div>

        {/* Number of Occupants */}
        <div>
          <label
            htmlFor="numOccupants"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Occupants <span className="text-error-500">*</span>
          </label>
          <input
            type="number"
            id="numOccupants"
            value={formData.numOccupants}
            onChange={(e) =>
              setFormData({ ...formData, numOccupants: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="e.g., 5"
            min="1"
          />
          <p className="mt-1 text-xs text-gray-500">
            Total number of people living in the property
          </p>
        </div>

        {/* Number of Households */}
        <div>
          <label
            htmlFor="numHouseholds"
            className="block text-sm font-medium text-gray-700"
          >
            Number of Households <span className="text-error-500">*</span>
          </label>
          <input
            type="number"
            id="numHouseholds"
            value={formData.numHouseholds}
            onChange={(e) =>
              setFormData({ ...formData, numHouseholds: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="e.g., 3"
            min="1"
          />
          <p className="mt-1 text-xs text-gray-500">
            A household is a single person or family unit
          </p>
        </div>

        {/* Property Type */}
        <div>
          <label
            htmlFor="propertyType"
            className="block text-sm font-medium text-gray-700"
          >
            Property Type <span className="text-error-500">*</span>
          </label>
          <select
            id="propertyType"
            value={formData.propertyType}
            onChange={(e) =>
              setFormData({ ...formData, propertyType: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
          >
            <option value="">Select property type</option>
            <option value="house">House</option>
            <option value="flat">Flat</option>
            <option value="converted">Converted Building</option>
            <option value="purpose_built">Purpose-Built HMO</option>
          </select>
        </div>

        {/* Shared Facilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Do tenants share kitchen or bathroom facilities?{' '}
            <span className="text-error-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasSharedFacilities"
                value="yes"
                checked={formData.hasSharedFacilities === 'yes'}
                onChange={(e) =>
                  setFormData({ ...formData, hasSharedFacilities: e.target.value })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasSharedFacilities"
                value="no"
                checked={formData.hasSharedFacilities === 'no'}
                onChange={(e) =>
                  setFormData({ ...formData, hasSharedFacilities: e.target.value })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating}
          className="w-full rounded-xl bg-primary-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating
            ? 'Generating Assessment...'
            : 'Generate Free Assessment'}
        </button>

        {generated && (
          <div className="rounded-lg bg-success-50 border border-success-200 p-4">
            <p className="text-sm text-success-800 font-medium">
              ✓ Assessment generated successfully! Your PDF has been downloaded.
            </p>
          </div>
        )}
      </form>

      {/* Educational Content */}
      <div className="mt-12 space-y-8">
        {/* Section 1: What is an HMO? */}
        <div className="rounded-xl bg-primary-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            What is an HMO (House in Multiple Occupation)?
          </h3>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              A House in Multiple Occupation (HMO) is a property rented out by at least 3 people who are
              not from one 'household' (e.g., a family) but share facilities like the bathroom and kitchen.
              It's sometimes called a 'house share'.
            </p>
            <p>
              <strong>Why HMO licensing matters:</strong> Operating an unlicensed HMO is a criminal offence
              with serious consequences. Local councils use licensing to ensure HMO properties meet minimum
              safety and management standards.
            </p>
            <p className="text-error-700 font-semibold">
              ⚠️ Penalties for unlicensed HMOs can include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Unlimited fines (commonly £30,000 or more)</li>
              <li>Rent repayment orders forcing you to repay up to 12 months' rent</li>
              <li>Inability to serve Section 21 notices (no-fault evictions)</li>
              <li>Criminal prosecution and record</li>
            </ul>
          </div>
        </div>

        {/* Section 2: Do I Need an HMO License? */}
        <div className="rounded-xl bg-blue-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Do I Need an HMO License?
          </h3>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              <strong>Standard Test (Mandatory Licensing):</strong> Your property definitely needs
              an HMO license if it meets ALL of these conditions:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>It's occupied by 5 or more people</li>
              <li>They form 2 or more separate households</li>
              <li>They share a toilet, bathroom, or kitchen facilities</li>
              <li>It's at least 3 storeys high (in England and Wales)</li>
            </ul>

            <p className="mt-4">
              <strong>Additional Licensing:</strong> Many local councils have introduced additional
              licensing schemes that cover HMOs with 3-4 occupants, or properties in specific areas.
              These schemes vary by council.
            </p>

            <p className="mt-4">
              <strong>Selective Licensing:</strong> Some councils require licensing for ALL rental
              properties (not just HMOs) in certain designated areas, regardless of the number of
              occupants or households.
            </p>

            <p className="mt-4 text-primary-700 font-semibold">
              💡 Always check with your local council to confirm whether your property requires
              licensing. Each council has different requirements and schemes.
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
                How do I know if my property is an HMO?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Your property is an HMO if at least 3 tenants live there, forming more than 1 household,
                and share toilet, bathroom, or kitchen facilities. Use this free checker as a starting
                point, then contact your local council for confirmation. They can tell you if your
                property meets the HMO definition and whether it needs a license.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                What happens if I operate an unlicensed HMO?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Operating an unlicensed HMO is a criminal offence. You can face unlimited fines
                (commonly £30,000+), rent repayment orders forcing you to repay up to 12 months' rent
                to your tenants, and you cannot serve Section 21 notices to end tenancies. You may also
                be prosecuted and end up with a criminal record.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                How much does an HMO license cost?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                HMO license fees vary significantly by council, typically ranging from £500 to £1,500+
                per property. The license usually lasts for 5 years. Contact your local council for
                exact fees. While this may seem expensive, it's far less than the penalties for
                operating without one.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Can I convert my property to an HMO?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                In many areas, you'll need planning permission to convert a property into an HMO,
                especially if you're changing from a single-family dwelling (C3 use class) to an HMO
                (C4 or Sui Generis). Check with your local planning authority before converting. You'll
                also need to meet HMO property standards, which include requirements for room sizes,
                fire safety, and amenities.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Do I need separate tenancy agreements for HMO tenants?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                You can use either individual agreements for each tenant or a single joint agreement
                for all tenants. Individual agreements give you more flexibility (tenants can move out
                independently) but require more administration. Joint agreements make all tenants
                jointly and severally liable for the rent, providing more security. Our paid HMO
                tenancy agreement product (£39.99) includes both options with HMO-specific terms.
              </p>
            </div>
          </div>
        </div>
      </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
