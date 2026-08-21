import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const me = await getMe().catch(() => null);
  if (me) redirect(me.emailVerified === false ? "/verify" : "/dashboard");
  return <LoginForm />;
}
