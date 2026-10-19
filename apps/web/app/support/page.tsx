import type { Metadata } from "next";
import { SupportForm } from "./support-form";

export const metadata: Metadata = {
  title: "Support — Get Help with gurumates",
  description: "Need help with payments, disputes, or your account? Contact gurumates support. We typically respond within 24-48 hours.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return <SupportForm />;
}
