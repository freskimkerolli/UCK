import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyConversations } from "@/lib/actions/messages";
import { ConversationList } from "@/components/messages/conversation-list";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await getMyConversations();

  return (
    <div className="flex">
      <ConversationList initial={conversations} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
