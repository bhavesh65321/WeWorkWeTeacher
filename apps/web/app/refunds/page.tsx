import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Refunds" };

export default function RefundsPage() {
  return (
    <LegalPage title="Refund policy">
      <p>Unused coins never expire. Coin purchases are generally not refunded after the pack is credited, except where required by law or if a charge failed.</p>
      <p>If a paid session does not happen, open a dispute from the conversation within a reasonable time. Support can refund escrow to the student and cancel the tutor payout.</p>
      <p>Unread job applications are auto-refunded to the tutor after 14 days if the student never opened the thread.</p>
      <p>Platform fees already taken on a released payout are not returned unless we reverse the whole session.</p>
    </LegalPage>
  );
}
