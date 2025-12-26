/**
 * Review Section - Eviction Wizard
 *
 * Step 10: Final review showing blockers, warnings, and documents to be generated.
 *
 * Displays:
 * - Blockers: Cannot proceed until resolved
 * - Warnings: Can proceed but should be aware
 * - Section completion status
 * - Documents that will be generated
 *
 * Legal Context:
 * - Section 8: Form 3 (notice), N5 + N119 (court forms)
 * - Section 21: Form 6A (notice), N5B (accelerated court form)
 */

'use client';

import React, { useMemo } from 'react';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { validateGround8Eligibility } from '@/lib/arrears-engine';

interface WizardSection {
  id: string;
  label: string;
  description: string;
  routes?: ('section_8' | 'section_21')[];
  isComplete: (facts: WizardFacts) => boolean;
  hasBlockers?: (facts: WizardFacts) => string[];
  hasWarnings?: (facts: WizardFacts) => string[];
}

interface ReviewSectionProps {
  facts: WizardFacts;
  jurisdiction: 'england' | 'wales';
  caseId: string;
  sections: WizardSection[];
  onComplete: () => void;
  onJumpToSection: (sectionId: string) => void;
  onUpdate: (updates: Record<string, any>) => void | Promise<void>;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  facts,
  jurisdiction,
  sections,
  onComplete,
  onJumpToSection,
}) => {
  const evictionRoute = facts.eviction_route as 'section_8' | 'section_21' | undefined;

  // Collect all blockers and warnings from all sections
  const { blockers, warnings, incompleteRequired } = useMemo(() => {
    const allBlockers: Array<{ section: string; message: string }> = [];
    const allWarnings: Array<{ section: string; message: string }> = [];
    const incomplete: Array<{ section: string; sectionId: string }> = [];

    sections.forEach((section) => {
      // Check route visibility
      if (section.routes && evictionRoute && !section.routes.includes(evictionRoute)) {
        return; // Skip sections not applicable to this route
      }

      // Skip review section itself
      if (section.id === 'review') return;

      // Check completion
      if (!section.isComplete(facts)) {
        incomplete.push({ section: section.label, sectionId: section.id });
      }

      // Check blockers
      const sectionBlockers = section.hasBlockers?.(facts) || [];
      sectionBlockers.forEach((msg) => {
        allBlockers.push({ section: section.label, message: msg });
      });

      // Check warnings
      const sectionWarnings = section.hasWarnings?.(facts) || [];
      sectionWarnings.forEach((msg) => {
        allWarnings.push({ section: section.label, message: msg });
      });
    });

    // Add ground 8 specific check
    if (evictionRoute === 'section_8') {
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasGround8 = selectedGrounds.some((g) => g.includes('Ground 8'));

      if (hasGround8) {
        const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];

        if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
          allBlockers.push({
            section: 'Arrears Schedule',
            message: 'Ground 8 requires a completed arrears schedule',
          });
        } else {
          const validation = validateGround8Eligibility({
            arrears_items: arrearsItems,
            rent_amount: facts.rent_amount || 0,
            rent_frequency: facts.rent_frequency || 'monthly',
            jurisdiction: 'england',
          });

          if (!validation.is_eligible) {
            allBlockers.push({
              section: 'Arrears Schedule',
              message: `Ground 8 threshold not met: ${validation.arrears_in_months?.toFixed(2) || 0} months arrears (minimum 2 required)`,
            });
          }
        }
      }
    }

    return { blockers: allBlockers, warnings: allWarnings, incompleteRequired: incomplete };
  }, [sections, facts, evictionRoute]);

  // Determine documents to generate
  const documentsToGenerate = useMemo(() => {
    const docs: Array<{ name: string; description: string }> = [];

    if (evictionRoute === 'section_21') {
      docs.push(
        { name: 'Form 6A', description: 'Section 21 Notice seeking possession' },
        { name: 'N5B', description: 'Claim form for accelerated possession (Section 21)' },
      );
    } else if (evictionRoute === 'section_8') {
      docs.push(
        { name: 'Form 3', description: 'Section 8 Notice seeking possession' },
        { name: 'N5', description: 'Claim form for possession (Section 8)' },
        { name: 'N119', description: 'Particulars of claim for possession' },
      );

      // Add arrears schedule if arrears grounds
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasArrearsGround = selectedGrounds.some((g) =>
        ['Ground 8', 'Ground 10', 'Ground 11'].some((ag) => g.includes(ag))
      );
      if (hasArrearsGround) {
        docs.push({ name: 'Arrears Schedule', description: 'Detailed rent arrears breakdown' });
      }
    }

    // Always include roadmap
    docs.push({ name: 'Eviction Roadmap', description: 'Next steps guide for your claim' });

    return docs;
  }, [evictionRoute, facts.section8_grounds]);

  const canProceed = blockers.length === 0 && incompleteRequired.length === 0;

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className={`p-4 rounded-lg border ${
        canProceed
          ? 'bg-green-50 border-green-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <h3 className={`text-lg font-medium ${
          canProceed ? 'text-green-900' : 'text-amber-900'
        }`}>
          {canProceed
            ? '✓ Ready to Generate Documents'
            : '⚠ Please Resolve Issues Before Proceeding'
          }
        </h3>
        <p className={`text-sm mt-1 ${
          canProceed ? 'text-green-800' : 'text-amber-800'
        }`}>
          {evictionRoute === 'section_21'
            ? 'England Section 21 Complete Pack'
            : 'England Section 8 Complete Pack'
          }
        </p>
      </div>

      {/* Incomplete Sections */}
      {incompleteRequired.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Incomplete Sections ({incompleteRequired.length})
          </h4>
          <div className="space-y-2">
            {incompleteRequired.map((item) => (
              <div
                key={item.sectionId}
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <span className="text-sm text-gray-700">{item.section}</span>
                <button
                  type="button"
                  onClick={() => onJumpToSection(item.sectionId)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Complete →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-900">
            Blockers - Must Fix ({blockers.length})
          </h4>
          <div className="space-y-2">
            {blockers.map((blocker, i) => (
              <div
                key={i}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-800">
                  <strong>{blocker.section}:</strong> {blocker.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-amber-900">
            Warnings - Review Recommended ({warnings.length})
          </h4>
          <div className="space-y-2">
            {warnings.map((warning, i) => (
              <div
                key={i}
                className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <p className="text-sm text-amber-800">
                  <strong>{warning.section}:</strong> {warning.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Status Summary */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Section Status</h4>
        <div className="grid grid-cols-2 gap-2">
          {sections
            .filter((s) => s.id !== 'review')
            .filter((s) => !s.routes || !evictionRoute || s.routes.includes(evictionRoute))
            .map((section) => {
              const isComplete = section.isComplete(facts);
              const hasIssues = (section.hasBlockers?.(facts) || []).length > 0;

              return (
                <button
                  key={section.id}
                  onClick={() => onJumpToSection(section.id)}
                  className={`
                    flex items-center justify-between p-2 rounded-md text-left text-sm transition-colors
                    ${isComplete && !hasIssues
                      ? 'bg-green-50 text-green-800 hover:bg-green-100'
                      : hasIssues
                        ? 'bg-red-50 text-red-800 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {isComplete && !hasIssues && (
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {hasIssues && (
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {!isComplete && !hasIssues && (
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                    )}
                    {section.label}
                  </span>
                  <span className="text-xs">Edit</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Documents to Generate */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Documents to Generate</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {documentsToGenerate.map((doc) => (
            <div
              key={doc.name}
              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">{doc.name}</p>
                <p className="text-xs text-blue-700">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onComplete}
          disabled={!canProceed}
          className={`
            w-full py-3 px-6 text-base font-medium rounded-lg transition-colors
            ${canProceed
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {canProceed
            ? 'Generate Complete Pack'
            : 'Resolve Issues to Continue'
          }
        </button>

        {canProceed && (
          <p className="text-xs text-center text-gray-500 mt-2">
            This will generate all documents ready for submission to the court.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
