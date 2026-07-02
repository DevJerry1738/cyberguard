import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Link href="/" className="flex items-center gap-2.5 mb-10 w-fit" aria-label="CyberGuard Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 shadow-glow-sm">
            <Shield className="h-4 w-4 text-white" aria-hidden />
          </div>
          <span className="font-display text-lg font-bold text-white">
            Cyber<span className="text-brand-400">Guard</span>
          </span>
        </Link>

        <div className="max-w-sm">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">
            Sign in to your organisation&rsquo;s security workspace.
          </p>

          <LoginForm />

          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-surface-700" />
            <span className="text-xs text-slate-500">or</span>
            <div className="flex-1 h-px bg-surface-700" />
          </div>

          {/* TODO (Sprint 1): Add Supabase OAuth providers */}
          <Button variant="secondary" size="lg" className="w-full mt-4 gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&rsquo;t have an account?{" "}
            <Link href="/register" className="text-brand-400 font-medium hover:underline">
              Create one free
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
            Your session is protected with encrypted cookies, MFA support,
            and automatic token refresh — built on Supabase Auth.
          </p>
          <div className="mt-8 space-y-2.5">
            {["SOC 2 Compliant Infrastructure", "MFA Ready", "Session Auto-Refresh"].map((t) => (
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
