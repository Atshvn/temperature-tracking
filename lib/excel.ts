/**
 * Excel Processing Utilities
 * Parse and validate Excel files for vehicle temperature data
 * Format: Báo cáo nhiệt độ xe đông lạnh
 */

import * as XLSX from "xlsx";
import { TemperatureStatus } from "@prisma/client";

// Temperature threshold for warning status
export const FREEZER_THRESHOLD = -15; // Ngăn đông
export const COOLER_THRESHOLD = 10; // Ngăn mát

// Parsed row from Excel
export interface ExcelRow {
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  acStatus: string;
  freezerTemp: number | null;
  freezerHumidity: number | null;
  coolerTemp: number | null;
  coolerHumidity: number | null;
  coordinates: string | null;
  location: string | null;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: ExcelRow[];
  vehiclePlate: string | null;
}

// Parsed temperature record ready for database
export interface ParsedTemperatureRecord {
  vehiclePlate: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  acStatus: string;
  freezerTemp: number | null;
  freezerHumidity: number | null;
  coolerTemp: number | null;
  coolerHumidity: number | null;
  coordinates: string | null;
  location: string | null;
  status: TemperatureStatus;
}

/**
 * Convert Excel serial date to JavaScript Date
 * Excel dates are stored as days since December 30, 1899
 * Excel times in this app are in Vietnam time (UTC+7).
 * We convert to UTC so the database stores the correct absolute time,
 * and the frontend (UTC+7) will display the original Vietnam time correctly.
 */
