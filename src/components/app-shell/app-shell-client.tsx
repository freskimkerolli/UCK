"use client";

import { ComposerProvider } from "@/components/composer/composer-context";
import { PostComposerDialog } from "@/components/composer/post-composer-dialog";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";
import { TopBar } from "@/components/app-shell/top-bar";
import { BottomNav } from "@/components/app-shell/bottom-nav";

interface ShellUser {
  displayName: string;
  username: string;
  avatarUrl: string;
  role: string;
}

export function AppShellClient({
  user,
  unreadNotifications,
  unreadMessages,
  communities,
  children,
}: {
  user: ShellUser;
  unreadNotifications: number;
  unreadMessages: number;
  communities: { id: string; name: string }[];
  children: React.ReactNode;
}) {
  return (
    <ComposerProvider>
      <div className="flex min-h-screen">
        <SidebarNav user={user} unreadNotifications={unreadNotifications} unreadMessages={unreadMessages} />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar user={user} unreadNotifications={unreadNotifications} unreadMessages={unreadMessages} />
          <main className="flex-1 pb-20 lg:pb-8">{children}</main>
        </div>
      </div>
      <BottomNav />
      <PostComposerDialog currentUser={user} communities={communities} />
    </ComposerProvider>
  );
}
