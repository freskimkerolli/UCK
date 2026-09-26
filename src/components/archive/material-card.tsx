import Link from "next/link";
import { Calendar, MapPin, Landmark } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/archive/verification-badge";
import { type HistoricalMaterialType } from "@/lib/types";

interface MaterialCardProps {
  material: {
    id: string;
    title: string;
    description: string;
    type: string;
    eventDate: string;
    location: string;
    verificationStatus: string;
    mediaUrl: string;
    tags: { hashtag: { tag: string } }[];
  };
}

export async function MaterialCard({ material }: MaterialCardProps) {
  const tEnums = await getTranslations("enums");
  const typeLabel = tEnums(`historicalMaterialType.${material.type as HistoricalMaterialType}`);
  return (
    <Link href={`/archive/${material.id}`} className="block h-full">
      <Card interactive className="p-0 overflow-hidden h-full gap-0">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {material.mediaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={material.mediaUrl}
              alt={material.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 gradient-brand-subtle text-muted-foreground">
              <Landmark className="size-6 opacity-40" />
              <span className="text-sm">{typeLabel}</span>
            </div>
          )}
          <Badge className="absolute top-2.5 left-2.5 backdrop-blur-sm bg-primary/90 shadow-warm-sm">
            {typeLabel}
          </Badge>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold leading-snug line-clamp-2">{material.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="size-3" /> {material.eventDate}
            </span>
            <span className="flex items-center gap-1 min-w-0 flex-1 truncate">
              <MapPin className="size-3 shrink-0" /> <span className="truncate">{material.location}</span>
            </span>
          </div>
          <VerificationBadge status={material.verificationStatus} />
        </div>
      </Card>
    </Link>
  );
}
