import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "A confirmation email has been sent to your inbox. Verify your email to continue.",
  alternates: { canonical: "/verify-email" },
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-6 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-surface-700 bg-surface-900/95 p-10 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-center rounded-3xl bg-surface-800/70 p-6 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
            <Mail className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-4">Verify your email</h1>
        <p className="text-center text-slate-400 mb-8">
          We sent a confirmation email to your inbox. Click the link in the message to verify your account and continue setting up your organisation.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full">
              Return to login
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
