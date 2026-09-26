import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyCommunitiesForComposer, getUnreadCounts } from "@/lib/data/shell";
import { AppShellClient } from "@/components/app-shell/app-shell-client";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [communities, unread] = await Promise.all([
    getMyCommunitiesForComposer(user.id),
    getUnreadCounts(user.id),
  ]);

  return (
    <AppShellClient
      user={{
        displayName: user.profile?.displayName ?? user.username,
        username: user.username,
        avatarUrl: user.profile?.avatarUrl ?? "",
        role: user.role,
      }}
      unreadNotifications={unread.notifications}
      unreadMessages={unread.messages}
      communities={communities}
    >
      {children}
    </AppShellClient>
  );
}
