'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { RiErrorWarningLine, RiHome4Line } from 'react-icons/ri';
import { getSelectedGrounds, isArrearsEvidenceComplete, normalizeGroundCode } from '@/lib/grounds';

interface Props {
  analysis: any;
  blockingIssues: any[];
  warnings: string[];
  hasBlockingIssues: boolean;
  onFixIssue: (issue: any) => void;
  onFixIssues: () => void;
  onEdit: () => void;
  onProceed: () => void;
  isPaid?: boolean;
  isRegenerating?: boolean;
  isLoadingPaymentStatus?: boolean;
  children: React.ReactNode;
}

function display(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return 'Not provided';
}

export function EditorialCaseReview({analysis, blockingIssues, warnings, hasBlockingIssues, onFixIssue, onFixIssues, onEdit, onProceed, isPaid, isRegenerating, isLoadingPaymentStatus, children}: Props) {
  const facts = analysis?.case_facts || analysis?.facts || {};
  const landlordNames = [facts.landlord_full_name || facts.landlord_name, ...(facts.has_joint_landlords ? [facts.landlord2_name] : [])].filter(Boolean).join(', ');
  const tenantNames = [facts.tenant_full_name || facts.tenant_name, ...(facts.has_joint_tenants ? [facts.tenant2_name, facts.tenant3_name, facts.tenant4_name] : [])].filter(Boolean).join(', ');
  const address = typeof facts.property_address === 'string' ? facts.property_address : [facts.property_address_line1, facts.property_address_line2, facts.property_address_town, facts.property_address_postcode].filter(Boolean).join(', ');
  const currency = (value: unknown) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? new Intl.NumberFormat('en-GB', {style:'currency',currency:'GBP'}).format(Number(value)) : 'Not provided';
  const grounds = getSelectedGrounds(facts);
  const rentFrequencyLabels: Record<string, string> = {monthly:'per month',weekly:'per week',fortnightly:'per fortnight',quarterly:'per quarter',yearly:'per year',annually:'per year'};
  const includedGrounds = facts.include_recommended_grounds
    ? [...grounds, ...(analysis?.decision_engine?.recommended_grounds || []).map((ground: any) => ground.code)]
    : grounds;
  const arrearsEvidence = isArrearsEvidenceComplete(includedGrounds, facts.arrears_items || facts.issues?.rent_arrears?.arrears_items || []);
  const requiredIssues = !arrearsEvidence.complete
    ? [...blockingIssues, {description:'Complete the arrears schedule for the selected grounds.', affected_question_id:'arrears_items'}]
    : blockingIssues;
  const cannotProceed = hasBlockingIssues || !arrearsEvidence.complete;
  const uniqueWarnings = Array.from(new Set(warnings.filter(Boolean)));
  return <div className="space-y-5">
    {cannotProceed && <section aria-label="Required fixes" className="rounded-xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
      <h2 className="flex items-start gap-2 text-lg font-semibold tracking-tight text-amber-950"><RiErrorWarningLine aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" />{requiredIssues.length || 'Some'} {requiredIssues.length === 1 ? 'detail needs' : 'details need'} fixing</h2>
      <ul className="mt-4 space-y-4">{requiredIssues.map((issue, index) => <li key={index} className="flex flex-col items-start justify-between gap-3 border-t border-amber-200 pt-3 sm:flex-row"><div><p className="text-sm leading-6 text-amber-950">{typeof issue === 'string' ? issue : issue.description || issue.message || 'Review this answer.'}</p>{issue.action_required && <p className="mt-1 text-xs leading-5 text-amber-900">{issue.action_required}</p>}</div><Button variant="outline" size="small" className="shrink-0" onClick={()=>onFixIssue(issue)}>Fix this</Button></li>)}</ul>
      {blockingIssues.length === 0 && <Button variant="outline" onClick={onFixIssues} className="mt-3">Review required fixes</Button>}
    </section>}
    {uniqueWarnings.length > 0 && <section aria-label="Warnings to review" className="rounded-xl border border-[#e4d6ed] bg-[#faf6fd] p-4"><h2 className="text-sm font-semibold">{uniqueWarnings.length === 1 ? 'One reminder before you continue' : `${uniqueWarnings.length} reminders before you continue`}</h2><ul className="mt-2 space-y-2">{uniqueWarnings.map(warning=><li key={warning} className="text-sm leading-6 text-[#61516d]">{warning}</li>)}</ul></section>}
    <section aria-label="Case details"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold tracking-tight">Case details</h2><Button variant="ghost" size="small" onClick={onEdit}>Edit answers</Button></div>
      <div className="mt-4 flex items-start gap-3 border-b border-[#eee5f2] pb-4"><RiHome4Line aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" /><p className="text-sm leading-6">{display(address)}</p></div>
      <dl className="mt-4 grid gap-4 min-[360px]:grid-cols-2">{[
        ['Landlord(s)', display(landlordNames)],
        ['Tenant(s)', display(tenantNames)],
        ['Rent payable', `${currency(facts.rent_amount)}${facts.rent_frequency ? ` ${rentFrequencyLabels[facts.rent_frequency] || facts.rent_frequency}` : ''}`],
        ['Recorded arrears', currency(analysis?.case_summary?.total_arrears ?? facts.total_arrears ?? facts.arrears_total)],
      ].map(([label,value])=><div key={label}><dt className="text-xs text-[#76657f]">{label}</dt><dd className="mt-1 break-words text-sm leading-6">{value}</dd></div>)}</dl>
      {grounds.length>0 && <div className="mt-5 border-t border-[#eee5f2] pt-4"><p className="text-xs text-[#76657f]">Selected grounds</p><div className="mt-2 flex flex-wrap gap-2">{grounds.map(ground=><span key={ground} className="rounded-md bg-[#f1eaf8] px-3 py-1.5 text-xs text-[#673b89]">Ground {normalizeGroundCode(ground)}</span>)}</div></div>}
    </section>
    <details className="rounded-xl border border-[#e5deed] p-4"><summary className="cursor-pointer text-sm font-semibold">Full route, timing and evidence review</summary><div className="mt-4 min-w-0">{children}</div></details>
    <footer className="border-t border-[#e5deed] pt-5"><div className="flex flex-col gap-3 sm:flex-row"><Button variant="outline" onClick={onEdit} className="sm:flex-1">Edit answers</Button><Button onClick={onProceed} disabled={cannotProceed || isRegenerating || isLoadingPaymentStatus} className="sm:flex-1">{isLoadingPaymentStatus ? 'Checking payment status…' : isRegenerating ? 'Regenerating…' : isPaid ? 'Regenerate pack' : 'Continue to preview'}</Button></div><p className="mt-3 text-center text-xs leading-5 text-[#76657f]">{cannotProceed ? 'Resolve the required fixes to continue.' : isPaid ? 'Your saved answers will be used to regenerate your documents.' : 'Review your prepared documents before secure payment.'}</p></footer>
  </div>;
}
