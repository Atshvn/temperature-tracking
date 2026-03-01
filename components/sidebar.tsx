"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Info,
  Wifi,
  AlertTriangle,
  Camera,
  Image,
  Video,
  PlayCircle,
  FolderOpen,
  Building2,
  UserCircle,
  Factory,
  Truck,
  Wrench,
  FileText,
  ClipboardCheck,
  ListChecks,
  CircleDot,
  Fuel,
  FileBarChart,
  BarChart3,
  Thermometer,
  Snowflake,
  AirVent,
  Route,
  MapPin,
  Package,
  Clock,
  CalendarDays,
  Hammer,
  TrendingUp,
  Mountain,
  Box,
  Settings2,
  AlertOctagon,
  ListOrdered,
  Users,
  CreditCard,
  BadgeCheck,
  Navigation,
  Building,
  Timer,
  Settings,
  KeyRound,
  Shield,
  HelpCircle,
  Home,
  BookOpen,
  Receipt,
  LogOut,
  Menu,
  ChevronRight,
  Gauge,
  StopCircle,
  Activity,
  Zap,
  Bell,
  RotateCcw,
  Upload,
  Construction,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

// Menu item types
interface MenuItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
  adminOnly?: boolean;
  userAllowed?: boolean; // If true, regular users can access this item
  implemented?: boolean; // If true, the page exists and is functional
}

