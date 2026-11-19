import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Pricing",
  description: "CyberGuard pricing and plan details are not yet available.",
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
      "Assessment templates — planned availability varies",
      "Organization and assessment workflows",
      "Risk register — planned, not currently available",
      "PDF report export — planned, not currently available",
      "Plan limits and support terms to be announced",
    ],
  },
  {
    name: "Professional",
    tagline: "For growing security programmes",
    price: "To be announced",
    highlight: false,
    badge: null,
    features: [
      "Plan features and limits to be announced",
      "Risk scoring — planned, not currently available",
      "Evidence upload — planned, not currently available",
      "Report suite — planned, not currently available",
      "Department management is present in the application",
      "Audit immutability and support terms require confirmation",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Plan details to be announced",
    price: "To be announced",
    highlight: false,
    badge: null,
    features: [
      "Enterprise plan details to be announced",
      "Custom frameworks, SSO, APIs, and SLAs are not currently confirmed",
      "Support, onboarding, and retention terms require confirmation",
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
            Pricing, plan limits, and commercial terms have not been finalized. Contact the project team for current availability.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-400 font-medium">
            <Zap className="h-4 w-4" aria-hidden />
            Pricing is not currently available for purchase; plan details shown below are indicative roadmap placeholders.
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
                <p className="text-xs text-slate-500 mt-1">Pricing announced soon</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="h-4 w-4 flex-shrink-0 text-accent-400 mt-0.5" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/contact">
                <Button
                  variant={highlight ? "primary" : "secondary"}
                  size="md"
                  className="w-full gap-2"
                >
                  Contact the team
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
              <p className="font-semibold text-white">Commercial terms pending</p>
          </div>
          <p className="text-sm text-slate-500">
            Refunds, cancellation, and service terms require confirmation by the project team before purchase.
          </p>
        </div>
      </section>
    </>
  );
}
