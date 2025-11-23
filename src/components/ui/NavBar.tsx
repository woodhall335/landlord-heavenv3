"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./Button";
import { clsx } from "clsx";

interface NavItem {
  href: string;
  label: string;
}

interface NavBarProps {
  user?: { email: string; name?: string } | null;
}

const primaryLinks: NavItem[] = [
  { href: "/products/notice-only", label: "Notice Only" },
  { href: "/products/complete-pack", label: "Eviction Pack" },
  { href: "/products/money-claim", label: "Money Claims" },
  { href: "/products/ast", label: "Tenancy Agreements" },
  { href: "/hmo-pro", label: "HMO Pro" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-lg font-extrabold text-white shadow-md">
            LH
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xl font-black text-charcoal tracking-tight">Landlord Heaven</span>
            <span className="text-xs font-medium text-gray-500">Legal documents for landlords</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "text-sm font-semibold transition-colors relative py-2",
                pathname === item.href
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-gray-700 hover:text-primary"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <div className="flex items-center gap-3 rounded-full bg-gray-100 px-4 py-2 text-sm text-charcoal">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
              <span className="max-w-[140px] truncate font-semibold">{user.name || user.email}</span>
              <Link href="/dashboard" className="text-primary hover:text-primary-dark font-semibold">
                Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
                Log in
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="medium" className="px-7 shadow-md hover:shadow-lg">
                  Get started free
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span>Menu</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4">
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-semibold",
                  pathname === item.href ? "text-primary" : "text-charcoal"
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 pt-2">
              {user ? (
                <Link href="/dashboard" className="text-sm font-semibold text-primary">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-semibold text-charcoal">
                    Log in
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <Button variant="primary" fullWidth>
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavBar;
