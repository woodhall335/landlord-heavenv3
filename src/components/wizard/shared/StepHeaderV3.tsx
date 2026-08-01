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
    <div className="flex items-center gap-3.5 sm:gap-4">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[0.95rem] border border-[#e1d7f7] bg-gradient-to-br from-white via-[#faf8ff] to-[#f1ebff] shadow-[0_8px_22px_rgba(92,55,166,0.10)] sm:h-14 sm:w-14">
        <div className="pointer-events-none absolute inset-[1px] rounded-[0.85rem] border border-white/90" />
        {iconPath ? (
          <Image src={iconPath} alt="" fill sizes="56px" className="object-contain p-1.5 sm:p-2" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-violet-700">
            <RiImageLine className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-[1.6rem] font-semibold leading-[1.12] tracking-[-0.035em] text-[#170d2f] sm:text-[1.9rem]">{title}</h2>
        {description ? (
          <p className="mt-1 max-w-[50rem] text-sm leading-5 text-[#5c5670] sm:mt-1.5 sm:text-[15px] sm:leading-6">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
