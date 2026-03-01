"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Car,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Vehicle {
  id: string;
  licensePlate: string;
  registrationName: string;
  registrationYear: number;
  brandName: string;
  vehicleType: string;
  color: string;
  chassisNumber: string | null;
  engineNumber: string | null;
  manufacturingYear: number;
  usageExpiry: number;
  countryOfOrigin: string;
  fuelType: string;
  fuelConsumption: number | null;
  loadCapacity: number | null;
  volume: number | null;
  odometerKm: number;
  gpsKm: number;
  followingLaw: string | null;
  dimensions: string | null;
  notes: string | null;
}

const initialFormData = {
  licensePlate: "",
  registrationName: "",
  registrationYear: new Date().getFullYear().toString(),
  brandName: "",
  vehicleType: "",
  color: "Trắng",
  chassisNumber: "",
  engineNumber: "",
  manufacturingYear: new Date().getFullYear().toString(),
  usageExpiry: (new Date().getFullYear() + 25).toString(),
  countryOfOrigin: "Việt Nam",
  fuelType: "Dầu",
  fuelConsumption: "",
  loadCapacity: "",
  volume: "",
  odometerKm: "0",
  gpsKm: "0",
  followingLaw: "",
  dimensions: "",
  notes: "",
};

const brandOptions = [
  "ISUZU",
  "HINO",
  "HYUNDAI",
  "MITSUBISHI",
  "FUSO",
  "THACO",
  "DONGFENG",
];
const colorOptions = ["Trắng", "Đen", "Xám", "Đỏ", "Xanh", "Vàng"];
const fuelOptions = ["Dầu", "Xăng", "Điện", "Hybrid"];
const countryOptions = [
  "Việt Nam",
  "Nhật Bản",
  "Hàn Quốc",
  "Trung Quốc",
  "Thái Lan",
];

