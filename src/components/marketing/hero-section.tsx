"use client";

import Link from "next/link";
import { ArrowRight, Play, ShieldCheck, TrendingUp, Users, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ── Floating stat card ──────────────────────────────── */
function StatCard({
  label,
  value,
  change,
  positive,
  className,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  className?: string;
}) {
  return (
    <div
      className={`glass rounded-xl px-4 py-3 shadow-glow-sm min-w-[160px] ${className ?? ""}`}
    >
      <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      <p className={`mt-0.5 text-xs font-medium ${positive ? "text-accent-400" : "text-rose-400"}`}>
        {positive ? "↑" : "↓"} {change}
      </p>
    </div>
  );
}

/* ── Mini dashboard illustration ────────────────────── */
function DashboardIllustration() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow behind */}
      <div className="absolute inset-0 rounded-3xl bg-brand-500/10 blur-3xl scale-95 pointer-events-none" />

      {/* Main frame */}
      <div className="relative rounded-2xl border border-surface-700/60 bg-surface-900/80 backdrop-blur-sm overflow-hidden shadow-card">
        {/* Fake window chrome */}
        <div className="flex items-center gap-1.5 border-b border-surface-700/60 px-4 py-3 bg-surface-950/60">
          <span className="h-3 w-3 rounded-full bg-rose-500/70" />
          <span className="h-3 w-3 rounded-full bg-amber-500/70" />
          <span className="h-3 w-3 rounded-full bg-accent-500/70" />
          <span className="ml-3 flex-1 rounded-md bg-surface-800 h-5 text-[10px] text-slate-500 flex items-center px-3">
            app.cyberguard.io/dashboard
          </span>
        </div>

        <div className="flex h-72 sm:h-80">
          {/* Sidebar */}
          <aside className="hidden sm:flex w-14 flex-col items-center gap-4 border-r border-surface-700/40 bg-surface-950/60 pt-5">
            {[ShieldCheck, TrendingUp, Users, FileBarChart2].map((Icon, i) => (
              <button
                key={i}
                aria-label={`Nav item ${i + 1}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  i === 0
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-slate-600 hover:text-slate-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="flex-1 p-4 overflow-hidden">
            {/* Top row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Compliance Score", value: "84%", color: "text-accent-400", bg: "bg-accent-500/10" },
                { label: "Active Risks",     value: "12",  color: "text-rose-400",   bg: "bg-rose-500/10" },
                { label: "Assessments",      value: "3",   color: "text-brand-400",  bg: "bg-brand-500/10" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-surface-800/60 border border-surface-700/40 p-3">
                  <p className="text-[9px] uppercase tracking-wide text-slate-500 truncate">{m.label}</p>
                  <p className={`font-display text-xl font-bold mt-0.5 ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="rounded-xl bg-surface-800/40 border border-surface-700/30 p-3 mb-3">
              <p className="text-[9px] uppercase tracking-wide text-slate-500 mb-3">Risk Trend — Last 6 Months</p>
              <div className="flex items-end gap-1.5 h-14">
                {[40, 65, 50, 80, 60, 85].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm bg-gradient-to-t from-brand-600 to-brand-400 opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent alerts */}
            <div className="space-y-1.5">
              {[
                { label: "MFA enforcement policy gap", severity: "High", color: "rose" },
                { label: "Access control review overdue", severity: "Med",  color: "amber" },
              ].map((a) => (
                <div key={a.label} className="flex items-center gap-2 rounded-lg bg-surface-800/30 border border-surface-700/20 px-3 py-2">
                  <span className={`h-1.5 w-1.5 rounded-full bg-${a.color}-400 flex-shrink-0`} />
                  <span className="text-[10px] text-slate-300 flex-1 truncate">{a.label}</span>
                  <span className={`text-[9px] font-semibold text-${a.color}-400`}>{a.severity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat cards */}
      <div className="absolute -left-6 top-1/3 animate-float hidden lg:block" style={{ animationDelay: "0s" }}>
        <StatCard label="Compliance" value="84%" change="2.4% this week" positive />
      </div>
      <div className="absolute -right-6 bottom-1/4 animate-float hidden lg:block" style={{ animationDelay: "1.5s" }}>
        <StatCard label="Risks Resolved" value="9/12" change="vs last month" positive />
      </div>
    </div>
  );
}

/* ── Hero Section ────────────────────────────────────── */
export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background radial + grid */}
      <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[60vh] bg-hero-gradient pointer-events-none" aria-hidden />

      <div className="container-wide relative z-10 flex flex-col items-center text-center gap-8">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 animate-fade-in">
          <Badge variant="brand" className="text-xs py-1 px-3">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" aria-hidden />
            Now in Public Beta
          </Badge>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl animate-fade-up"
          style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}
        >
          Strengthen Your{" "}
          <span className="text-gradient">Cybersecurity</span>{" "}
          Before Threats Find You
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl animate-fade-up"
          style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
        >
          CyberGuard gives your team a unified platform to assess security posture,
          track compliance frameworks, manage risks, and generate audit-ready reports —
          without the complexity of enterprise tools.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3 animate-fade-up"
          style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
        >
          <Link href="/register">
            <Button size="lg" variant="primary" className="gap-2 pl-6 pr-5">
              Start Free Assessment
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <button className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-slate-300 hover:text-white transition-colors text-base font-medium group">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-700 bg-surface-800 group-hover:border-brand-500/40 group-hover:bg-brand-500/10 transition-all">
              <Play className="h-3.5 w-3.5 ml-0.5 text-brand-400" aria-hidden />
            </span>
            Watch Demo
          </button>
        </div>

        {/* Trust indicators */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 animate-fade-up"
          style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}
        >
          {["No credit card required", "SOC 2 Type II compliant", "GDPR ready", "14-day free trial"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-500" aria-hidden />
              {t}
            </span>
          ))}
        </div>

        {/* Dashboard illustration */}
        <div
          className="w-full mt-8 animate-fade-up"
          style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards" }}
        >
          <DashboardIllustration />
        </div>
      </div>
    </section>
  );
}
