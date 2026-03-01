import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - List all vehicles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              licensePlate: { contains: search, mode: "insensitive" as const },
            },
            {
              registrationName: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            { brandName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({
      vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get vehicles error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi lấy danh sách xe" },
      { status: 500 },
    );
  }
}

// POST - Create new vehicle
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      licensePlate,
      registrationName,
      registrationYear,
      brandName,
      vehicleType,
      color,
      chassisNumber,
      engineNumber,
      manufacturingYear,
      usageExpiry,
      countryOfOrigin,
      fuelType,
      fuelConsumption,
      loadCapacity,
      volume,
      odometerKm,
      gpsKm,
      followingLaw,
      dimensions,
      notes,
    } = body;

    // Validate required fields
    if (!licensePlate || !registrationName || !brandName || !vehicleType) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin bắt buộc" },
        { status: 400 },
      );
    }

    // Check if license plate already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: "Biển số đã tồn tại" },
        { status: 400 },
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        licensePlate,
        registrationName,
        registrationYear:
          parseInt(registrationYear) || new Date().getFullYear(),
        brandName,
        vehicleType,
        color: color || "Trắng",
        chassisNumber,
        engineNumber,
        manufacturingYear:
          parseInt(manufacturingYear) || new Date().getFullYear(),
        usageExpiry: parseInt(usageExpiry) || new Date().getFullYear() + 25,
        countryOfOrigin: countryOfOrigin || "Việt Nam",
        fuelType: fuelType || "Dầu",
        fuelConsumption: fuelConsumption ? parseFloat(fuelConsumption) : null,
        loadCapacity: loadCapacity ? parseFloat(loadCapacity) : null,
        volume: volume ? parseInt(volume) : null,
        odometerKm: parseInt(odometerKm) || 0,
        gpsKm: parseInt(gpsKm) || 0,
        followingLaw,
        dimensions,
        notes,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi tạo phương tiện" },
      { status: 500 },
    );
  }
}
