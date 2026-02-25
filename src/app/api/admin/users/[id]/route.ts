import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createAdminClient, requireServerAuth } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const supabase = createAdminClient();

    if (!isAdmin(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select(
        "id, email, full_name, email_verified, hmo_pro_active, hmo_pro_tier, created_at, last_sign_in_at"
      )
      .eq("id", id)
      .maybeSingle();

    if (userError) {
      console.error("Failed to fetch user:", userError);
      return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, created_at, payment_status, total_amount")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Failed to fetch orders:", ordersError);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const safeOrders = (orders || []).map((order) => ({
      id: order.id,
      created_at: order.created_at,
      status: order.payment_status,
      amount: order.total_amount,
    }));

    const metrics = {
      order_count: safeOrders.length,
      total_revenue: safeOrders.reduce(
        (sum, order) => (order.status === "paid" ? sum + (order.amount || 0) : sum),
        0
      ),
    };

    return NextResponse.json(
      {
        user: {
          ...targetUser,
          subscription_tier: targetUser.hmo_pro_tier,
        },
        metrics,
        orders: safeOrders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized - Please log in") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Admin user detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
