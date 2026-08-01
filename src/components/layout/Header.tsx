'use client';

import { NavBar } from '@/components/ui';
import { useHeaderMode } from './HeaderModeContext';

interface HeaderProps {
  user?: {
    email: string;
    name?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const { scrollThreshold } = useHeaderMode();

  return (
    <NavBar
      user={user}
      headerMode="solid"
      scrollThreshold={scrollThreshold}
    />
  );
}
