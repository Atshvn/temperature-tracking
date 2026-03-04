"use client";

import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Snowflake,
  Download,
  Search,
  ThermometerSnowflake,
  Droplets,
  MapPin,
  RefreshCw,
  Loader2,
  Car,
  FileSpreadsheet,
  FileText,
  Trash2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  licensePlate: string;
  registrationName: string;
  brandName: string;
}

interface ChartDataPoint {
  time: string;
  timeLabel: string;
  coolerTemp: number | null;
  freezerTemp: number | null;
  coolerHumidity: number | null;
  freezerHumidity: number | null;
}

interface TableRecord {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  acStatus: string;
  coolerTemp: number | null;
  coolerHumidity: number | null;
  freezerTemp: number | null;
  freezerHumidity: number | null;
  coordinates: string | null;
  location: string | null;
  status: string;
}

export default function ColdStoragePage() {
  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Filter state
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return format(d, "yyyy-MM-dd'T'HH:mm");
  });
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return format(d, "yyyy-MM-dd'T'HH:mm");
  });
  const [tempThreshold, setTempThreshold] = useState("0.3");
  const [reportInterval, setReportInterval] = useState("5");

  // Data state
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [tableData, setTableData] = useState<TableRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 0,
  });

  // Admin state for delete functionality
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch current user role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const user = await response.json();
          setIsAdmin(user.role === "ADMIN");
        }
      } catch {
        console.error("Error fetching user");
      }
    };
    fetchUser();
  }, []);

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const response = await fetch("/api/vehicles?limit=1000");
      const data = await response.json();
      if (response.ok && data.vehicles) {
        setVehicles(data.vehicles);
        // Auto-select first vehicle
        if (data.vehicles.length > 0 && !selectedVehicle) {
          setSelectedVehicle(data.vehicles[0].licensePlate);
        }
      }
    } catch {
      toast.error("Không thể tải danh sách xe");
    } finally {
      setLoadingVehicles(false);
    }
  }, [selectedVehicle]);

  // Fetch temperature data
  const fetchTemperatureData = useCallback(async () => {
    if (!selectedVehicle) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        vehiclePlate: selectedVehicle,
        fromDate: fromDate,
        toDate: toDate,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/temperature?${params}`);
      const data = await response.json();
      console.log(data.records);
      if (response.ok) {
        setChartData(data.chartData || []);
        setTableData(data.records || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Không thể kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  }, [selectedVehicle, fromDate, toDate, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleViewReport = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSelectedRows([]); // Clear selection when viewing new report
    fetchTemperatureData();
  };

  // Handle delete selected records (Admin only)
  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Chọn ít nhất 1 bản ghi để xóa");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa ${selectedRows.length} bản ghi?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/temperature", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRows }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setSelectedRows([]);
        fetchTemperatureData(); // Refresh data
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Không thể kết nối đến server");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle select all toggle
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tableData.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle single row select
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  // Fetch all records (no pagination) for export
  const fetchAllForExport = useCallback(async (): Promise<TableRecord[]> => {
    if (!selectedVehicle) return [];
    const params = new URLSearchParams({
      vehiclePlate: selectedVehicle,
      fromDate: fromDate,
      toDate: toDate,
      page: "1",
      limit: "100000",
    });
    const response = await fetch(`/api/temperature?${params}`);
    const data = await response.json();
    if (response.ok) return data.records || [];
    return [];
  }, [selectedVehicle, fromDate, toDate]);

  const handleExportExcel = async () => {
    if (!selectedVehicle) {
      toast.error("Vui lòng chọn xe");
      return;
    }

    setIsExporting(true);
    let exportData: TableRecord[] = [];
    try {
      exportData = await fetchAllForExport();
    } catch {
      toast.error("Không thể tải dữ liệu để xuất");
      setIsExporting(false);
      return;
    }

    if (exportData.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      setIsExporting(false);
      return;
    }

    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();

      // Style definitions matching file-mau.xlsx template exactly
      const titleStyle = {
        font: { sz: 11 }, // No bold, matching template
        alignment: { horizontal: "left", vertical: "center" },
      };

      const dateRangeStyle = {
        font: { sz: 11 },
        alignment: { horizontal: "left", vertical: "center" },
      };

      // Gray background like template (B1AFAF)
      const columnHeaderStyle = {
        font: { bold: true, sz: 10 },
        fill: { patternType: "solid", fgColor: { rgb: "B1AFAF" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // Data cells with borders and text wrap (matching template)
      const dataCellStyle = {
        font: { sz: 10 },
        alignment: { vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // Prepare data with headers matching upload template format exactly
      const wsData: (string | number | null)[][] = [];

      // Row 0: Vehicle info (same format as template)
      wsData.push([`Phương tiện: ${selectedVehicle}`]);

      // Row 1: Date range - format: "Khoảng thời gian: 00:00:00 dd/MM/yyyy - 23:59:00 dd/MM/yyyy"
      // fromDate/toDate are in yyyy-MM-dd'T'HH:mm format, parse and reformat
      const fromDateFormatted = format(new Date(fromDate), "dd/MM/yyyy");
      const toDateFormatted = format(new Date(toDate), "dd/MM/yyyy");
      wsData.push([
        `Khoảng thời gian: 00:00:00 ${fromDateFormatted} - 23:59:00 ${toDateFormatted}`,
      ]);

      // Row 2: Column headers (exact order from template)
      wsData.push([
        "Bắt đầu",
        "Kết thúc",
        "Thời gian",
        "Điều hòa",
        "Ngăn Đông",
        "Ngăn Đông - Độ ẩm",
        "Ngăn Mát",
        "Ngăn Mát - Độ ẩm",
        "Vị trí Bắt đầu/Kết thúc",
        "Vị trí Bắt đầu/Kết thúc",
      ]);

      // Row 3+: Data rows (order: freezer first, then cooler - matching template)
      // Format: M/d/yyyy h:mm:ss a (e.g., 12/2/2025 10:03:45 AM)
      exportData.forEach((row) => {
        wsData.push([
          format(new Date(row.startTime), "M/d/yyyy h:mm:ss a"),
          format(new Date(row.endTime), "M/d/yyyy h:mm:ss a"),
          formatDuration(row.duration),
          row.acStatus,
          row.freezerTemp,
          row.freezerHumidity,
          row.coolerTemp,
          row.coolerHumidity,
          row.coordinates || "",
          row.location || "",
        ]);
      });

      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Apply styles to cells
      // Row 0 (Vehicle info) - no bold
      if (ws["A1"]) ws["A1"].s = titleStyle;

      // Row 1 (Date range)
      if (ws["A2"]) ws["A2"].s = dateRangeStyle;

      // Row 2 (Column headers) - Apply gray background style to each header cell
      const headerCells = [
        "A3",
        "B3",
        "C3",
        "D3",
        "E3",
        "F3",
        "G3",
        "H3",
        "I3",
        "J3",
      ];
      headerCells.forEach((cell) => {
        if (ws[cell]) ws[cell].s = columnHeaderStyle;
      });

      // Apply style to data cells with borders (including empty cells)
      for (let row = 4; row <= exportData.length + 3; row++) {
        const cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        cols.forEach((col) => {
          const cellRef = `${col}${row}`;
          // Create cell if it doesn't exist (for empty values)
          if (!ws[cellRef]) {
            ws[cellRef] = { t: "s", v: "" };
          }
          ws[cellRef].s = { ...dataCellStyle };
        });
      }

      // Set column widths (exactly matching template)
      ws["!cols"] = [
        { wch: 13 }, // Bắt đầu
        { wch: 13 }, // Kết thúc
        { wch: 7.33 }, // Thời gian
        { wch: 6.83 }, // Điều hòa
        { wch: 9.17 }, // Ngăn Đông
        { wch: 12 }, // Ngăn Đông - Độ ẩm
        { wch: 13.33 }, // Ngăn Mát
        { wch: 17.33 }, // Ngăn Mát - Độ ẩm
        { wch: 31.83 }, // Vị trí Bắt đầu/Kết thúc (GPS)
        { wch: 54.17 }, // Vị trí Bắt đầu/Kết thúc (Address)
      ];

      // Set row heights
      ws["!rows"] = [
        { hpt: 18 }, // Row 0 - Vehicle info
        { hpt: 18 }, // Row 1 - Date range
        { hpt: 20 }, // Row 2 - Headers
      ];

      // Hide gridlines
      if (!ws["!sheetViews"]) ws["!sheetViews"] = [{}];
      ws["!sheetViews"][0].showGridLines = false;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Báo cáo nhiệt độ");

      // Generate filename: "VehiclePlate dd-MM.xlsx" using export date
      const fileDate = format(new Date(), "dd-MM");
      const filename = `${selectedVehicle} ${fileDate}.xlsx`;

      // Export file
      XLSX.writeFile(wb, filename);

      toast.success(`Xuất Excel thành công! (${exportData.length} bản ghi)`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi khi xuất Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedVehicle) {
      toast.error("Vui lòng chọn xe");
      return;
    }

    setIsExporting(true);
    let exportData: TableRecord[] = [];
    try {
      exportData = await fetchAllForExport();
    } catch {
      toast.error("Không thể tải dữ liệu để xuất");
      setIsExporting(false);
      return;
    }

    if (exportData.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      setIsExporting(false);
      return;
    }

    try {
      // Fetch Roboto fonts for Vietnamese support
      const [fontRegularResponse, fontBoldResponse] = await Promise.all([
        fetch("/fonts/Roboto-Regular.ttf"),
        fetch("/fonts/Roboto-Bold.ttf"),
      ]);

      const [fontRegularBuffer, fontBoldBuffer] = await Promise.all([
        fontRegularResponse.arrayBuffer(),
        fontBoldResponse.arrayBuffer(),
      ]);

      const fontRegularBase64 = btoa(
        new Uint8Array(fontRegularBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      );
      const fontBoldBase64 = btoa(
        new Uint8Array(fontBoldBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          "",
        ),
      );

      // Create new PDF document (landscape for better table fit)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add Vietnamese fonts (regular and bold)
      doc.addFileToVFS("Roboto-Regular.ttf", fontRegularBase64);
      doc.addFileToVFS("Roboto-Bold.ttf", fontBoldBase64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
      doc.setFont("Roboto");

      // Format dates for header
      const fromDateFormatted = format(new Date(fromDate), "dd/MM/yyyy");
      const toDateFormatted = format(new Date(toDate), "dd/MM/yyyy");

      // Add title (Row 0 style - no bold)
      doc.setFontSize(11);
      doc.text(`Phương tiện: ${selectedVehicle}`, 14, 15);

      // Add date range (Row 1 style)
      doc.setFontSize(11);
      doc.text(
        `Khoảng thời gian: 00:00:00 ${fromDateFormatted} - 23:59:00 ${toDateFormatted}`,
        14,
        21,
      );

      // Prepare table data (matching template order: Ngăn Đông first, then Ngăn Mát)
      const headers = [
        [
          "Bắt đầu",
          "Kết thúc",
          "Thời gian",
          "Điều hòa",
          "Ngăn Đông",
          "Ngăn Đông - Độ ẩm",
          "Ngăn Mát",
          "Ngăn Mát - Độ ẩm",
          "Vị trí GPS",
          "Vị trí",
        ],
      ];

      const data = exportData.map((row) => [
        format(new Date(row.startTime), "M/d/yyyy h:mm:ss a"),
        format(new Date(row.endTime), "M/d/yyyy h:mm:ss a"),
        formatDuration(row.duration),
        row.acStatus,
        row.freezerTemp?.toString() || "",
        row.freezerHumidity?.toString() || "",
        row.coolerTemp?.toString() || "",
        row.coolerHumidity?.toString() || "",
        row.coordinates || "",
        row.location || "", // Full location, no truncation
      ]);

      // Generate table with style matching Excel template
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 26,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          font: "Roboto",
          overflow: "linebreak", // Enable text wrapping
        },
        headStyles: {
          fillColor: [177, 175, 175], // Gray color matching template (B1AFAF)
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
        },
        bodyStyles: {
          valign: "top",
        },
        columnStyles: {
          0: { cellWidth: 22 }, // Bắt đầu
          1: { cellWidth: 22 }, // Kết thúc
          2: { cellWidth: 12 }, // Thời gian
          3: { cellWidth: 10 }, // Điều hòa
          4: { cellWidth: 14, halign: "center" }, // Ngăn Đông
          5: { cellWidth: 16, halign: "center" }, // Ngăn Đông - Độ ẩm
          6: { cellWidth: 14, halign: "center" }, // Ngăn Mát
          7: { cellWidth: 16, halign: "center" }, // Ngăn Mát - Độ ẩm
          8: { cellWidth: 35 }, // Vị trí GPS
          9: { cellWidth: "auto" }, // Vị trí - auto width for full text
        },
        theme: "grid",
        margin: { top: 10, left: 14, right: 14 },
      });

      // Add footer with page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Trang ${i} / ${pageCount}`,
          doc.internal.pageSize.getWidth() - 25,
          doc.internal.pageSize.getHeight() - 10,
        );
        doc.text(
          `Xuất ngày: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
          14,
          doc.internal.pageSize.getHeight() - 10,
        );
      }

      // Generate filename and save: "VehiclePlate dd-MM.pdf" using export date
      const fileDatePdf = format(new Date(), "dd-MM");
      const filename = `${selectedVehicle} ${fileDatePdf}.pdf`;
      doc.save(filename);

      toast.success(`Xuất PDF thành công! (${exportData.length} bản ghi)`);
    } catch (error) {
      console.error("Export PDF error:", error);
      toast.error("Có lỗi khi xuất PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Format duration in minutes to HH:mm:ss
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    const s = 0;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Custom tooltip for chart
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ color: string; name: string; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></span>
              {entry.name}: {entry.value !== null ? entry.value : "N/A"}
              {entry.name.includes("Độ ẩm") ? "%" : "°C"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const selectedVehicleInfo = vehicles.find(
    (v) => v.licensePlate === selectedVehicle,
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Snowflake className="h-8 w-8 text-primary" />
          Báo cáo nhiệt độ thùng lạnh/kho lạnh
        </h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi và phân tích nhiệt độ thùng lạnh, kho lạnh theo thời gian
          thực
        </p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Vehicle Selector */}
            <div className="lg:col-span-1">
              <Label className="text-sm font-medium mb-2 block">
                Chọn phương tiện
              </Label>
              <Select
                value={selectedVehicle}
                onValueChange={setSelectedVehicle}
                disabled={loadingVehicles}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn xe">
                    {loadingVehicles ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải...
                      </span>
                    ) : (
                      selectedVehicle || "Chọn xe"
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.licensePlate}>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {v.licensePlate}
                        <span className="text-xs text-muted-foreground">
                          ({v.brandName})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="lg:col-span-1">
              <Label className="text-sm font-medium mb-2 block">Từ ngày</Label>
              <DateTimePicker
                value={fromDate}
                onChange={setFromDate}
                placeholder="Chọn ngày bắt đầu"
              />
            </div>

            {/* To Date */}
            <div className="lg:col-span-1">
              <Label className="text-sm font-medium mb-2 block">Đến ngày</Label>
              <DateTimePicker
                value={toDate}
                onChange={setToDate}
                placeholder="Chọn ngày kết thúc"
              />
            </div>

            {/* Temperature Threshold */}
            <div className="lg:col-span-1">
              <Label className="text-sm font-medium mb-2 block">
                Mức thay đổi nhiệt độ
              </Label>
              <Input
                type="number"
                step="0.1"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
              />
            </div>

            {/* Report Interval */}
            <div className="lg:col-span-1">
              <Label className="text-sm font-medium mb-2 block">
                Tần suất báo cáo (phút)
              </Label>
              <Input
                type="number"
                value={reportInterval}
                onChange={(e) => setReportInterval(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="lg:col-span-1 flex items-end gap-2">
              <Button
                onClick={handleViewReport}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Xem báo cáo
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isExporting}>
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleExportExcel}
                    disabled={isExporting}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Xuất Excel (toàn bộ)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleExportPDF}
                    disabled={isExporting}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Xuất PDF (toàn bộ)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ThermometerSnowflake className="h-5 w-5" />
            Biểu đồ nhiệt độ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="timeLabel"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  yAxisId="temp"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  label={{
                    value: "Nhiệt độ °C",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fontSize: 12 },
                  }}
                />
                <YAxis
                  yAxisId="humidity"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  label={{
                    value: "Độ ẩm %",
                    angle: 90,
                    position: "insideRight",
                    style: { textAnchor: "middle", fontSize: 12 },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <ReferenceLine
                  yAxisId="temp"
                  y={0}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="5 5"
                  label={{
                    value: "Ngưỡng đông",
                    fill: "hsl(var(--destructive))",
                    fontSize: 10,
                  }}
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="coolerTemp"
                  name="Ngăn mát (°C)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="freezerTemp"
                  name="Ngăn đông (°C)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
                <Line
                  yAxisId="humidity"
                  type="monotone"
                  dataKey="coolerHumidity"
                  name="Ngăn mát - Độ ẩm (%)"
                  stroke="#60a5fa"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
                <Line
                  yAxisId="humidity"
                  type="monotone"
                  dataKey="freezerHumidity"
                  name="Ngăn đông - Độ ẩm (%)"
                  stroke="#22d3d1"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls
                />
                <Brush
                  dataKey="timeLabel"
                  height={30}
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--muted))"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Custom */}
          <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">
                Ngăn mát - Độ ẩm(%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500 rounded"></div>
              <span className="text-sm text-muted-foreground">
                Ngăn mát(°C)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-muted-foreground">
                Ngăn đông - Độ ẩm(%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500 rounded"></div>
              <span className="text-sm text-muted-foreground">
                Ngăn đông(°C)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Info & Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg">
                Phương tiện: {selectedVehicle}
                {selectedVehicleInfo && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({selectedVehicleInfo.brandName} -{" "}
                    {selectedVehicleInfo.registrationName})
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Khoảng thời gian:{" "}
                {format(new Date(fromDate), "HH:mm:ss dd/MM/yyyy", {
                  locale: vi,
                })}{" "}
                -{" "}
                {format(new Date(toDate), "HH:mm:ss dd/MM/yyyy", {
                  locale: vi,
                })}
              </p>
            </div>
            <Badge variant="outline" className="w-fit">
              <MapPin className="h-3 w-3 mr-1" />
              {pagination.total} bản ghi
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : tableData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Snowflake className="h-12 w-12 mb-3 opacity-50" />
              <p>Chưa có dữ liệu nhiệt độ</p>
              <p className="text-sm">
                Chọn xe và nhấn &quot;Xem báo cáo&quot; để tải dữ liệu
              </p>
            </div>
          ) : (
            <>
              {/* Delete button for admin when items selected */}
              {isAdmin && selectedRows.length > 0 && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <span className="text-sm text-red-700 dark:text-red-300">
                    Đã chọn {selectedRows.length} bản ghi
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Xóa
                  </Button>
                </div>
              )}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {isAdmin && (
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={
                              selectedRows.length === tableData.length &&
                              tableData.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                      )}
                      <TableHead className="font-semibold whitespace-nowrap">
                        Bắt đầu
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Kết thúc
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Thời gian
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap">
                        Điều hòa
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap text-blue-600">
                        Ngăn mát(°C)
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap text-blue-400">
                        Ngăn mát - Độ ẩm(%)
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap text-red-600">
                        Ngăn đông(°C)
                      </TableHead>
                      <TableHead className="font-semibold whitespace-nowrap text-cyan-600">
                        Ngăn đông - Độ ẩm(%)
                      </TableHead>
                      <TableHead className="font-semibold min-w-[300px]">
                        Vị trí
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={`${index % 2 === 0 ? "bg-muted/20" : ""} ${selectedRows.includes(row.id) ? "bg-red-50 dark:bg-red-950" : ""}`}
                      >
                        {isAdmin && (
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(row.id)}
                              onCheckedChange={(checked) =>
                                handleSelectRow(row.id, checked as boolean)
                              }
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-mono text-sm whitespace-nowrap">
                          {format(
                            new Date(row.startTime),
                            "HH:mm:ss dd/MM/yyyy",
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm whitespace-nowrap">
                          {format(new Date(row.endTime), "HH:mm:ss dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatDuration(row.duration)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.acStatus === "Bật" ? "default" : "secondary"
                            }
                          >
                            {row.acStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-blue-600">
                          {row.coolerTemp !== null
                            ? row.coolerTemp.toFixed(2)
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-blue-400">
                          {row.coolerHumidity !== null
                            ? `${row.coolerHumidity}%`
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-red-600">
                          {row.freezerTemp !== null
                            ? row.freezerTemp.toFixed(2)
                            : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-cyan-600">
                          {row.freezerHumidity !== null
                            ? `${row.freezerHumidity}%`
                            : "-"}
                        </TableCell>
                        <TableCell
                          className="text-sm text-muted-foreground max-w-[400px] truncate"
                          title={row.location || ""}
                        >
                          {row.location || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Trang {pagination.page} / {pagination.totalPages} (
                  {pagination.total} bản ghi)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => {
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }));
                      fetchTemperatureData();
                    }}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => {
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }));
                      fetchTemperatureData();
                    }}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
