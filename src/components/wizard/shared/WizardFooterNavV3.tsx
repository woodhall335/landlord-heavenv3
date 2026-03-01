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
    <div className="w-full border-t border-violet-100 bg-violet-50/40 px-6 py-4">
      {hasExplicitSlots ? (
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{leftSlot}</div>
          {centerSlot ? (
            <div className="order-3 w-full text-sm text-gray-500 md:order-none md:w-auto md:whitespace-nowrap">{centerSlot}</div>
          ) : null}
          <div className="ml-auto flex min-w-[150px] flex-wrap justify-end gap-2">{rightSlot}</div>
        </div>
      ) : (
        <div className="flex w-full flex-wrap items-center gap-3 md:gap-4 [&>*:last-child]:ml-auto">{children}</div>
      )}
    </div>
  );
}
