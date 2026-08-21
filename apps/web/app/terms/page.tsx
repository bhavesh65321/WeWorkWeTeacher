import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>WeTeacherWeStudent (WTWS) is a marketplace that connects students and tutors. You must be 13 or older.</p>
      <p>Students post jobs or message tutors using coins. Tutors apply with coins. After a session is paid into escrow, both parties may use in-app chat, phone, and WhatsApp to arrange the lesson.</p>
      <p>WTWS holds session fees in escrow until the student releases them (or support resolves a dispute). A platform fee is deducted from the tutor payout.</p>
      <p>Do not share contact details in chat until the session is paid. Fake profiles, spam jobs, and academic-integrity violations may lead to account closure.</p>
      <p>Classroom video is not part of Open GA. Built-in video/whiteboard will ship later.</p>
    </LegalPage>
  );
}