export function excelDateToJSDate(serial: number): Date {
  // Excel epoch is December 30, 1899
  const days = Math.floor(serial);

  // Handle fractional days (time)
  const fractionalDay = serial - days;
  const totalSeconds = Math.round(fractionalDay * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Use UTC arithmetic to avoid server timezone interference.
  // The Excel file records Vietnam local time (UTC+7), so subtract 7 hours
  // to get the correct UTC timestamp for storage.
  const excelEpochUTC = Date.UTC(1899, 11, 30); // Dec 30, 1899 00:00 UTC
  const dayMs = days * 24 * 60 * 60 * 1000;
  const timeMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  const vietnamOffsetMs = 7 * 60 * 60 * 1000; // UTC+7

  return new Date(excelEpochUTC + dayMs + timeMs - vietnamOffsetMs);
}

/**
 * Parse vehicle plate from first row
 * Format: "Phương tiện: 50H73950"
 */
function parseVehiclePlate(row: unknown[]): string | null {
  if (!row || !row[0]) return null;
  const text = String(row[0]);
  const match = text.match(/Phương tiện:\s*([A-Z0-9]+)/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Parse a single value, handling both numbers and strings
 */
function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  const num = parseFloat(String(value).replace(",", "."));
  return isNaN(num) ? null : num;
}

/**
 * Parse Excel file buffer and extract temperature data
 */
export function parseExcelFile(buffer: ArrayBuffer): ValidationResult {
  const errors: string[] = [];
  const data: ExcelRow[] = [];
  let vehiclePlate: string | null = null;

  try {
    // Read workbook
    const workbook = XLSX.read(buffer, { type: "array" });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        valid: false,
        errors: ["Excel file has no sheets"],
        data: [],
        vehiclePlate: null,
      };
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (raw data)
    const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      raw: true,
    });

    if (rawData.length < 4) {
      return {
        valid: false,
        errors: ["File không đúng định dạng hoặc không có dữ liệu"],
        data: [],
        vehiclePlate: null,
      };
    }

    // Parse vehicle plate from first row
    vehiclePlate = parseVehiclePlate(rawData[0]);
    if (!vehiclePlate) {
      errors.push("Không tìm thấy biển số xe trong file");
    }

    // Skip header rows (0: vehicle info, 1: time range, 2: column headers)
    // Data starts from row 3 (index 3)
    for (let i = 3; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !Array.isArray(row) || row.length === 0) continue;

      const rowNumber = i + 1;

      try {
        // Column mapping based on template:
        // 0: Bắt đầu (Excel serial date)
        // 1: Kết thúc (Excel serial date)
        // 2: Thời gian (duration in days)
        // 3: Điều hòa
        // 4: Ngăn Đông (temp)
        // 5: Ngăn Đông - Độ ẩm
        // 6: Ngăn Mát (temp)
        // 7: Ngăn Mát - Độ ẩm
        // 8: Vị trí (coordinates)
        // 9: Vị trí (address/location)

        const startSerial = parseNumericValue(row[0]);
        const endSerial = parseNumericValue(row[1]);
        const durationDays = parseNumericValue(row[2]);

        if (!startSerial || !endSerial) {
          // Skip empty rows silently
          if (
            row.some(
              (cell) => cell !== null && cell !== undefined && cell !== "",
            )
          ) {
            errors.push(`Dòng ${rowNumber}: Thiếu thời gian bắt đầu/kết thúc`);
          }
          continue;
        }

        const startTime = excelDateToJSDate(startSerial);
        const endTime = excelDateToJSDate(endSerial);

        // Duration in minutes (Excel stores as fraction of day)
        const duration = durationDays ? Math.round(durationDays * 24 * 60) : 0;

        const acStatus = row[3] ? String(row[3]) : "Tắt";
        const freezerTemp = parseNumericValue(row[4]);
        const freezerHumidity = parseNumericValue(row[5]);
        const coolerTemp = parseNumericValue(row[6]);
        const coolerHumidity = parseNumericValue(row[7]);
        const coordinates = row[8] ? String(row[8]) : null;
        const location = row[9] ? String(row[9]) : null;

        data.push({
          startTime,
          endTime,
          duration,
          acStatus,
          freezerTemp,
          freezerHumidity,
          coolerTemp,
          coolerHumidity,
          coordinates,
          location,
        });
      } catch {
        errors.push(`Dòng ${rowNumber}: Lỗi xử lý dữ liệu`);
      }
    }

    if (data.length === 0) {
      errors.push("Không tìm thấy dữ liệu hợp lệ trong file");
    }

    return {
      valid: errors.length === 0,
      errors,
      data,
      vehiclePlate,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        `Lỗi đọc file Excel: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
      data: [],
      vehiclePlate: null,
    };
  }
}

/**
 * Determine temperature status based on thresholds
 */
function determineStatus(
  freezerTemp: number | null,
  coolerTemp: number | null,
): TemperatureStatus {
  // Warning if freezer temp is too high (should be below threshold)
  if (freezerTemp !== null && freezerTemp > FREEZER_THRESHOLD) {
    return TemperatureStatus.WARNING;
  }
  // Warning if cooler temp is too high
  if (coolerTemp !== null && coolerTemp > COOLER_THRESHOLD) {
    return TemperatureStatus.WARNING;
  }
  return TemperatureStatus.NORMAL;
}

/**
 * Convert parsed Excel data to database records
 */
export function convertToDbRecords(
  data: ExcelRow[],
  vehiclePlate: string,
): ParsedTemperatureRecord[] {
  return data.map((row) => ({
    vehiclePlate,
    startTime: row.startTime,
    endTime: row.endTime,
    duration: row.duration,
    acStatus: row.acStatus,
    freezerTemp: row.freezerTemp,
    freezerHumidity: row.freezerHumidity,
    coolerTemp: row.coolerTemp,
    coolerHumidity: row.coolerHumidity,
    coordinates: row.coordinates,
    location: row.location,
    status: determineStatus(row.freezerTemp, row.coolerTemp),
  }));
}

/**
 * Generate Excel template for download
 */
export function generateExcelTemplate(): ArrayBuffer {
  const workbook = XLSX.utils.book_new();

  // Create sample data
  const data = [
    ["Phương tiện: 50H12345"],
    ["Khoảng thời gian: 00:00:00 01/01/2025 - 23:59:00 01/01/2025"],
    [
      "Bắt đầu",
      "Kết thúc",
      "Thời gian",
      "Điều hòa",
      "Ngăn Đông",
      "Ngăn Đông - Độ ẩm",
      "Ngăn Mát",
      "Ngăn Mát - Độ ẩm",
      "Vị trí (GPS)",
      "Vị trí (Địa chỉ)",
    ],
    [
      "01/01/2025 08:00",
      "01/01/2025 08:05",
      "5 phút",
      "Bật",
      "-18.5",
      "85",
      "5.2",
      "90",
      "(10.123,106.456)",
      "123 Đường ABC, Q1, TP.HCM",
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 18 }, // Bắt đầu
    { wch: 18 }, // Kết thúc
    { wch: 10 }, // Thời gian
    { wch: 10 }, // Điều hòa
    { wch: 12 }, // Ngăn Đông
    { wch: 18 }, // Ngăn Đông - Độ ẩm
    { wch: 12 }, // Ngăn Mát
    { wch: 18 }, // Ngăn Mát - Độ ẩm
    { wch: 25 }, // GPS
    { wch: 40 }, // Địa chỉ
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}
