"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { historicalMaterialSchema } from "@/lib/validations";
import { connectHashtags } from "@/lib/hashtags";
import type { ActionResult } from "@/lib/actions/auth";

export async function createHistoricalMaterialAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireCurrentUser();
  const tErrors = await getTranslations("actionErrors");
  const parsed = historicalMaterialSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? tErrors("invalidData") };
  const data = parsed.data;

  const material = await prisma.historicalMaterial.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      eventDate: data.eventDate,
      location: data.location,
      source: data.source,
      author: data.author,
      mediaUrl: data.mediaUrl,
      contributorId: user.id,
      verificationStatus: "UNVERIFIED",
    },
  });

  if (data.tags.length > 0) {
    const tags = await connectHashtags(data.tags.map((t) => t.replace(/^#/, "").toLowerCase()));
    await prisma.historicalMaterialTag.createMany({
      data: tags.map((t) => ({ materialId: material.id, hashtagId: t.id })),
    });
  }

  revalidatePath("/archive");
  return { success: true, data: { id: material.id } };
}
