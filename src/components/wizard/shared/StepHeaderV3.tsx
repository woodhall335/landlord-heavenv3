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
    <div className="mb-6 flex items-start gap-3 rounded-[1.45rem] border border-[#ece1ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,255,0.96))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_42px_rgba(76,29,149,0.06)] sm:mb-8 sm:gap-4 sm:rounded-[1.75rem] sm:p-5 md:p-6">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,243,255,0.96))] ring-1 ring-[#ddd0ff] shadow-[0_18px_38px_rgba(91,33,182,0.10)] sm:h-14 sm:w-14 md:h-[76px] md:w-[76px]">
        <div className="pointer-events-none absolute inset-[1px] rounded-[0.95rem] border border-white/80" />
        {iconPath ? (
          <Image src={iconPath} alt="" fill sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 76px" className="object-contain p-1.5 sm:p-2 md:p-2.5" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-violet-700">
            <RiImageLine className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b56d8] sm:text-[11px]">
            Current step
          </p>
          <span className="rounded-full border border-[#e5d9ff] bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b46c1] shadow-sm">
            Guided
          </span>
        </div>
        <h2 className="mt-3 text-[1.62rem] font-semibold tracking-[-0.035em] text-[#170d2f] sm:text-[1.88rem] md:text-[2.08rem]">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-[50rem] text-[14px] leading-6 text-[#5c5670] sm:text-[15px] sm:leading-7 md:text-[15.5px]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
