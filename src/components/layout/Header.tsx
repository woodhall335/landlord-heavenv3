"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { clsx } from "clsx";

interface HeaderProps {
  user?: {
    email: string;
    name?: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const productLinks = [
    { href: "/products/notice-only", label: "Notice Only", price: "£29.99" },
    { href: "/products/complete-pack", label: "Complete Eviction Pack", price: "£149.99" },
    { href: "/products/money-claim", label: "Money Claim Pack", price: "£129.99" },
    { href: "/products/ast", label: "Tenancy Agreements", price: "From £39.99" },
    { href: "/hmo-pro", label: "HMO Pro Membership", price: "From £19.99/mo", badge: "Popular" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <span className="text-white font-bold text-xl">LH</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-white">
                Landlord Heaven
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductsDropdownOpen(true)}
              onMouseLeave={() => setProductsDropdownOpen(false)}
            >
              <button
                className={clsx(
                  "flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-250",
                  productsDropdownOpen || pathname.startsWith("/products") || pathname.startsWith("/hmo-pro")
                    ? "text-white bg-white/20"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                Products
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {productsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {productLinks.map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-charcoal group-hover:text-primary">
                            {product.label}
                          </span>
                          {product.badge && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-warning/10 text-warning rounded">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{product.price}</span>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/pricing"
              className={clsx(
                "px-3 py-2 text-sm font-semibold rounded-md transition-all duration-250",
                isActive("/pricing")
                  ? "text-white bg-white/20"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              Pricing
            </Link>

            <Link
              href="/help"
              className={clsx(
                "px-3 py-2 text-sm font-semibold rounded-md transition-all duration-250",
                isActive("/help")
                  ? "text-white bg-white/20"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              Help
            </Link>

            <Link
              href="/about"
              className={clsx(
                "px-3 py-2 text-sm font-semibold rounded-md transition-all duration-250",
                isActive("/about")
                  ? "text-white bg-white/20"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              About
            </Link>
          </div>

          {/* Right Side - Auth Buttons / User Menu */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-all duration-250"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-primary font-semibold text-sm">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-medium text-charcoal">Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-charcoal">Settings</span>
                    </Link>
                    <hr className="my-2 border-gray-200" />
                    <form action="/api/auth/logout" method="POST">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium text-charcoal">Log Out</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="small" className="border-white text-white hover:bg-white hover:text-primary">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="secondary" size="small" className="bg-white text-primary hover:bg-white/90 shadow-md">
                    Sign Up Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-all duration-250"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 bg-primary-dark">
            <div className="space-y-1">
              {/* Products Section */}
              <div className="px-3 py-2 text-xs font-semibold text-white/60 uppercase tracking-wide">
                Products
              </div>
              {productLinks.map((product) => (
                <Link
                  key={product.href}
                  href={product.href}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/10 transition-all duration-250"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-sm font-medium text-white">{product.label}</span>
                  <span className="text-xs text-white/70">{product.price}</span>
                </Link>
              ))}

              <hr className="my-2 border-white/20" />

              {/* Main Links */}
              <Link
                href="/pricing"
                className="block px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/help"
                className="block px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Help
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              {/* Auth Buttons */}
              {user ? (
                <>
                  <hr className="my-2 border-white/20" />
                  <div className="px-3 py-2 text-xs font-semibold text-white/70">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10"
                    >
                      Log Out
                    </button>
                  </form>
                </>
              ) : (
                <div className="px-3 py-4 space-y-2">
                  <Link href="/auth/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" fullWidth className="border-white text-white hover:bg-white hover:text-primary">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" fullWidth className="bg-white text-primary hover:bg-white/90">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
