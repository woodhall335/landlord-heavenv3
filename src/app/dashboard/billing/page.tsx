"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Subscription info from users table (HMO Pro is parked for now)
interface UserSubscription {
  hmo_pro_active: boolean;
  hmo_pro_tier: string | null;
  hmo_pro_trial_ends_at: string | null;
  hmo_pro_subscription_ends_at: string | null;
  stripe_subscription_id: string | null;
}

interface Order {
  id: string;
  user_id: string;
  product_type: string;
  total_amount: number;
  payment_status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadBillingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBillingData() {
    const supabase = getSupabaseBrowserClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Load subscription info from users table
      const { data: userData } = await supabase
        .from("users")
        .select("hmo_pro_active, hmo_pro_tier, hmo_pro_trial_ends_at, hmo_pro_subscription_ends_at, stripe_subscription_id")
        .eq("id", user.id)
        .single();

      if (userData && userData.hmo_pro_active) {
        setSubscription(userData as UserSubscription);
      }

      // Load orders - use correct field names from schema
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, user_id, product_type, total_amount, payment_status, stripe_payment_intent_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (ordersData) {
        setOrders(ordersData as Order[]);
      }
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!subscription || !subscription.stripe_subscription_id) return;

    const confirmed = confirm(
      "Are you sure you want to cancel your HMO Pro subscription? You'll keep access until the end of your billing period."
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.stripe_subscription_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      const endDate = subscription.hmo_pro_subscription_ends_at
        ? new Date(subscription.hmo_pro_subscription_ends_at).toLocaleDateString()
        : "end of billing period";
      setMessage({ type: "success", text: "Subscription cancelled successfully. Access until " + endDate });
      loadBillingData();
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      setMessage({ type: "error", text: error.message || "Failed to cancel subscription" });
    }
  }

  async function handleReactivateSubscription() {
    if (!subscription || !subscription.stripe_subscription_id) return;

    try {
      const response = await fetch("/api/subscriptions/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.stripe_subscription_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate subscription");
      }

      setMessage({ type: "success", text: "Subscription reactivated successfully!" });
      loadBillingData();
    } catch (error: any) {
      console.error("Error reactivating subscription:", error);
      setMessage({ type: "error", text: error.message || "Failed to reactivate subscription" });
    }
  }

  async function handleManagePaymentMethod() {
    try {
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      setMessage({ type: "error", text: error.message || "Failed to open payment portal" });
    }
  }

  function getTierPrice(tier: string, propertyCount: number): string {
    if (propertyCount <= 5) return "£19.99";
    if (propertyCount <= 10) return "£24.99";
    if (propertyCount <= 15) return "£29.99";
    if (propertyCount <= 20) return "£34.99";
    const extraTiers = Math.ceil((propertyCount - 20) / 5);
    return `£${(34.99 + extraTiers * 5).toFixed(2)}`;
  }

  function getProductName(productType: string): string {
    const names: Record<string, string> = {
      notice_only: "Notice Only",
      complete_pack: "Complete Eviction Pack",
      money_claim: "Money Claim Pack",
      ast_standard: "Standard AST",
      ast_premium: "Premium AST",
    };
    return names[productType] || productType;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-charcoal mb-8">Billing & Subscription</h1>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-error/10 text-error border border-error/20"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* HMO Pro Subscription - Parked for later review */}

          {/* Order History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-charcoal mb-4">Order History</h2>

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-semibold text-charcoal">Date</th>
                      <th className="text-left p-3 text-sm font-semibold text-charcoal">Product</th>
                      <th className="text-left p-3 text-sm font-semibold text-charcoal">Amount</th>
                      <th className="text-left p-3 text-sm font-semibold text-charcoal">Status</th>
                      <th className="text-left p-3 text-sm font-semibold text-charcoal">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-700">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-sm text-gray-700">{getProductName(order.product_type)}</td>
                        <td className="p-3 text-sm font-semibold text-charcoal">
                          £{(order.total_amount / 100).toFixed(2)}
                        </td>
                        <td className="p-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              order.payment_status === "paid"
                                ? "bg-success/10 text-success"
                                : order.payment_status === "pending"
                                ? "bg-warning/10 text-warning"
                                : "bg-error/10 text-error"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          {order.stripe_payment_intent_id && (
                            <button
                              onClick={handleManagePaymentMethod}
                              className="text-primary hover:underline"
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p>No order history yet.</p>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              💡 <strong>Tip:</strong> You can manage your payment methods, view detailed invoices, and update billing
              information through the Stripe Customer Portal.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
