import React from 'react';
import Image from 'next/image';
import { getWizardIconPathBySlug } from './wizardIconManifest';

interface InlineSectionHeaderV3Props {
  title: string;
  subtitle?: string;
  iconSlug?: string;
  right?: React.ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function InlineSectionHeaderV3({
  title,
  subtitle,
  iconSlug,
  right,
  titleClassName,
  subtitleClassName,
}: InlineSectionHeaderV3Props) {
  const iconPath = getWizardIconPathBySlug(iconSlug);

  return (
    <div className="mb-2 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {iconPath ? (
            <Image src={iconPath} alt="" width={28} height={28} sizes="28px" className="h-7 w-7 object-contain" />
          ) : null}
          <h3 className={`text-sm font-semibold uppercase tracking-wide text-violet-900 ${titleClassName ?? ''}`.trim()}>{title}</h3>
        </div>
        {subtitle ? <p className={`mt-1 text-sm text-violet-700 ${subtitleClassName ?? ''}`.trim()}>{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