export default function VehicleInfoPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });

      const response = await fetch(`/api/vehicles?${params}`);
      const data = await response.json();

      if (response.ok) {
        setVehicles(data.vehicles);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchVehicles();
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        licensePlate: vehicle.licensePlate,
        registrationName: vehicle.registrationName,
        registrationYear: vehicle.registrationYear.toString(),
        brandName: vehicle.brandName,
        vehicleType: vehicle.vehicleType,
        color: vehicle.color,
        chassisNumber: vehicle.chassisNumber || "",
        engineNumber: vehicle.engineNumber || "",
        manufacturingYear: vehicle.manufacturingYear.toString(),
        usageExpiry: vehicle.usageExpiry.toString(),
        countryOfOrigin: vehicle.countryOfOrigin,
        fuelType: vehicle.fuelType,
        fuelConsumption: vehicle.fuelConsumption?.toString() || "",
        loadCapacity: vehicle.loadCapacity?.toString() || "",
        volume: vehicle.volume?.toString() || "",
        odometerKm: vehicle.odometerKm.toString(),
        gpsKm: vehicle.gpsKm.toString(),
        followingLaw: vehicle.followingLaw || "",
        dimensions: vehicle.dimensions || "",
        notes: vehicle.notes || "",
      });
    } else {
      setEditingVehicle(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.licensePlate ||
      !formData.registrationName ||
      !formData.brandName ||
      !formData.vehicleType
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingVehicle
        ? `/api/vehicles/${editingVehicle.id}`
        : "/api/vehicles";
      const method = editingVehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          editingVehicle ? "Cập nhật thành công" : "Thêm mới thành công",
        );
        setIsDialogOpen(false);
        fetchVehicles();
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Không thể kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phương tiện này?")) return;

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Đã xóa phương tiện");
        fetchVehicles();
      } else {
        const data = await response.json();
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Không thể kết nối đến server");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Car className="h-8 w-8 text-primary" />
            Thông tin phương tiện
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý danh sách và thông tin chi tiết các phương tiện
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm phương tiện
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle
                  ? "Cập nhật phương tiện"
                  : "Thêm phương tiện mới"}
              </DialogTitle>
              <DialogDescription>
                Điền thông tin chi tiết của phương tiện. Các trường có dấu * là
                bắt buộc.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                {/* Row 1 */}
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Biển số *</Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licensePlate: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="50H03074"
                    disabled={!!editingVehicle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationName">Tên đăng ký *</Label>
                  <Input
                    id="registrationName"
                    value={formData.registrationName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationName: e.target.value,
                      })
                    }
                    placeholder="CÔNG TY TNHH..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationYear">Năm đăng ký</Label>
                  <Input
                    id="registrationYear"
                    type="number"
                    value={formData.registrationYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationYear: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Row 2 */}
                <div className="space-y-2">
                  <Label htmlFor="brandName">Hãng xe *</Label>
                  <Select
                    value={formData.brandName}
                    onValueChange={(value) =>
                      setFormData({ ...formData, brandName: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hãng xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {brandOptions.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Loại phương tiện *</Label>
                  <Input
                    id="vehicleType"
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleType: e.target.value })
                    }
                    placeholder="Ô tô tải đông lạnh 2 ngăn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Màu sắc</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) =>
                      setFormData({ ...formData, color: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn màu" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 3 */}
                <div className="space-y-2">
                  <Label htmlFor="chassisNumber">Số khung</Label>
                  <Input
                    id="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chassisNumber: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="RLE1KR77HLMV103648"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engineNumber">Số máy</Label>
                  <Input
                    id="engineNumber"
                    value={formData.engineNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engineNumber: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="131W92"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturingYear">Năm sản xuất</Label>
                  <Input
                    id="manufacturingYear"
                    type="number"
                    value={formData.manufacturingYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manufacturingYear: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Row 4 */}
                <div className="space-y-2">
                  <Label htmlFor="usageExpiry">Niên hạn sử dụng</Label>
                  <Input
                    id="usageExpiry"
                    type="number"
                    value={formData.usageExpiry}
                    onChange={(e) =>
                      setFormData({ ...formData, usageExpiry: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryOfOrigin">Nước sản xuất</Label>
                  <Select
                    value={formData.countryOfOrigin}
                    onValueChange={(value) =>
                      setFormData({ ...formData, countryOfOrigin: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nước" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Nhiên liệu</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, fuelType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhiên liệu" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelOptions.map((fuel) => (
                        <SelectItem key={fuel} value={fuel}>
                          {fuel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 5 */}
                <div className="space-y-2">
                  <Label htmlFor="fuelConsumption">Định mức (lít/100km)</Label>
                  <Input
                    id="fuelConsumption"
                    type="number"
                    step="0.1"
                    value={formData.fuelConsumption}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fuelConsumption: e.target.value,
                      })
                    }
                    placeholder="14.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loadCapacity">Tải trọng (tấn)</Label>
                  <Input
                    id="loadCapacity"
                    type="number"
                    step="0.01"
                    value={formData.loadCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, loadCapacity: e.target.value })
                    }
                    placeholder="1.95"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume">Dung tích</Label>
                  <Input
                    id="volume"
                    type="number"
                    value={formData.volume}
                    onChange={(e) =>
                      setFormData({ ...formData, volume: e.target.value })
                    }
                    placeholder="12"
                  />
                </div>

                {/* Row 6 */}
                <div className="space-y-2">
                  <Label htmlFor="odometerKm">KM Đồng hồ</Label>
                  <Input
                    id="odometerKm"
                    type="number"
                    value={formData.odometerKm}
                    onChange={(e) =>
                      setFormData({ ...formData, odometerKm: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpsKm">KM GPS</Label>
                  <Input
                    id="gpsKm"
                    type="number"
                    value={formData.gpsKm}
                    onChange={(e) =>
                      setFormData({ ...formData, gpsKm: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followingLaw">Luật theo</Label>
                  <Input
                    id="followingLaw"
                    value={formData.followingLaw}
                    onChange={(e) =>
                      setFormData({ ...formData, followingLaw: e.target.value })
                    }
                  />
                </div>

                {/* Row 7 */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="dimensions">
                    Kích thước lọt lòng thùng xe
                  </Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) =>
                      setFormData({ ...formData, dimensions: e.target.value })
                    }
                    placeholder="4220x1720x1780"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingVehicle ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo biển số, tên đăng ký, hãng xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
              <Button onClick={fetchVehicles} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Danh sách phương tiện</span>
            <Badge variant="outline">{pagination.total} xe</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold whitespace-nowrap">
                    Biển số
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Tên đăng ký
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Năm ĐK
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Hãng xe
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Loại phương tiện
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Màu sắc
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Số khung
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Số máy
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Năm SX
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Niên hạn
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Nước SX
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Nhiên liệu
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Định mức
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Tải trọng
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Dung tích
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    KM ĐH
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    KM GPS
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap">
                    Kích thước thùng
                  </TableHead>
                  <TableHead className="font-semibold whitespace-nowrap sticky right-0 bg-muted/50">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-muted-foreground">
                        Đang tải dữ liệu...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center py-10">
                      <Car className="h-12 w-12 mx-auto text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">
                        Chưa có phương tiện nào
                      </p>
                      <Button
                        variant="link"
                        onClick={() => handleOpenDialog()}
                        className="mt-2"
                      >
                        Thêm phương tiện đầu tiên
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle, index) => (
                    <TableRow
                      key={vehicle.id}
                      className={index % 2 === 0 ? "bg-muted/20" : ""}
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        <Badge variant="outline">{vehicle.licensePlate}</Badge>
                      </TableCell>
                      <TableCell
                        className="max-w-[200px] truncate"
                        title={vehicle.registrationName}
                      >
                        {vehicle.registrationName}
                      </TableCell>
                      <TableCell>{vehicle.registrationYear}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{vehicle.brandName}</Badge>
                      </TableCell>
                      <TableCell
                        className="max-w-[150px] truncate"
                        title={vehicle.vehicleType}
                      >
                        {vehicle.vehicleType}
                      </TableCell>
                      <TableCell>{vehicle.color}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {vehicle.chassisNumber || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {vehicle.engineNumber || "-"}
                      </TableCell>
                      <TableCell>{vehicle.manufacturingYear}</TableCell>
                      <TableCell>{vehicle.usageExpiry}</TableCell>
                      <TableCell>{vehicle.countryOfOrigin}</TableCell>
                      <TableCell>{vehicle.fuelType}</TableCell>
                      <TableCell>{vehicle.fuelConsumption || "-"}</TableCell>
                      <TableCell>{vehicle.loadCapacity || "-"}</TableCell>
                      <TableCell>{vehicle.volume || "-"}</TableCell>
                      <TableCell className="font-mono">
                        {vehicle.odometerKm.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {vehicle.gpsKm.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className="text-xs max-w-[150px] truncate"
                        title={vehicle.dimensions || ""}
                      >
                        {vehicle.dimensions || "-"}
                      </TableCell>
                      <TableCell className="sticky right-0 bg-background">
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenDialog(vehicle)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.totalPages} (
                {pagination.total} xe)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
