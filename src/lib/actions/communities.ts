"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { communitySchema } from "@/lib/validations";
import { slugify } from "@/lib/slugify";
import type { ActionResult } from "@/lib/actions/auth";

export async function createCommunityAction(input: unknown): Promise<ActionResult<{ slug: string }>> {
  const user = await requireCurrentUser();
  const tErrors = await getTranslations("actionErrors");
  const parsed = communitySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? tErrors("invalidData") };
  const data = parsed.data;

  const baseSlug = slugify(data.name) || "komunitet";
  let slug = baseSlug;
  let n = 1;
  while (await prisma.community.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const community = await prisma.community.create({
    data: {
      slug,
      name: data.name,
      description: data.description,
      category: data.category,
      rules: data.rules,
      coverUrl: data.coverUrl,
      logoUrl: data.logoUrl,
      createdById: user.id,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });

  revalidatePath("/communities");
  return { success: true, data: { slug: community.slug } };
}

export async function joinCommunityAction(communityId: string): Promise<ActionResult<{ joined: boolean }>> {
  const user = await requireCurrentUser();
  const existing = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId: user.id } },
  });
  if (existing) {
    if (existing.role === "OWNER") {
      const t = await getTranslations("actionErrors");
      return { success: false, error: t("founderCannotLeave") };
    }
    await prisma.communityMember.delete({ where: { id: existing.id } });
    revalidatePath("/communities");
    return { success: true, data: { joined: false } };
  }
  await prisma.communityMember.create({ data: { communityId, userId: user.id, role: "MEMBER" } });
  revalidatePath("/communities");
  return { success: true, data: { joined: true } };
}
