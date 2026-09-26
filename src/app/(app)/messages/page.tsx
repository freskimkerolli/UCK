import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { findOrCreateConversationAction } from "@/lib/actions/messages";
import { EmptyState } from "@/components/shared/empty-state";

export default async function MessagesIndexPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { with: withUsername } = await searchParams;
  if (withUsername) {
    const res = await findOrCreateConversationAction(withUsername);
    if (res.success) redirect(`/messages/${res.data.conversationId}`);
  }

  const t = await getTranslations("chat");

  return (
    <div className="hidden md:flex h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-6rem)] items-center justify-center">
      <EmptyState icon={MessageCircle} title={t("selectConversationTitle")} description={t("selectConversationDescription")} />
    </div>
  );
}
