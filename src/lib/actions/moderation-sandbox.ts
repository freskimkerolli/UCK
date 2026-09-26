"use server";

import { getTranslations } from "next-intl/server";
import { requireCurrentUser, requireModerator } from "@/lib/session";
import { moderateText } from "@/lib/moderation";

/**
 * Powers the admin "NLP Sandbox" — runs the exact same moderateText()
 * function that gates real posts/comments, so what a moderator sees here is
 * not a simulation, it's the live engine.
 */
export async function analyzeModerationTextAction(text: string) {
  await requireModerator();
  const t = await getTranslations("moderation");
  return moderateText(text, t);
}

/**
 * Same engine, but gated for any signed-in user rather than moderators only
 * — this is what powers the "AI Guardrail" live preview in the post
 * composer, so a user sees the real classification (and the real block
 * message, verbatim) as they type, before they ever hit publish.
 */
export async function previewModerationAction(text: string) {
  await requireCurrentUser();
  const t = await getTranslations("moderation");
  return moderateText(text, t);
}
