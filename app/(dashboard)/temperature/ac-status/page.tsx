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
import { AirVent, Search, Download } from "lucide-react";

interface ACStatusData {
  id: string;
  vehicleNumber: string;
  driverName: string;
  acStatus: "on" | "off";
  temperature: number;
  lastUpdated: string;
}

// Mock data - replace with API call
const mockData: ACStatusData[] = [
  {
    id: "1",
    vehicleNumber: "51A-12345",
    driverName: "Nguyễn Văn A",
    acStatus: "on",
    temperature: 24,
    lastUpdated: "2026-02-28 10:30:00",
  },
  {
    id: "2",
    vehicleNumber: "51A-67890",
    driverName: "Trần Văn B",
    acStatus: "off",
    temperature: 32,
    lastUpdated: "2026-02-28 10:25:00",
  },
  {
    id: "3",
    vehicleNumber: "51A-11111",
    driverName: "Lê Thị C",
    acStatus: "on",
    temperature: 22,
    lastUpdated: "2026-02-28 10:28:00",
  },
];

export default function ACStatusPage() {
  const [data, setData] = useState<ACStatusData[]>([]);
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

  const acOnCount = data.filter((d) => d.acStatus === "on").length;
  const acOffCount = data.filter((d) => d.acStatus === "off").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trạng thái điều hoà</h1>
          <p className="text-muted-foreground">
            Theo dõi trạng thái điều hoà của tất cả phương tiện
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng phương tiện
            </CardTitle>
            <AirVent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điều hoà BẬT</CardTitle>
            <AirVent className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acOnCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điều hoà TẮT</CardTitle>
            <AirVent className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{acOffCount}</div>
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
                <TableHead>Trạng thái điều hoà</TableHead>
                <TableHead>Nhiệt độ (°C)</TableHead>
                <TableHead>Cập nhật lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
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
                    <TableCell>
                      <Badge
                        variant={
                          item.acStatus === "on" ? "default" : "destructive"
                        }
                      >
                        {item.acStatus === "on" ? "BẬT" : "TẮT"}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.temperature}°C</TableCell>
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
