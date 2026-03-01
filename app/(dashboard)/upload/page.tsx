"use client";

import { useRouter } from "next/navigation";
import { UploadExcel } from "@/components/upload-excel";

export default function UploadPage() {
  const router = useRouter();

  const handleUploadSuccess = () => {
    // Refresh the page or redirect
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Upload dữ liệu</h1>
        <p className="text-muted-foreground">
          Tải lên file Excel chứa dữ liệu nhiệt độ xe
        </p>
      </div>

      {/* Upload Component */}
      <div className="max-w-2xl">
        <UploadExcel onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
}
