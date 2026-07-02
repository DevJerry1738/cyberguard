import {
  TableProperties,
  EyeOff,
  PieChart,
  GitBranch,
  LayoutDashboard,
} from "lucide-react";

const painPoints = [
  {
    Icon: TableProperties,
    title: "Manual Compliance Tracking",
    description:
      "Teams waste hundreds of hours annually copying evidence into spreadsheets. CyberGuard automates evidence collection and maps controls to frameworks automatically.",
  },
  {
    Icon: EyeOff,
    title: "Unknown Security Gaps",
    description:
      "Without structured assessments, critical vulnerabilities go unnoticed for months. Our assessment engine surfaces gaps before auditors — or attackers — do.",
  },
  {
    Icon: PieChart,
    title: "Poor Risk Visibility",
    description:
      "Disconnected tools produce conflicting data. CyberGuard consolidates risk signals into a single score, so leadership always knows where they stand.",
  },
  {
    Icon: GitBranch,
    title: "Fragmented Reporting",
    description:
      "Preparing board-level compliance reports requires stitching together data from dozens of sources. CyberGuard generates audit-ready reports in minutes.",
  },
  {
    Icon: LayoutDashboard,
    title: "No Centralized Command Centre",
    description:
      "Security professionals switch between five tools to get a complete picture. CyberGuard is the single pane of glass for your entire security programme.",
  },
];

export function WhyCyberGuardSection() {
  return (
    <section
      className="section-padding"
      aria-labelledby="why-heading"
    >
      <div className="container-wide">
        {/* Heading */}
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">The Problem</p>
          <h2 id="why-heading" className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Security compliance is broken.{" "}
            <span className="text-gradient">We fixed it.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Most organizations manage cybersecurity with outdated spreadsheets, siloed
            tools, and reactive processes — leaving them exposed to risks they don't
            even know exist.
          </p>
        </div>

        {/* Pain point cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {painPoints.map(({ Icon, title, description }, i) => (
            <div
              key={title}
              className="group rounded-2xl border border-surface-700/60 bg-surface-900/60 p-6 hover:border-brand-500/30 hover:bg-surface-800/60 transition-all duration-300 card-hover"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 mb-5 group-hover:bg-brand-500/20 transition-colors">
                <Icon className="h-5 w-5 text-brand-400" aria-hidden />
              </div>
              <h3 className="font-display text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
