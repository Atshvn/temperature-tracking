/**
 * Prisma Seed Script
 * Creates default admin user and sample data for the Vehicle Temperature Report System
 */

import { PrismaClient, Role, TemperatureStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@example.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@example.com",
      password: userPassword,
      role: Role.USER,
    },
  });
  console.log("✅ Demo user created:", user.email);

  // Create sample vehicles
  const vehiclesData = [
    {
      licensePlate: "50H73950",
      registrationName: "CÔNG TY TNHH THỰC PHẨM A ĐÔNG",
      registrationYear: 2021,
      brandName: "ISUZU",
      vehicleType: "Ô tô tải đông lạnh 2 ngăn",
      color: "Trắng",
      chassisNumber: "RLE1KR77HLMV103648",
      engineNumber: "131W92",
      manufacturingYear: 2021,
      usageExpiry: 2046,
      countryOfOrigin: "Nhật Bản",
      fuelType: "Dầu",
      fuelConsumption: 14.5,
      loadCapacity: 1.95,
      volume: 12,
      odometerKm: 45000,
      gpsKm: 44800,
      dimensions: "4220x1720x1780",
    },
    {
      licensePlate: "50H12345",
      registrationName: "CÔNG TY TNHH THỰC PHẨM A ĐÔNG",
      registrationYear: 2020,
      brandName: "HINO",
      vehicleType: "Ô tô tải đông lạnh",
      color: "Trắng",
      chassisNumber: "HINO12345678901234",
      engineNumber: "567890",
      manufacturingYear: 2020,
      usageExpiry: 2045,
      countryOfOrigin: "Nhật Bản",
      fuelType: "Dầu",
      fuelConsumption: 16.0,
      loadCapacity: 2.5,
      volume: 15,
      odometerKm: 78000,
      gpsKm: 77500,
      dimensions: "5000x2000x2000",
    },
    {
      licensePlate: "51C99999",
      registrationName: "CÔNG TY TNHH VẬN TẢI LẠNH MIỀN NAM",
      registrationYear: 2022,
      brandName: "HYUNDAI",
      vehicleType: "Ô tô tải đông lạnh 1 ngăn",
      color: "Xanh",
      chassisNumber: "HYUNDAI98765432101",
      engineNumber: "HYD2022",
      manufacturingYear: 2022,
      usageExpiry: 2047,
      countryOfOrigin: "Hàn Quốc",
      fuelType: "Dầu",
      fuelConsumption: 13.5,
      loadCapacity: 1.5,
      volume: 10,
      odometerKm: 25000,
      gpsKm: 24800,
      dimensions: "3800x1600x1700",
    },
    {
      licensePlate: "30B67890",
      registrationName: "CÔNG TY CP LOGISTICS BẮC NAM",
      registrationYear: 2019,
      brandName: "MITSUBISHI",
      vehicleType: "Ô tô tải đông lạnh",
      color: "Trắng",
      manufacturingYear: 2019,
      usageExpiry: 2044,
      countryOfOrigin: "Nhật Bản",
      fuelType: "Dầu",
      fuelConsumption: 15.0,
      loadCapacity: 2.0,
      volume: 14,
      odometerKm: 120000,
      gpsKm: 119500,
    },
    {
      licensePlate: "29A55555",
      registrationName: "CÔNG TY TNHH THƯƠNG MẠI HÀ NỘI",
      registrationYear: 2023,
      brandName: "THACO",
      vehicleType: "Ô tô tải đông lạnh 2 ngăn",
      color: "Xám",
      chassisNumber: "THACO2023XYZ12345",
      engineNumber: "TH2023001",
      manufacturingYear: 2023,
      usageExpiry: 2048,
      countryOfOrigin: "Việt Nam",
      fuelType: "Dầu",
      fuelConsumption: 12.0,
      loadCapacity: 1.8,
      volume: 11,
      odometerKm: 8000,
      gpsKm: 7950,
      dimensions: "4100x1700x1750",
    },
  ];

  const createdVehicles = [];
  for (const vehicleData of vehiclesData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { licensePlate: vehicleData.licensePlate },
      update: {},
      create: vehicleData,
    });
    createdVehicles.push(vehicle);
  }
  console.log(`✅ ${createdVehicles.length} vehicles created`);

  // Create sample upload log
  const uploadLog = await prisma.uploadLog.create({
    data: {
      fileName: "sample_temperature_data.xlsx",
      recordsCount: 100,
      uploadedById: admin.id,
    },
  });
  console.log("✅ Sample upload log created");

  // Create sample vehicle temperature data
  const temperatureRecords = [];
  const now = new Date();

  for (const vehicle of createdVehicles) {
    // Create 20 records per vehicle for the last 3 days
    for (let day = 0; day < 3; day++) {
      for (let hour = 8; hour <= 18; hour += 2) {
        const startTime = new Date(now);
        startTime.setDate(startTime.getDate() - day);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(
          endTime.getMinutes() + Math.floor(Math.random() * 30) + 5,
        );

        const duration = (endTime.getTime() - startTime.getTime()) / 60000; // minutes

        const freezerTemp = -20 + Math.random() * 10; // -20 to -10
        const coolerTemp = 2 + Math.random() * 8; // 2 to 10
        const isWarning = freezerTemp > -15 || coolerTemp > 10;

        temperatureRecords.push({
          vehiclePlate: vehicle.licensePlate,
          vehicleId: vehicle.id,
          startTime,
          endTime,
          duration: Math.round(duration),
          acStatus: Math.random() > 0.2 ? "Bật" : "Tắt",
          freezerTemp: parseFloat(freezerTemp.toFixed(2)),
          freezerHumidity: Math.floor(80 + Math.random() * 15),
          coolerTemp: parseFloat(coolerTemp.toFixed(2)),
          coolerHumidity: Math.floor(85 + Math.random() * 10),
          coordinates: `(10.${Math.floor(Math.random() * 99999)},106.${Math.floor(Math.random() * 99999)})`,
          location: `${Math.floor(Math.random() * 500)} Đường ${["Nguyễn Văn Linh", "Lê Văn Việt", "Võ Văn Ngân", "Phạm Văn Đồng", "Quốc lộ 1A"][Math.floor(Math.random() * 5)]}, TP.HCM`,
          status: isWarning
            ? TemperatureStatus.WARNING
            : TemperatureStatus.NORMAL,
          uploadLogId: uploadLog.id,
        });
      }
    }
  }

  await prisma.vehicleTemperature.createMany({
    data: temperatureRecords,
  });
  console.log(`✅ ${temperatureRecords.length} temperature records created`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Default accounts:");
  console.log("   Admin: admin@example.com / admin123");
  console.log("   User:  user@example.com / user123");
  console.log("\n🚛 Sample vehicles:");
  createdVehicles.forEach((v) => {
    console.log(`   ${v.licensePlate} - ${v.brandName} - ${v.vehicleType}`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
