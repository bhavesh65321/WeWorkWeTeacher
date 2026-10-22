import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me) redirect("/login?next=/admin");
  if (!me.isAdmin) redirect("/dashboard");
  return children;
}
