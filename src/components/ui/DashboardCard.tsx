import React from "react";
import { clsx } from "clsx";

interface DashboardCardProps {
  title: string;
  value: string | number;
  helper?: string;
  icon?: React.ReactNode;
  tone?: "default" | "teal" | "warning" | "success";
}

export function DashboardCard({ title, value, helper, icon, tone = "default" }: DashboardCardProps) {
  const toneClasses = {
    default: "bg-white text-gray-900 ring-gray-200",
    teal: "bg-gradient-to-br from-[#009E9E] to-emerald-500 text-white ring-emerald-100",
    warning: "bg-amber-50 text-amber-900 ring-amber-100",
    success: "bg-emerald-50 text-emerald-900 ring-emerald-100",
  };

  return (
    <div className={clsx("rounded-2xl p-5 shadow-sm ring-1", toneClasses[tone])}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide text-gray-500/80">{title}</div>
          <div className="text-3xl font-bold">{value}</div>
          {helper && <div className="mt-1 text-sm text-gray-600">{helper}</div>}
        </div>
        {icon && <div className="text-2xl text-emerald-600">{icon}</div>}
      </div>
    </div>
  );
}

export default DashboardCard;
