/**
 * Dashboard API Route
 * GET /api/dashboard - Get dashboard statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all statistics in parallel
    const [
      warningCount,
      vehicleCount,
      avgFreezerTemp,
      avgCoolerTemp,
      minFreezerTemp,
      minCoolerTemp,
      recordsByVehicle,
    ] = await Promise.all([
      // Warning count
      prisma.vehicleTemperature.count({
        where: { status: "WARNING" },
      }),

      // Total vehicles
      prisma.vehicle.count(),

      // Average freezer temperature (exclude null values)
      prisma.vehicleTemperature.aggregate({
        _avg: { freezerTemp: true },
        where: { freezerTemp: { not: null } },
      }),

      // Average cooler temperature (exclude null values)
      prisma.vehicleTemperature.aggregate({
        _avg: { coolerTemp: true },
        where: { coolerTemp: { not: null } },
      }),

      // Min freezer temperature (lowest)
      prisma.vehicleTemperature.aggregate({
        _min: { freezerTemp: true },
        where: { freezerTemp: { not: null } },
      }),

      // Min cooler temperature
      prisma.vehicleTemperature.aggregate({
        _min: { coolerTemp: true },
        where: { coolerTemp: { not: null } },
      }),

      // Records count grouped by vehicle
      prisma.vehicleTemperature.groupBy({
        by: ["vehiclePlate"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
    ]);

    // Transform recordsByVehicle for chart
    const vehicleRecordsChart = recordsByVehicle.map((item) => ({
      vehiclePlate: item.vehiclePlate,
      count: item._count.id,
    }));

    return NextResponse.json({
      stats: {
        warningCount,
        vehicleCount,
        avgFreezerTemp: avgFreezerTemp._avg.freezerTemp,
        avgCoolerTemp: avgCoolerTemp._avg.coolerTemp,
        minFreezerTemp: minFreezerTemp._min.freezerTemp,
        minCoolerTemp: minCoolerTemp._min.coolerTemp,
      },
      vehicleRecordsChart,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return NextResponse.json(
      { error: "Không thể tải dữ liệu dashboard" },
      { status: 500 },
    );
  }
}
