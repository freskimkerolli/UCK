import Link from "next/link";
import { Users2, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type CommunityCategory } from "@/lib/types";
import { initials } from "@/lib/format";

interface CommunityCardProps {
  community: {
    slug: string;
    name: string;
    description: string;
    category: string;
    coverUrl: string;
    logoUrl: string;
    _count: { members: number; posts: number };
  };
}

export async function CommunityCard({ community }: CommunityCardProps) {
  const tEnums = await getTranslations("enums");
  return (
    <Link href={`/communities/${community.slug}`} className="block h-full">
      <Card interactive className="p-0 overflow-hidden h-full gap-0">
        <div className="h-24 gradient-brand-subtle relative overflow-hidden">
          {community.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={community.coverUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
            />
          )}
        </div>
        <div className="p-4 pt-0 space-y-2.5">
          <Avatar className="size-14 border-4 border-card -mt-7 shadow-warm-sm">
            <AvatarImage src={community.logoUrl} alt={community.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials(community.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold leading-snug line-clamp-1">{community.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{community.description}</p>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <Badge variant="secondary">{tEnums(`communityCategory.${community.category as CommunityCategory}`)}</Badge>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users2 className="size-3.5" /> {community._count.members}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="size-3.5" /> {community._count.posts}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
