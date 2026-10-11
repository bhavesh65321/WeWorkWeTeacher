import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { getMe } from "@/lib/api";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "WeTeacherWeStudent",
    template: "%s · WTWS",
  },
  description: "Find verified tutors. Book, pay, and learn on one platform.",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe().catch(() => null);
  return (
    <html lang="en">
      <body className={`${sans.variable} font-sans min-h-screen bg-slate-50/60`}>
        <Header me={me} />
        <main className="mx-auto min-h-[70vh] min-w-0 max-w-7xl overflow-x-hidden px-4 pb-20 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:px-8 lg:pb-8">
          {children}
        </main>
        <div className="hidden sm:block">
          <Footer />
        </div>
        <MobileBottomNav me={me} />
      </body>
    </html>
  );
}
