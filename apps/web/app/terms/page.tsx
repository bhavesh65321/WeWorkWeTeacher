import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use — gurumates",
  description: "Read the terms of use for gurumates tutoring marketplace. Learn about our policies for students and tutors.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>gurumates is a marketplace that connects students and tutors. You must be 13 or older.</p>
      <p>Students post jobs or message tutors using coins. Tutors apply with coins. After contact is unlocked with coins, both parties may use in-app chat, phone, and WhatsApp to arrange lessons.</p>
      <p>Coin packs can be purchased using Cards or UPI via Stripe. Coins are used for job applications, messaging, contact unlocks, and premium upgrades.</p>
      <p>Do not share contact details in chat until contact is unlocked. Fake profiles, spam jobs, and academic-integrity violations may lead to account closure.</p>
      <p>Classroom video is not part of Open GA. Built-in video/whiteboard will ship later.</p>
    </LegalPage>
  );
}
