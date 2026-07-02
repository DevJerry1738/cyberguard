import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section
      className="section-padding"
      aria-labelledby="cta-heading"
    >
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 p-12 sm:p-16 text-center">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-cta-gradient pointer-events-none" aria-hidden />
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" aria-hidden />

          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-4">Get Started Today</p>
            <h2 id="cta-heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
              Start your security journey with confidence
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Join forward-thinking security teams who are using CyberGuard to build
              measurable, audit-ready compliance programmes — without the enterprise price tag.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button size="xl" variant="primary" className="gap-2">
                  Start Free Assessment
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="xl" variant="secondary" className="gap-2">
                  <Calendar className="h-4 w-4" aria-hidden />
                  Schedule a Demo
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              No credit card required &bull; 14-day free trial &bull; Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
