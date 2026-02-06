import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient, requireServerAuth } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireServerAuth();
    // Admin user metrics use service-role client to bypass RLS
    const supabase = createAdminClient();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "20", 10);
    const sortBy = searchParams.get("sort") || "signup";
    const searchTerm = searchParams.get("search") || "";

    let query = supabase
      .from("users")
      .select("id, email, full_name, email_verified, hmo_pro_active, hmo_pro_tier, created_at, last_sign_in_at", {
        count: "exact",
      })
      .range((page - 1) * perPage, page * perPage - 1);

    if (searchTerm) {
      query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
    }

    if (sortBy === "signup") {
      query = query.order("created_at", { ascending: false });
    } else if (sortBy === "email") {
      query = query.order("email", { ascending: true });
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Failed to fetch users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    const userIds = (users || []).map((u) => u.id);
    let ordersByUser = new Map<string, { total_amount: number }[]>();

    if (userIds.length > 0) {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total_amount")
        .in("user_id", userIds)
        .eq("payment_status", "paid");

      if (ordersError) {
        console.error("Failed to fetch orders:", ordersError);
        return NextResponse.json(
          { error: "Failed to fetch orders" },
          { status: 500 }
        );
      }

      ordersByUser = orders?.reduce((acc, order) => {
        const existing = acc.get(order.user_id) || [];
        existing.push({ total_amount: order.total_amount });
        acc.set(order.user_id, existing);
        return acc;
      }, new Map<string, { total_amount: number }[]>()) || ordersByUser;
    }

    const usersWithStats = (users || []).map((u) => {
      const userOrders = ordersByUser.get(u.id) || [];
      const totalRevenue = userOrders.reduce((sum, order) => sum + order.total_amount, 0);

      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        email_verified: u.email_verified,
        hmo_pro_active: u.hmo_pro_active,
        hmo_pro_tier: u.hmo_pro_tier,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        subscription_tier: u.hmo_pro_tier,
        order_count: userOrders.length,
        total_revenue: totalRevenue,
      };
    });

    return NextResponse.json(
      {
        success: true,
        users: usersWithStats,
        count: count || 0,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized - Please log in") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.error("Admin user metrics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
