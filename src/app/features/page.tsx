import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardCheck, BarChart3, ShieldCheck, ScrollText,
  Users2, Bell, FileBarChart2, Globe, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore every capability in CyberGuard — from structured security assessments and dynamic risk scoring to compliance tracking, audit logs, and team management.",
  alternates: { canonical: "/features" },
};

const featureGroups = [
  {
    label: "Assessment Engine",
    color: "brand",
    Icon: ClipboardCheck,
    headline: "Structure your security assessments",
    description:
      "CyberGuard's assessment engine guides your team through framework-aligned questionnaires, collecting evidence, tracking progress, and producing a structured compliance record — automatically.",
    capabilities: [
      "SOC 2, ISO 27001, and NIST CSF templates out-of-the-box",
      "Department-level task delegation with deadline tracking",
      "Evidence file upload with secure Supabase Storage",
      "Auto-save drafts and resume from any device",
      "Bulk question import for custom frameworks",
      "Real-time completion progress tracking",
    ],
  },
  {
    label: "Risk Intelligence",
    color: "rose",
    Icon: BarChart3,
    headline: "Understand and prioritise your threats",
    description:
      "Our risk engine turns raw assessment data into a prioritised, quantified risk register — giving security leaders the context they need to make confident decisions.",
    capabilities: [
      "Likelihood × Impact risk scoring matrix",
      "Dynamic severity classification (Critical → Low)",
      "Risk trend tracking over time",
      "Owner assignment and remediation workflows",
      "Linked recommendations per identified risk",
      "Executive risk summary export",
    ],
  },
  {
    label: "Compliance Tracking",
    color: "accent",
    Icon: ShieldCheck,
    headline: "Know your compliance score at all times",
    description:
      "Never be surprised by an audit again. CyberGuard gives you a live compliance score mapped to your chosen frameworks, with clear visibility into which controls need attention.",
    capabilities: [
      "Real-time compliance score across frameworks",
      "Control-level gap analysis and health indicators",
      "Multi-framework control mapping (write once, satisfy many)",
      "Compliance history and trend charts",
      "Audit readiness checklist generator",
      "One-click share with external auditors",
    ],
  },
  {
    label: "Audit & Governance",
    color: "amber",
    Icon: ScrollText,
    headline: "Prove accountability to anyone who asks",
    description:
      "CyberGuard automatically captures every meaningful action across your programme into a tamper-proof, timestamped audit trail. Your governance story is always ready.",
    capabilities: [
      "Immutable audit log — every action recorded",
      "Advanced search and date-range filtering",
      "User, department, and action-type filters",
      "Export logs as CSV for external review",
      "Read-only auditor access mode",
      "Compliance period snapshots",
    ],
  },
  {
    label: "Team & Organisation",
    color: "purple",
    Icon: Users2,
    headline: "Collaborate across your entire organisation",
    description:
      "Security is a team sport. CyberGuard makes it easy to organise your workforce, assign responsibilities, and ensure every department plays its part in your security programme.",
    capabilities: [
      "Five built-in roles: Owner, Admin, Security Officer, Manager, Employee",
      "Department grouping and scoped access",
      "Secure member invitation via email",
      "Role assignment and permission management",
      "Assessment task delegation to department heads",
      "Multi-organisation support (agencies & MSPs)",
    ],
  },
];

const colorMap: Record<string, { Icon: string; badge: string; border: string }> = {
  brand:  { Icon: "text-brand-400",  badge: "bg-brand-500/10  text-brand-400  border-brand-500/20",  border: "border-brand-500/20"  },
  rose:   { Icon: "text-rose-400",   badge: "bg-rose-500/10   text-rose-400   border-rose-500/20",   border: "border-rose-500/20"   },
  accent: { Icon: "text-accent-400", badge: "bg-accent-500/10 text-accent-400 border-accent-500/20", border: "border-accent-500/20" },
  amber:  { Icon: "text-amber-400",  badge: "bg-amber-500/10  text-amber-400  border-amber-500/20",  border: "border-amber-500/20"  },
  purple: { Icon: "text-purple-400", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", border: "border-purple-500/20" },
};

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden" aria-labelledby="features-page-heading">
        <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-96 bg-hero-gradient pointer-events-none" aria-hidden />
        <div className="container-wide relative z-10 max-w-3xl mx-auto">
          <Badge variant="brand" className="mb-6 text-xs">Platform Capabilities</Badge>
          <h1 id="features-page-heading" className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Every tool your security programme needs
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            CyberGuard brings together security assessments, risk management, compliance tracking,
            audit governance, and team collaboration into one cohesive platform — without the
            enterprise complexity.
          </p>
          <Link href="/register">
            <Button size="lg" variant="primary" className="gap-2">
              Start for free <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature groups */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24" aria-label="Feature details">
        <div className="container-wide max-w-5xl mx-auto space-y-24">
          {featureGroups.map(({ label, color, Icon, headline, description, capabilities }, i) => {
            const c = colorMap[color];
            const isEven = i % 2 === 0;
            return (
              <div key={label} className={`flex flex-col gap-12 lg:flex-row lg:items-center ${isEven ? "" : "lg:flex-row-reverse"}`}>
                {/* Text */}
                <div className="lg:w-1/2 space-y-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${c.badge}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-white leading-snug">{headline}</h2>
                  <p className="text-slate-400 leading-relaxed">{description}</p>
                  <ul className="space-y-2.5 pt-2">
                    {capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <ShieldCheck className={`h-4 w-4 flex-shrink-0 mt-0.5 ${c.Icon}`} aria-hidden />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual card */}
                <div className="lg:w-1/2">
                  <div className={`rounded-2xl border ${c.border} bg-surface-900/60 p-8 h-60 flex items-center justify-center`}>
                    <div className="flex flex-col items-center gap-4 opacity-60">
                      <Icon className={`h-16 w-16 ${c.Icon}`} aria-hidden />
                      <p className="text-sm text-slate-500 text-center max-w-xs">{headline}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <CTASection />
    </>
  );
}
