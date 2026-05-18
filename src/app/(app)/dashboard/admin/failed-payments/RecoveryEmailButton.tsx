"use client";

import { useState } from "react";

interface RecoveryEmailButtonProps {
  orderId: string;
  disabled?: boolean;
}

export function RecoveryEmailButton({ orderId, disabled = false }: RecoveryEmailButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "already_sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function sendRecoveryEmail() {
    setStatus("sending");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/orders/send-checkout-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data?.error || "Failed to send");
        return;
      }

      setStatus(data.status === "already_sent" ? "already_sent" : "sent");
      setMessage(data.message || "Recovery email sent");
    } catch {
      setStatus("error");
      setMessage("Failed to send");
    }
  }

  const buttonLabel =
    status === "sending"
      ? "Sending..."
      : status === "sent"
        ? "Sent"
        : status === "already_sent"
          ? "Already sent"
          : "Send recovery";

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={sendRecoveryEmail}
        disabled={disabled || status === "sending" || status === "sent" || status === "already_sent"}
        className="rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonLabel}
      </button>
      {message && (
        <p className={`max-w-[11rem] text-xs ${status === "error" ? "text-red-600" : "text-gray-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
