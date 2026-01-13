'use client';

import { useEffect } from 'react';
import { trackFreeToolViewed } from '@/lib/analytics';
import type { ToolType } from './ToolUpsellCard';

interface ToolFunnelTrackerProps {
  toolName: string;
  toolType: ToolType;
  jurisdiction?: string;
}

export function ToolFunnelTracker({
  toolName,
  toolType,
  jurisdiction,
}: ToolFunnelTrackerProps): null {
  useEffect(() => {
    trackFreeToolViewed({
      tool_name: toolName,
      tool_type: toolType,
      jurisdiction,
    });
  }, [toolName, toolType, jurisdiction]);

  return null;
}
