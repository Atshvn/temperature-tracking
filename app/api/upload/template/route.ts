/**
 * Download Excel Template API Route
 * GET /api/upload/template - Download sample Excel template
 */

import { NextRequest, NextResponse } from "next/server";
import { generateExcelTemplate } from "@/lib/excel";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Generate template
    const buffer = generateExcelTemplate();

    // Return as file download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="temperature_template.xlsx"',
      },
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json(
      { error: "Không thể tạo template" },
      { status: 500 },
    );
  }
}
