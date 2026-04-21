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
    <div className="mb-7 flex items-start gap-4 rounded-[1.6rem] border border-[#ece2ff] bg-[linear-gradient(180deg,rgba(249,245,255,0.94),rgba(243,236,255,0.88))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1.1rem] bg-white ring-1 ring-[#e0d2ff] shadow-[0_14px_30px_rgba(91,33,182,0.08)] md:h-[72px] md:w-[72px]">
        {iconPath ? (
          <Image src={iconPath} alt="" fill sizes="(max-width: 768px) 56px, 72px" className="object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-violet-700">
            <RiImageLine className="h-7 w-7" />
          </div>
        )}
      </div>
      <div>
        <h2 className="text-[1.95rem] font-semibold tracking-[-0.03em] text-[#170d2f]">{title}</h2>
        {description ? <p className="mt-2 max-w-[48rem] text-[15px] leading-7 text-[#5c5670]">{description}</p> : null}
      </div>
    </div>
  );
}
