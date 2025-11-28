"use client";

import React, { useState } from "react";

interface ROICalculatorProps {
  title?: string;
  subtitle?: string;
}

export function ROICalculator({ title, subtitle }: ROICalculatorProps) {
  const [hoursPerAgreement, setHoursPerAgreement] = useState(1);
  const [agreementsPerWeek, setAgreementsPerWeek] = useState(100);
  const [employees, setEmployees] = useState(2);
  const [avgSalary, setAvgSalary] = useState(56940);

  // Calculate ROI (simplified version)
  const workingHours = 2087;
  const hourlyRate = avgSalary / workingHours;
  const currentTimeCost = hoursPerAgreement * agreementsPerWeek * 52 * hourlyRate * employees;
  const withPandaDoc = (3 / 60) * agreementsPerWeek * 52 * hourlyRate * employees; // 3 minutes with software
  const savings = currentTimeCost - withPandaDoc;
  const roi = ((savings / (20 * 12)) * 100).toFixed(0); // Assuming $20/month cost

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
      <div className="bg-lavender rounded-2xl p-8 space-y-6">
        <h3 className="text-2xl font-black text-gray-900 mb-6">
          {title || "Your current setup"}
        </h3>

        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Hours for agreement creation
              <span className="text-gray-400">ⓘ</span>
            </label>
            <input
              type="number"
              value={hoursPerAgreement}
              onChange={(e) => setHoursPerAgreement(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              min="1"
              max="1000"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Number of agreements per week
              <span className="text-gray-400">ⓘ</span>
            </label>
            <input
              type="number"
              value={agreementsPerWeek}
              onChange={(e) => setAgreementsPerWeek(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              min="1"
              max="1000"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Number of employees
              <span className="text-gray-400">ⓘ</span>
            </label>
            <input
              type="number"
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
              min="1"
              max="1000"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
              Average salary per employee
              <span className="text-gray-400">ⓘ</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">$</span>
              <input
                type="number"
                value={avgSalary}
                onChange={(e) => setAvgSalary(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-8 text-gray-900 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                min="1"
                max="500000"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-lavender rounded-2xl p-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            Money saved with Landlord Heaven
            <span className="text-gray-400">ⓘ</span>
          </div>
          <div className="text-4xl font-black text-gray-900">
            ${Math.round(savings).toLocaleString()}/year
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mt-6">
            Estimated ROI
            <span className="text-gray-400">ⓘ</span>
          </div>
          <div className="text-4xl font-black text-gray-900">
            {roi}%
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 text-white space-y-4">
          <h4 className="text-2xl font-bold">Ready to get the returns?</h4>
          <p className="text-white/90">
            {subtitle || "Schedule a customized demo with just a few clicks."}
          </p>
          <button className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-4 px-8 rounded-lg transition-colors shadow-lg mt-4">
            Request a demo
          </button>
        </div>
      </div>
    </div>
  );
}

export default ROICalculator;
