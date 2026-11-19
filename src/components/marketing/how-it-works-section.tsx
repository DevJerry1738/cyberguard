const steps = [
  {
    number: "01",
    title: "Create an account and workspace",
    description:
      "Create your CyberGuard workspace, configure your organisation profile, and invite your security and compliance team members in minutes.",
    detail: "Email authentication, organization onboarding, and role management are implemented; verify provider settings for your environment.",
  },
  {
    number: "02",
    title: "Complete Your First Assessment",
    description:
      "Create an assessment template and organize questions into security domains, then start and assign an assessment session.",
    detail: "Draft saving, resume, and completion progress are implemented. Evidence uploads are not yet available.",
  },
  {
    number: "03",
    title: "Review assessment progress",
    description:
      "Use the assessment workspace to review saved responses and follow the session through review and submission.",
    detail: "Risk scoring and automated gap prioritization are roadmap items.",
  },
  {
    number: "04",
    title: "Review activity",
    description:
      "Organization and assessment actions can be recorded in the activity history available to the application.",
    detail: "A dedicated audit search/export experience is planned.",
  },
  {
    number: "05",
    title: "Explore upcoming capabilities",
    description:
      "Risk registry, calculated compliance analytics, and downloadable reports are planned for future releases.",
    detail: "These capabilities are not currently available in the application.",
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
            A clearer workflow for security assessments
          </h2>
          <p className="text-lg text-slate-400">
            Current functionality focuses on organization setup and the assessment lifecycle. Reporting and risk management remain on the roadmap.
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
