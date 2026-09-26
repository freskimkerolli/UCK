import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Settings } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getMyBlockedUsers } from "@/lib/actions/blocks";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.settings) redirect("/home");

  const blockedUsers = await getMyBlockedUsers(user.id);
  const t = await getTranslations("settings");

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <Settings className="size-5" /> {t("pageTitle")}
      </h1>
      <SettingsTabs
        data={{
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          theme: user.settings.theme,
          profileVisibility: user.settings.profileVisibility,
          emailNotifications: user.settings.emailNotifications,
          pushNotifications: user.settings.pushNotifications,
          notifyFollow: user.settings.notifyFollow,
          notifyLike: user.settings.notifyLike,
          notifyComment: user.settings.notifyComment,
          notifyMention: user.settings.notifyMention,
          notifyMessage: user.settings.notifyMessage,
          notifyCommunity: user.settings.notifyCommunity,
          showSensitiveHistorical: user.settings.showSensitiveHistorical,
        }}
        blockedUsers={blockedUsers}
      />
    </div>
  );
}
