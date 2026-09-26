import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import type { getLatestEvents } from "@/lib/data/home";

export async function RecentEventsWidget({ events }: { events: Awaited<ReturnType<typeof getLatestEvents>> }) {
  if (events.length === 0) return null;
  const t = await getTranslations("home");

  return (
    <Card className="p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-[18px] text-primary" />
          <h2 className="font-semibold text-sm">{t("recentEventsTitle")}</h2>
        </div>
        <Link href="/archive?type=EVENT_RECORD" className="text-xs text-primary hover:underline shrink-0">
          {t("viewAllLink")}
        </Link>
      </div>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="flex items-start gap-2.5">
            <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{e.eventDate}</p>
              <p className="font-medium text-sm leading-snug">{e.title}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
