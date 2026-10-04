import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { NotificationsList } from "@/components/notifications-list";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const me = await getMe();
  if (!me) redirect("/login");
  
  return (
    <div className="space-y-8">
      <div>
        <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Notifications
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="mt-2 text-slate-600">
          Stay updated with job matches, messages, and account activity.
        </p>
      </div>
      <Suspense>
        <NotificationsList />
      </Suspense>
    </div>
  );
}
