import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DesktopSidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { verifyToken } from "@/lib/auth";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar isAdmin={isAdmin} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <Header
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
          }}
          isAdmin={isAdmin}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
