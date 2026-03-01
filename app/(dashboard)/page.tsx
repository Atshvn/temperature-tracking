"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Thermometer,
  Car,
  AlertTriangle,
  Activity,
  Snowflake,
  BarChart3,
} from "lucide-react";
import { formatTemperature } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardStats {
  warningCount: number;
  vehicleCount: number;
  avgFreezerTemp: number | null;
  avgCoolerTemp: number | null;
  minFreezerTemp: number | null;
  minCoolerTemp: number | null;
}

interface VehicleRecordChart {
  vehiclePlate: string;
  count: number;
}

interface DashboardData {
  stats: DashboardStats;
  vehicleRecordsChart: VehicleRecordChart[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();
        if (response.ok) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống báo cáo nhiệt độ xe
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
        {/* Total Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số xe</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {data?.stats.vehicleCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Xe trong hệ thống
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Warning Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive">
                  {data?.stats.warningCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vượt ngưỡng nhiệt độ
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngăn đông</CardTitle>
            <Snowflake className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <div className="flex items-baseline gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data?.stats?.minFreezerTemp != null
                      ? formatTemperature(data!.stats.minFreezerTemp!)
                      : "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">Thấp nhất</p>
                </div>
                <div>
                  <div className="text-lg font-semibold text-muted-foreground">
                    {data?.stats?.avgFreezerTemp != null
                      ? formatTemperature(data!.stats.avgFreezerTemp!)
                      : "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">Trung bình</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cooler Temperature */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngăn mát</CardTitle>
            <Thermometer className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <div className="flex items-baseline gap-4">
                <div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {data?.stats?.minCoolerTemp != null
                      ? formatTemperature(data!.stats.minCoolerTemp!)
                      : "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">Thấp nhất</p>
                </div>
                <div>
                  <div className="text-lg font-semibold text-muted-foreground">
                    {data?.stats?.avgCoolerTemp != null
                      ? formatTemperature(data!.stats.avgCoolerTemp!)
                      : "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">Trung bình</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Records Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Số bản ghi theo xe</CardTitle>
          </div>
          <CardDescription>
            Thống kê số lượng bản ghi nhiệt độ của từng xe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          ) : data?.vehicleRecordsChart &&
            data.vehicleRecordsChart.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.vehicleRecordsChart}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="vehiclePlate"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={80}
                    className="text-xs"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Số bản ghi",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fontSize: 12 },
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      Number(value).toLocaleString(),
                      "Bản ghi",
                    ]}
                    labelFormatter={(label) => `Xe: ${label}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.vehicleRecordsChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="#22c55e" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có dữ liệu</p>
              <p className="text-sm text-muted-foreground">
                Upload file Excel để bắt đầu
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
