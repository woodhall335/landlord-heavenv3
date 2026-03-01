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
    <div className="-mx-6 -mb-7 mt-6 w-auto border-t border-violet-100 bg-violet-50/60 px-6 py-4 md:-mx-7">
      {hasExplicitSlots ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-[132px] shrink-0 items-center gap-2">{leftSlot}</div>
          {centerSlot ? (
            <div className="order-3 w-full text-sm text-gray-500 sm:order-none sm:w-auto sm:whitespace-nowrap">{centerSlot}</div>
          ) : null}
          <div className="ml-auto flex min-w-[132px] shrink-0 justify-end gap-2">{rightSlot}</div>
        </div>
      ) : (
        <div className="flex w-full flex-wrap items-center justify-between gap-4 [&>*:last-child]:ml-auto">{children}</div>
      )}
    </div>
  );
}
