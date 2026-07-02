const logos = [
  { name: "Technology",  abbr: "TECH" },
  { name: "Healthcare",  abbr: "HEALTH" },
  { name: "Finance",     abbr: "FIN" },
  { name: "Education",   abbr: "EDU" },
  { name: "Government",  abbr: "GOV" },
  { name: "Retail",      abbr: "RETL" },
];

export function TrustedBySection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-surface-800/60" aria-label="Trusted by industries">
      <div className="container-wide">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-600 mb-10">
          Trusted across industries
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {logos.map(({ name, abbr }) => (
            <div
              key={name}
              className="flex items-center gap-2.5 grayscale opacity-40 hover:opacity-70 hover:grayscale-0 transition-all duration-300"
              aria-label={name}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-700 text-[9px] font-bold text-slate-400">
                {abbr.slice(0, 2)}
              </div>
              <span className="font-display text-sm font-semibold text-slate-400 tracking-wide hidden sm:block">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
