import React from 'react';
import Image from 'next/image';
import { RiImageLine } from 'react-icons/ri';

interface StepHeaderV3Props {
  title: string;
  description?: string;
  iconPath?: string;
}

export function StepHeaderV3({ title, description, iconPath }: StepHeaderV3Props) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-[1.35rem] border border-[#ece2ff] bg-[linear-gradient(180deg,rgba(249,245,255,0.94),rgba(243,236,255,0.88))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:mb-7 sm:gap-4 sm:rounded-[1.6rem] sm:p-5">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[1rem] bg-white ring-1 ring-[#e0d2ff] shadow-[0_14px_30px_rgba(91,33,182,0.08)] sm:h-14 sm:w-14 md:h-[72px] md:w-[72px]">
        {iconPath ? (
          <Image src={iconPath} alt="" fill sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 72px" className="object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-violet-700">
            <RiImageLine className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h2 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-[#170d2f] sm:text-[1.75rem] md:text-[1.95rem]">{title}</h2>
        {description ? <p className="mt-2 max-w-[48rem] text-[14px] leading-6 text-[#5c5670] sm:text-[15px] sm:leading-7">{description}</p> : null}
      </div>
    </div>
  );
}
