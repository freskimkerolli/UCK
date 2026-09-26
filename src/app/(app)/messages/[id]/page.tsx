import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getConversationDetail } from "@/lib/actions/messages";
import { ChatWindow } from "@/components/messages/chat-window";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const detail = await getConversationDetail(id);
  if (!detail) notFound();

  return <ChatWindow conversationId={id} initial={detail} currentUserId={user.id} />;
}
