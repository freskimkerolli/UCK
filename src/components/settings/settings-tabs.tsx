"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Loader2, Trash2, UserX } from "lucide-react";
import { updateSettingsAction } from "@/lib/actions/settings";
import { unblockUserAction } from "@/lib/actions/blocks";
import { deleteAccountAction } from "@/lib/actions/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PasswordForm } from "@/components/settings/password-form";
import { ToggleRow } from "@/components/settings/toggle-row";
import { EmptyState } from "@/components/shared/empty-state";
import { initials, formatDate } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

interface SettingsData {
  email: string;
  username: string;
  createdAt: string | Date;
  theme: string;
  profileVisibility: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyFollow: boolean;
  notifyLike: boolean;
  notifyComment: boolean;
  notifyMention: boolean;
  notifyMessage: boolean;
  notifyCommunity: boolean;
  showSensitiveHistorical: boolean;
}

interface BlockedUserRow {
  id: string;
  blocked: { id: string; username: string; profile: { displayName: string; avatarUrl: string } | null };
}

export function SettingsTabs({ data, blockedUsers }: { data: SettingsData; blockedUsers: BlockedUserRow[] }) {
  const t = useTranslations("settings");
  const tActions = useTranslations("actions");
  const locale = useLocale() as AppLocale;
  const [settings, setSettings] = useState(data);
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { setTheme } = useTheme();
  const router = useRouter();

  function save(partial: Partial<SettingsData>, opts?: { silent?: boolean }) {
    setSettings((s) => ({ ...s, ...partial }));
    startTransition(async () => {
      const res = await updateSettingsAction(partial);
      if (!res.success) toast.error(res.error);
      else if (!opts?.silent) toast.success(t("settingsSaved"));
    });
  }

  async function handleUnblock(blockedUserId: string) {
    await unblockUserAction(blockedUserId);
    router.refresh();
  }

  function handleDeleteAccount() {
    startTransition(async () => {
      await deleteAccountAction();
      await signOut({ callbackUrl: "/" });
    });
  }

  return (
    <Tabs defaultValue="account" className="gap-6">
      <TabsList className="flex-wrap h-auto justify-start">
        <TabsTrigger value="account">{t("tabAccount")}</TabsTrigger>
        <TabsTrigger value="privacy">{t("tabPrivacy")}</TabsTrigger>
        <TabsTrigger value="notifications">{t("tabNotifications")}</TabsTrigger>
        <TabsTrigger value="password">{t("tabPassword")}</TabsTrigger>
        <TabsTrigger value="appearance">{t("tabAppearance")}</TabsTrigger>
        <TabsTrigger value="blocked">{t("tabBlocked")}</TabsTrigger>
        <TabsTrigger value="content">{t("tabContent")}</TabsTrigger>
        <TabsTrigger value="danger">{t("tabDanger")}</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card className="p-5 space-y-3 max-w-md">
          <div>
            <Label className="text-xs text-muted-foreground">{t("emailLabel")}</Label>
            <p className="text-sm">{settings.email}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t("usernameLabel")}</Label>
            <p className="text-sm">@{settings.username}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">{t("joinedLabel")}</Label>
            <p className="text-sm">{formatDate(settings.createdAt, undefined, locale)}</p>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            {t("editProfileHint")}
          </p>
          <Button variant="outline" size="sm" render={<Link href="/appeals" />}>
            {t("blockedContentAppealsButton")}
          </Button>
        </Card>
      </TabsContent>

      <TabsContent value="privacy">
        <Card className="p-5 space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label>{t("profileVisibilityLabel")}</Label>
            <Select
              value={settings.profileVisibility}
              onValueChange={(v) => v && save({ profileVisibility: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">{t("visibilityPublic")}</SelectItem>
                <SelectItem value="FOLLOWERS">{t("visibilityFollowersOnly")}</SelectItem>
                <SelectItem value="PRIVATE">{t("visibilityPrivate")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="p-5 divide-y max-w-md">
          <ToggleRow id="emailNotifications" label={t("emailNotifications")} checked={settings.emailNotifications} onCheckedChange={(c) => save({ emailNotifications: c })} />
          <ToggleRow id="pushNotifications" label={t("pushNotifications")} checked={settings.pushNotifications} onCheckedChange={(c) => save({ pushNotifications: c })} />
          <ToggleRow id="notifyFollow" label={t("notifyFollow")} checked={settings.notifyFollow} onCheckedChange={(c) => save({ notifyFollow: c })} />
          <ToggleRow id="notifyLike" label={t("notifyLike")} checked={settings.notifyLike} onCheckedChange={(c) => save({ notifyLike: c })} />
          <ToggleRow id="notifyComment" label={t("notifyComment")} checked={settings.notifyComment} onCheckedChange={(c) => save({ notifyComment: c })} />
          <ToggleRow id="notifyMention" label={t("notifyMention")} checked={settings.notifyMention} onCheckedChange={(c) => save({ notifyMention: c })} />
          <ToggleRow id="notifyMessage" label={t("notifyMessage")} checked={settings.notifyMessage} onCheckedChange={(c) => save({ notifyMessage: c })} />
          <ToggleRow id="notifyCommunity" label={t("notifyCommunity")} checked={settings.notifyCommunity} onCheckedChange={(c) => save({ notifyCommunity: c })} />
        </Card>
      </TabsContent>

      <TabsContent value="password">
        <Card className="p-5 max-w-md">
          <PasswordForm />
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card className="p-5 space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label>{t("themeLabel")}</Label>
            <Select
              value={settings.theme}
              onValueChange={(v) => {
                if (!v) return;
                setTheme(v);
                save({ theme: v }, { silent: true });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("themeLight")}</SelectItem>
                <SelectItem value="dark">{t("themeDark")}</SelectItem>
                <SelectItem value="system">{t("themeSystem")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("languageLabel")}</Label>
            <Select value="sq" disabled>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sq">{t("languageAlbanian")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("languageComingSoon")}</p>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="blocked">
        {blockedUsers.length === 0 ? (
          <EmptyState icon={UserX} title={t("noBlockedUsers")} />
        ) : (
          <Card className="p-2 max-w-md divide-y">
            {blockedUsers.map((b) => {
              const name = b.blocked.profile?.displayName ?? b.blocked.username;
              return (
                <div key={b.id} className="flex items-center gap-3 p-2.5">
                  <Avatar className="size-9">
                    <AvatarImage src={b.blocked.profile?.avatarUrl} alt={name} />
                    <AvatarFallback>{initials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-muted-foreground">@{b.blocked.username}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleUnblock(b.blocked.id)}>
                    {t("unblockButton")}
                  </Button>
                </div>
              );
            })}
          </Card>
        )}
      </TabsContent>

      <TabsContent value="content">
        <Card className="p-5 max-w-md">
          <ToggleRow
            id="showSensitiveHistorical"
            label={t("sensitiveContentLabel")}
            description={t("sensitiveContentDescription")}
            checked={settings.showSensitiveHistorical}
            onCheckedChange={(c) => save({ showSensitiveHistorical: c })}
          />
        </Card>
      </TabsContent>

      <TabsContent value="danger">
        <Card className="p-5 max-w-md border-destructive/40 space-y-3">
          <p className="text-sm font-medium">{t("deleteAccountTitle")}</p>
          <p className="text-sm text-muted-foreground">
            {t("deleteAccountWarning")}
          </p>
          <Button variant="destructive" className="gap-1.5" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" /> {t("deleteAccountButton")}
          </Button>
        </Card>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tActions("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {t("deleteConfirmAction")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TabsContent>
    </Tabs>
  );
}
