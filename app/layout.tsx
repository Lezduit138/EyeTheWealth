import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "ETW — Eye The Wealth",
    template: "%s | ETW — Eye The Wealth",
  },
  description:
    "ETW aggregates public socioeconomic and financial transparency data from credible sources. Explore. Trace. Understand.",
  keywords: [
    "financial transparency",
    "socioeconomic data",
    "NGO funding",
    "wealth statistics",
    "India",
    "public data",
    "investigative",
  ],
  authors: [{ name: "ETW — Eye The Wealth" }],
  robots: { index: true, follow: true },
  openGraph: {
    title: "ETW — Eye The Wealth",
    description: "Financial and socioeconomic transparency platform.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers session={session}>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
