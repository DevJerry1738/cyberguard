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
    "Explore CyberGuard's current organization and assessment workflows, plus capabilities planned for future releases.",
  alternates: { canonical: "/features" },
};

const featureGroups = [
  {
    label: "Assessment Engine",
    color: "brand",
    Icon: ClipboardCheck,
    headline: "Structure your security assessments",
    description:
      "Build assessment templates, organize questions by security domain, assign sessions, save drafts, and follow completion progress. Evidence uploads and pre-populated framework libraries are not currently confirmed as available.",
    capabilities: [
      "Custom assessment template and question builder",
      "Assessment session assignments",
      "Draft saving and resume workflow",
      "Assessment completion progress",
      "Review and submission flow",
    ],
  },
  {
    label: "Risk Intelligence",
    color: "rose",
    Icon: BarChart3,
    headline: "Understand and prioritise your threats",
    description:
      "Risk register, likelihood-and-impact scoring, recommendations, and remediation management are planned capabilities; they are not currently available in the app.",
    capabilities: [
      "Planned risk register",
      "Planned likelihood-and-impact scoring",
      "Planned severity and trend views",
      "Planned remediation ownership",
      "Planned risk recommendations",
    ],
  },
  {
    label: "Compliance Tracking",
    color: "accent",
    Icon: ShieldCheck,
    headline: "Know your compliance score at all times",
    description:
      "Calculated cross-framework compliance scores and audit-readiness analytics are planned. Assessment progress is available, but it is not a certification or compliance attestation.",
    capabilities: [
      "Planned compliance score calculations",
      "Planned control gap analysis",
      "Planned cross-framework mapping",
      "Planned compliance history",
      "Planned audit-readiness exports",
    ],
  },
  {
    label: "Audit & Governance",
    color: "amber",
    Icon: ScrollText,
    headline: "Prove accountability to anyone who asks",
    description:
      "Selected application actions create timestamped activity records. Full event coverage, append-only enforcement, audit search, and export are not yet verified or available.",
    capabilities: [
      "Selected activity event records",
      "Recent activity on the dashboard",
      "Planned dedicated audit viewer and export",
    ],
  },
  {
    label: "Team & Organisation",
    color: "purple",
    Icon: Users2,
    headline: "Collaborate across your entire organisation",
    description:
      "Manage organization members, invitations, roles, and departments. Verify role and department boundaries for each workflow before relying on them.",
    capabilities: [
      "Organization membership and invitation flows",
      "Role definitions and assignment",
      "Department management",
      "Assessment session assignment",
      "Role/tenant access verification remains ongoing",
      "Multi-organization support is not confirmed",
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
            Assessment workflows for your security programme
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            CyberGuard currently focuses on assessment and organization workflows. Risk management,
            calculated compliance analytics, and report generation are roadmap capabilities.
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
