"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui";

interface UserDetail {
  id: string;
  email: string | null;
  full_name: string | null;
  email_verified: boolean;
  hmo_pro_active: boolean;
  hmo_pro_tier: string | null;
  subscription_tier?: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

interface UserMetrics {
  order_count: number;
  total_revenue: number;
}

interface UserOrder {
  id: string;
  created_at: string;
  status: string;
  amount: number;
}

interface UserDetailResponse {
  user?: UserDetail;
  metrics?: UserMetrics;
  orders?: UserOrder[];
  error?: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      setUnauthorized(false);
      setNotFound(false);

      try {
        const checkResponse = await fetch("/api/admin/check-access");

        if (checkResponse.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (checkResponse.status === 403) {
          setUnauthorized(true);
          return;
        }

        if (!checkResponse.ok) {
          setError("Failed to verify admin access");
          return;
        }

        const response = await fetch(`/api/admin/users/${userId}`);
        const payload: UserDetailResponse = await response.json();

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setUnauthorized(true);
          return;
        }

        if (!response.ok) {
          setError(payload.error || "Failed to fetch user");
          return;
        }

        setUser(payload.user || null);
        setMetrics(payload.metrics || null);
        setOrders(payload.orders || []);
      } catch (err) {
        console.error("Failed to load user details:", err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [router, userId]);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Container>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-charcoal mb-2">Unauthorized</h1>
            <p className="text-gray-600 mb-4">You do not have permission to view this user.</p>
            <Link href="/dashboard/admin/users" className="text-primary hover:underline">
              Back to users
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-charcoal mb-2">User not found</h1>
            <p className="text-gray-600 mb-4">The requested user does not exist.</p>
            <Link href="/dashboard/admin/users" className="text-primary hover:underline">
              Back to users
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="large">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">User</h1>
          <p className="text-gray-600">Admin details for {user.email || user.id}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <table className="w-full">
            <tbody>
              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal w-56">User ID</td>
                <td className="p-4 text-gray-700 break-all">{user.id}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal">Email</td>
                <td className="p-4 text-gray-700">{user.email || "-"}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal">Full name</td>
                <td className="p-4 text-gray-700">{user.full_name || "-"}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal">Email verified</td>
                <td className="p-4 text-gray-700">{user.email_verified ? "Yes" : "No"}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal">HMO Pro tier</td>
                <td className="p-4 text-gray-700">{user.subscription_tier || user.hmo_pro_tier || "None"}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal">Created</td>
                <td className="p-4 text-gray-700">{formatDate(user.created_at)}</td>
              </tr>
              <tr className="border-t">
                <td className="p-4 font-semibold text-charcoal">Last sign in</td>
                <td className="p-4 text-gray-700">{formatDate(user.last_sign_in_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Metrics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Order count</p>
              <p className="text-2xl font-bold text-charcoal">{metrics?.order_count ?? 0}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total revenue</p>
              <p className="text-2xl font-bold text-charcoal">£{(metrics?.total_revenue ?? 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-charcoal">Orders</h2>
          </div>

          {orders.length === 0 ? (
            <p className="p-6 text-gray-600">No orders found for this user.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-charcoal">Order ID</th>
                    <th className="text-left p-4 text-sm font-semibold text-charcoal">Date</th>
                    <th className="text-left p-4 text-sm font-semibold text-charcoal">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-charcoal">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="p-4 text-sm text-gray-700 break-all">{order.id}</td>
                      <td className="p-4 text-sm text-gray-700">{formatDate(order.created_at)}</td>
                      <td className="p-4 text-sm text-gray-700 capitalize">{order.status || "-"}</td>
                      <td className="p-4 text-sm text-gray-700">£{(order.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Link href="/dashboard/admin/users" className="text-primary hover:underline">
          ← Back to users
        </Link>
      </Container>
    </div>
  );
}
