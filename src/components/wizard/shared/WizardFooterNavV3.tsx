import React from 'react';

interface WizardFooterNavV3Props {
  children?: React.ReactNode;
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function WizardFooterNavV3({ children, leftSlot, centerSlot, rightSlot }: WizardFooterNavV3Props) {
  const hasExplicitSlots = leftSlot !== undefined || centerSlot !== undefined || rightSlot !== undefined;
  const wrapperClass = 'w-full';

  return (
    <div className="w-full">
      {hasExplicitSlots ? (
        <div className={wrapperClass}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 shrink-0 items-center gap-2">{leftSlot}</div>
            {centerSlot ? (
              <div className="hidden rounded-full border border-[#ebe2ff] bg-white/78 px-3 py-1.5 text-xs leading-5 text-[#6b6285] shadow-sm sm:block sm:whitespace-nowrap sm:text-sm">{centerSlot}</div>
            ) : null}
            <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-2 sm:gap-2.5">{rightSlot}</div>
          </div>
        </div>
      ) : (
        <div className={wrapperClass}>
          <div className="flex w-full items-center justify-between gap-3 sm:gap-4 [&>*:first-child]:shrink-0 [&>*:last-child]:ml-auto [&>*:last-child]:min-w-0">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
