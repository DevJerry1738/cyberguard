"use client";

import { Accordion } from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is CyberGuard and who is it for?",
    answer:
      "CyberGuard is a cybersecurity compliance and risk assessment platform designed for small-to-medium businesses, IT managers, security officers, and CISOs. It helps organisations assess their security posture, track compliance against frameworks like SOC 2 and ISO 27001, and manage risks — all from a single unified platform.",
  },
  {
    question: "Which compliance frameworks does CyberGuard support?",
    answer:
      "CyberGuard currently supports SOC 2 Type I/II, ISO 27001:2022, NIST Cybersecurity Framework (CSF), and CIS Controls. Additional frameworks including HIPAA, PCI-DSS, and GDPR mappings are planned for upcoming releases.",
  },
  {
    question: "How does CyberGuard protect my organisation's data?",
    answer:
      "CyberGuard employs end-to-end encryption (TLS 1.3 in transit, AES-256 at rest), database-level row isolation to prevent cross-tenant data access, multi-factor authentication, immutable audit logs, and a zero-trust access model. Our infrastructure is built on SOC 2 compliant cloud services.",
  },
  {
    question: "Can I invite team members and assign them different roles?",
    answer:
      "Yes. CyberGuard supports role-based access control with five built-in roles: Owner, Administrator, Security Officer, Department Manager, and Employee. Each role has scoped permissions, so team members only see and act on data relevant to their function.",
  },
  {
    question: "What happens to my data if I cancel my subscription?",
    answer:
      "Upon cancellation, you have a 30-day window to export all your assessment data, reports, audit logs, and risk records in standard formats (CSV, JSON, PDF). After 30 days, data is permanently deleted from our systems in accordance with our data retention policy.",
  },
  {
    question: "Is CyberGuard suitable for startups without a dedicated security team?",
    answer:
      "Absolutely. CyberGuard was designed with smaller organisations in mind. Our guided assessment workflows, plain-language recommendations, and department-level task delegation make it possible for non-security specialists to actively contribute to your compliance programme.",
  },
  {
    question: "How is CyberGuard priced?",
    answer:
      "CyberGuard is priced per organisation, not per seat, making it cost-effective as your team grows. We offer a Starter plan for smaller teams, a Professional plan with full framework support, and an Enterprise plan with custom configurations. Full pricing details are available on our Pricing page.",
  },
];

export function FAQSection() {
  return (
    <section
      className="section-padding border-t border-surface-800/60"
      aria-labelledby="faq-heading"
    >
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left: heading */}
          <div className="lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">FAQ</p>
            <h2 id="faq-heading" className="font-display text-4xl font-bold text-white mb-4">
              Common questions
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Can&rsquo;t find what you&rsquo;re looking for?{" "}
              <a href="/contact" className="text-brand-400 hover:underline">
                Contact our team
              </a>{" "}
              and we&rsquo;ll get back to you within one business day.
            </p>
          </div>

          {/* Right: accordion */}
          <div className="lg:col-span-2">
            <Accordion items={faqItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
