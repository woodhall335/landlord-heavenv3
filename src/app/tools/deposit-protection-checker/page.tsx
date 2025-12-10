'use client';

import { useState } from 'react';
import { FreeToolLayout } from '@/components/tools/FreeToolLayout';

export default function DepositProtectionChecker() {
  const [formData, setFormData] = useState({
    depositAmount: '',
    protectionScheme: '',
    dateProtected: '',
    prescribedInfoGiven: '',
    howToRentGuideProvided: '',
    jurisdiction: 'england-wales',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const calculateRiskScore = () => {
    let score = 0;

    // Critical issues (automatic invalid)
    if (formData.protectionScheme === 'not_protected') return 10;
    if (formData.prescribedInfoGiven === 'no') return 9;

    // High risk issues
    if (formData.protectionScheme === 'dont_know') score += 7;
    if (formData.prescribedInfoGiven === 'not_sure') score += 5;
    if (formData.howToRentGuideProvided === 'no' && formData.jurisdiction === 'england-wales') score += 4;
    if (formData.howToRentGuideProvided === 'not_sure' && formData.jurisdiction === 'england-wales') score += 2;

    return Math.min(score, 10);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Import pdf-lib dynamically
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      // Calculate validity and risk
      const isValid = (
        formData.protectionScheme !== 'not_protected' &&
        formData.protectionScheme !== 'dont_know' &&
        formData.prescribedInfoGiven === 'yes' &&
        (formData.jurisdiction !== 'england-wales' || formData.howToRentGuideProvided === 'yes')
      );

      const status = isValid ? 'VALID' :
                     formData.protectionScheme === 'not_protected' ? 'INVALID' : 'AT RISK';

      const riskScore = calculateRiskScore();

      // Create PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();

      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let yPosition = height - 80;

      // Watermark
      page.drawText('FREE ASSESSMENT - NOT LEGAL ADVICE', {
        x: 80,
        y: height / 2,
        size: 40,
        font: boldFont,
        color: rgb(0.9, 0.9, 0.9),
        rotate: { angle: Math.PI / 4, origin: { x: width / 2, y: height / 2 } },
      });

      // Title
      page.drawText('DEPOSIT PROTECTION COMPLIANCE CHECK', {
        x: 50,
        y: yPosition,
        size: 18,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      page.drawText('Section 21 Validity Assessment', {
        x: 50,
        y: yPosition,
        size: 10,
        font: regularFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 40;

      // Deposit Details
      page.drawText('DEPOSIT DETAILS', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      page.drawText(`Deposit Amount: £${formData.depositAmount}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const schemeLabels: Record<string, string> = {
        'dps': 'DPS (Deposit Protection Service)',
        'mydeposits': 'MyDeposits',
        'tds': 'TDS (Tenancy Deposit Scheme)',
        'not_protected': 'Not Protected',
        'dont_know': 'Don\'t Know',
      };

      page.drawText(`Protection Scheme: ${schemeLabels[formData.protectionScheme] || formData.protectionScheme}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      if (formData.dateProtected) {
        page.drawText(`Date Protected: ${new Date(formData.dateProtected).toLocaleDateString('en-GB')}`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;
      }

      const jurisdictionLabels: Record<string, string> = {
        'england-wales': 'England & Wales',
        'scotland': 'Scotland',
        'northern-ireland': 'Northern Ireland',
      };

      page.drawText(`Jurisdiction: ${jurisdictionLabels[formData.jurisdiction]}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 40;

      // Compliance Status
      page.drawText('COMPLIANCE STATUS', {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 25;

      const statusColor = status === 'VALID' ? rgb(0.1, 0.6, 0.1) :
                          status === 'INVALID' ? rgb(0.8, 0.1, 0.1) :
                          rgb(0.9, 0.6, 0);

      page.drawText(`Status: ${status}`, {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: statusColor,
      });
      yPosition -= 30;

      // Risk Score
      const riskLevel = riskScore >= 7 ? 'HIGH RISK' :
                        riskScore >= 4 ? 'MEDIUM RISK' : 'LOW RISK';
      const riskColor = riskScore >= 7 ? rgb(0.8, 0.1, 0.1) :
                        riskScore >= 4 ? rgb(0.9, 0.6, 0) :
                        rgb(0.1, 0.6, 0.1);

      page.drawText(`Risk Score: ${riskScore}/10 (${riskLevel})`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: riskColor,
      });
      yPosition -= 40;

      // Compliance Issues
      page.drawText('COMPLIANCE CHECKLIST', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const checks = [
        {
          label: 'Deposit protected in approved scheme',
          status: formData.protectionScheme !== 'not_protected' && formData.protectionScheme !== 'dont_know',
        },
        {
          label: 'Prescribed information provided',
          status: formData.prescribedInfoGiven === 'yes',
        },
        {
          label: 'How to Rent guide provided (England only)',
          status: formData.jurisdiction !== 'england-wales' || formData.howToRentGuideProvided === 'yes',
        },
      ];

      checks.forEach((check) => {
        const checkmark = check.status ? '✓' : '✗';
        const checkColor = check.status ? rgb(0.1, 0.6, 0.1) : rgb(0.8, 0.1, 0.1);

        page.drawText(`${checkmark}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: checkColor,
        });

        page.drawText(check.label, {
          x: 70,
          y: yPosition,
          size: 10,
          font: regularFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= 20;
      });

      yPosition -= 20;

      // Specific Issues
      const issues: string[] = [];

      if (formData.protectionScheme === 'not_protected') {
        issues.push('CRITICAL: Deposit not protected - Section 21 invalid');
      }
      if (formData.protectionScheme === 'dont_know') {
        issues.push('Cannot confirm deposit protection status');
      }
      if (formData.prescribedInfoGiven === 'no') {
        issues.push('CRITICAL: Prescribed information not provided - Section 21 invalid');
      }
      if (formData.prescribedInfoGiven === 'not_sure') {
        issues.push('Cannot confirm prescribed information provided');
      }
      if (formData.jurisdiction === 'england-wales' && formData.howToRentGuideProvided === 'no') {
        issues.push('How to Rent guide not provided - Section 21 may be invalid');
      }

      if (issues.length > 0) {
        page.drawText('ISSUES IDENTIFIED:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: rgb(0.8, 0.1, 0.1),
        });
        yPosition -= 20;

        issues.forEach((issue) => {
          const words = issue.split(' ');
          let line = '';
          const lines: string[] = [];

          words.forEach((word) => {
            const testLine = line + word + ' ';
            if (testLine.length * 5.5 > width - 100) {
              lines.push(line.trim());
              line = word + ' ';
            } else {
              line = testLine;
            }
          });
          if (line.trim()) lines.push(line.trim());

          lines.forEach((textLine) => {
            page.drawText(`• ${textLine}`, {
              x: 50,
              y: yPosition,
              size: 9,
              font: regularFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= 16;
          });
        });

        yPosition -= 10;
      }

      // Legal Consequences
      page.drawText('LEGAL CONSEQUENCES OF NON-COMPLIANCE', {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      const consequences = [
        'Section 21 notice will be invalid',
        'Penalty: 1-3x the deposit amount',
        'Tenant can apply to court for compensation',
        'Cannot evict using Section 21 until compliant',
      ];

      consequences.forEach((item) => {
        page.drawText(`• ${item}`, {
          x: 50,
          y: yPosition,
          size: 9,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 16;
      });

      yPosition -= 20;

      // Recommendations
      if (!isValid) {
        page.drawText('RECOMMENDED ACTIONS:', {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        const recommendations: string[] = [];

        if (formData.protectionScheme === 'not_protected') {
          recommendations.push('Protect the deposit in an approved scheme immediately');
        }
        if (formData.prescribedInfoGiven !== 'yes') {
          recommendations.push('Provide prescribed information to tenant in writing');
        }
        if (formData.jurisdiction === 'england-wales' && formData.howToRentGuideProvided !== 'yes') {
          recommendations.push('Provide latest How to Rent guide to tenant');
        }
        recommendations.push('Consult a solicitor before serving Section 21');
        recommendations.push('Consider using our Complete Eviction Pack (£149.99)');

        recommendations.forEach((rec) => {
          const words = rec.split(' ');
          let line = '';
          const lines: string[] = [];

          words.forEach((word) => {
            const testLine = line + word + ' ';
            if (testLine.length * 5.5 > width - 100) {
              lines.push(line.trim());
              line = word + ' ';
            } else {
              line = testLine;
            }
          });
          if (line.trim()) lines.push(line.trim());

          lines.forEach((textLine) => {
            page.drawText(`• ${textLine}`, {
              x: 50,
              y: yPosition,
              size: 9,
              font: regularFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= 16;
          });
        });
      }

      // Disclaimers
      page.drawText('DISCLAIMER: This is not legal advice. Consult a qualified solicitor for legal guidance.', {
        x: 50,
        y: 80,
        size: 8,
        font: boldFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText('FREE VERSION - For court-ready eviction documents, upgrade to our Complete Pack.', {
        x: 50,
        y: 65,
        size: 8,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      page.drawText(`Generated: ${new Date().toLocaleDateString('en-GB')} | Landlord Heaven`, {
        x: 50,
        y: 50,
        size: 8,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Save and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Deposit-Protection-Check-FREE-${Date.now()}.pdf`;
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
    formData.depositAmount &&
    formData.protectionScheme &&
    formData.prescribedInfoGiven &&
    (formData.jurisdiction !== 'england-wales' || formData.howToRentGuideProvided);

  return (
    <FreeToolLayout
      title="Free Deposit Protection Checker"
      description="Check if your deposit protection is compliant and verify Section 21 validity. Free instant assessment for UK landlords."
      paidVersion={{
        price: '£149.99',
        features: [
          'Complete Section 8 & Section 21 notices',
          'All official HMCTS court forms',
          'Evidence bundle templates',
          'Compliance checks included',
          'Ask Heaven AI guidance',
          'Court-ready from day one',
        ],
        href: '/products/complete-pack',
      }}
    >
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Check Your Deposit Protection Compliance
      </h2>

      <form className="space-y-6">
        {/* Jurisdiction */}
        <div>
          <label
            htmlFor="jurisdiction"
            className="block text-sm font-medium text-gray-700"
          >
            Jurisdiction <span className="text-error-500">*</span>
          </label>
          <select
            id="jurisdiction"
            value={formData.jurisdiction}
            onChange={(e) =>
              setFormData({ ...formData, jurisdiction: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
          >
            <option value="england-wales">England & Wales</option>
            <option value="scotland">Scotland</option>
            <option value="northern-ireland">Northern Ireland</option>
          </select>
        </div>

        {/* Deposit Amount */}
        <div>
          <label
            htmlFor="depositAmount"
            className="block text-sm font-medium text-gray-700"
          >
            Deposit Amount (£) <span className="text-error-500">*</span>
          </label>
          <input
            type="number"
            id="depositAmount"
            value={formData.depositAmount}
            onChange={(e) =>
              setFormData({ ...formData, depositAmount: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
            placeholder="e.g., 1500"
            min="0"
            step="0.01"
          />
        </div>

        {/* Protection Scheme */}
        <div>
          <label
            htmlFor="protectionScheme"
            className="block text-sm font-medium text-gray-700"
          >
            Deposit Protection Scheme <span className="text-error-500">*</span>
          </label>
          <select
            id="protectionScheme"
            value={formData.protectionScheme}
            onChange={(e) =>
              setFormData({ ...formData, protectionScheme: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
          >
            <option value="">Select protection scheme</option>
            <option value="dps">DPS (Deposit Protection Service)</option>
            <option value="mydeposits">MyDeposits</option>
            <option value="tds">TDS (Tenancy Deposit Scheme)</option>
            <option value="not_protected">Not Protected</option>
            <option value="dont_know">Don't Know</option>
          </select>
        </div>

        {/* Date Protected */}
        <div>
          <label
            htmlFor="dateProtected"
            className="block text-sm font-medium text-gray-700"
          >
            Date Deposit Was Protected
          </label>
          <input
            type="date"
            id="dateProtected"
            value={formData.dateProtected}
            onChange={(e) =>
              setFormData({ ...formData, dateProtected: e.target.value })
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be within 30 days of receiving the deposit
          </p>
        </div>

        {/* Prescribed Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Was prescribed information provided to the tenant?{' '}
            <span className="text-error-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="prescribedInfoGiven"
                value="yes"
                checked={formData.prescribedInfoGiven === 'yes'}
                onChange={(e) =>
                  setFormData({ ...formData, prescribedInfoGiven: e.target.value })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="prescribedInfoGiven"
                value="no"
                checked={formData.prescribedInfoGiven === 'no'}
                onChange={(e) =>
                  setFormData({ ...formData, prescribedInfoGiven: e.target.value })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="prescribedInfoGiven"
                value="not_sure"
                checked={formData.prescribedInfoGiven === 'not_sure'}
                onChange={(e) =>
                  setFormData({ ...formData, prescribedInfoGiven: e.target.value })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Not Sure</span>
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Includes deposit certificate and scheme details
          </p>
        </div>

        {/* How to Rent Guide (England & Wales only) */}
        {formData.jurisdiction === 'england-wales' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Was the How to Rent guide provided? (England only){' '}
              <span className="text-error-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="howToRentGuideProvided"
                  value="yes"
                  checked={formData.howToRentGuideProvided === 'yes'}
                  onChange={(e) =>
                    setFormData({ ...formData, howToRentGuideProvided: e.target.value })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="howToRentGuideProvided"
                  value="no"
                  checked={formData.howToRentGuideProvided === 'no'}
                  onChange={(e) =>
                    setFormData({ ...formData, howToRentGuideProvided: e.target.value })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="howToRentGuideProvided"
                  value="not_sure"
                  checked={formData.howToRentGuideProvided === 'not_sure'}
                  onChange={(e) =>
                    setFormData({ ...formData, howToRentGuideProvided: e.target.value })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Not Sure</span>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Latest version from gov.uk required
            </p>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating}
          className="w-full rounded-xl bg-primary-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isGenerating
            ? 'Generating Assessment...'
            : 'Check Compliance (Free Watermarked)'}
        </button>

        {generated && (
          <div className="rounded-lg bg-success-50 border border-success-200 p-4">
            <p className="text-sm text-success-800 font-medium">
              ✓ Compliance check completed! Your PDF has been downloaded.
            </p>
          </div>
        )}
      </form>

      {/* Educational Content */}
      <div className="mt-12 space-y-8">
        {/* Section 1 */}
        <div className="rounded-xl bg-primary-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Why Deposit Protection Matters
          </h3>
          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              Tenancy deposit protection is a legal requirement in England, Wales, Scotland, and
              Northern Ireland. If you fail to protect your tenant's deposit correctly, your
              Section 21 notice (no-fault eviction) will be <strong>automatically invalid</strong>.
            </p>
            <p>
              <strong className="text-error-700">Penalties for non-compliance:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Court can order you to pay the tenant 1-3 times the deposit amount</li>
              <li>Cannot serve a valid Section 21 notice until compliant</li>
              <li>Tenant can apply to court at any time during or after the tenancy</li>
              <li>Costs and legal fees can exceed £5,000+</li>
            </ul>
            <p className="text-primary-700 font-semibold mt-4">
              💡 Even if you protect the deposit now, a Section 21 may still be invalid if it
              wasn't protected within 30 days of receiving it.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="rounded-xl bg-blue-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            The Three Requirements for Valid Section 21
          </h3>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                1. Protect the Deposit (Within 30 Days)
              </h4>
              <p>
                You must protect the deposit in a government-approved scheme within 30 days of
                receiving it. The approved schemes are: DPS (Deposit Protection Service), MyDeposits,
                and TDS (Tenancy Deposit Scheme). You can choose custodial (scheme holds deposit) or
                insured (you hold deposit, but pay insurance fee).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                2. Provide Prescribed Information
              </h4>
              <p>
                Within 30 days of protecting the deposit, you must give the tenant "prescribed
                information" in writing. This includes: which scheme protects the deposit, your contact
                details, the tenant's rights and responsibilities, what to do if there's a dispute,
                and how to apply for the deposit to be released.
              </p>
              <p className="mt-2 text-primary-700">
                The deposit protection scheme will provide you with the prescribed information
                certificate when you protect the deposit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                3. Serve the How to Rent Guide (England Only)
              </h4>
              <p>
                In England, you must provide the tenant with the latest version of the government's
                "How to Rent" guide at the start of the tenancy. This requirement was introduced in
                October 2015. Use the latest version from gov.uk.
              </p>
              <p className="mt-2 text-warning-700 font-semibold">
                ⚠️ This is England-only. Scotland and Northern Ireland have different requirements.
              </p>
            </div>
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
                What happens if I didn't protect the deposit?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                If you didn't protect the deposit within 30 days, you cannot serve a valid Section 21
                notice. The tenant can apply to court for a penalty of 1-3x the deposit amount. You
                should protect the deposit now and provide prescribed information, but this won't
                make a Section 21 valid retroactively. Consider negotiating with the tenant or using
                Section 8 grounds instead if you need to evict.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Can I protect the deposit now and serve a Section 21?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                If you protect the deposit late (after 30 days), a Section 21 notice served
                immediately afterward will likely be invalid. Courts have ruled that late protection
                doesn't automatically fix the problem. You should protect it now to avoid further
                penalties, but consult a solicitor before serving Section 21. Our Complete Eviction
                Pack (£149.99) includes compliance checks and Ask Heaven AI guidance.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                What is "prescribed information"?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Prescribed information is a document you must give to the tenant (and any landlord
                or agent) within 30 days of protecting the deposit. It tells the tenant: which
                government-approved scheme is protecting their deposit, your contact details, the
                deposit amount and address of the property, how the deposit is protected, what to do
                if there's a dispute about the deposit, and how to apply for the deposit back. The
                deposit protection scheme provides this document when you register.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                Do Scottish landlords need to provide How to Rent?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                No, the "How to Rent" guide requirement only applies in England. Scotland has its
                own tenancy laws and doesn't use Section 21 notices at all. Scottish landlords must
                still protect deposits (in SafeDeposits Scotland, MyDeposits Scotland, or Letting
                Protection Service Scotland), but the specific documentation requirements differ.
                Northern Ireland also has separate rules.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900">
                What if I lost the deposit certificate?
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                If you've lost the prescribed information certificate, contact your deposit protection
                scheme. They can provide you with a replacement certificate or confirmation that the
                deposit is protected. You should have provided this to the tenant within 30 days of
                protection. If you didn't, provide it now - but note that late provision may still
                affect Section 21 validity. Keep digital and physical copies of all deposit documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FreeToolLayout>
  );
}
