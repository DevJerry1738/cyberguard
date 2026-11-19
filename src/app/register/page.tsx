import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Check } from "lucide-react";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a CyberGuard account and set up an organization workspace.",
  alternates: { canonical: "/register" },
};

const perks = [
  "Create an organization workspace",
  "Manage members, roles, and departments",
  "Build assessment templates and sessions",
  "Trial and commercial terms require confirmation",
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-b from-surface-900 to-surface-950 border-r border-surface-800/60 overflow-hidden flex-col justify-center px-12">
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div className="absolute inset-0 bg-hero-gradient" aria-hidden />
        <div className="relative z-10">
          {/* <Link href="/" className="flex items-center gap-2.5 mb-12 w-fit" aria-label="CyberGuard Home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <Shield className="h-4 w-4 text-white" aria-hidden />
            </div>
            <span className="font-display text-lg font-bold text-white">
              Cyber<span className="text-brand-400">Guard</span>
            </span>
          </Link> */}

          <h2 className="font-display text-3xl font-bold text-white mb-4 leading-tight">
            Your security journey starts here
          </h2>
          <p className="text-slate-400 mb-10 text-sm leading-relaxed">
            Set up an organization workspace and explore CyberGuard's current assessment workflows.
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
            Set up your organisation&rsquo;s CyberGuard account.
          </p>

          <RegisterForm />

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
