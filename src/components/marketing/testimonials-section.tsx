const testimonials = [
  {
    quote:
      "CyberGuard transformed our SOC 2 preparation from a six-month chaos into a structured, three-month process. The automated scoring and evidence collection saved our team over 200 hours.",
    name: "Sarah Chen",
    title: "Chief Information Security Officer",
    company: "Meridian Health Systems",
    initials: "SC",
    rating: 5,
  },
  {
    quote:
      "As a fintech startup, we needed to demonstrate compliance to enterprise clients fast. CyberGuard gave us a credible security posture — and the reports our prospects actually trust — within weeks of signing up.",
    name: "Marcus Williams",
    title: "Co-founder & CTO",
    company: "Axle Financial Technologies",
    initials: "MW",
    rating: 5,
  },
  {
    quote:
      "Managing ISO 27001 across eight departments used to mean a spreadsheet nightmare. CyberGuard centralised everything — risk register, controls, audit trails — into one place our entire team actually uses.",
    name: "Priya Nair",
    title: "Head of Compliance",
    company: "TechEdge Solutions",
    initials: "PN",
    rating: 5,
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20" aria-hidden>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section
      className="section-padding border-t border-surface-800/60"
      aria-labelledby="testimonials-heading"
    >
      <div className="container-wide">
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-3">Customer Stories</p>
          <h2 id="testimonials-heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-3">
            Trusted by security-conscious teams
          </h2>
          <p className="text-sm text-slate-500 italic">
            The following testimonials are illustrative examples representing typical customer outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ quote, name, title, company, initials, rating }) => (
            <blockquote
              key={name}
              className="group flex flex-col rounded-2xl border border-surface-700/60 bg-surface-900/60 p-7 hover:border-brand-500/25 hover:bg-surface-800/60 transition-all duration-300 card-hover"
            >
              <Stars count={rating} />
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
