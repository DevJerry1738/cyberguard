const steps = [
  {
    number: "01",
    title: "Register Your Organisation",
    description:
      "Create your CyberGuard workspace, configure your organisation profile, and invite your security and compliance team members in minutes.",
    detail: "Supports SSO, MFA, and role-based permissions from day one.",
  },
  {
    number: "02",
    title: "Complete Your First Assessment",
    description:
      "Select a compliance framework — SOC 2, ISO 27001, or NIST CSF — and work through a structured questionnaire designed for your industry.",
    detail: "Evidence uploads, department delegation, and auto-save built in.",
  },
  {
    number: "03",
    title: "Identify & Prioritise Risks",
    description:
      "CyberGuard automatically calculates risk scores from your assessment responses and surfaces the highest-impact gaps first.",
    detail: "Dynamic risk matrix with likelihood × impact scoring.",
  },
  {
    number: "04",
    title: "Act on Recommendations",
    description:
      "Receive prioritised, actionable recommendations tied to specific controls. Track remediation progress and assign tasks to owners.",
    detail: "Customisable remediation workflows with due dates.",
  },
  {
    number: "05",
    title: "Monitor & Report Progress",
    description:
      "Track your compliance score over time and generate polished, audit-ready reports for your board, clients, or certification bodies.",
    detail: "One-click PDF exports and scheduled reporting.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      className="section-padding border-t border-surface-800/60"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container-wide">
        {/* Heading */}
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">Getting Started</p>
          <h2 id="how-it-works-heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            From zero to compliant in days
          </h2>
          <p className="text-lg text-slate-400">
            CyberGuard's guided workflow takes your team from first login to audit-ready
            in a structured, repeatable process.
          </p>
        </div>

        {/* Steps timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div
            className="absolute left-[28px] top-0 bottom-0 w-px bg-gradient-to-b from-brand-500/60 via-brand-500/20 to-transparent hidden sm:block"
            aria-hidden
          />

          <ol className="space-y-12" role="list">
            {steps.map(({ number, title, description, detail }, i) => (
              <li key={number} className="relative flex gap-6 sm:gap-8">
                {/* Number circle */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-500/40 bg-surface-900 shadow-glow-sm">
                    <span className="font-display text-sm font-bold text-brand-400">{number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-3 pb-2">
                  <h3 className="font-display text-xl font-semibold text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-2">{description}</p>
                  <p className="text-xs text-slate-500 italic">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