// Menu items configuration
const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/",
    implemented: true,
    userAllowed: true,
    icon: LayoutDashboard,
  },
  {
    title: "Phương tiện",
    icon: Car,
    children: [
      { title: "Xem lịch trình", href: "/vehicles/schedule", icon: Calendar },
      {
        title: "Thông tin phương tiện",
        href: "/vehicles/info",
        icon: Info,
        implemented: true,
      },
      { title: "Trạng thái trực tuyến", href: "/vehicles/online", icon: Wifi },
      {
        title: "Thông tin cảnh báo",
        href: "/vehicles/alerts",
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: "Camera",
    icon: Camera,
    children: [
      { title: "Xem ảnh chụp", href: "/camera/photos", icon: Image },
      { title: "Xem video trực tuyến", href: "/camera/live", icon: Video },
      { title: "Xem lại video", href: "/camera/playback", icon: PlayCircle },
    ],
  },
  {
    title: "Danh mục",
    icon: FolderOpen,
    children: [
      { title: "Bộ phận", href: "/categories/departments", icon: Building2 },
      { title: "Lái xe", href: "/categories/drivers", icon: UserCircle },
      { title: "Hãng xe", href: "/categories/brands", icon: Factory },
      {
        title: "Loại phương tiện",
        href: "/categories/vehicle-types",
        icon: Truck,
      },
      {
        title: "Loại bảo dưỡng / sửa chữa",
        href: "/categories/maintenance-types",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Bảo dưỡng & Sửa chữa",
    icon: Wrench,
    children: [
      { title: "Thông tin xe", href: "/maintenance/vehicle-info", icon: Car },
      {
        title: "Hạn bảo trì / bảo dưỡng / giấy tờ",
        href: "/maintenance/deadlines",
        icon: FileText,
      },
      {
        title: "Danh mục hạn bảo trì",
        href: "/maintenance/categories",
        icon: ListChecks,
      },
      { title: "Thay lốp", href: "/maintenance/tires", icon: CircleDot },
      {
        title: "Bảo dưỡng sửa chữa",
        href: "/maintenance/repairs",
        icon: Wrench,
      },
      {
        title: "Hóa đơn xăng dầu",
        href: "/maintenance/fuel-invoices",
        icon: Fuel,
      },
      {
        title: "Báo cáo quản trị xe",
        href: "/maintenance/reports/admin",
        icon: FileBarChart,
      },
      {
        title: "Báo cáo hạn bảo trì",
        href: "/maintenance/reports/deadlines",
        icon: ClipboardCheck,
      },
      {
        title: "Báo cáo chi phí xăng dầu",
        href: "/maintenance/reports/fuel-cost",
        icon: Fuel,
      },
      {
        title: "Báo cáo chi phí sửa chữa",
        href: "/maintenance/reports/repair-cost",
        icon: Receipt,
      },
    ],
  },
  {
    title: "QCVN 31:2014",
    icon: FileText,
    children: [
      { title: "Danh sách lái xe", href: "/qcvn/drivers", icon: Users },
      {
        title: "Theo dõi đổi lái",
        href: "/qcvn/driver-changes",
        icon: RotateCcw,
      },
      { title: "Hành trình", href: "/qcvn/routes", icon: Route },
      { title: "Tốc độ", href: "/qcvn/speed", icon: Gauge },
      { title: "Quá tốc độ", href: "/qcvn/overspeed", icon: Zap },
      {
        title: "Thời gian lái liên tục",
        href: "/qcvn/continuous-driving",
        icon: Timer,
      },
      { title: "Dừng / đỗ", href: "/qcvn/stops", icon: StopCircle },
      { title: "Tổng hợp theo xe", href: "/qcvn/summary-vehicle", icon: Car },
      {
        title: "Tổng hợp theo lái xe",
        href: "/qcvn/summary-driver",
        icon: UserCircle,
      },
    ],
  },
  {
    title: "Báo cáo",
    icon: BarChart3,
    children: [
      { title: "Điểm dừng / đỗ", href: "/reports/stops", icon: MapPin },
      { title: "Chạy – đỗ", href: "/reports/run-stop", icon: Activity },
      {
        title: "Trạng thái hoạt động",
        href: "/reports/status",
        icon: Activity,
      },
      { title: "Quá tốc độ", href: "/reports/overspeed", icon: Zap },
      { title: "Báo cáo cảnh báo", href: "/reports/alerts", icon: Bell },
      { title: "Báo cáo nhiên liệu", href: "/reports/fuel", icon: Fuel },
      {
        title: "Báo cáo km theo ngày",
        href: "/reports/daily-km",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Báo cáo nhiệt độ",
    icon: Thermometer,
    userAllowed: true,
    children: [
      {
        title: "Upload Excel",
        href: "/temperature/upload",
        icon: Upload,
        userAllowed: true,
        implemented: true,
      },
      {
        title: "Trạng thái điều hoà",
        href: "/temperature/ac-status",
        icon: AirVent,
        userAllowed: true,
        implemented: true,
      },
      {
        title: "Nhiệt độ 1 cảm biến",
        href: "/temperature/single-sensor",
        icon: Thermometer,
        userAllowed: true,
        implemented: true,
      },
      {
        title: "Nhiệt độ thùng lạnh / kho lạnh",
        href: "/temperature/cold-storage",
        icon: Snowflake,
        userAllowed: true,
        implemented: true,
      },
    ],
  },
  {
    title: "Báo cáo phí đường bộ",
    icon: Route,
    children: [
      { title: "Qua trạm thu phí", href: "/toll/stations", icon: Navigation },
      { title: "Tổng hợp phí đường bộ", href: "/toll/summary", icon: Receipt },
    ],
  },
  {
    title: "Báo cáo Camera",
    icon: Camera,
    children: [
      {
        title: "Vi phạm lái xe an toàn",
        href: "/camera-reports/safety-violations",
        icon: AlertOctagon,
      },
    ],
  },
  {
    title: "Báo cáo Tổng hợp",
    icon: Package,
    children: [
      {
        title: "Thời gian trong điểm kiểm soát",
        href: "/summary/checkpoint-time",
        icon: Clock,
      },
      {
        title: "Lịch trình theo ngày",
        href: "/summary/daily-schedule",
        icon: CalendarDays,
      },
      {
        title: "Lịch trình theo chuyến",
        href: "/summary/trip-schedule",
        icon: Route,
      },
      { title: "Tổng hợp đội xe", href: "/summary/fleet", icon: Truck },
    ],
  },
  {
    title: "Báo cáo Chuyên dụng",
    icon: Hammer,
    children: [
      { title: "Taxi", href: "/specialized/taxi", icon: Car },
      { title: "Nâng ben", href: "/specialized/dump-truck", icon: TrendingUp },
      { title: "Cao độ", href: "/specialized/altitude", icon: Mountain },
      {
        title: "Diện tích / khối lượng",
        href: "/specialized/area-volume",
        icon: Box,
      },
      {
        title: "Cấu hình tham số",
        href: "/specialized/config",
        icon: Settings2,
      },
    ],
  },
  {
    title: "Báo cáo Vi phạm",
    icon: AlertOctagon,
    children: [
      { title: "Vi phạm", href: "/violations/list", icon: AlertTriangle },
      {
        title: "Tổng hợp vi phạm",
        href: "/violations/summary",
        icon: ListOrdered,
      },
    ],
  },
  {
    title: "Quản lý",
    icon: Users,
    adminOnly: true,
    children: [
      {
        title: "Quản lý lái xe",
        href: "/management/drivers",
        icon: UserCircle,
      },
      {
        title: "Ghi thẻ lái xe",
        href: "/management/driver-cards",
        icon: BadgeCheck,
      },
      {
        title: "Điểm kiểm soát",
        href: "/management/checkpoints",
        icon: Navigation,
      },
      {
        title: "Thông tin khách hàng",
        href: "/management/customers",
        icon: Building,
      },
      {
        title: "Hạn sử dụng phần mềm",
        href: "/management/license",
        icon: Timer,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      {
        title: "Quản lý tài khoản",
        href: "/settings/users",
        icon: Users,
        adminOnly: true,
        implemented: true,
      },
      {
        title: "Đổi mật khẩu",
        href: "/settings/password",
        icon: KeyRound,
        userAllowed: true,
        implemented: true,
      },
      {
        title: "Phân quyền",
        href: "/settings/permissions",
        icon: Shield,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Trợ giúp",
    icon: HelpCircle,
    children: [
      { title: "Trang chủ", href: "/help/home", icon: Home },
      { title: "Hướng dẫn sử dụng", href: "/help/guide", icon: BookOpen },
      {
        title: "Thông tin thanh toán",
        href: "/help/payment",
        icon: CreditCard,
      },
    ],
  },
];

interface SidebarProps {
  isAdmin?: boolean;
}

// Collapsible Menu Item Component
// Helper function to determine if an item is accessible for the user
function isItemAccessible(item: MenuItem, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  if (item.adminOnly) return false;
  return item.userAllowed === true;
}

// Helper function to check if item should be shown in menu
function shouldShowItem(item: MenuItem, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  // For regular users, only show if userAllowed or has children with userAllowed
  if (item.userAllowed) return true;
  if (item.children) {
    return item.children.some((child) => child.userAllowed === true);
  }
  return false;
}

function CollapsibleMenuItem({
  item,
  isAdmin,
  pathname,
  onItemClick,
}: {
  item: MenuItem;
  isAdmin: boolean;
  pathname: string;
  onItemClick?: () => void;
}) {
  const hasActiveChild = item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/"),
  );

  const [isOpen, setIsOpen] = useState(hasActiveChild || false);

  // Auto-expand if has active child
  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  // Don't show items that shouldn't be visible
  if (!shouldShowItem(item, isAdmin)) return null;

  // Get link href based on access permission and implementation status
  const getItemHref = (menuItem: MenuItem): string => {
    if (isAdmin) {
      // Admin: go to page if implemented, otherwise under-construction
      if (menuItem.implemented) return menuItem.href || "#";
      return "/under-construction";
    }
    // Regular user
    if (!menuItem.userAllowed) {
      // User doesn't have permission
      return "/no-permission";
    }
    // User has permission
    if (menuItem.implemented) return menuItem.href || "#";
    return "/under-construction";
  };

  // Check if item shows warning icon (not implemented for admin, no permission for user)
  const showWarningIcon = (menuItem: MenuItem): boolean => {
    if (isAdmin) return !menuItem.implemented;
    return !menuItem.userAllowed || !menuItem.implemented;
  };

  // If no children, render as simple link
  if (!item.children) {
    const isActive = pathname === item.href;
    const showWarning = showWarningIcon(item);
    return (
      <Link
        href={getItemHref(item)}
        onClick={onItemClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground",
          showWarning && "opacity-60",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.title}</span>
        {showWarning && (
          <Construction className="h-3 w-3 ml-auto text-yellow-500" />
        )}
      </Link>
    );
  }

  // Filter children based on visibility rules
  const visibleChildren = item.children.filter((child) =>
    shouldShowItem(child, isAdmin),
  );

  if (visibleChildren.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
          hasActiveChild
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">{item.title}</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4 space-y-1 mt-1">
        {visibleChildren.map((child) => {
          const isActive = pathname === child.href;
          const showWarning = showWarningIcon(child);
          return (
            <Link
              key={child.href}
              href={getItemHref(child)}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground",
                showWarning && "opacity-60",
              )}
            >
              <child.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{child.title}</span>
              {showWarning && (
                <Construction className="h-3 w-3 ml-auto text-yellow-500" />
              )}
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Desktop Sidebar Component
function DesktopSidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-card z-40">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-2 px-6 border-b shrink-0">
        <MapPin className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">3STracking</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <CollapsibleMenuItem
              key={item.title}
              item={item}
              isAdmin={isAdmin}
              pathname={pathname}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="p-4 border-t shrink-0">
        <form action="/api/auth/logout" method="POST">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Đăng xuất
          </Button>
        </form>
      </div>
    </aside>
  );
}

// Mobile Sidebar Component (Sheet)
function MobileSidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {/* Logo / Brand */}
        <div className="flex h-16 items-center gap-2 px-6 border-b">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">3STracking</span>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <CollapsibleMenuItem
                key={item.title}
                item={item}
                isAdmin={isAdmin}
                pathname={pathname}
                onItemClick={() => setOpen(false)}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-card">
          <form action="/api/auth/logout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { DesktopSidebar, MobileSidebar };
