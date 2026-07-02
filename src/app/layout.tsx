import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "CyberGuard — Cybersecurity Compliance & Risk Assessment Platform",
    template: "%s | CyberGuard",
  },
  description:
    "CyberGuard helps organizations assess their cybersecurity posture, track compliance, manage risks, and generate audit-ready reports — all in one unified platform.",
  keywords: [
    "cybersecurity compliance",
    "risk assessment",
    "security posture",
    "SOC 2",
    "ISO 27001",
    "audit management",
    "CISO dashboard",
  ],
  authors: [{ name: "CyberGuard, Inc." }],
  creator: "CyberGuard",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "CyberGuard",
    title: "CyberGuard — Cybersecurity Compliance & Risk Assessment Platform",
    description:
      "Assess, monitor, and improve your organization's cybersecurity posture with CyberGuard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberGuard — Cybersecurity Compliance Platform",
    description:
      "Enterprise-grade compliance and risk management for modern security teams.",
    creator: "@cyberguardapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
