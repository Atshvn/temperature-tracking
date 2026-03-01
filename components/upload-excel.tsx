"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";

interface UploadExcelProps {
  onUploadSuccess?: () => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadExcel({ onUploadSuccess }: UploadExcelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<{ recordsCount: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
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
      onUploadSuccess?.();
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
    } catch (error) {
      toast.error("Không thể tải template");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload dữ liệu nhiệt độ</CardTitle>
        <CardDescription>
          Tải lên file Excel chứa dữ liệu nhiệt độ xe. Hỗ trợ định dạng .xlsx và
          .xls
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

          {file && uploadState !== "success" && uploadState !== "error" && (
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
                  Đã lưu {result?.recordsCount} bản ghi vào hệ thống
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
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
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
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Upload file khác
            </Button>
          )}

          <Button variant="secondary" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Tải template mẫu
          </Button>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-muted p-4">
          <h4 className="font-medium mb-2">Hướng dẫn:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              File Excel cần có các cột:{" "}
              <code className="bg-background px-1 rounded">vehiclePlate</code>,{" "}
              <code className="bg-background px-1 rounded">temperature</code>,{" "}
              <code className="bg-background px-1 rounded">recordedAt</code>
            </li>
            <li>Biển số xe: dạng chuỗi (VD: 29A-12345)</li>
            <li>Nhiệt độ: số thực (VD: 25.5)</li>
            <li>Thời gian: định dạng ngày/giờ (VD: 2024-01-15 10:30:00)</li>
            <li>Nhiệt độ &gt; 35°C sẽ được đánh dấu cảnh báo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
