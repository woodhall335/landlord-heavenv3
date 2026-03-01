import React from 'react';
import Image from 'next/image';
import { getWizardIconPathBySlug } from './wizardIconManifest';

interface InlineSectionHeaderV3Props {
  title: string;
  subtitle?: string;
  iconSlug?: string;
  right?: React.ReactNode;
}

export function InlineSectionHeaderV3({ title, subtitle, iconSlug, right }: InlineSectionHeaderV3Props) {
  const iconPath = getWizardIconPathBySlug(iconSlug);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {iconPath ? <Image src={iconPath} alt="" width={36} height={36} sizes="36px" className="h-9 w-9 object-contain" /> : null}
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
