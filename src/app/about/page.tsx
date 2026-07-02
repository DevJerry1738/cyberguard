import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Target, Heart, Users2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about CyberGuard — our mission to make enterprise-grade cybersecurity compliance accessible to every organisation, and the values that guide our team.",
  alternates: { canonical: "/about" },
};

const values = [
  { Icon: Shield,  title: "Security Without Compromise",  description: "We hold ourselves to the same standards we help you achieve. Security is in every line of code we write." },
  { Icon: Target,  title: "Clarity Over Complexity",      description: "Compliance doesn't have to be overwhelming. We translate complexity into clear, actionable steps every team can follow." },
  { Icon: Heart,   title: "Customer Obsession",           description: "Our north star is customer success. We measure ourselves by the security outcomes our customers achieve." },
  { Icon: Users2,  title: "Team-First Culture",           description: "The best security programmes are collaborative. CyberGuard is designed to bring every stakeholder into the process." },
  { Icon: Globe,   title: "Accessible Security",          description: "Enterprise-grade security tools shouldn't require an enterprise budget. We believe every organisation deserves protection." },
];

const stats = [
  { value: "2026",  label: "Founded" },
  { value: "100+",  label: "Beta Customers" },
  { value: "5",     label: "Frameworks Supported" },
  { value: "SOC 2", label: "Compliance Target" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-labelledby="about-heading">
        <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-96 bg-hero-gradient pointer-events-none" aria-hidden />
        <div className="container-wide relative z-10 max-w-3xl">
          <Badge variant="brand" className="mb-6">Our Story</Badge>
          <h1 id="about-heading" className="font-display text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            We believe every organisation deserves enterprise-grade{" "}
            <span className="text-gradient">cybersecurity</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            CyberGuard was built because the tools that help organisations stay secure were
            too complex, too expensive, and too fragmented for most teams to actually use.
            We set out to change that.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20" aria-label="Company statistics">
        <div className="container-wide grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-3xl">
          {stats.map(({ value, label }) => (
            <div key={label} className="rounded-2xl border border-surface-700/60 bg-surface-900/60 p-6 text-center">
              <p className="font-display text-3xl font-bold text-brand-400 mb-1">{value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding border-t border-surface-800/60" aria-label="Mission and vision">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">Our Mission</p>
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Make security compliance achievable for every organisation
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              Too many businesses are one data breach or failed audit away from serious
              consequences — not because they don&rsquo;t care about security, but because the
              tools available to them were built for Fortune 500 companies with dedicated
              security teams and six-figure budgets.
            </p>
            <p className="text-slate-400 leading-relaxed">
              CyberGuard is built for the IT manager wearing three hats, the startup CTO
              navigating their first SOC 2, and the compliance officer trying to get their
              organisation audit-ready without a team of consultants.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-400 mb-3">Our Vision</p>
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              A world where cybersecurity is a strength, not a liability
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              We envision a future where every organisation — regardless of size, industry,
              or technical maturity — has the tools to build a meaningful, measurable, and
              continuously improving security programme.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Where security posture is visible to leadership, compliance is a live
              process rather than an annual panic, and every team member understands their
              role in protecting the organisation.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding border-t border-surface-800/60" aria-labelledby="values-heading">
        <div className="container-wide">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">What drives us</p>
            <h2 id="values-heading" className="font-display text-4xl font-bold text-white mb-4">Our core values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(({ Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-surface-700/60 bg-surface-900/60 p-6 hover:border-brand-500/30 transition-all duration-300 card-hover">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 mb-5">
                  <Icon className="h-5 w-5 text-brand-400" aria-hidden />
                </div>
                <h3 className="font-display text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
