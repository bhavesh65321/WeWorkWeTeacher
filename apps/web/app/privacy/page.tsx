import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>We store your name, email, phone, profile, messages, bookings, and payment records needed to run the marketplace.</p>
      <p>Card numbers are processed by Stripe. We do not store full card details.</p>
      <p>Phone numbers are shown to the other party only after escrow is funded.</p>
      <p>You can export or delete your account from Dashboard. Deletion anonymizes your login and contact data.</p>
      <p>We use a session cookie to keep you signed in. See Cookies for details.</p>
    </LegalPage>
  );
}
