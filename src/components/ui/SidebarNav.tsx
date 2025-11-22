import React from "react";
import Link from "next/link";
import { clsx } from "clsx";

export interface SidebarItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarNavProps {
  items: SidebarItem[];
  activePath?: string;
}

export function SidebarNav({ items, activePath }: SidebarNavProps) {
  return (
    <nav className="space-y-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      {items.map((item) => {
        const active = activePath === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
              active ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-50"
            )}
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default SidebarNav;
