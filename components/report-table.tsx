"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime, formatTemperature } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
} from "lucide-react";

// Temperature record type
export interface TemperatureRecord {
  id: string;
  vehiclePlate: string;
  temperature: number;
  recordedAt: string;
  status: "NORMAL" | "WARNING";
  createdAt: string;
}

interface ReportTableProps {
  data: TemperatureRecord[];
  isLoading?: boolean;
}

type SortField = "vehiclePlate" | "temperature" | "recordedAt" | "status";
type SortOrder = "asc" | "desc";

export function ReportTable({ data, isLoading = false }: ReportTableProps) {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Sort states
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 ml-1" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) =>
        item.vehiclePlate.toLowerCase().includes(term),
      );
    }

    // Apply date filter
    if (dateFrom) {
      result = result.filter((item) => new Date(item.recordedAt) >= dateFrom);
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter((item) => new Date(item.recordedAt) <= endOfDay);
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "vehiclePlate":
            comparison = a.vehiclePlate.localeCompare(b.vehiclePlate);
            break;
          case "temperature":
            comparison = a.temperature - b.temperature;
            break;
          case "recordedAt":
            comparison =
              new Date(a.recordedAt).getTime() -
              new Date(b.recordedAt).getTime();
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, dateFrom, dateTo, sortField, sortOrder]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasFilters = searchTerm || dateFrom || dateTo;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-full sm:w-64" />
          <Skeleton className="h-10 w-full sm:w-40" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Biển số xe</TableHead>
                <TableHead>Nhiệt độ</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo biển số..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateFrom && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom
                ? format(dateFrom, "dd/MM/yyyy", { locale: vi })
                : "Từ ngày"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateTo && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo
                ? format(dateTo, "dd/MM/yyyy", { locale: vi })
                : "Đến ngày"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("vehiclePlate")}
              >
                <div className="flex items-center">
                  Biển số xe
                  {getSortIcon("vehiclePlate")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("temperature")}
              >
                <div className="flex items-center">
                  Nhiệt độ
                  {getSortIcon("temperature")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("recordedAt")}
              >
                <div className="flex items-center">
                  Thời gian
                  {getSortIcon("recordedAt")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Trạng thái
                  {getSortIcon("status")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p>Không có dữ liệu</p>
                    {hasFilters && (
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        className="mt-2"
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow
                  key={record.id}
                  className={cn(
                    record.status === "WARNING" &&
                      "bg-red-50 dark:bg-red-950/20",
                  )}
                >
                  <TableCell className="font-medium">
                    {record.vehiclePlate}
                  </TableCell>
                  <TableCell
                    className={cn(
                      record.status === "WARNING" &&
                        "text-red-600 dark:text-red-400 font-semibold",
                    )}
                  >
                    {formatTemperature(record.temperature)}
                  </TableCell>
                  <TableCell>{formatDateTime(record.recordedAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === "WARNING" ? "destructive" : "success"
                      }
                    >
                      {record.status === "WARNING" ? "Cảnh báo" : "Bình thường"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Hiển thị {filteredData.length} / {data.length} bản ghi
      </div>
    </div>
  );
}
