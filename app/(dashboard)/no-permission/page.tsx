import { ShieldX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NoPermissionPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-500/10 rounded-full">
              <ShieldX className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl">Không có quyền truy cập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Bạn không có quyền truy cập vào trang này.
          </p>
          <p className="text-sm text-muted-foreground">
            Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Quay về Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
