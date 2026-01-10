'use client';

import React from 'react';
import { RiQuestionLine } from 'react-icons/ri';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

interface WelcomeScreenProps {
  jurisdiction: Jurisdiction;
  onExampleClick: (question: string) => void;
}

const jurisdictionContent: Record<Jurisdiction, {
  title: string;
  subtitle: string;
  examples: string[];
}> = {
  england: {
    title: "Ask me about English landlord law",
    subtitle: "Section 21, Section 8, ASTs, and more",
    examples: [
      "How do I serve a Section 21 notice?",
      "What are the grounds for Section 8?",
      "Can I increase rent on an AST?",
      "What's the notice period for rent arrears?",
    ],
  },
  wales: {
    title: "Ask me about Welsh landlord law",
    subtitle: "Renting Homes Act, occupation contracts, and more",
    examples: [
      "How do I serve a Section 173 notice?",
      "What changed with the Renting Homes Act?",
      "What notice do I give a contract holder?",
      "Do I need Rent Smart Wales registration?",
    ],
  },
  scotland: {
    title: "Ask me about Scottish landlord law",
    subtitle: "Notice to Leave, PRT, First-tier Tribunal, and more",
    examples: [
      "How do I serve a Notice to Leave?",
      "What are the eviction grounds in Scotland?",
      "Do I need pre-action requirements?",
      "How does the First-tier Tribunal work?",
    ],
  },
  'northern-ireland': {
    title: "Ask me about NI landlord law",
    subtitle: "Notice to Quit, tenancy agreements, and more",
    examples: [
      "How do I serve a Notice to Quit in NI?",
      "What are my landlord obligations in NI?",
      "What notice period do I need to give?",
      "How do I recover rent arrears?",
    ],
  },
};

export function WelcomeScreen({
  jurisdiction,
  onExampleClick,
}: WelcomeScreenProps): React.ReactElement {
  const content = jurisdictionContent[jurisdiction];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-4">
        ☁️
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {content.title}
      </h3>
      <p className="text-sm text-primary font-medium mb-2">
        {content.subtitle}
      </p>
      <p className="text-gray-500 mb-6 max-w-md text-sm">
        Get plain-English explanations about UK landlord problems. I help you understand notices, eviction routes, money claims, and tenancy agreements.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {content.examples.map((question) => (
          <button
            key={question}
            onClick={() => onExampleClick(question)}
            className="text-left p-3 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all text-sm text-gray-700 cursor-pointer hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            type="button"
          >
            <RiQuestionLine className="inline-block w-4 h-4 mr-2 text-primary" />
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WelcomeScreen;
