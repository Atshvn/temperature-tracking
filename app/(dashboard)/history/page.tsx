"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSpreadsheet, Upload } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface UploadLog {
  id: string;
  fileName: string;
  recordsCount: number;
  actualRecords: number;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/history");
        const result = await response.json();
        if (response.ok) {
          setLogs(result.logs);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
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
        <h1 className="text-3xl font-bold">Lịch sử upload</h1>
        <p className="text-muted-foreground">
          Xem lịch sử các file đã được upload vào hệ thống
        </p>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách upload</CardTitle>
          <CardDescription>
            Lịch sử upload file Excel nhiệt độ xe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên file</TableHead>
                    <TableHead>Số bản ghi</TableHead>
                    <TableHead>Người upload</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{log.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {log.recordsCount} bản ghi
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.uploadedBy.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.uploadedBy.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(log.uploadedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Chưa có file nào được upload
              </p>
              <p className="text-sm text-muted-foreground">
                Vào trang Upload để tải file lên
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
