'use client';

import React from 'react';
import { RiQuestionLine } from 'react-icons/ri';

interface FollowUpChipsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function FollowUpChips({
  questions,
  onQuestionClick,
}: FollowUpChipsProps): React.ReactElement | null {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
        <RiQuestionLine className="w-3.5 h-3.5" />
        Follow-up questions
      </p>
      <div className="flex flex-col gap-1.5">
        {questions.map((question, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onQuestionClick(question)}
            className="text-left text-xs px-3 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg border border-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FollowUpChips;
