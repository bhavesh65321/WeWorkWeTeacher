import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Sign up" };

export default async function RegisterPage() {
  const me = await getMe().catch(() => null);
  if (me) redirect(me.emailVerified === false ? "/verify" : "/dashboard");
  
  return (
    <div className="mx-auto max-w-md space-y-8">
      <div className="text-center">
        <span className="inline-block rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Get Started
        </span>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Create account</h1>
        <p className="mt-2 text-slate-600">
          Join thousands of students and tutors
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
