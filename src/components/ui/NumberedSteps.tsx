import React from "react";

interface Step {
  number: string;
  title: string;
  description: string;
}

interface NumberedStepsProps {
  steps: Step[];
  title?: string;
  subtitle?: string;
}

export function NumberedSteps({ steps, title, subtitle }: NumberedStepsProps) {
  return (
    <div className="space-y-12">
      {(title || subtitle) && (
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {title && (
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="space-y-4">
            <div className="text-6xl font-black text-gray-900">
              {step.number}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NumberedSteps;
