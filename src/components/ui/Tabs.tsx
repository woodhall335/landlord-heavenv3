import React from "react";
import { clsx } from "clsx";
import { isWizardThemeV2 } from '@/components/wizard/shared/theme';

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
    <div className={clsx("p-2 shadow-sm", isWizardThemeV2 ? "rounded-xl bg-white ring-1 ring-violet-100" : "rounded-2xl bg-white ring-1 ring-gray-200")}>
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
                  ? (isWizardThemeV2 ? "bg-violet-600 text-white shadow-sm" : "bg-gradient-to-r from-primary to-emerald-500 text-white shadow")
                  : (isWizardThemeV2 ? "text-violet-900 hover:bg-violet-50" : "text-gray-700 hover:bg-gray-50")
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
