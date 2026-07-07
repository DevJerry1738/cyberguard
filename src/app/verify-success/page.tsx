import type { Metadata } from "next";
import Link from "next/link";
import { Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Email Verified Success",
  description: "Your email has been successfully verified. Log in to start setting up your compliance dashboard.",
  alternates: { canonical: "/verify-success" },
};

export default function VerifySuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-6 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-surface-700 bg-surface-900/95 p-10 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-center rounded-3xl bg-surface-800/70 p-6 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-4 font-display">Email verified successfully</h1>
        <p className="text-center text-slate-400 mb-8 leading-relaxed">
          Your email has been verified. You can now log in to access your CyberGuard compliance and risk assessment dashboard.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full">
              Proceed to login
            </Button>
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white">
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
