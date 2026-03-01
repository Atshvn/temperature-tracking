import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Get single vehicle
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Không tìm thấy phương tiện" },
        { status: 404 },
      );
    }

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("Get vehicle error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra" }, { status: 500 });
  }
}

// PUT - Update vehicle
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...body,
        registrationYear: body.registrationYear
          ? parseInt(body.registrationYear)
          : undefined,
        manufacturingYear: body.manufacturingYear
          ? parseInt(body.manufacturingYear)
          : undefined,
        usageExpiry: body.usageExpiry ? parseInt(body.usageExpiry) : undefined,
        fuelConsumption: body.fuelConsumption
          ? parseFloat(body.fuelConsumption)
          : undefined,
        loadCapacity: body.loadCapacity
          ? parseFloat(body.loadCapacity)
          : undefined,
        volume: body.volume ? parseInt(body.volume) : undefined,
        odometerKm: body.odometerKm ? parseInt(body.odometerKm) : undefined,
        gpsKm: body.gpsKm ? parseInt(body.gpsKm) : undefined,
      },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error("Update vehicle error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật" },
      { status: 500 },
    );
  }
}

// DELETE - Delete vehicle
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Đã xóa phương tiện" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa" },
      { status: 500 },
    );
  }
}
