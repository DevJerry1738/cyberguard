import {
  ShieldCheck, BarChart3, AlertTriangle, Bell, Users2,
  Home, ClipboardList, TrendingUp, FileText, Settings,
} from "lucide-react";

/* ── Sidebar ─────────────────────────────────────────── */
function Sidebar() {
  const items = [
    { Icon: Home,          label: "Dashboard",    active: true },
    { Icon: ClipboardList, label: "Assessments",  active: false },
    { Icon: TrendingUp,    label: "Risks",        active: false },
    { Icon: FileText,      label: "Reports",      active: false },
    { Icon: Users2,        label: "Team",         active: false },
    { Icon: Settings,      label: "Settings",     active: false },
  ];
  return (
    <aside className="hidden md:flex w-52 flex-col border-r border-surface-700/50 bg-surface-950/80 pt-5 px-3 gap-1">
      {items.map(({ Icon, label, active }) => (
        <div
          key={label}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
            active
              ? "bg-brand-500/15 text-brand-300"
              : "text-slate-500 hover:text-slate-300 hover:bg-surface-800"
          }`}
          aria-current={active ? "page" : undefined}
        >
          <Icon className="h-4 w-4 flex-shrink-0" aria-hidden />
          {label}
        </div>
      ))}
    </aside>
  );
}

/* ── Metric card ─────────────────────────────────────── */
function Metric({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-xl border border-surface-700/50 bg-surface-800/60 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

/* ── Main dashboard preview ──────────────────────────── */
export function DashboardPreview() {
  const risks = [
    { label: "MFA policy not enforced",          severity: "Critical", color: "rose" },
    { label: "Vendor risk assessment overdue",    severity: "High",     color: "orange" },
    { label: "Data retention policy gap",         severity: "Medium",   color: "amber" },
    { label: "Backup procedure not documented",   severity: "Medium",   color: "amber" },
    { label: "Access review completed",           severity: "Resolved", color: "accent" },
  ];

  const depts = [
    { name: "Engineering",   score: 91, color: "accent" },
    { name: "HR",            score: 78, color: "brand" },
    { name: "Operations",    score: 64, color: "amber" },
    { name: "Finance",       score: 88, color: "accent" },
  ];

  return (
    <section
      className="section-padding border-t border-surface-800/60 overflow-hidden"
      aria-labelledby="preview-heading"
    >
      <div className="container-wide">
        {/* Heading */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">Platform Preview</p>
          <h2 id="preview-heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Your security command centre
          </h2>
          <p className="text-lg text-slate-400">
            Everything your security team needs — compliance scores, risk register,
            department tracking, and audit logs — in one unified workspace.
          </p>
        </div>

        {/* Fake OS window */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 rounded-3xl glow-brand pointer-events-none" aria-hidden />

          <div className="relative rounded-2xl border border-surface-700/60 bg-surface-900/90 backdrop-blur-sm overflow-hidden shadow-card">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-surface-700/50 bg-surface-950/80 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-rose-500/60" />
              <span className="h-3 w-3 rounded-full bg-amber-500/60" />
              <span className="h-3 w-3 rounded-full bg-accent-500/60" />
              <span className="ml-3 rounded-md bg-surface-800 px-3 h-5 text-[10px] text-slate-500 flex items-center">
                app.cyberguard.io/dashboard
              </span>
              <div className="ml-auto flex gap-1.5">
                <Bell className="h-3.5 w-3.5 text-slate-500" />
                <div className="h-5 w-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-[9px] text-brand-400 font-bold">
                  JD
                </div>
              </div>
            </div>

            <div className="flex h-[500px]">
              <Sidebar />

              {/* Main area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Greeting */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">Good morning, Jordan 👋</h3>
                    <p className="text-xs text-slate-500">Your compliance snapshot for today</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 px-3 py-1 text-xs text-accent-400 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> SOC 2 Active
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Metric label="Compliance Score" value="84%" sub="↑ 3% this week"  color="text-accent-400" />
                  <Metric label="Open Risks"       value="12"  sub="3 critical"      color="text-rose-400" />
                  <Metric label="Assessments"      value="3"   sub="1 in progress"   color="text-brand-400" />
                  <Metric label="Tasks Assigned"   value="7"   sub="2 overdue"       color="text-amber-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Risk register */}
                  <div className="rounded-xl border border-surface-700/50 bg-surface-800/40 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/40">
                      <p className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400" aria-hidden />
                        Risk Register
                      </p>
                      <span className="text-[10px] text-brand-400 cursor-pointer hover:underline">View all</span>
                    </div>
                    <ul className="divide-y divide-surface-700/30">
                      {risks.map((r) => (
                        <li key={r.label} className="flex items-center gap-3 px-4 py-2.5">
                          <span className={`h-2 w-2 rounded-full bg-${r.color}-400 flex-shrink-0`} aria-hidden />
                          <span className="flex-1 text-[11px] text-slate-300 truncate">{r.label}</span>
                          <span className={`text-[10px] font-semibold text-${r.color}-400 flex-shrink-0`}>
                            {r.severity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Department scores */}
                  <div className="rounded-xl border border-surface-700/50 bg-surface-800/40 p-4">
                    <p className="text-xs font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      <Users2 className="h-3.5 w-3.5 text-brand-400" aria-hidden />
                      Department Compliance
                    </p>
                    <div className="space-y-3">
                      {depts.map(({ name, score, color }) => (
                        <div key={name} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">{name}</span>
                            <span className={`font-semibold text-${color}-400`}>{score}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-700">
                            <div
                              className={`h-full rounded-full bg-${color}-500 transition-all`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="rounded-xl border border-surface-700/50 bg-surface-800/40 p-4">
                  <p className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-brand-400" aria-hidden />
                    Top Recommendations
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      "Enforce MFA for all administrator accounts immediately",
                      "Complete annual vendor security review for 4 vendors",
                      "Update data retention policy to meet GDPR Article 5(1)(e)",
                      "Schedule quarterly access rights review with IT",
                    ].map((rec) => (
                      <div
                        key={rec}
                        className="flex gap-2.5 rounded-lg bg-surface-900/50 border border-surface-700/30 p-3"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-brand-400 flex-shrink-0 mt-0.5" aria-hidden />
                        <span className="text-[11px] text-slate-400 leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
