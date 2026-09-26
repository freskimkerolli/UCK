import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, BookMarked, User, Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getMaterialById } from "@/lib/data/archive";
import { VerificationBadge } from "@/components/archive/verification-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type HistoricalMaterialType } from "@/lib/types";
import { initials } from "@/lib/format";

export default async function ArchiveMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("archive");
  const tEnums = await getTranslations("enums");

  const material = await getMaterialById(id);
  if (!material) notFound();

  const contributorName = material.contributor.profile?.displayName ?? material.contributor.username;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      {material.mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={material.mediaUrl} alt={material.title} className="w-full max-h-[420px] object-cover rounded-xl border" />
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>{tEnums(`historicalMaterialType.${material.type as HistoricalMaterialType}`)}</Badge>
          <VerificationBadge status={material.verificationStatus} />
        </div>
        <h1 className="text-2xl font-semibold">{material.title}</h1>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{material.description}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm rounded-xl border p-4">
        <InfoRow icon={Calendar} label={t("dateLabel")} value={material.eventDate} />
        <InfoRow icon={MapPin} label={t("locationLabel")} value={material.location} />
        <InfoRow icon={BookMarked} label={t("sourceLabel")} value={material.source} />
        <InfoRow icon={User} label={t("authorLabel")} value={material.author} />
      </div>

      {material.verificationStatus !== "VERIFIED" && (
        <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 border p-3">
          {t("flaggedNoticePrefix")}{" "}
          <strong>
            {tEnums(`verificationStatus.${material.verificationStatus}`)}
          </strong>
          . {t("flaggedNoticeSuffix")}
        </p>
      )}

      {material.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <Tag className="size-3.5 text-muted-foreground" />
          {material.tags.map(({ hashtag }) => (
            <Link key={hashtag.tag} href={`/explore?tag=${hashtag.tag}`}>
              <Badge variant="secondary">#{hashtag.tag}</Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t">
        <Avatar className="size-8">
          <AvatarImage src={material.contributor.profile?.avatarUrl} alt={contributorName} />
          <AvatarFallback className="text-xs">{initials(contributorName)}</AvatarFallback>
        </Avatar>
        <p className="text-sm text-muted-foreground min-w-0 break-words">
          {t("contributedByPrefix")}{" "}
          <Link href={`/profile/${material.contributor.username}`} className="font-medium text-foreground hover:underline">
            {contributorName}
          </Link>
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
