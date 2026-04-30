import React from 'react';

interface WizardFooterNavV3Props {
  children?: React.ReactNode;
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function WizardFooterNavV3({ children, leftSlot, centerSlot, rightSlot }: WizardFooterNavV3Props) {
  const hasExplicitSlots = leftSlot !== undefined || centerSlot !== undefined || rightSlot !== undefined;
  const wrapperClass =
    'rounded-[1.45rem] border border-[#e7dcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(247,241,255,0.96))] p-3.5 shadow-[0_20px_44px_rgba(76,29,149,0.09)] backdrop-blur-md sm:border-[1px] sm:p-3.5';

  return (
    <div className="w-full border-t border-[#ebe0ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(250,246,255,0.99))] pt-4 sm:pt-5">
      {hasExplicitSlots ? (
        <div className={`${wrapperClass} sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 shrink-0 items-center gap-2">{leftSlot}</div>
            {centerSlot ? (
              <div className="hidden rounded-full border border-[#ebe2ff] bg-white/78 px-3 py-1.5 text-xs leading-5 text-[#6b6285] shadow-sm sm:block sm:whitespace-nowrap sm:text-sm">{centerSlot}</div>
            ) : null}
            <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-2.5">{rightSlot}</div>
          </div>
        </div>
      ) : (
        <div className={`${wrapperClass} sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}>
          <div className="flex w-full items-center justify-between gap-3 sm:gap-4 [&>*:first-child]:shrink-0 [&>*:last-child]:ml-auto [&>*:last-child]:min-w-0">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
