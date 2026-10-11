import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Sign up" };

export default async function RegisterPage() {
  const me = await getMe().catch(() => null);
  if (me) redirect(me.emailVerified === false ? "/verify" : "/dashboard");
  
  return (
    <div className="mx-auto max-w-md space-y-6 sm:space-y-8">
      <div className="text-center">
        <span className="inline-block rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 sm:px-3 sm:py-1 sm:text-xs">
          Get Started
        </span>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl">Create account</h1>
        <p className="mt-1.5 text-sm text-slate-600 sm:mt-2 sm:text-base">
          Join thousands of students and tutors
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
