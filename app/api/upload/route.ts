/**
 * Upload Excel API Route
 * POST /api/upload - Upload and process Excel file
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware, isAdmin } from "@/lib/auth";
import { parseExcelFile, convertToDbRecords } from "@/lib/excel";

export const dynamic = "force-dynamic";

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

    // Verify user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại." },
        { status: 401 },
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const vehicleId = formData.get("vehicleId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Vui lòng chọn file để upload" },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file Excel (.xlsx, .xls)" },
        { status: 400 },
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File không được vượt quá 10MB" },
        { status: 400 },
      );
    }

    // If vehicleId provided, verify it exists
    let vehicle = null;
    if (vehicleId) {
      vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });
      if (!vehicle) {
        return NextResponse.json(
          { error: "Không tìm thấy xe" },
          { status: 400 },
        );
      }
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();

    // Parse Excel file
    const parseResult = parseExcelFile(buffer);

    if (!parseResult.valid && parseResult.data.length === 0) {
      return NextResponse.json(
        {
          error: "Dữ liệu không hợp lệ",
          details: parseResult.errors,
        },
        { status: 400 },
      );
    }

    // Use vehicle license plate from file or from selected vehicle
    const vehiclePlate = vehicle?.licensePlate || parseResult.vehiclePlate;

    if (!vehiclePlate) {
      return NextResponse.json(
        {
          error:
            "Không xác định được biển số xe. Vui lòng chọn xe hoặc kiểm tra file.",
        },
        { status: 400 },
      );
    }

    // Convert to database records
    const records = convertToDbRecords(parseResult.data, vehiclePlate);

    // Create upload log and temperature records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create upload log
      const uploadLog = await tx.uploadLog.create({
        data: {
          fileName: file.name,
          recordsCount: records.length,
          uploadedById: user.id,
        },
      });

      // Create temperature records
      await tx.vehicleTemperature.createMany({
        data: records.map((record) => ({
          vehiclePlate: record.vehiclePlate,
          startTime: record.startTime,
          endTime: record.endTime,
          duration: record.duration,
          acStatus: record.acStatus,
          freezerTemp: record.freezerTemp,
          freezerHumidity: record.freezerHumidity,
          coolerTemp: record.coolerTemp,
          coolerHumidity: record.coolerHumidity,
          coordinates: record.coordinates,
          location: record.location,
          status: record.status,
          vehicleId: vehicleId || null,
          uploadLogId: uploadLog.id,
        })),
      });

      return uploadLog;
    });

    return NextResponse.json({
      success: true,
      uploadLogId: result.id,
      recordsCount: records.length,
      fileName: file.name,
      vehiclePlate,
      warnings: parseResult.errors.length > 0 ? parseResult.errors : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi upload file" },
      { status: 500 },
    );
  }
}
