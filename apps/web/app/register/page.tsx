import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { RegisterForm } from "./register-form";
import { BrandMarkIcon } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Sign Up Free — Join gurumates",
  description: "Create a free account on gurumates. Find tutors for any subject or start teaching and earn. Join 1000+ students and tutors.",
  alternates: { canonical: "/register" },
  robots: { index: true, follow: true },
};

export default async function RegisterPage() {
  const me = await getMe().catch(() => null);
  if (me) redirect(me.emailVerified === false ? "/verify" : "/dashboard");
  
  return (
    <div className="mx-auto max-w-md space-y-6 sm:space-y-8">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <BrandMarkIcon className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Create account</h1>
        <p className="mt-1.5 text-sm text-slate-600 sm:mt-2 sm:text-base">
          Join gurumates — find tutors or start teaching
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:rounded-2xl sm:p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
