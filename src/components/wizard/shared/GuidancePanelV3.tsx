import React from 'react';
import { type StepMetadata } from './stepMetadata';
import { AskHeavenCardV3 } from './AskHeavenCardV3';
import { NeedsChecklistV3 } from './NeedsChecklistV3';
import { WhyThisMattersV3 } from './WhyThisMattersV3';
import { InlineSectionHeaderV3 } from './InlineSectionHeaderV3';

interface GuidancePanelV3Props {
  metadata?: StepMetadata;
  askHeaven: React.ReactNode;
  compact?: boolean;
}

export function GuidancePanelV3({ metadata, askHeaven, compact = false }: GuidancePanelV3Props) {
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <AskHeavenCardV3 compact={compact}>{askHeaven}</AskHeavenCardV3>
      <NeedsChecklistV3 title={metadata?.checklistTitle} items={metadata?.checklistItems} compact={compact} />
      <div>
        <InlineSectionHeaderV3
          title="Why this matters"
          iconSlug="warning"
          titleClassName="text-[#241247]"
        />
        <WhyThisMattersV3 title={metadata?.whyThisMatters?.title} body={metadata?.whyThisMatters?.body} compact={compact} />
      </div>
    </div>
  );
}

