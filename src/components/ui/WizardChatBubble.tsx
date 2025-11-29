import React from "react";
import { clsx } from "clsx";

interface WizardChatBubbleProps {
  role: "assistant" | "user";
  children: React.ReactNode;
}

export function WizardChatBubble({ role, children }: WizardChatBubbleProps) {
  const isAssistant = role === "assistant";
  return (
    <div className={clsx("flex", isAssistant ? "justify-start" : "justify-end")}
    >
      <div
        className={clsx(
          "max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm ring-1",
          isAssistant
            ? "bg-white text-gray-800 ring-gray-200"
            : "bg-linear-to-br from-primary to-emerald-500 text-white ring-emerald-100"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default WizardChatBubble;
