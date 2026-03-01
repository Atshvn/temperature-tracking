/**
 * Users API Route
 * GET /api/users - List all users
 * POST /api/users - Create new user
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, authMiddleware, isAdmin } from "@/lib/auth";
import { z } from "zod";

// Create user schema
const createUserSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
});

// GET - List all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách người dùng" },
      { status: 500 },
    );
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 },
      );
    }

    const { username, name, email, password, role } = validationResult.data;

    // Check if username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username đã được sử dụng" },
        { status: 400 },
      );
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Không thể tạo tài khoản" },
      { status: 500 },
    );
  }
}
