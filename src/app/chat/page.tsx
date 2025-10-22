import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/actions/chat.actions";
import ChatClientPage from "./chat-client-page"; // We will create this next

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const initialConversations = await getConversations();

  return <ChatClientPage initialConversations={initialConversations} />;
}
