import React from 'react';

interface WizardFooterNavV3Props {
  children?: React.ReactNode;
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function WizardFooterNavV3({ children, leftSlot, centerSlot, rightSlot }: WizardFooterNavV3Props) {
  const hasExplicitSlots = leftSlot !== undefined || centerSlot !== undefined || rightSlot !== undefined;

  return (
    <div className="w-full border-t border-[#ebe0ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(250,246,255,0.98))] pt-4 sm:pt-5">
      {hasExplicitSlots ? (
        <div className="rounded-[1.3rem] border border-[#e8ddff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,241,255,0.95))] p-3 shadow-[0_18px_40px_rgba(76,29,149,0.08)] backdrop-blur-sm sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex shrink-0 items-center gap-2">{leftSlot}</div>
            {centerSlot ? (
              <div className="order-last text-xs leading-5 text-[#6b6285] sm:order-none sm:block sm:whitespace-nowrap sm:text-sm">{centerSlot}</div>
            ) : null}
            <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-2.5">{rightSlot}</div>
          </div>
        </div>
      ) : (
        <div className="rounded-[1.3rem] border border-[#e8ddff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,241,255,0.95))] p-3 shadow-[0_18px_40px_rgba(76,29,149,0.08)] backdrop-blur-sm sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 [&>*:first-child]:shrink-0 [&>*:last-child]:ml-auto [&>*:last-child]:min-w-0">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
