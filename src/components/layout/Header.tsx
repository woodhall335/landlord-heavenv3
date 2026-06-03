'use client';

import { NavBar } from '@/components/ui';
import { usePathname } from 'next/navigation';
import { useHeaderMode } from './HeaderModeContext';

interface HeaderProps {
  user?: {
    email: string;
    name?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const { headerMode, scrollThreshold } = useHeaderMode();
  const pathname = usePathname();
  const forceSolidHeader =
    pathname?.startsWith('/assisted-prep') ||
    pathname === '/section-8-notice-assisted-prep' ||
    pathname === '/money-claim-assisted-prep' ||
    pathname === '/possession-claim-assisted-prep';

  return (
    <NavBar
      user={user}
      headerMode={forceSolidHeader ? 'solid' : headerMode}
      scrollThreshold={scrollThreshold}
    />
  );
}
