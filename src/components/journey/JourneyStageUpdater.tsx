'use client';

import { useEffect } from 'react';
import { inferStageFromAskHeaven } from '@/lib/journey/stage';
import { setJourneyState } from '@/lib/journey/state';

interface JourneyStageUpdaterProps {
  topicHint?: string | null;
  sourceId: string;
}

export function JourneyStageUpdater({ topicHint, sourceId }: JourneyStageUpdaterProps): null {
  useEffect(() => {
    const stage = inferStageFromAskHeaven(topicHint);
    setJourneyState(
      {
        stage_estimate: stage,
        last_touch: {
          type: 'ask_heaven',
          id: sourceId,
          ts: Date.now(),
        },
      },
      'ask_heaven_stage_hint',
    );
  }, [sourceId, topicHint]);

  return null;
}
