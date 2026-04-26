/**
 * Review Section - Eviction Wizard
 *
 * Final review for the public eviction products.
 *
 * The review step should feel like a landlord file review:
 * - what is being prepared
 * - what must be fixed before continuing
 * - what could cause problems later
 * - what the pack includes
 */

'use client';

import React, { useMemo } from 'react';
import { DocumentProofShowcase } from '@/components/preview';
import type { WizardFacts } from '@/lib/case-facts/schema';
import { validateGround8Eligibility } from '@/lib/arrears-engine';
import { getPackContents } from '@/lib/products/pack-contents';
import { buildEnglandPackProofEntries } from './buildEnglandPackProofEntries';
import {
  RiArrowDownCircleLine,
  RiCalendarLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiFileTextLine,
} from 'react-icons/ri';
import { calculateFilingWindow, formatDate } from '@/lib/validators/s21-court-pack';

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
  caseId,
  sections,
  onComplete,
  onJumpToSection,
}) => {
  const evictionRoute = facts.eviction_route as 'section_8' | 'section_21' | undefined;

  const filingWindowInfo = useMemo(() => {
    if (jurisdiction !== 'wales' || evictionRoute !== 'section_21') return null;

    const serviceDate = facts.notice_service_date as string | undefined;
    const possessionDate = facts.notice_expiry_date as string | undefined;

    if (!serviceDate || !possessionDate) return null;

    return calculateFilingWindow(serviceDate, possessionDate);
  }, [evictionRoute, facts.notice_expiry_date, facts.notice_service_date, jurisdiction]);

  const { blockers, warnings, incompleteRequired } = useMemo(() => {
    const allBlockers: Array<{ section: string; message: string }> = [];
    const allWarnings: Array<{ section: string; message: string }> = [];
    const incomplete: Array<{ section: string; sectionId: string }> = [];

    sections.forEach((section) => {
      if (section.routes && evictionRoute && !section.routes.includes(evictionRoute)) return;
      if (section.id === 'review') return;

      if (!section.isComplete(facts)) {
        incomplete.push({ section: section.label, sectionId: section.id });
      }

      (section.hasBlockers?.(facts) || []).forEach((message) => {
        allBlockers.push({ section: section.label, message });
      });

      (section.hasWarnings?.(facts) || []).forEach((message) => {
        allWarnings.push({ section: section.label, message });
      });
    });

    if (evictionRoute === 'section_8') {
      const selectedGrounds = (facts.section8_grounds as string[]) || [];
      const hasGround8 = selectedGrounds.some((ground) => ground.includes('Ground 8'));

      if (hasGround8) {
        const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];

        if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
          allBlockers.push({
            section: 'Arrears Schedule',
            message: 'Ground 8 requires a completed arrears schedule before the notice and claim file can be generated cleanly.',
          });
        } else {
          const validation = validateGround8Eligibility({
            arrears_items: arrearsItems,
            rent_amount: facts.rent_amount || 0,
            rent_frequency: facts.rent_frequency || 'monthly',
            jurisdiction: jurisdiction === 'england' ? 'england' : 'wales',
          });

          if (!validation.is_eligible) {
            allBlockers.push({
              section: 'Arrears Schedule',
              message: `Ground 8 threshold not met yet: ${validation.arrears_in_months?.toFixed(2) || 0} months arrears recorded (${validation.threshold_label || `${validation.threshold_months} months`} required).`,
            });
          }
        }
      }
    }

    return { blockers: allBlockers, warnings: allWarnings, incompleteRequired: incomplete };
  }, [evictionRoute, facts, jurisdiction, sections]);

  const documentsToGenerate = useMemo(() => {
    const arrearsItems = facts.issues?.rent_arrears?.arrears_items || facts.arrears_items || [];
    if (jurisdiction === 'england') {
      return getPackContents({
        product: 'complete_pack',
        jurisdiction,
        route: evictionRoute,
        grounds: (facts.section8_grounds as string[]) || [],
        has_arrears: Boolean(arrearsItems.length),
        include_arrears_schedule: Boolean(arrearsItems.length),
      }).map((item) => ({
        name: item.title,
        description: item.description || 'Included in the generated possession pack.',
      }));
    }

    if (evictionRoute === 'section_21') {
      return [
        { name: 'Form 6A', description: 'Section 21 notice seeking possession.' },
        { name: 'N5B', description: 'Accelerated possession claim form.' },
        { name: 'Case roadmap', description: 'Next steps guide for the possession claim.' },
      ];
    }

    return [
      { name: 'Form 3 notice', description: 'Section 8 notice seeking possession.' },
      { name: 'N5', description: 'Claim form for possession.' },
      { name: 'N119', description: 'Particulars of claim for possession.' },
      { name: 'Arrears schedule', description: 'Detailed rent arrears breakdown where rent grounds are used.' },
      { name: 'Case roadmap', description: 'Next steps guide for the possession claim.' },
    ];
  }, [evictionRoute, facts.arrears_items, facts.issues?.rent_arrears?.arrears_items, facts.section8_grounds, jurisdiction]);

  const filingWindowBlocker = filingWindowInfo?.warning?.blocking
    ? { section: 'Filing window', message: filingWindowInfo.warning.message }
    : null;
  const filingWindowWarning =
    filingWindowInfo?.warning && !filingWindowInfo.warning.blocking
      ? { section: 'Filing window', message: filingWindowInfo.warning.message }
      : null;

  const blockerItems = filingWindowBlocker ? [...blockers, filingWindowBlocker] : blockers;
  const warningItems = filingWindowWarning ? [...warnings, filingWindowWarning] : warnings;
  const canProceed = blockerItems.length === 0 && incompleteRequired.length === 0;

  const caseProofEntries =
    jurisdiction === 'england' && evictionRoute === 'section_8'
      ? buildEnglandPackProofEntries({
          product: 'complete_pack',
          caseId,
          facts,
        })
      : [];

  const packTitle =
    jurisdiction === 'england'
      ? 'Complete Eviction Pack'
      : evictionRoute === 'section_21'
        ? 'Section 21 possession pack'
        : 'Section 8 possession pack';

  const packDescription =
    jurisdiction === 'england'
      ? 'You are preparing the current England possession notice, court claim forms, and the supporting documents needed to file a full possession case.'
      : evictionRoute === 'section_21'
        ? 'You are preparing a Section 21 notice and the accelerated possession paperwork for this claim.'
        : 'You are preparing a Section 8 notice and the supporting court forms for this claim.';

  return (
    <div className="space-y-8">
      <section
        className={`rounded-[1.6rem] border px-5 py-5 shadow-sm ${
          canProceed ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'
        }`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-75">Review your pack</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">
          {canProceed ? 'This pack is ready to generate' : 'You still need to fix a few things before this pack is ready'}
        </h3>
        <p className="mt-2 text-sm leading-6 opacity-90">{packTitle}</p>
      </section>

      <ReviewCard title="What you are preparing" description={packDescription}>
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryValue label="File reference" value={caseId} />
          <SummaryValue label="Jurisdiction" value={jurisdiction === 'england' ? 'England' : 'Wales'} />
          <SummaryValue
            label="Route"
            value={
              jurisdiction === 'england'
                ? 'Form 3A possession route'
                : evictionRoute === 'section_21'
                  ? 'Section 21 possession route'
                  : 'Section 8 possession route'
            }
          />
          <SummaryValue
            label="Notice served"
            value={facts.notice_service_date ? formatDate(facts.notice_service_date as string) : 'Not yet recorded'}
          />
        </div>
      </ReviewCard>

      {caseProofEntries.length > 0 ? (
        <DocumentProofShowcase
          compact
          title="Actual draft checkpoints from this case"
          description="These live first-page previews help you sense-check the actual notice, court-form, service, and witness paperwork before you pay for the full pack."
          entries={caseProofEntries}
        />
      ) : null}

      <ReviewListCard
        title="What must be fixed before you continue"
        emptyTitle="No blocker-level issues are showing"
        emptyDescription="The pack is not missing any required answers or blocker-level checks at the moment."
        tone="danger"
        items={[
          ...incompleteRequired.map((item) => ({
            section: item.section,
            message: 'This section still needs to be completed before the full pack can be generated cleanly.',
            sectionId: item.sectionId,
          })),
          ...blockerItems.map((item) => ({
            section: item.section,
            message: item.message,
          })),
        ]}
        onJumpToSection={onJumpToSection}
      />

      <ReviewListCard
        title="What could slow things down later"
        emptyTitle="No extra warnings right now"
        emptyDescription="There are no non-blocking warnings showing for the current facts."
        tone="warning"
        items={warningItems.map((item) => ({
          section: item.section,
          message: item.message,
        }))}
      />

      <ReviewCard
        title="Included in your pack"
        description="These are the documents this product prepares from the answers you have given."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {documentsToGenerate.map((doc) => (
            <div
              key={doc.name}
              className="flex items-start gap-3 rounded-2xl border border-[#e7dbff] bg-[#faf7ff] px-4 py-4"
            >
              <RiFileTextLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#7C3AED]" />
              <div>
                <p className="text-sm font-semibold text-[#27134a]">{doc.name}</p>
                <p className="mt-1 text-sm leading-6 text-[#62597c]">{doc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ReviewCard>

      {filingWindowInfo?.warning && (
        <div
          className={`rounded-[1.4rem] border p-4 ${
            filingWindowInfo.warning.severity === 'error' ? 'border-red-300 bg-red-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <RiCalendarLine
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                filingWindowInfo.warning.severity === 'error' ? 'text-red-500' : 'text-amber-500'
              }`}
            />
            <div className="flex-1">
              <h4
                className={`font-medium ${
                  filingWindowInfo.warning.severity === 'error' ? 'text-red-900' : 'text-amber-900'
                }`}
              >
                Filing window check
              </h4>
              <p
                className={`mt-1 text-sm ${
                  filingWindowInfo.warning.severity === 'error' ? 'text-red-800' : 'text-amber-800'
                }`}
              >
                {filingWindowInfo.warning.message}
              </p>
              {filingWindowInfo.warning.helpText && (
                <p
                  className={`mt-2 text-sm ${
                    filingWindowInfo.warning.severity === 'error' ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  {filingWindowInfo.warning.helpText}
                </p>
              )}
              {filingWindowInfo.windowDays > 0 && (
                <div
                  className={`mt-3 rounded-xl px-3 py-3 ${
                    filingWindowInfo.warning.severity === 'error' ? 'bg-red-100' : 'bg-amber-100'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                      filingWindowInfo.warning.severity === 'error' ? 'text-red-900' : 'text-amber-900'
                    }`}
                  >
                    Key dates
                  </p>
                  <ul
                    className={`mt-2 space-y-1 text-sm ${
                      filingWindowInfo.warning.severity === 'error' ? 'text-red-800' : 'text-amber-800'
                    }`}
                  >
                    <li>Earliest court application: {formatDate(facts.notice_expiry_date as string)}</li>
                    <li>Notice expires: {formatDate(filingWindowInfo.expiryDate)}</li>
                    <li>Filing window: {filingWindowInfo.windowDays} days</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ReviewCard
        title="Sections in this pack"
        description="Use these to jump back and tighten anything that still needs attention."
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {sections
            .filter((section) => section.id !== 'review')
            .filter((section) => !section.routes || !evictionRoute || section.routes.includes(evictionRoute))
            .map((section) => {
              const isComplete = section.isComplete(facts);
              const hasIssues = (section.hasBlockers?.(facts) || []).length > 0;

              return (
                <button
                  key={section.id}
                  onClick={() => onJumpToSection(section.id)}
                  className={`
                    flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors
                    ${isComplete && !hasIssues
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      : hasIssues
                        ? 'border-red-200 bg-red-50 text-red-900 hover:bg-red-100'
                        : 'border-[#e7dbff] bg-white text-[#584e73] hover:bg-[#faf7ff]'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {isComplete && !hasIssues ? <RiCheckLine className="h-4 w-4 text-[#7C3AED]" /> : null}
                    {hasIssues ? <RiErrorWarningLine className="h-4 w-4 text-[#7C3AED]" /> : null}
                    {!isComplete && !hasIssues ? <RiArrowDownCircleLine className="h-4 w-4 text-[#7C3AED]" /> : null}
                    {section.label}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">Edit</span>
                </button>
              );
            })}
        </div>
      </ReviewCard>

      <div className="border-t border-[#ebe4ff] pt-2">
        <button
          type="button"
          onClick={onComplete}
          disabled={!canProceed}
          className={`
            w-full rounded-2xl px-6 py-4 text-base font-semibold transition-colors
            ${canProceed
              ? 'bg-[linear-gradient(135deg,#7c3aed,#5b21b6)] text-white shadow-[0_20px_40px_rgba(91,33,182,0.28)] hover:brightness-105'
              : 'cursor-not-allowed bg-gray-200 text-gray-500'
            }
          `}
        >
          {canProceed ? 'Continue to generate the complete pack' : 'Fix the issues above to continue'}
        </button>
        <p className="mt-3 text-center text-sm text-[#6a627f]">
          {canProceed
            ? 'You will be able to preview the paperwork again before payment.'
            : 'Use the section links above to finish the file cleanly before generating.'}
        </p>
      </div>
    </div>
  );
};

function ReviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-[#e7dbff] bg-white px-5 py-5 shadow-sm">
      <h4 className="text-lg font-semibold tracking-tight text-[#20103f]">{title}</h4>
      {description ? <p className="mt-2 text-sm leading-6 text-[#62597c]">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ReviewListCard({
  title,
  emptyTitle,
  emptyDescription,
  tone,
  items,
  onJumpToSection,
}: {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  tone: 'danger' | 'warning';
  items: Array<{ section: string; message: string; sectionId?: string }>;
  onJumpToSection?: (sectionId: string) => void;
}) {
  const styles =
    tone === 'danger'
      ? {
          container: 'border-red-200 bg-red-50',
          title: 'text-red-900',
          body: 'text-red-800',
        }
      : {
          container: 'border-amber-200 bg-amber-50',
          title: 'text-amber-900',
          body: 'text-amber-800',
        };

  return (
    <section className={`rounded-[1.6rem] border px-5 py-5 ${styles.container}`}>
      <h4 className={`text-lg font-semibold tracking-tight ${styles.title}`}>{title}</h4>
      {items.length === 0 ? (
        <div className="mt-3">
          <p className={`text-sm font-medium ${styles.title}`}>{emptyTitle}</p>
          <p className={`mt-1 text-sm leading-6 ${styles.body}`}>{emptyDescription}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div key={`${item.section}-${index}`} className="rounded-2xl border border-white/70 bg-white/75 px-4 py-4">
              {(() => {
                const sectionId = item.sectionId;
                return (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-sm font-semibold ${styles.title}`}>{item.section}</p>
                  <p className={`mt-1 text-sm leading-6 ${styles.body}`}>{item.message}</p>
                </div>
                {sectionId && onJumpToSection ? (
                  <button
                    type="button"
                    onClick={() => onJumpToSection(sectionId)}
                    className="rounded-full border border-current/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#7C3AED]"
                  >
                    Edit
                  </button>
                ) : null}
              </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ece4ff] bg-[#faf7ff] px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b56d8]">{label}</p>
      <p className="mt-2 text-sm font-medium text-[#221342]">{value}</p>
    </div>
  );
}

export default ReviewSection;
