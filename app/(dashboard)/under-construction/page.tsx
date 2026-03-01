import { Construction } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function UnderConstructionPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-yellow-500/10 rounded-full">
              <Construction className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Đang cập nhật</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Chức năng này đang được phát triển và sẽ sớm được cập nhật.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vui lòng quay lại sau hoặc liên hệ quản trị viên để biết thêm chi
            tiết.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
