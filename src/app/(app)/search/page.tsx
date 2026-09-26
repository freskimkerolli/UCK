import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, Hash, Users2, Landmark, Calendar } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { globalSearch } from "@/lib/data/search";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/format";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("search");

  const { q = "" } = await searchParams;
  const results = q ? await globalSearch(q) : null;
  const totalResults = results
    ? results.users.length + results.posts.length + results.hashtags.length + results.materials.length + results.communities.length + results.events.length
    : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <Search className="size-5" /> {q ? t("resultsFor", { query: q }) : t("title")}
      </h1>

      {!q && <EmptyState icon={Search} title={t("promptTitle")} />}

      {q && totalResults === 0 && <EmptyState icon={Search} title={t("noResultsTitle")} description={t("noResultsDescription")} />}

      {results && results.users.length > 0 && (
        <Section title={t("sectionPeople")}>
          {results.users.map((u) => (
            <Link key={u.id} href={`/profile/${u.username}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted">
              <Avatar className="size-9">
                <AvatarImage src={u.profile?.avatarUrl} alt={u.username} />
                <AvatarFallback>{initials(u.profile?.displayName ?? u.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{u.profile?.displayName ?? u.username}</p>
                <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
              </div>
            </Link>
          ))}
        </Section>
      )}

      {results && results.hashtags.length > 0 && (
        <Section title={t("sectionHashtags")}>
          <div className="flex flex-wrap gap-2 px-1">
            {results.hashtags.map((h) => (
              <Link key={h.id} href={`/explore?tag=${h.tag}`}>
                <Badge variant="secondary" className="gap-1">
                  <Hash className="size-3" /> {h.tag}
                </Badge>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {results && results.posts.length > 0 && (
        <Section title={t("sectionPosts")}>
          {results.posts.map((p) => (
            <Link key={p.id} href={`/post/${p.id}`} className="block p-2.5 rounded-lg hover:bg-muted">
              <p className="text-sm font-medium">{p.author.profile?.displayName ?? p.author.username}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p>
            </Link>
          ))}
        </Section>
      )}

      {results && results.materials.length > 0 && (
        <Section title={t("sectionMaterials")}>
          {results.materials.map((m) => (
            <Link key={m.id} href={`/archive/${m.id}`} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted">
              <Landmark className="size-4 text-primary shrink-0" />
              <span className="text-sm truncate min-w-0">{m.title}</span>
            </Link>
          ))}
        </Section>
      )}

      {results && results.communities.length > 0 && (
        <Section title={t("sectionCommunities")}>
          {results.communities.map((c) => (
            <Link key={c.id} href={`/communities/${c.slug}`} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted">
              <Users2 className="size-4 text-primary shrink-0" />
              <span className="text-sm truncate min-w-0">{c.name}</span>
            </Link>
          ))}
        </Section>
      )}

      {results && results.events.length > 0 && (
        <Section title={t("sectionEvents")}>
          {results.events.map((e) => (
            <div key={e.id} className="flex items-center gap-2.5 p-2.5 rounded-lg">
              <Calendar className="size-4 text-primary shrink-0" />
              <span className="text-sm truncate min-w-0">{e.title}</span>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-3">
      <h2 className="text-sm font-semibold text-muted-foreground px-1 pb-1">{title}</h2>
      <div className="space-y-0.5">{children}</div>
    </Card>
  );
}
