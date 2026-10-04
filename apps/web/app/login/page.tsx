import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const me = await getMe().catch(() => null);
  if (me) redirect(me.emailVerified === false ? "/verify" : "/dashboard");
  
  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="text-center">
        <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          Welcome Back
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Log in</h1>
        <p className="mt-2 text-slate-600">
          Sign in to your account to continue
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <LoginForm />
      </div>
    </div>
  );
}
