import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Sign up" };

export default async function RegisterPage() {
  const me = await getMe().catch(() => null);
  if (me) redirect(me.emailVerified === false ? "/verify" : "/dashboard");
  return <RegisterForm />;
}
