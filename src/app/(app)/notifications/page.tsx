import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getNotifications } from "@/lib/data/notifications";
import { NotificationItem } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { EmptyState } from "@/components/shared/empty-state";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await getNotifications(user.id);
  const t = await getTranslations("notificationsPage");

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="size-5" /> {t("title")}
        </h1>
        {notifications.some((n) => !n.isRead) && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
