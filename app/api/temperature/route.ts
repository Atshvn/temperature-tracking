/**
 * Temperature Data API
 * GET /api/temperature - Get temperature records with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const vehiclePlate = searchParams.get("vehiclePlate");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (vehiclePlate) {
      where.vehiclePlate = vehiclePlate;
    }

    if (fromDate || toDate) {
      where.startTime = {};
      if (fromDate) {
        (where.startTime as Record<string, Date>).gte = new Date(fromDate);
      }
      if (toDate) {
        (where.startTime as Record<string, Date>).lte = new Date(toDate);
      }
    }

    // Fetch records with pagination
    const [records, total] = await Promise.all([
      prisma.vehicleTemperature.findMany({
        where,
        orderBy: { startTime: "asc" },
        skip,
        take: limit,
        include: {
          vehicle: {
            select: {
              id: true,
              licensePlate: true,
              registrationName: true,
              brandName: true,
            },
          },
        },
      }),
      prisma.vehicleTemperature.count({ where }),
    ]);

    // Transform data for chart and table
    const chartData = records.map((r) => ({
      time: r.startTime.toISOString(),
      timeLabel: new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(r.startTime),
      coolerTemp: r.coolerTemp,
      freezerTemp: r.freezerTemp,
      coolerHumidity: r.coolerHumidity,
      freezerHumidity: r.freezerHumidity,
    }));

    const tableData = records.map((r) => ({
      id: r.id,
      startTime: r.startTime.toISOString(),
      endTime: r.endTime.toISOString(),
      duration: r.duration,
      acStatus: r.acStatus,
      coolerTemp: r.coolerTemp,
      coolerHumidity: r.coolerHumidity,
      freezerTemp: r.freezerTemp,
      freezerHumidity: r.freezerHumidity,
      coordinates: r.coordinates,
      location: r.location,
      status: r.status,
    }));

    return NextResponse.json({
      records: tableData,
      chartData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get temperature error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy dữ liệu nhiệt độ" },
      { status: 500 },
    );
  }
}

// DELETE /api/temperature - Delete temperature records (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check authorization
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dynamically import verifyToken to avoid issues
    const { verifyToken } = await import("@/lib/auth");
    const user = await verifyToken(token);

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Chỉ admin mới có quyền xóa dữ liệu" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Danh sách ID không hợp lệ" },
        { status: 400 },
      );
    }

    // Delete records
    const result = await prisma.vehicleTemperature.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      message: `Đã xóa ${result.count} bản ghi`,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Delete temperature error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa dữ liệu" },
      { status: 500 },
    );
  }
}
