import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Refunds" };

export default function RefundsPage() {
  return (
    <LegalPage title="Refund policy">
      <p>Unused coins never expire. Coin purchases are generally not refunded after the pack is credited, except where required by law or if a charge failed.</p>
      <p>Unread job applications are auto-refunded to the tutor after 14 days if the student never opened the thread.</p>
      <p>Contact unlocks and premium upgrades are non-refundable once the action is completed.</p>
      <p>For payment issues or disputes, contact support within 7 days of the transaction.</p>
    </LegalPage>
  );
}
