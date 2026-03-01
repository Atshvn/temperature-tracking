"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Car,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface Vehicle {
  id: string;
  licensePlate: string;
  registrationName: string;
  brandName: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function TemperatureUploadPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<{
    recordsCount: number;
    vehiclePlate?: string;
    warnings?: string[];
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch vehicles for selector
  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const response = await fetch("/api/vehicles?limit=1000");
      const data = await response.json();
      if (response.ok) {
        setVehicles(data.vehicles);
      }
    } catch {
      toast.error("Không thể tải danh sách xe");
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Chỉ chấp nhận file Excel (.xlsx, .xls)");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File không được vượt quá 10MB");
      return;
    }

    setFile(selectedFile);
    setUploadState("idle");
    setErrorMessage("");
    setResult(null);
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) return;

    setUploadState("uploading");
    setProgress(0);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedVehicleId) {
        formData.append("vehicleId", selectedVehicleId);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setUploadState("success");
      setResult(data);
      toast.success(`Đã upload thành công ${data.recordsCount} bản ghi`);
    } catch (error) {
      setUploadState("error");
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
    setErrorMessage("");
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Download template
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/upload/template");
      if (!response.ok) throw new Error("Failed to download template");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "temperature_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Đã tải template");
    } catch {
      toast.error("Không thể tải template");
    }
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Upload className="h-8 w-8 text-primary" />
          Upload dữ liệu nhiệt độ
        </h1>
        <p className="text-muted-foreground mt-1">
          Tải lên file Excel chứa dữ liệu báo cáo nhiệt độ xe đông lạnh
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Vehicle Selection & Upload */}
        <div className="space-y-6">
          {/* Vehicle Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Chọn xe (tùy chọn)
              </CardTitle>
              <CardDescription>
                Chọn xe để gán dữ liệu hoặc để trống để lấy từ file Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Select
                    value={selectedVehicleId}
                    onValueChange={(value) =>
                      setSelectedVehicleId(value === "auto" ? "" : value)
                    }
                    disabled={loadingVehicles}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Chọn xe hoặc để trống --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        -- Lấy từ file Excel --
                      </SelectItem>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {vehicle.licensePlate}
                            </Badge>
                            <span className="text-muted-foreground">
                              {vehicle.registrationName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchVehicles}
                  disabled={loadingVehicles}
                >
                  {loadingVehicles ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {selectedVehicle && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Xe đã chọn:</strong> {selectedVehicle.licensePlate}{" "}
                    - {selectedVehicle.registrationName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hãng: {selectedVehicle.brandName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload file Excel</CardTitle>
              <CardDescription>
                Tải lên file Excel xuất từ hệ thống GPS. Hỗ trợ định dạng .xlsx
                và .xls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                  uploadState === "success" &&
                    "border-green-500 bg-green-50 dark:bg-green-950/20",
                  uploadState === "error" &&
                    "border-red-500 bg-red-50 dark:bg-red-950/20",
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                />

                {!file && uploadState === "idle" && (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">
                        Kéo thả file vào đây hoặc click để chọn
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Chấp nhận file .xlsx, .xls (tối đa 10MB)
                      </p>
                    </div>
                  </div>
                )}

                {file &&
                  uploadState !== "success" &&
                  uploadState !== "error" && (
                    <div className="space-y-2">
                      <FileSpreadsheet className="mx-auto h-12 w-12 text-green-600" />
                      <div>
                        <p className="text-lg font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  )}

                {uploadState === "success" && (
                  <div className="space-y-2">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                    <div>
                      <p className="text-lg font-medium text-green-600">
                        Upload thành công!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Đã lưu {result?.recordsCount} bản ghi cho xe{" "}
                        <Badge variant="secondary">
                          {result?.vehiclePlate}
                        </Badge>
                      </p>
                    </div>
                  </div>
                )}

                {uploadState === "error" && (
                  <div className="space-y-2">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
                    <div>
                      <p className="text-lg font-medium text-red-600">
                        Upload thất bại
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {uploadState === "uploading" && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Đang xử lý... {progress}%
                  </p>
                </div>
              )}

              {/* Warnings */}
              {result?.warnings && result.warnings.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Cảnh báo ({result.warnings.length}):
                  </p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 list-disc list-inside">
                    {result.warnings.slice(0, 5).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                    {result.warnings.length > 5 && (
                      <li>... và {result.warnings.length - 5} cảnh báo khác</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {file && uploadState === "idle" && (
                  <>
                    <Button onClick={handleUpload} className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload file
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      <X className="mr-2 h-4 w-4" />
                      Hủy
                    </Button>
                  </>
                )}

                {(uploadState === "success" || uploadState === "error") && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Upload file khác
                  </Button>
                )}

                <Button variant="secondary" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Tải template mẫu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Instructions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hướng dẫn upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Định dạng file Excel</h4>
                <p className="text-sm text-muted-foreground">
                  File Excel cần theo đúng định dạng xuất từ hệ thống GPS với
                  các cột:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                  <li>
                    <code className="bg-muted px-1 rounded">Bắt đầu</code> -
                    Thời gian bắt đầu
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">Kết thúc</code> -
                    Thời gian kết thúc
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">Thời gian</code> -
                    Thời lượng
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">Điều hòa</code> -
                    Trạng thái AC
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">Ngăn Đông</code> -
                    Nhiệt độ ngăn đông
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">
                      Ngăn Đông - Độ ẩm
                    </code>
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">Ngăn Mát</code> -
                    Nhiệt độ ngăn mát
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">
                      Ngăn Mát - Độ ẩm
                    </code>
                  </li>
                  <li>
                    <code className="bg-muted px-1 rounded">Vị trí</code> - Tọa
                    độ GPS và địa chỉ
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. Biển số xe</h4>
                <p className="text-sm text-muted-foreground">
                  Dòng đầu tiên của file cần có thông tin xe theo định dạng:
                </p>
                <code className="block bg-muted p-2 rounded text-sm">
                  Phương tiện: 50H12345
                </code>
                <p className="text-sm text-muted-foreground">
                  Hoặc bạn có thể chọn xe từ danh sách bên trái.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. Ngưỡng cảnh báo</h4>
                <ul className="text-sm text-muted-foreground list-disc list-inside ml-2">
                  <li>Ngăn đông: Cảnh báo nếu nhiệt độ &gt; -15°C</li>
                  <li>Ngăn mát: Cảnh báo nếu nhiệt độ &gt; 10°C</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Lưu ý:</strong> Dữ liệu sẽ được lưu theo xe và có thể
                  xem trong <em>Báo cáo nhiệt độ &gt; Kho lạnh</em>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
