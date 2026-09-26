import { Users, Activity, FileText, MessageSquare, Flag, Clock, ShieldOff, Users2, Landmark } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAdminStats } from "@/lib/data/admin";
import { StatCard } from "@/components/admin/stat-card";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();
  const t = await getTranslations("admin.overviewPage");

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard icon={Users} label={t("totalUsers")} value={stats.totalUsers} />
      <StatCard icon={Activity} label={t("activeUsers")} value={stats.activeUsers} />
      <StatCard icon={FileText} label={t("totalPosts")} value={stats.totalPosts} />
      <StatCard icon={MessageSquare} label={t("totalComments")} value={stats.totalComments} />
      <StatCard icon={Flag} label={t("totalReports")} value={stats.totalReports} />
      <StatCard icon={Clock} label={t("pendingReview")} value={stats.pendingReports} />
      <StatCard icon={ShieldOff} label={t("blockedContent")} value={stats.blockedContent} />
      <StatCard icon={Users2} label={t("communities")} value={stats.communities} />
      <StatCard icon={Landmark} label={t("historicalMaterials")} value={stats.historicalMaterials} />
    </div>
  );
}
