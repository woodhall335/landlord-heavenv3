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
    <div className="mb-6 flex items-start gap-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-violet-100 md:h-[72px] md:w-[72px]">
        {iconPath ? (
          <Image src={iconPath} alt="" fill sizes="(max-width: 768px) 56px, 72px" className="object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-violet-700">
            <RiImageLine className="h-7 w-7" />
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-violet-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-violet-700">{description}</p> : null}
      </div>
    </div>
  );
}
