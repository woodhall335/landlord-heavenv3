import React from "react";
import { clsx } from "clsx";

export interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200">
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                active
                  ? "bg-gradient-to-r from-primary to-emerald-500 text-white shadow"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
