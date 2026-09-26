"use client";

import Link from "next/link";
import { FileText, Landmark, MapPin, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { safeJsonParse } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function PostMedia({
  mediaType,
  mediaUrls,
  documentName,
  locationLabel,
  historicalMaterial,
}: {
  mediaType: string | null;
  mediaUrls: string;
  documentName: string | null;
  locationLabel: string | null;
  historicalMaterial: { id: string; title: string; type: string; verificationStatus: string } | null;
}) {
  const t = useTranslations("post");
  const urls = safeJsonParse<string[]>(mediaUrls, []);
  const url = urls[0];

  return (
    <div className="space-y-2">
      {mediaType === "PHOTO" && url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full max-h-[480px] object-cover rounded-lg border" loading="lazy" />
      )}
      {mediaType === "VIDEO" && url && (
        <video src={url} controls className="w-full max-h-[480px] rounded-lg border bg-black" />
      )}
      {mediaType === "DOCUMENT" && (documentName || url) && (
        <a
          href={url || "#"}
          target={url ? "_blank" : undefined}
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5 hover:bg-muted transition-colors"
        >
          <FileText className="size-5 text-primary shrink-0" />
          <span className="text-sm font-medium truncate">{documentName || t("attachedDocumentFallback")}</span>
        </a>
      )}
      {locationLabel && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" /> {locationLabel}
        </div>
      )}
      {historicalMaterial && (
        <Link
          href={`/archive/${historicalMaterial.id}`}
          className="flex items-center gap-2.5 rounded-lg border bg-accent/10 px-3 py-2.5 hover:bg-accent/20 transition-colors"
        >
          <Landmark className="size-5 text-accent-foreground shrink-0" />
          <span className="text-sm font-medium truncate flex-1">{historicalMaterial.title}</span>
          {historicalMaterial.verificationStatus === "VERIFIED" && (
            <Badge variant="secondary" className="gap-1 shrink-0">
              <BadgeCheck className="size-3" /> {t("verifiedBadge")}
            </Badge>
          )}
        </Link>
      )}
    </div>
  );
}
