"use client";

import Link from "next/link";
import Image from "next/image";
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
  // HMO Pro removed from navigation for V1 - will be re-enabled in V2
  // { href: "/hmo-pro", label: "HMO Pro" },
];

const freeToolsLinks: NavItem[] = [
  { href: "/tools/free-section-21-notice-generator", label: "Section 21 Notice" },
  { href: "/tools/free-section-8-notice-generator", label: "Section 8 Notice" },
  { href: "/tools/rent-arrears-calculator", label: "Rent Arrears Calculator" },
  { href: "/tools/hmo-license-checker", label: "HMO License Checker" },
  { href: "/tools/free-rent-demand-letter", label: "Rent Demand Letter" },
];

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showFreeTools, setShowFreeTools] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/headerlogo.png"
            alt="Landlord Heaven - Legal Documents for Landlords"
            width={280}
            height={50}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {/* Free Tools Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowFreeTools(true)}
            onMouseLeave={() => setShowFreeTools(false)}
          >
            <button
              className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors relative py-2 flex items-center gap-1"
            >
              Free Tools
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
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
            <Link href="/auth/login">
              <Button variant="primary" size="medium" className="px-7 shadow-md hover:shadow-lg">
                Login
              </Button>
            </Link>
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
            {/* Free Tools Section */}
            <div>
              <div className="mb-2 text-xs font-bold uppercase text-gray-500">Free Tools</div>
              {freeToolsLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-sm font-semibold text-charcoal hover:text-primary"
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

            {user && (
              <div className="flex items-center gap-3 pt-2">
                <Link href="/dashboard" className="text-sm font-semibold text-primary">
                  Go to dashboard
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
