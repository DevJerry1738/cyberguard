import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent, per-organisation pricing for security teams of every size. CyberGuard pricing plans coming soon.",
  alternates: { canonical: "/pricing" },
};

const plans = [
  {
    name: "Starter",
    tagline: "For small teams getting started",
    price: "Coming Soon",
    highlight: false,
    badge: null,
    features: [
      "Up to 10 team members",
      "1 compliance framework",
      "Basic risk register",
      "Standard assessments",
      "PDF report export",
      "Email support",
    ],
  },
  {
    name: "Professional",
    tagline: "For growing security programmes",
    price: "Coming Soon",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited team members",
      "All compliance frameworks",
      "Advanced risk scoring",
      "Evidence upload & storage",
      "Audit-ready report suite",
      "Department management",
      "Immutable audit logs",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For complex multi-tenant organisations",
    price: "Custom",
    highlight: false,
    badge: null,
    features: [
      "Everything in Professional",
      "Custom compliance frameworks",
      "Dedicated customer success",
      "SLA guarantee",
      "SSO & advanced RBAC",
      "API access",
      "On-boarding & training",
      "Custom data retention",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden" aria-labelledby="pricing-heading">
        <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-96 bg-hero-gradient pointer-events-none" aria-hidden />
        <div className="container-wide relative z-10 max-w-2xl mx-auto">
          <Badge variant="brand" className="mb-6">Pricing</Badge>
          <h1 id="pricing-heading" className="font-display text-5xl sm:text-6xl font-bold text-white mb-5">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-400 mb-4">
            Priced per organisation, not per seat. Grow your team without growing your bill.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-400 font-medium">
            <Zap className="h-4 w-4" aria-hidden />
            Pricing launches with Sprint 2 — join the waitlist to get early access pricing.
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24" aria-label="Pricing plans">
        <div className="container-wide grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(({ name, tagline, price, highlight, badge, features }) => (
            <div
              key={name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                highlight
                  ? "border-brand-500/50 bg-gradient-to-b from-brand-500/10 to-surface-900 shadow-glow-md"
                  : "border-surface-700/60 bg-surface-900/60"
              }`}
            >
              {badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge variant="brand" className="shadow-glow-sm px-3 py-1 text-xs font-semibold">
                    {badge}
                  </Badge>
                </span>
              )}

              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-white mb-1">{name}</h2>
                <p className="text-sm text-slate-400">{tagline}</p>
              </div>

              <div className="mb-8">
                <p className="font-display text-3xl font-bold text-white">{price}</p>
                {price !== "Custom" && (
                  <p className="text-xs text-slate-500 mt-1">Pricing announced soon</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="h-4 w-4 flex-shrink-0 text-accent-400 mt-0.5" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={name === "Enterprise" ? "/contact" : "/register"}>
                <Button
                  variant={highlight ? "primary" : "secondary"}
                  size="md"
                  className="w-full gap-2"
                >
                  {name === "Enterprise" ? "Contact Sales" : "Get Early Access"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="container-wide max-w-2xl mx-auto mt-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-accent-400" aria-hidden />
            <p className="font-semibold text-white">30-day money-back guarantee</p>
          </div>
          <p className="text-sm text-slate-500">
            Not happy in your first 30 days? We&rsquo;ll refund you in full — no questions asked.
          </p>
        </div>
      </section>
    </>
  );
}
