import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { NotificationsList } from "@/components/notifications-list";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const me = await getMe();
  if (!me) redirect("/login");
  return (
    <Suspense>
      <NotificationsList />
    </Suspense>
  );
}
