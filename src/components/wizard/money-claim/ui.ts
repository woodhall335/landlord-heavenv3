export const MONEY_CLAIM_CARD_CLASS =
  'rounded-[1.5rem] border border-[#e7ddff] bg-white/95 p-5 shadow-[0_18px_42px_rgba(53,31,108,0.06)]';

export const MONEY_CLAIM_TINTED_CARD_CLASS =
  'rounded-[1.5rem] border px-5 py-4 shadow-[0_14px_36px_rgba(53,31,108,0.05)]';

export const MONEY_CLAIM_LABEL_CLASS = 'text-sm font-semibold text-[#27134a]';

export const MONEY_CLAIM_HINT_CLASS = 'text-xs leading-5 text-[#6b6580]';

export const MONEY_CLAIM_INPUT_CLASS =
  'w-full rounded-2xl border border-[#ddd2ff] bg-[#fcfbff] px-4 py-3 text-sm text-[#20163a] shadow-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#ede9fe]';

export const MONEY_CLAIM_TEXTAREA_CLASS =
  'w-full rounded-2xl border border-[#ddd2ff] bg-[#fcfbff] px-4 py-3 text-sm leading-7 text-[#20163a] shadow-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#ede9fe]';

export const MONEY_CLAIM_INLINE_NOTE_CLASS =
  'rounded-2xl border border-[#ece5ff] bg-[#faf8ff] px-4 py-3 text-sm leading-6 text-[#4f4670]';

type ChoiceTone = 'violet' | 'amber' | 'green' | 'blue';

const ACTIVE_CHOICE_CLASSES: Record<ChoiceTone, string> = {
  violet: 'border-[#8b5cf6] bg-white ring-2 ring-[#ddd6fe]',
  amber: 'border-[#f59e0b] bg-white ring-2 ring-[#fde68a]',
  green: 'border-[#22c55e] bg-white ring-2 ring-[#bbf7d0]',
  blue: 'border-[#3b82f6] bg-white ring-2 ring-[#bfdbfe]',
};

export function getMoneyClaimChoiceCardClass(
  active: boolean,
  tone: ChoiceTone = 'violet',
) {
  return [
    'flex items-start rounded-2xl border px-4 py-3.5 transition-all',
    active
      ? ACTIVE_CHOICE_CLASSES[tone]
      : 'border-[#e5def6] bg-white/90 hover:border-[#cdbdf4] hover:bg-white',
  ].join(' ');
}
