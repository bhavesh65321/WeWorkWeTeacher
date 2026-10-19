import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — gurumates",
  description: "Learn how gurumates protects your privacy. We explain what data we collect and how we use it.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>We store your name, email, phone, profile, messages, bookings, and payment records needed to run the marketplace.</p>
      <p>Card numbers and UPI details are processed by Stripe. We do not store full payment details.</p>
      <p>Phone numbers are shown to the other party only after contact is unlocked with coins.</p>
      <p>You can export or delete your account from Dashboard. Deletion anonymizes your login and contact data.</p>
      <p>We use a session cookie to keep you signed in. See Cookies for details.</p>
    </LegalPage>
  );
}
