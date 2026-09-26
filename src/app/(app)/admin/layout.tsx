import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") redirect("/home");
  const t = await getTranslations("admin.layout");

  return (
    <div>
      <div className="px-4 sm:px-6 py-4">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" /> {t("title")}
        </h1>
      </div>
      <AdminNav />
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}
