const testimonials = [
  {
    quote:
      "An organization could use assessment templates and draft saving to structure its compliance work. Evidence collection and automated scoring are planned capabilities.",
    name: "Illustrative example",
    title: "Potential assessment workflow",
    company: "Not a customer testimonial",
    initials: "EX",
  },
  {
    quote:
      "A team can invite collaborators, manage organization roles, and work through assessment sessions in one workspace. Report generation is planned.",
    name: "Illustrative example",
    title: "Potential team workflow",
    company: "Not a customer testimonial",
    initials: "EX",
  },
  {
    quote:
      "Security domains, template questions, and session progress provide a starting point for organizing assessment work. Risk registers and compliance reports are planned.",
    name: "Illustrative example",
    title: "Potential organization workflow",
    company: "Not a customer testimonial",
    initials: "EX",
  },
];

export function TestimonialsSection() {
  return (
    <section
      className="section-padding border-t border-surface-800/60"
      aria-labelledby="testimonials-heading"
    >
      <div className="container-wide">
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">Illustrative Scenarios</p>
          <h2 id="testimonials-heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">
            Example assessment workflows
          </h2>
          <p className="text-sm text-slate-500 italic">
            These are product scenarios, not customer testimonials or verified outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, title, company, initials }) => (
            <blockquote
              key={name}
              className="group flex flex-col rounded-2xl border border-surface-700/60 bg-surface-900/60 p-7 hover:border-brand-500/25 hover:bg-surface-800/60 transition-all duration-300 card-hover"
            >
              <p className="mt-5 mb-6 text-sm text-slate-300 leading-relaxed flex-1">
                &ldquo;{quote}&rdquo;
              </p>
              <footer className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/20 border border-brand-500/30 font-display text-sm font-bold text-brand-400">
                  {initials}
                </div>
                <div>
                  <cite className="text-sm font-semibold text-white not-italic">{name}</cite>
                  <p className="text-xs text-slate-500">{title}, {company}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
