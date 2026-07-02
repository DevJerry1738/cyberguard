import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Start your free CyberGuard trial. Set up your organisation's security workspace in minutes.",
  alternates: { canonical: "/register" },
};

const perks = [
  "14-day free trial, no credit card required",
  "Instant access to SOC 2 & ISO 27001 templates",
  "Invite your team in under 2 minutes",
  "Cancel anytime",
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-b from-surface-900 to-surface-950 border-r border-surface-800/60 overflow-hidden flex-col justify-center px-12">
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div className="absolute inset-0 bg-hero-gradient" aria-hidden />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 mb-12 w-fit" aria-label="CyberGuard Home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <Shield className="h-4 w-4 text-white" aria-hidden />
            </div>
            <span className="font-display text-lg font-bold text-white">
              Cyber<span className="text-brand-400">Guard</span>
            </span>
          </Link>

          <h2 className="font-display text-3xl font-bold text-white mb-4 leading-tight">
            Your security journey starts here
          </h2>
          <p className="text-slate-400 mb-10 text-sm leading-relaxed">
            Join security-conscious teams using CyberGuard to build measurable,
            audit-ready compliance programmes.
          </p>

          <ul className="space-y-4">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-500/20 border border-accent-500/30">
                  <Check className="h-3 w-3 text-accent-400" aria-hidden />
                </div>
                <span className="text-sm text-slate-300">{perk}</span>
              </li>
            ))}
          </ul>

          {/* Mini social proof */}
          <div className="mt-12 rounded-2xl border border-surface-700/60 bg-surface-800/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {["SC", "MW", "PN"].map((init) => (
                  <div key={init} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface-800 bg-brand-500/20 text-[9px] font-bold text-brand-400">
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">Joined last week</p>
            </div>
            <p className="text-xs text-slate-400 italic leading-relaxed">
              &ldquo;Set up our SOC 2 assessment in 20 minutes. Incredible onboarding experience.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-20 sm:px-10 lg:max-w-lg xl:max-w-xl">
        <div className="max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10 w-fit" aria-label="CyberGuard Home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <Shield className="h-4 w-4 text-white" aria-hidden />
            </div>
            <span className="font-display text-lg font-bold text-white">
              Cyber<span className="text-brand-400">Guard</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-white mb-2">Create your workspace</h1>
          <p className="text-slate-400 text-sm mb-8">
            Set up your organisation&rsquo;s CyberGuard account in under 2 minutes.
          </p>

          <RegisterForm />

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-700" />
            <span className="text-xs text-slate-500">or continue with</span>
            <div className="flex-1 h-px bg-surface-700" />
          </div>

          {/* TODO (Sprint 1): Add Supabase OAuth */}
          <Button variant="secondary" size="lg" className="w-full mt-4 gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </Button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
