-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TemperatureStatus" AS ENUM ('NORMAL', 'WARNING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_temperatures" (
    "id" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "status" "TemperatureStatus" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadLogId" TEXT,

    CONSTRAINT "vehicle_temperatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_logs" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "recordsCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "upload_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "vehicle_temperatures_vehiclePlate_idx" ON "vehicle_temperatures"("vehiclePlate");

-- CreateIndex
CREATE INDEX "vehicle_temperatures_recordedAt_idx" ON "vehicle_temperatures"("recordedAt");

-- CreateIndex
CREATE INDEX "vehicle_temperatures_status_idx" ON "vehicle_temperatures"("status");

-- AddForeignKey
ALTER TABLE "vehicle_temperatures" ADD CONSTRAINT "vehicle_temperatures_uploadLogId_fkey" FOREIGN KEY ("uploadLogId") REFERENCES "upload_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_logs" ADD CONSTRAINT "upload_logs_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
