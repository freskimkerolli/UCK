"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, User } from "lucide-react";
import { BOTTOM_NAV_ITEMS } from "@/components/app-shell/nav-items";
import { useComposer } from "@/components/composer/composer-context";
import { cn } from "@/lib/utils";

export function BottomNav({ username }: { username: string }) {
  const pathname = usePathname();
  const composer = useComposer();
  const t = useTranslations("nav");
  const tTopbar = useTranslations("topbar");

  const items = [
    ...BOTTOM_NAV_ITEMS.slice(0, 2),
    { href: "__create__", labelKey: null as string | null, icon: Plus },
    ...BOTTOM_NAV_ITEMS.slice(2),
    { href: `/profile/${username}`, labelKey: "bottomProfile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          if (item.href === "__create__") {
            return (
              <button
                key="create"
                type="button"
                onClick={() => composer.open()}
                className="flex flex-col items-center justify-center"
                aria-label={tTopbar("createPost")}
              >
                <span className="flex items-center justify-center size-11 rounded-full gradient-brand text-primary-foreground -mt-5 shadow-warm-lg active:scale-95 transition-transform">
                  <item.icon className="size-5" />
                </span>
              </button>
            );
          }
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] transition-colors",
                active ? "text-primary font-semibold" : "text-muted-foreground",
              )}
            >
              <span className={cn("flex items-center justify-center size-8 rounded-full transition-colors", active && "bg-primary/10")}>
                <item.icon className="size-5" />
              </span>
              {item.labelKey && t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
