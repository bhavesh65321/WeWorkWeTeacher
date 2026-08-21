import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { ConversationView } from "@/components/conversation-view";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getMe();
  if (!me) redirect("/login");
  const { id } = await params;
  return <ConversationView id={id} />;
}
