import { RiCheckboxCircleLine, RiErrorWarningLine, RiFileWarningLine } from 'react-icons/ri';

export type ReviewState = 'ready' | 'needs-review' | 'incomplete';

export function ReviewStatus({ state, isPaid, generationError }: { state: ReviewState; isPaid?: boolean; generationError?: string | null }) {
  const status = generationError ? 'incomplete' : state;
  const Icon = status === 'ready' ? RiCheckboxCircleLine : status === 'incomplete' ? RiFileWarningLine : RiErrorWarningLine;
  const tone = status === 'ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : status === 'incomplete' ? 'border-rose-200 bg-rose-50 text-rose-950' : 'border-amber-200 bg-amber-50 text-amber-950';
  const title = generationError ? 'Pack could not be regenerated' : status === 'ready' ? (isPaid ? 'Ready to regenerate' : 'Ready to preview') : status === 'incomplete' ? 'Incomplete — details need fixing' : 'Needs review';
  const detail = generationError ? 'Your updated pack has not been confirmed. Review the generation error before trying again.' : status === 'ready' ? 'No required fixes were identified by the automated review. Check your answers and documents before use.' : status === 'incomplete' ? 'Required answers or evidence need attention. Check the flagged items below.' : 'Review the highlighted reminders and supporting information before continuing.';
  return <section aria-label="Review status" role="status" className={`flex items-start gap-3 rounded-xl border p-4 ${tone}`}><Icon aria-hidden="true" className="mt-0.5 h-7 w-7 shrink-0" /><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm leading-6">{detail}</p></div></section>;
}
