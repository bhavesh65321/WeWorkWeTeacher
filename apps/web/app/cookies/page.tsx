import { LegalPage } from "@/components/legal-page";

export const metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies">
      <p>WTWS uses an httpOnly session cookie (`wtws_token`) so you stay logged in. It is required for the product to work.</p>
      <p>We do not use advertising cookies in Open GA. Analytics, if added later, will be listed here.</p>
    </LegalPage>
  );
}
