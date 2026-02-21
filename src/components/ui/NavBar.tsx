"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { RiArrowDownSLine, RiMenuLine, RiLogoutBoxLine, RiDashboardLine } from 'react-icons/ri';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { freeTools } from '@/lib/tools/tools';
import type { HeaderMode } from '@/components/layout/HeaderModeContext';

interface NavItem {
  href: string;
  label: string;
}

interface NavBarUser {
  email: string;
  name?: string;
}

interface NavBarProps {
  user?: NavBarUser | null;
  headerMode: HeaderMode;
  scrollThreshold: number;
}

type EffectiveHeaderState = 'solid' | 'transparent';

const primaryLinks: NavItem[] = [
  { href: "/products/notice-only", label: "Notice Only" },
  { href: "/products/complete-pack", label: "Eviction Pack" },
  { href: "/products/money-claim", label: "Money Claims" },
  { href: "/products/ast", label: "Tenancy Agreements" },
  { href: "/blog", label: "Landlord Guides" },
];

const freeToolsLinks: NavItem[] = freeTools.map((tool) => ({
  href: tool.href,
  label: tool.label,
}));

export function NavBar({ user: serverUser, headerMode, scrollThreshold }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showFreeTools, setShowFreeTools] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [clientUser, setClientUser] = useState<NavBarUser | null>(serverUser || null);
  const [effectiveHeaderState, setEffectiveHeaderState] = useState<EffectiveHeaderState>(
    headerMode === 'solid' ? 'solid' : 'transparent',
  );

  useEffect(() => {
    if (headerMode === 'solid') {
      setEffectiveHeaderState('solid');
      return;
    }

    if (headerMode === 'transparent') {
      setEffectiveHeaderState('transparent');
      return;
    }

    const setFromScroll = () => {
      setEffectiveHeaderState(window.scrollY > scrollThreshold ? 'solid' : 'transparent');
    };

    setFromScroll();
    window.addEventListener('scroll', setFromScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', setFromScroll);
    };
  }, [headerMode, scrollThreshold]);

  useEffect(() => {
    setOpen(false);
  }, [effectiveHeaderState]);

  const checkAuthState = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        setClientUser({
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name,
        });
      } else {
        setClientUser(null);
      }
    } catch {
      // Keep current state on error
    }
  }, []);

  useEffect(() => {
    checkAuthState();

    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setClientUser({
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name,
          });
        } else if (event === 'SIGNED_OUT') {
          setClientUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setClientUser({
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuthState]);

  const user = clientUser;

  const isSolid = effectiveHeaderState === 'solid';
  const textClass = isSolid ? 'text-[#111827]' : 'text-white';
  const secondaryTextClass = isSolid ? 'text-gray-700' : 'text-white';
  const hoverTextClass = isSolid ? 'hover:text-[#692ED4]' : 'hover:text-white hover:opacity-80 focus:text-white focus:opacity-80';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      setClientUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header
      className={clsx(
        'site-header fixed left-0 right-0 z-50 transition-colors duration-200',
        isSolid ? 'bg-white border-b border-[#E5EE7B]' : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src={isSolid ? "/images/logo.png" : "/images/logo2.png"}
            alt="Landlord Heaven"
            width={160}
            height={40}
            priority
            sizes="160px"
            className="h-8 w-auto"
          />
        </Link>

        <nav className="items-center gap-9 lg:flex hidden">
          <div className="relative" onMouseEnter={() => setShowFreeTools(true)} onMouseLeave={() => setShowFreeTools(false)}>
            <Link
              href="/tools"
              className={clsx('text-sm font-semibold transition-colors relative py-2 flex items-center gap-1', secondaryTextClass, hoverTextClass)}
              aria-label="Free tools hub"
            >
              Free Tools
              <RiArrowDownSLine className={clsx('h-4 w-4', isSolid ? 'text-[#692ED4]' : 'text-white')} />
            </Link>

            {showFreeTools && (
              <div className="absolute left-0 top-full pt-2 w-56 z-50">
                <div className="rounded-xl bg-white shadow-lg border border-gray-200 py-2">
                  {freeToolsLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-[#692ED4] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'text-sm font-semibold transition-colors relative py-2',
                pathname === item.href
                  ? clsx(textClass, 'after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-[#73AEED]')
                  : clsx(secondaryTextClass, hoverTextClass)
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="items-center gap-4 lg:flex hidden">
          {user ? (
            <div className={clsx('flex items-center gap-2 rounded-full px-3 py-2 text-sm', isSolid ? 'bg-gray-100 text-charcoal' : 'bg-white/20 text-white backdrop-blur-sm')}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
              <Link href="/dashboard" className={clsx('transition-colors', isSolid ? 'text-gray-500 hover:text-primary' : 'text-white/90 hover:text-white')} title="Dashboard">
                <RiDashboardLine className="h-5 w-5" />
              </Link>
              <button onClick={handleLogout} disabled={isLoggingOut} className={clsx('transition-colors', isSolid ? 'text-gray-500 hover:text-red-600' : 'text-white/90 hover:text-red-200')} title="Logout">
                <RiLogoutBoxLine className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className={clsx(
                'inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 border-2',
                isSolid
                  ? 'border-primary text-primary bg-white hover:bg-primary/5'
                  : 'border-primary bg-primary text-white hover:bg-primary-dark'
              )}
            >
              Login
            </Link>
          )}
        </div>

        <button
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold lg:hidden border',
            isSolid
              ? 'border-gray-200 text-gray-700 bg-white'
              : 'border-white/40 text-white bg-white/10 backdrop-blur-sm'
          )}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span>Menu</span>
          <RiMenuLine className={clsx('h-5 w-5', isSolid ? 'text-[#692ED4]' : 'text-white')} />
        </button>
      </div>

      {open && (
        <div className={clsx('border-t lg:hidden', isSolid ? 'border-gray-200 bg-white' : 'border-white/25 bg-[#111827]/95 backdrop-blur-sm')}>
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
            <div>
              <div className={clsx('mb-2 text-xs font-bold uppercase', isSolid ? 'text-gray-500' : 'text-white/70')}>Free Tools</div>
              <Link href="/tools" className={clsx('block py-2 text-sm font-semibold', isSolid ? 'text-charcoal hover:text-[#692ED4]' : 'text-white hover:text-white/80')} onClick={() => setOpen(false)}>
                Free Tools Hub
              </Link>
              {freeToolsLinks.map((item) => (
                <Link key={item.href} href={item.href} className={clsx('block py-2 text-sm font-semibold', isSolid ? 'text-charcoal hover:text-[#692ED4]' : 'text-white hover:text-white/80')} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className={clsx('pt-4', isSolid ? 'border-t border-gray-200' : 'border-t border-white/20')}>
              {primaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'block py-2 text-sm font-semibold relative',
                    pathname === item.href
                      ? clsx(isSolid ? 'text-[#111827]' : 'text-white', 'after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-16 after:bg-[#73AEED]')
                      : isSolid ? 'text-charcoal' : 'text-white'
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className={clsx('pt-4 mt-2', isSolid ? 'border-t border-gray-200' : 'border-t border-white/20')}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </span>
                  <div>
                    <p className={clsx('font-semibold', isSolid ? 'text-charcoal' : 'text-white')}>{user.name || user.email}</p>
                    {user.name && <p className={clsx('text-xs', isSolid ? 'text-gray-500' : 'text-white/70')}>{user.email}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/dashboard" className={clsx('flex items-center gap-2 py-2 text-sm font-semibold', isSolid ? 'text-primary' : 'text-white')} onClick={() => setOpen(false)}>
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className={clsx('flex items-center gap-2 py-2 text-sm font-semibold', isSolid ? 'text-red-600 hover:text-red-700' : 'text-red-200 hover:text-red-100')}
                  >
                    <RiLogoutBoxLine className="h-4 w-4" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={clsx('pt-4 mt-2', isSolid ? 'border-t border-gray-200' : 'border-t border-white/20')}>
                <Link href="/auth/login" className={clsx('block py-2 text-sm font-semibold', isSolid ? 'text-primary' : 'text-white')} onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link href="/auth/signup" className={clsx('block py-2 text-sm font-semibold', isSolid ? 'text-charcoal' : 'text-white')} onClick={() => setOpen(false)}>
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default NavBar;
