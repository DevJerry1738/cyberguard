import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your CyberGuard account to access your compliance dashboard.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-20 sm:px-10 lg:max-w-lg xl:max-w-xl">
        {/* Logo */}
        {/* <Link href="/" className="flex items-center gap-2.5 mb-10 w-fit" aria-label="CyberGuard Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 shadow-glow-sm">
            <Shield className="h-4 w-4 text-white" aria-hidden />
          </div>
          <span className="font-display text-lg font-bold text-white">
            Cyber<span className="text-brand-400">Guard</span>
          </span>
        </Link> */}

        <div className="max-w-sm">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">
            Sign in to your organisation&rsquo;s security workspace.
          </p>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&rsquo;t have an account?{" "}
            <Link href="/register" className="text-brand-400 font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — decorative */}
      <div className="hidden lg:flex flex-1 relative bg-surface-900 border-l border-surface-800/60 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div className="absolute inset-0 bg-hero-gradient" aria-hidden />
        <div className="relative z-10 max-w-xs text-center px-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 border border-brand-500/30 shadow-glow-md">
              <Shield className="h-8 w-8 text-brand-400" aria-hidden />
            </div>
          </div>
          <p className="font-display text-xl font-bold text-white mb-3">Secure by design</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Authentication is provided through Supabase Auth. MFA enforcement and the full security configuration must be confirmed for your environment.
          </p>
          <div className="mt-8 space-y-2.5">
            {["Supabase Auth integration", "Organization role model", "Security verification ongoing"].map((t) => (
              <div key={t} className="flex items-center gap-2 rounded-lg bg-surface-800/40 border border-surface-700/40 px-4 py-2.5">
                <Shield className="h-3.5 w-3.5 text-accent-400 flex-shrink-0" aria-hidden />
                <span className="text-xs text-slate-300">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
