"use client";

import { Image as ImageIcon, Video, FileText, Landmark, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useComposer, type ComposerPanel } from "@/components/composer/composer-context";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

export function ComposerTriggerCard({
  displayName,
  avatarUrl,
  communityId,
}: {
  displayName: string;
  avatarUrl: string;
  communityId?: string;
}) {
  const composer = useComposer();
  const t = useTranslations("composer");

  const ATTACHMENT_ACTIONS: { panel: ComposerPanel; icon: typeof ImageIcon; label: string; tint: string }[] = [
    { panel: "PHOTO", icon: ImageIcon, label: t("photo"), tint: "text-primary" },
    { panel: "VIDEO", icon: Video, label: t("video"), tint: "text-chart-3" },
    { panel: "DOCUMENT", icon: FileText, label: t("document"), tint: "text-accent-foreground" },
    { panel: "HISTORICAL", icon: Landmark, label: t("historicalMaterial"), tint: "text-primary" },
    { panel: "LOCATION", icon: MapPin, label: t("area"), tint: "text-muted-foreground" },
  ];

  return (
    <Card className="p-4 space-y-3.5">
      <button
        type="button"
        onClick={() => composer.open({ communityId })}
        className="w-full flex items-center gap-3 text-left"
      >
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials(displayName)}</AvatarFallback>
        </Avatar>
        <span className="flex-1 rounded-full bg-muted/60 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
          {t("contentPlaceholder")}
        </span>
      </button>
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 border-t -mx-4 px-4 pt-3">
        {ATTACHMENT_ACTIONS.map((a) => (
          <button
            key={a.panel}
            type="button"
            onClick={() => composer.open({ communityId, panel: a.panel })}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary transition-colors"
          >
            <a.icon className={`size-[15px] ${a.tint}`} />
            {a.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
