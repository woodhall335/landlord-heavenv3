import React from "react";

interface WizardSidebarPanelProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function WizardSidebarPanel({ title, children, footer }: WizardSidebarPanelProps) {
  return (
    <aside className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-4 space-y-3 text-sm text-gray-600">{children}</div>
      {footer && <div className="mt-6 pt-4 border-t border-gray-200">{footer}</div>}
    </aside>
  );
}

export default WizardSidebarPanel;
