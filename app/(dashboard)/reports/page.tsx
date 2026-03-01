"use client";

import { useEffect, useState } from "react";
import { ReportTable, TemperatureRecord } from "@/components/report-table";

export default function ReportsPage() {
  const [data, setData] = useState<TemperatureRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/reports?limit=500");
        const result = await response.json();
        if (response.ok) {
          setData(result.records);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
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
        <h1 className="text-3xl font-bold">Báo cáo nhiệt độ</h1>
        <p className="text-muted-foreground">
          Xem và tìm kiếm dữ liệu nhiệt độ xe
        </p>
      </div>

      {/* Report Table */}
      <ReportTable data={data} isLoading={isLoading} />
    </div>
  );
}
