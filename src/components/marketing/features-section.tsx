import Link from "next/link";
import {
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  ScrollText,
  Users2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    Icon: ClipboardCheck,
    title: "Security Assessments",
    tag: "Core",
    description:
      "Run structured assessments mapped to SOC 2, ISO 27001, NIST CSF, and more. Assign questions to departments, collect evidence, and track completion in real time.",
    benefits: ["Multi-framework support", "Evidence upload", "Auto-scoring"],
    color: "brand",
  },
  {
    Icon: BarChart3,
    title: "Risk Scoring Engine",
    tag: "Intelligence",
    description:
      "Automatically calculate risk severity using a likelihood × impact matrix. Prioritise threats by business impact and track remediation progress over time.",
    benefits: ["Dynamic risk matrix", "Trend tracking", "Executive summaries"],
    color: "accent",
  },
  {
    Icon: ShieldCheck,
    title: "Compliance Tracking",
    tag: "Compliance",
    description:
      "Map your security controls to multiple frameworks simultaneously. Get a real-time compliance score and identify which controls need immediate attention.",
    benefits: ["Gap analysis", "Control mapping", "Readiness dashboards"],
    color: "purple",
  },
  {
    Icon: ScrollText,
    title: "Audit Logs",
    tag: "Governance",
    description:
      "Maintain an immutable, timestamped audit trail of every action across your compliance programme. Built for auditors, regulators, and internal reviews.",
    benefits: ["Tamper-proof records", "Advanced filters", "Exportable logs"],
    color: "amber",
  },
  {
    Icon: Users2,
    title: "Team Management",
    tag: "Organisation",
    description:
      "Invite team members, assign roles with granular permissions, and organise your workforce into departments. Delegate assessment tasks to the right people.",
    benefits: ["RBAC permissions", "Department scoping", "Invitation flows"],
    color: "rose",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  brand:  { bg: "bg-brand-500/10",  border: "border-brand-500/20",  text: "text-brand-400",  badge: "bg-brand-500/10  text-brand-400  border-brand-500/20" },
  accent: { bg: "bg-accent-500/10", border: "border-accent-500/20", text: "text-accent-400", badge: "bg-accent-500/10 text-accent-400 border-accent-500/20" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  badge: "bg-amber-500/10  text-amber-400  border-amber-500/20" },
  rose:   { bg: "bg-rose-500/10",   border: "border-rose-500/20",   text: "text-rose-400",   badge: "bg-rose-500/10   text-rose-400   border-rose-500/20" },
};

export function FeaturesSection() {
  return (
    <section
      className="section-padding bg-surface-950"
      aria-labelledby="features-heading"
    >
      <div className="container-wide">
        {/* Heading */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">Platform Capabilities</p>
          <h2 id="features-heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Everything your security team needs
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            From initial assessment to executive reporting, CyberGuard covers the entire
            compliance and risk management lifecycle.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ Icon, title, tag, description, benefits, color }) => {
            const c = colorMap[color];
            return (
              <article
                key={title}
                className="group flex flex-col rounded-2xl border border-surface-700/60 bg-surface-900/60 p-6 hover:border-surface-600/80 transition-all duration-300 card-hover"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} border ${c.border}`}>
                    <Icon className={`h-6 w-6 ${c.text}`} aria-hidden />
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${c.badge}`}>
                    {tag}
                  </span>
                </div>

                <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">{description}</p>

                <ul className="mb-5 space-y-1.5">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-slate-400">
                      <ShieldCheck className={`h-3.5 w-3.5 flex-shrink-0 ${c.text}`} aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/features"
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${c.text} hover:gap-2.5 transition-all`}
                  aria-label={`Learn more about ${title}`}
                >
                  Learn more <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
