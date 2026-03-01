import React from 'react';
import Image from 'next/image';
import { getPanelIconPath, type PanelIconSlug, type StepMetadata } from './stepMetadata';
import { AskHeavenCardV3 } from './AskHeavenCardV3';
import { NeedsChecklistV3 } from './NeedsChecklistV3';
import { WhyThisMattersV3 } from './WhyThisMattersV3';

interface GuidancePanelV3Props {
  metadata?: StepMetadata;
  askHeaven?: React.ReactNode;
}

function PanelHeader({ slug, title }: { slug: PanelIconSlug; title: string }) {
  const iconPath = getPanelIconPath(
    slug === 'ask-heaven'
      ? 'askHeaven'
      : slug === 'what-you-need'
      ? 'whatYouNeed'
      : slug === 'warning'
      ? 'warning'
      : 'success'
  );

  return (
    <div className="mb-2 flex items-center gap-2">
      {iconPath ? <Image src={iconPath} alt="" width={20} height={20} sizes="20px" className="object-contain" /> : null}
      <h3 className="text-sm font-semibold text-violet-900">{title}</h3>
    </div>
  );
}

export function GuidancePanelV3({ metadata, askHeaven }: GuidancePanelV3Props) {
  const hasChecklist = Boolean(metadata?.checklistItems?.length);
  const hasWhy = Boolean(metadata?.whyThisMatters?.body);

  return (
    <div className="space-y-4">
      {askHeaven ? (
        <div>
          <PanelHeader slug="ask-heaven" title="Ask Heaven" />
          <AskHeavenCardV3>{askHeaven}</AskHeavenCardV3>
        </div>
      ) : null}

      {hasChecklist ? (
        <div>
          <PanelHeader slug="what-you-need" title={metadata?.checklistTitle ?? "What you'll need"} />
          <NeedsChecklistV3 title={metadata?.checklistTitle} items={metadata?.checklistItems} />
        </div>
      ) : null}

      {hasWhy ? (
        <div>
          <PanelHeader slug="warning" title="Why this matters" />
          <WhyThisMattersV3 title={metadata?.whyThisMatters?.title} body={metadata?.whyThisMatters?.body} />
        </div>
      ) : null}
    </div>
  );
}
