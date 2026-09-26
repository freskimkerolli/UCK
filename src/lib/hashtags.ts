import { prisma } from "@/lib/prisma";

const HASHTAG_RE = /#([\p{L}0-9_]{2,40})/gu;

export function extractHashtags(content: string, extra: string[] = []): string[] {
  const found = [...content.matchAll(HASHTAG_RE)].map((m) => m[1].toLowerCase());
  const cleanedExtra = extra.map((t) => t.replace(/^#/, "").trim().toLowerCase()).filter(Boolean);
  return [...new Set([...found, ...cleanedExtra])];
}

export async function connectHashtags(tags: string[]) {
  const hashtags = await Promise.all(
    tags.map((tag) =>
      prisma.hashtag.upsert({ where: { tag }, update: {}, create: { tag } }),
    ),
  );
  return hashtags;
}
