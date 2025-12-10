"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: "active" | "canceled" | "past_due";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  property_count: number;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  product_type: string;
  amount: number;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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

      // Load subscription
      const { data: subData } = await supabase
        .from("hmo_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (subData) {
        setSubscription(subData as any);
      }

      // Load orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (ordersData) {
        setOrders(ordersData as any);
      }
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!subscription) return;

    const confirmed = confirm(
      "Are you sure you want to cancel your HMO Pro subscription? You'll keep access until the end of your billing period."
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      setMessage({ type: "success", text: "Subscription cancelled successfully. Access until " + new Date(subscription.current_period_end).toLocaleDateString() });
      loadBillingData();
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      setMessage({ type: "error", text: error.message || "Failed to cancel subscription" });
    }
  }

  async function handleReactivateSubscription() {
    if (!subscription) return;

    try {
      const response = await fetch("/api/subscriptions/reactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.id }),
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

          {/* Subscription Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-charcoal mb-4">HMO Pro Subscription</h2>

            {subscription ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-semibold text-charcoal">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          subscription.status === "active"
                            ? "bg-success/10 text-success"
                            : subscription.status === "canceled"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {subscription.status === "active"
                          ? subscription.cancel_at_period_end
                            ? "Cancels at period end"
                            : "Active"
                          : subscription.status}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tier</p>
                    <p className="font-semibold text-charcoal">
                      {subscription.property_count} Properties - {getTierPrice(subscription.tier, subscription.property_count)}/month
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Period</p>
                    <p className="font-semibold text-charcoal">
                      {new Date(subscription.current_period_start).toLocaleDateString()} -{" "}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Next Billing Date</p>
                    <p className="font-semibold text-charcoal">
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleManagePaymentMethod}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Manage Payment Method
                  </button>

                  {subscription.cancel_at_period_end ? (
                    <button
                      onClick={handleReactivateSubscription}
                      className="bg-gray-200 text-charcoal px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Reactivate Subscription
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      className="bg-error text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have an active HMO Pro subscription.</p>
                <Link
                  href="/hmo-pro"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            )}
          </div>

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
                          £{(order.amount / 100).toFixed(2)}
                        </td>
                        <td className="p-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              order.status === "succeeded"
                                ? "bg-success/10 text-success"
                                : order.status === "processing"
                                ? "bg-warning/10 text-warning"
                                : "bg-error/10 text-error"
                            }`}
                          >
                            {order.status}
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
