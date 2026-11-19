"use client";

import { Accordion } from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is CyberGuard and who is it for?",
    answer:
      "CyberGuard is an organization and cybersecurity assessment application. Teams can manage members and departments, build assessment templates, assign sessions, save drafts, and review progress. Risk scoring and report generation are planned, not currently available.",
  },
  {
    question: "Which compliance frameworks does CyberGuard support?",
    answer:
      "The application lets organization users create templates and specify framework names. This repository does not establish that pre-populated SOC 2, ISO 27001, NIST CSF, or CIS control content is shipped. Confirm template content before relying on a framework mapping.",
  },
  {
    question: "How does CyberGuard protect my organisation's data?",
    answer:
      "The application uses Supabase Auth and database row-level security policies. Policy coverage and deployment configuration require verification for each environment. Mandatory MFA, append-only audit enforcement, certifications, and specific encryption guarantees are not asserted here; ask the project team for current assurance documentation.",
  },
  {
    question: "Can I invite team members and assign them different roles?",
    answer:
      "The application defines Owner, Admin, Security Officer, Manager, and Employee roles and provides member and department management. Permission coverage should be verified for the specific action and environment; UI visibility alone is not an authorization guarantee.",
  },
  {
    question: "What happens to my data if I cancel my subscription?",
    answer:
      "Data export, cancellation timelines, and retention policies depend on the product's approved service terms. Contact the project team for current policy details; report and risk exports are not currently evidenced as implemented.",
  },
  {
    question: "Is CyberGuard suitable for startups without a dedicated security team?",
    answer:
      "The assessment and organization-management workflows are intended to help teams collaborate. Automated recommendations and department-level question delegation are not currently confirmed as available.",
  },
  {
    question: "How is CyberGuard priced?",
    answer:
      "Pricing and plan availability are subject to confirmation by the project team. See the Pricing page for current published information and confirm commercial terms before purchase.",
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
                Send us a message
              </a>{" "}
              and the project team can provide current information.
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
