"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", labelKey: "overview" },
  { href: "/admin/reports", labelKey: "reports" },
  { href: "/admin/flagged", labelKey: "flagged" },
  { href: "/admin/users", labelKey: "users" },
  { href: "/admin/communities", labelKey: "communities" },
  { href: "/admin/archive", labelKey: "archive" },
  { href: "/admin/appeals", labelKey: "appeals" },
  { href: "/admin/log", labelKey: "log" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
  return (
    <div className="flex gap-1 overflow-x-auto border-b px-4 sm:px-6">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </div>
  );
}
