interface BlogCTAProps {
  variant?: 'default' | 'urgency' | 'inline';
  title?: string;
  description?: string;
}

/**
 * Deprecated CTA component.
 *
 * Blog article page now owns CTA slotting to prevent duplicate CTAs.
 */
export function BlogCTA(_: BlogCTAProps) {
  return null;
}
