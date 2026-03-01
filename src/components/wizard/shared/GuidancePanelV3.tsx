import React from 'react';
import { type StepMetadata } from './stepMetadata';
import { AskHeavenCardV3 } from './AskHeavenCardV3';
import { NeedsChecklistV3 } from './NeedsChecklistV3';
import { WhyThisMattersV3 } from './WhyThisMattersV3';
import { InlineSectionHeaderV3 } from './InlineSectionHeaderV3';

interface GuidancePanelV3Props {
  metadata?: StepMetadata;
  askHeaven: React.ReactNode;
}

export function GuidancePanelV3({ metadata, askHeaven }: GuidancePanelV3Props) {
  return (
    <div className="space-y-4">
      <div>
        <InlineSectionHeaderV3 title="Ask Heaven" iconSlug="ask-heaven" />
        <AskHeavenCardV3>{askHeaven}</AskHeavenCardV3>
      </div>
      <div>
        <InlineSectionHeaderV3 title={metadata?.checklistTitle ?? "What you'll need"} iconSlug="what-you-need" />
        <NeedsChecklistV3 title={metadata?.checklistTitle} items={metadata?.checklistItems} />
      </div>
      <div>
        <InlineSectionHeaderV3 title="Why this matters" iconSlug="warning" />
        <WhyThisMattersV3 title={metadata?.whyThisMatters?.title} body={metadata?.whyThisMatters?.body} />
      </div>
    </div>
  );
}
