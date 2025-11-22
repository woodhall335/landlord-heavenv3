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
  { href: "/products/notice-only", label: "Notice" },
  { href: "/products/complete-pack", label: "Complete Pack" },
  { href: "/products/money-claim", label: "Money Claim" },
  { href: "/products/ast", label: "Tenancy" },
  { href: "/hmo-pro", label: "HMO Pro" },
  { href: "/pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#009E9E] to-emerald-500 text-lg font-bold text-white shadow-lg shadow-emerald-200/60">
            LH
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-lg font-bold text-gray-900">Landlord Heaven</span>
            <span className="text-sm text-gray-500">Legal-tech for landlords</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "text-sm font-semibold transition-colors",
                pathname === item.href
                  ? "text-[#009E9E]"
                  : "text-gray-700 hover:text-gray-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <div className="flex items-center gap-3 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-800">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#009E9E] to-emerald-500 text-white font-semibold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </span>
              <span className="max-w-[140px] truncate font-semibold">{user.name || user.email}</span>
              <Link href="/dashboard" className="text-[#009E9E] hover:text-emerald-600">
                Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
                Log in
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="medium" className="min-h-button px-5">
                  Get started
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
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "text-sm font-semibold", 
                  pathname === item.href ? "text-[#009E9E]" : "text-gray-700"
                )}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 pt-2">
              {user ? (
                <Link href="/dashboard" className="text-sm font-semibold text-[#009E9E]">
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-sm font-semibold text-gray-700">
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
