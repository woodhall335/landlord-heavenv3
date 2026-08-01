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
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#faf8ff] ring-1 ring-[#ded3f8] shadow-sm sm:h-12 sm:w-12">
        <div className="pointer-events-none absolute inset-[1px] rounded-[0.95rem] border border-white/80" />
        {iconPath ? (
          <Image src={iconPath} alt="" fill sizes="48px" className="object-contain p-1.5" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-violet-700">
            <RiImageLine className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#e5d9ff] bg-[#faf8ff] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6b46c1]">
            Guided
          </span>
        </div>
        <h2 className="mt-1.5 text-[1.55rem] font-semibold leading-tight tracking-[-0.03em] text-[#170d2f] sm:text-[1.8rem]">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-[50rem] text-sm leading-5 text-[#5c5670] sm:text-[15px] sm:leading-6">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
