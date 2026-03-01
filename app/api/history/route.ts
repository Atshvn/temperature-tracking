/**
 * History API Route (Upload Logs)
 * GET /api/history - Get upload history
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get total count
    const total = await prisma.uploadLog.count();

    // Get upload logs with uploader info
    const logs = await prisma.uploadLog.findMany({
      orderBy: { uploadedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            temperatures: true,
          },
        },
      },
    });

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        fileName: log.fileName,
        recordsCount: log.recordsCount,
        actualRecords: log._count.temperatures,
        uploadedAt: log.uploadedAt,
        uploadedBy: log.uploadedBy,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json(
      { error: "Không thể tải lịch sử upload" },
      { status: 500 },
    );
  }
}
