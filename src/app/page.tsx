import type { Metadata } from "next";
import { HeroSection }         from "@/components/marketing/hero-section";
import { TrustedBySection }    from "@/components/marketing/trusted-by-section";
import { WhyCyberGuardSection } from "@/components/marketing/why-cyberguard-section";
import { FeaturesSection }     from "@/components/marketing/features-section";
import { HowItWorksSection }   from "@/components/marketing/how-it-works-section";
import { SecuritySection }     from "@/components/marketing/security-section";
import { DashboardPreview }    from "@/components/marketing/dashboard-preview";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { FAQSection }          from "@/components/marketing/faq-section";
import { CTASection }          from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "CyberGuard — Cybersecurity Compliance & Risk Assessment Platform",
  description:
    "Assess your cybersecurity posture, track compliance against SOC 2 and ISO 27001, manage risks, and generate audit-ready reports — all in one platform.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <WhyCyberGuardSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <DashboardPreview />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
