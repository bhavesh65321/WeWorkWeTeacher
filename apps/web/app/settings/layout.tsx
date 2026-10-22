import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  if (!me) redirect("/login?next=/settings");
  return children;
}
