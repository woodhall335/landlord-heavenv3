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
    <div className="w-full border-t border-violet-100 bg-white pt-4">
      {hasExplicitSlots ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex shrink-0 items-center gap-2">{leftSlot}</div>
          <div className="flex items-center gap-3 sm:ml-auto">
            {centerSlot ? (
              <div className="text-sm text-gray-500 sm:whitespace-nowrap">{centerSlot}</div>
            ) : null}
            <div className="flex shrink-0 justify-end gap-2">{rightSlot}</div>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-between gap-4 [&>*:last-child]:ml-auto">{children}</div>
      )}
    </div>
  );
}
