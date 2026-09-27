"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Bell, MessageCircle, PenSquare, ChevronDown, Settings, LogOut, User } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo";
import { SearchBar } from "@/components/app-shell/search-bar";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { LanguageSwitcher } from "@/components/app-shell/language-switcher";
import { useComposer } from "@/components/composer/composer-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";

interface TopBarUser {
  displayName: string;
  username: string;
  avatarUrl: string;
  role: string;
}

export function TopBar({
  user,
  unreadNotifications,
  unreadMessages,
}: {
  user: TopBarUser;
  unreadNotifications: number;
  unreadMessages: number;
}) {
  const composer = useComposer();
  const t = useTranslations("topbar");
  const tNav = useTranslations("nav");

  const roleLabel =
    user.role === "ADMIN" ? t("roleAdmin") : user.role === "MODERATOR" ? t("roleModerator") : t("roleUser");

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-md flex items-center gap-3 px-4 lg:px-6">
      <Link href="/home" className="hidden sm:inline-flex lg:hidden shrink-0">
        <LogoLockup size="sm" />
      </Link>

      <SearchBar className="flex-1 max-w-2xl" />

      <Button className="hidden sm:inline-flex rounded-lg shadow-warm-sm shrink-0" onClick={() => composer.open()}>
        <PenSquare className="size-4" />
        {t("createPost")}
      </Button>

      <LanguageSwitcher className="hidden lg:flex items-center gap-1 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-sm text-secondary-foreground hover:bg-secondary transition-colors shrink-0" />

      <div className="flex items-center gap-0.5 shrink-0">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          render={<Link href="/messages" />}
          className="relative rounded-full hover:bg-chart-3/10 hover:text-chart-3"
          aria-label={tNav("messages")}
        >
          <MessageCircle className="size-[18px]" />
          {unreadMessages > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 rounded-full text-[10px]">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </Badge>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          render={<Link href="/notifications" />}
          className="relative rounded-full hover:bg-primary/10 hover:text-primary"
          aria-label={tNav("notifications")}
        >
          <Bell className="size-[18px]" />
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 rounded-full text-[10px]">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </Badge>
          )}
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 pl-1.5 shrink-0">
          <div className="relative">
            <Avatar className="size-8">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            {user.role === "ADMIN" && (
              <VerifiedBadge
                label={t("roleAdmin")}
                className="absolute -bottom-0.5 -right-0.5 size-3.5"
              />
            )}
          </div>
          <div className="hidden xl:flex flex-col text-left leading-tight">
            <span className="text-sm font-semibold">{user.displayName}</span>
            {user.role !== "ADMIN" && <span className="text-xs text-primary">{roleLabel}</span>}
          </div>
          <ChevronDown className="hidden xl:inline size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[8.75rem]">
          <DropdownMenuItem render={<Link href={`/profile/${user.username}`} />}>
            <User className="size-4" /> {t("myProfile")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Settings className="size-4" /> {tNav("settings")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="size-4" /> {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
