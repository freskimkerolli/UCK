"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, ShieldCheck, User } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { SIDEBAR_MAIN, SIDEBAR_ADMIN, ARCHIVE_SUBMENU } from "@/components/app-shell/nav-items";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarUser {
  role: string;
  username: string;
}

export function SidebarNav({
  user,
  unreadNotifications,
  unreadMessages,
}: {
  user: SidebarUser;
  unreadNotifications: number;
  unreadMessages: number;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tBrand = useTranslations("brand");
  const isAdmin = user.role === "ADMIN" || user.role === "MODERATOR";
  const [archiveOpen, setArchiveOpen] = useState(pathname.startsWith("/archive"));
  const profileHref = `/profile/${user.username}`;
  const profileActive = pathname === profileHref || pathname.startsWith(profileHref + "/");

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 h-screen sticky top-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground overflow-y-auto">
      <Link href="/home" className="flex items-center gap-2 px-4 py-4 shrink-0">
        <LogoMark className="h-8 w-auto" />
        <div className="flex flex-col leading-tight">
          <span className="font-bold tracking-tight">{tBrand("name")}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tBrand("tagline")}</span>
        </div>
      </Link>

      <div className="flex-1 px-3 pb-4">
        <nav className="space-y-0.5 mb-3">
          <Link
            href={profileHref}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              profileActive
                ? "bg-primary text-primary-foreground shadow-warm-sm"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <User className="size-5" />
            {t("bottomProfile")}
          </Link>
        </nav>

        <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("exploreArchiveSection")}
        </p>
        <nav className="space-y-0.5">
          {SIDEBAR_MAIN.map((item) => {
            const isArchive = item.href === "/archive";
            const active = isArchive
              ? pathname.startsWith("/archive")
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const badge =
              item.href === "/notifications" ? unreadNotifications : item.href === "/messages" ? unreadMessages : 0;

            if (isArchive) {
              return (
                <div key={item.href} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setArchiveOpen((o) => !o)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-warm-sm"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="size-5" />
                      {t(item.labelKey)}
                    </span>
                    <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", archiveOpen && "rotate-180")} />
                  </button>
                  {archiveOpen && (
                    <div className="ml-9 flex flex-col gap-0.5 mt-0.5 pl-1">
                      {ARCHIVE_SUBMENU.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="rounded-lg px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:text-primary hover:bg-sidebar-accent transition-colors"
                        >
                          {t(sub.labelKey)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-warm-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="size-5" />
                  {t(item.labelKey)}
                </span>
                {badge > 0 && (
                  <Badge className={cn("h-5 min-w-5 justify-center px-1 rounded-full", active && "bg-primary-foreground text-primary")}>
                    {badge > 99 ? "99+" : badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {isAdmin && (
          <>
            <p className="px-2 mt-5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("adminSection")}
            </p>
            <nav className="space-y-0.5">
              {SIDEBAR_ADMIN.map((item) => {
                // "/admin" is the parent path of every other admin route
                // (/admin/flagged, /admin/users, ...), so it must match
                // exactly — otherwise "Admin Dashboard" lights up active
                // alongside whichever admin sub-page is actually open.
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent text-primary font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="size-[18px]" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>

      <div className="px-3 pt-3 pb-5 shrink-0">
        <div className="rounded-lg bg-sidebar-accent/60 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{t("guidelinesTitle")}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-snug">{t("guidelinesDesc")}</p>
          <Link href="/rules" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            {t("guidelinesLink")}
          </Link>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/60 pt-2.5">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </aside>
  );
}
