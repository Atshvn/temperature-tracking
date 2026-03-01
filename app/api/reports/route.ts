/**
 * Reports API Route
 * GET /api/reports - Get temperature reports with filtering
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const status = searchParams.get("status");

    // Build where clause
    const where: Prisma.VehicleTemperatureWhereInput = {};

    if (search) {
      where.vehiclePlate = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (dateFrom || dateTo) {
      where.recordedAt = {};
      if (dateFrom) {
        where.recordedAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.recordedAt.lte = endDate;
      }
    }

    if (status === "WARNING" || status === "NORMAL") {
      where.status = status;
    }

    // Get total count
    const total = await prisma.vehicleTemperature.count({ where });

    // Get records
    const records = await prisma.vehicleTemperature.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        vehiclePlate: true,
        temperature: true,
        recordedAt: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: "Không thể tải dữ liệu báo cáo" },
      { status: 500 },
    );
  }
}
