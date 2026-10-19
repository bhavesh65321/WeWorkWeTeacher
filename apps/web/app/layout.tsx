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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gurumates.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "gurumates — Find Trusted Tutors Near You | Online & Home Tuition",
    template: "%s · gurumates",
  },
  description:
    "Find verified tutors for any subject — academics, coding, music, languages & more. Post your requirement free, chat safely, unlock contact when ready. Join 1000+ students & tutors on gurumates.",
  keywords: [
    "find tutors",
    "online tutors",
    "home tuition",
    "private tutors",
    "tutor marketplace",
    "learn coding",
    "math tutor",
    "science tutor",
    "language tutor",
    "music lessons",
    "gurumates",
    "tutoring platform",
    "hire tutor",
    "teaching jobs",
  ],
  authors: [{ name: "gurumates" }],
  creator: "gurumates",
  publisher: "gurumates",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "gurumates",
    title: "gurumates — Find Trusted Tutors Near You",
    description:
      "Find verified tutors for any subject. Post your requirement free, chat safely, unlock contact when ready.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "gurumates — Find Trusted Tutors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "gurumates — Find Trusted Tutors Near You",
    description:
      "Find verified tutors for any subject. Post your requirement free, chat safely, unlock contact when ready.",
    images: ["/og-image.png"],
    creator: "@gurumates",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "education",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0080D0",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe().catch(() => null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "gurumates",
    url: SITE_URL,
    description: "Find trusted tutors for any subject — academics, coding, music, languages & more.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tutors?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
