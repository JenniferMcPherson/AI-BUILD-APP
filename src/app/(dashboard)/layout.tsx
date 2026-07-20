import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getCurrentUser } from "@/lib/dal";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await verifySession();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar userName={user.name} planTier={user.planTier} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
