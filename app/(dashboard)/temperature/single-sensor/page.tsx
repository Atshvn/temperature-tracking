"use client";

import { useState, useEffect } from "react";
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
import { Thermometer, Search, Download, AlertTriangle } from "lucide-react";

interface SensorData {
  id: string;
  vehicleNumber: string;
  driverName: string;
  sensorTemp: number;
  minTemp: number;
  maxTemp: number;
  status: "normal" | "warning" | "critical";
  lastUpdated: string;
}

// Mock data - replace with API call
const mockData: SensorData[] = [
  {
    id: "1",
    vehicleNumber: "51A-12345",
    driverName: "Nguyễn Văn A",
    sensorTemp: 2.5,
    minTemp: 0,
    maxTemp: 5,
    status: "normal",
    lastUpdated: "2026-02-28 10:30:00",
  },
  {
    id: "2",
    vehicleNumber: "51A-67890",
    driverName: "Trần Văn B",
    sensorTemp: 8.2,
    minTemp: 0,
    maxTemp: 5,
    status: "critical",
    lastUpdated: "2026-02-28 10:25:00",
  },
  {
    id: "3",
    vehicleNumber: "51A-11111",
    driverName: "Lê Thị C",
    sensorTemp: 4.8,
    minTemp: 0,
    maxTemp: 5,
    status: "warning",
    lastUpdated: "2026-02-28 10:28:00",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "normal":
      return (
        <Badge variant="default" className="bg-green-500">
          Bình thường
        </Badge>
      );
    case "warning":
      return (
        <Badge variant="default" className="bg-yellow-500">
          Cảnh báo
        </Badge>
      );
    case "critical":
      return <Badge variant="destructive">Nguy hiểm</Badge>;
    default:
      return <Badge variant="secondary">Không xác định</Badge>;
  }
}

export default function SingleSensorPage() {
  const [data, setData] = useState<SensorData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const filteredData = data.filter(
    (item) =>
      item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const normalCount = data.filter((d) => d.status === "normal").length;
  const warningCount = data.filter((d) => d.status === "warning").length;
  const criticalCount = data.filter((d) => d.status === "critical").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nhiệt độ 1 cảm biến</h1>
          <p className="text-muted-foreground">
            Theo dõi nhiệt độ từ cảm biến đơn trên các phương tiện
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng phương tiện
            </CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bình thường</CardTitle>
            <Thermometer className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {normalCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {warningCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nguy hiểm</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo biển số, tài xế..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Biển số xe</TableHead>
                <TableHead>Tài xế</TableHead>
                <TableHead>Nhiệt độ (°C)</TableHead>
                <TableHead>Ngưỡng Min</TableHead>
                <TableHead>Ngưỡng Max</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cập nhật lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.vehicleNumber}
                    </TableCell>
                    <TableCell>{item.driverName}</TableCell>
                    <TableCell className="font-mono">
                      {item.sensorTemp}°C
                    </TableCell>
                    <TableCell className="font-mono">
                      {item.minTemp}°C
                    </TableCell>
                    <TableCell className="font-mono">
                      {item.maxTemp}°C
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.lastUpdated}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
