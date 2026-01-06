"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { RiArrowDownSLine, RiMenuLine, RiLogoutBoxLine } from 'react-icons/ri';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

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
}

const primaryLinks: NavItem[] = [
  { href: "/products/notice-only", label: "Notice Only" },
  { href: "/products/complete-pack", label: "Eviction Pack" },
  { href: "/products/money-claim", label: "Money Claims" },
  { href: "/products/ast", label: "Tenancy Agreements" },
  { href: "/blog", label: "Guides" },
  // HMO Pro removed from navigation for V1 - will be re-enabled in V2
  // { href: "/hmo-pro", label: "HMO Pro" },
];

const freeToolsLinks: NavItem[] = [
  { href: "/ask-heaven", label: "Ask Heaven" },
  { href: "/tools/validators", label: "Validators" },
  { href: "/tools/free-section-21-notice-generator", label: "Section 21 Notice" },
  { href: "/tools/free-section-8-notice-generator", label: "Section 8 Notice" },
  { href: "/tools/rent-arrears-calculator", label: "Rent Arrears Calculator" },
  { href: "/tools/hmo-license-checker", label: "HMO License Checker" },
  { href: "/tools/free-rent-demand-letter", label: "Rent Demand Letter" },
];

export function NavBar({ user: serverUser }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showFreeTools, setShowFreeTools] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Client-side auth state - starts with server prop, updates on auth changes
  const [clientUser, setClientUser] = useState<NavBarUser | null>(serverUser || null);

  // Check auth state on mount and listen for changes
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
    // Check auth state on mount
    checkAuthState();

    // Listen for auth state changes
    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

  // Use client-side state (more up-to-date than server prop)
  const user = clientUser;

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Trigger sticky header and menu after 200px scroll
      const isPastThreshold = scrollY >= 200;
      setIsScrolled(isPastThreshold);
      // Menu visible at top (0-10px) or after 200px scroll
      setShowMenu(scrollY <= 10 || isPastThreshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={clsx(
        "site-header fixed left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white border-b border-gray-200 shadow-sm"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/headerlogo2.png"
            alt="Landlord Heaven - Legal Documents for Landlords"
            width={280}
            height={50}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className={clsx(
          "items-center gap-9 lg:flex transition-all duration-300",
          showMenu
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none",
          "hidden"
        )}>
          {/* Free Tools Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowFreeTools(true)}
            onMouseLeave={() => setShowFreeTools(false)}
          >
            <button
              className="text-sm font-semibold text-gray-700 hover:text-[#692ED4] transition-colors relative py-2 flex items-center gap-1"
            >
              Free Tools
              <RiArrowDownSLine className="h-4 w-4 text-[#692ED4]" />
            </button>

            {showFreeTools && (
              <div
                className="absolute left-0 top-full pt-2 w-56 z-50"
              >
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
                "text-sm font-semibold transition-colors relative py-2",
                pathname === item.href
                  ? "text-[#692ED4] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#692ED4]"
                  : "text-gray-700 hover:text-[#692ED4]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={clsx(
          "items-center gap-4 lg:flex transition-all duration-300",
          showMenu
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none",
          "hidden"
        )}>
          {user ? (
            <div className="flex items-center gap-3 rounded-full bg-gray-100 px-4 py-2 text-sm text-charcoal">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
              <span className="max-w-[140px] truncate font-semibold">{user.name || user.email}</span>
              <Link href="/dashboard" className="text-primary hover:text-primary-dark font-semibold">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <RiLogoutBoxLine className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="header-login-btn">
              Login
            </Link>
          )}
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span>Menu</span>
          <RiMenuLine className="h-5 w-5 text-[#692ED4]" />
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
            {/* Free Tools Section */}
            <div>
              <div className="mb-2 text-xs font-bold uppercase text-gray-500">Free Tools</div>
              {freeToolsLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-sm font-semibold text-charcoal hover:text-[#692ED4]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              {primaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "block py-2 text-sm font-semibold",
                    pathname === item.href ? "text-primary" : "text-charcoal"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-charcoal">{user.name || user.email}</p>
                    {user.name && <p className="text-xs text-gray-500">{user.email}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 py-2 text-sm font-semibold text-primary"
                    onClick={() => setOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 py-2 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    <RiLogoutBoxLine className="h-4 w-4" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-2">
                <Link
                  href="/auth/login"
                  className="block py-2 text-sm font-semibold text-primary"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block py-2 text-sm font-semibold text-charcoal"
                  onClick={() => setOpen(false)}
                >
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
