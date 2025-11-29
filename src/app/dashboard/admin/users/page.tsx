"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  email_verified: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

interface UserWithStats extends User {
  subscription_tier?: string;
  order_count?: number;
  total_revenue?: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"signup" | "revenue" | "email">("signup");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 20;

  const checkAdminAccess = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if user is admin
      const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(",") || [];
      if (!adminIds.includes(user.id)) {
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    }
  }, [router]);

  const loadUsers = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    try {
      let query = supabase
        .from("users")
        .select("*", { count: "exact" })
        .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1);

      // Search filter
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      // Sort
      if (sortBy === "signup") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "email") {
        query = query.order("email", { ascending: true });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Load subscription info and revenue for each user
      const usersWithStats: UserWithStats[] = await Promise.all(
        (data || []).map(async (user: any) => {
          // Get subscription
          const { data: subData } = await supabase
            .from("hmo_subscriptions")
            .select("tier")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();

          // Get order stats
          const { data: ordersData } = await supabase
            .from("orders")
            .select("amount")
            .eq("user_id", user.id)
            .eq("status", "succeeded");

          const orderCount = ordersData?.length || 0;
          const totalRevenue = (ordersData as { amount: number }[] | null)?.reduce((sum, order) => sum + order.amount, 0) || 0;

          return {
            ...user,
            subscription_tier: (subData as { tier: string } | null)?.tier,
            order_count: orderCount,
            total_revenue: totalRevenue,
          };
        })
      );

      // Apply tier filter
      let filteredUsers = usersWithStats;
      if (filterTier !== "all") {
        filteredUsers = usersWithStats.filter((u) => {
          if (filterTier === "hmo_pro") return !!u.subscription_tier;
          if (filterTier === "none") return !u.subscription_tier;
          return u.subscription_tier === filterTier;
        });
      }

      // Apply revenue sort if needed
      if (sortBy === "revenue") {
        filteredUsers.sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0));
      }

      setUsers(filteredUsers);
      setTotalPages(Math.ceil((count || 0) / usersPerPage));
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }, [searchTerm, filterTier, sortBy, currentPage, usersPerPage]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (loading) return;
    loadUsers();
  }, [loading, loadUsers]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function _handleBanUser(userId: string, isBanned: boolean) {
    const confirmed = confirm(
      isBanned ? "Are you sure you want to unban this user?" : "Are you sure you want to ban this user?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ban: !isBanned }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      alert(`User ${isBanned ? "unbanned" : "banned"} successfully`);
      loadUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      alert(error.message || "Failed to update user");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Container size="large">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="large">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal mb-2">User Management</h1>
          <p className="text-gray-600">Manage all user accounts and subscriptions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Subscription Tier</label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="hmo_pro">HMO Pro Subscribers</option>
                <option value="none">No Subscription</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="signup">Signup Date</option>
                <option value="email">Email</option>
                <option value="revenue">Total Revenue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">User</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Subscription</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Orders</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Revenue</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Joined</th>
                  <th className="text-left p-4 text-sm font-semibold text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-charcoal">{user.full_name || "No name"}</p>
                        <p className="text-xs text-gray-500">{user.id.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{user.email}</span>
                        {user.email_verified && (
                          <span className="text-xs text-success">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {user.subscription_tier ? (
                        <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                          HMO Pro
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">{user.order_count || 0}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-charcoal">
                        £{((user.total_revenue || 0) / 100).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-700">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/admin/users/${user.id}`}
                          className="text-primary hover:underline text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-charcoal">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">HMO Pro Subscribers</p>
            <p className="text-3xl font-bold text-purple-600">
              {users.filter((u) => u.subscription_tier).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-charcoal">
              {users.reduce((sum, u) => sum + (u.order_count || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-success">
              £{(users.reduce((sum, u) => sum + (u.total_revenue || 0), 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
