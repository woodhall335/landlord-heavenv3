'use client';

import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { RiShieldLine, RiFileTextLine, RiCheckboxCircleLine, RiFileCheckLine } from 'react-icons/ri';

interface CaseStrengthWidgetProps {
  scoreReport: {
    score: number;
    components: {
      legal_eligibility: { score: number; issues?: string[]; strengths?: string[] };
      evidence: { score: number; issues?: string[] };
      consistency: { score: number };
      procedure: { score: number };
    };
  };
}

export function CaseStrengthWidget({ scoreReport }: CaseStrengthWidgetProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Weak';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Case Strength Assessment</h3>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(scoreReport.score)}`}>
            {scoreReport.score}/100
          </div>
          <div className="text-sm text-gray-500">
            {getScoreLabel(scoreReport.score)}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        ℹ️ Informational Only — Not Legal Advice
      </p>

      <div className="space-y-4">
        {/* Legal Eligibility */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <RiShieldLine className="h-4 w-4 text-[#7C3AED]" />
              <span className="text-sm font-medium">Legal Eligibility</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(scoreReport.components.legal_eligibility.score)}`}>
              {scoreReport.components.legal_eligibility.score}/100
            </span>
          </div>
          <Progress value={scoreReport.components.legal_eligibility.score} className="h-2" />

          {scoreReport.components.legal_eligibility.issues && scoreReport.components.legal_eligibility.issues.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 space-y-1">
              {scoreReport.components.legal_eligibility.issues.slice(0, 2).map((issue, i) => (
                <li key={i}>• {issue}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Evidence */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <RiFileTextLine className="h-4 w-4 text-[#7C3AED]" />
              <span className="text-sm font-medium">Evidence</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(scoreReport.components.evidence.score)}`}>
              {scoreReport.components.evidence.score}/100
            </span>
          </div>
          <Progress value={scoreReport.components.evidence.score} className="h-2" />
        </div>

        {/* Consistency */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <RiCheckboxCircleLine className="h-4 w-4 text-[#7C3AED]" />
              <span className="text-sm font-medium">Consistency</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(scoreReport.components.consistency.score)}`}>
              {scoreReport.components.consistency.score}/100
            </span>
          </div>
          <Progress value={scoreReport.components.consistency.score} className="h-2" />
        </div>

        {/* Procedure */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <RiFileCheckLine className="h-4 w-4 text-[#7C3AED]" />
              <span className="text-sm font-medium">Procedure</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(scoreReport.components.procedure.score)}`}>
              {scoreReport.components.procedure.score}/100
            </span>
          </div>
          <Progress value={scoreReport.components.procedure.score} className="h-2" />
        </div>
      </div>
    </Card>
  );
}
