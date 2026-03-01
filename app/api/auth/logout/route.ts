/**
 * Logout API Route
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    removeAuthCookie();

    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi đăng xuất" },
      { status: 500 },
    );
  }
}
