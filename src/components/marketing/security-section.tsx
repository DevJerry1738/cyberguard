import { Lock, ShieldCheck, FileKey2, UserCheck, ServerCrash, Eye } from "lucide-react";

const pillars = [
  {
    Icon: Lock,
    title: "Protected connections",
    description:
      "CyberGuard uses Supabase services for authentication and data access. Confirm the hosting environment's encryption and data-residency details with the project team.",
  },
  {
    Icon: UserCheck,
    title: "Role-Based Access Control",
    description:
      "The application defines organization roles and uses database policies. Complete policy coverage and role boundaries must be verified before relying on them for a specific workflow.",
  },
  {
    Icon: Eye,
    title: "Activity records",
    description:
      "Selected organization and assessment actions create audit-log records. Append-only enforcement and a full audit review/export experience are not yet verified.",
  },
  {
    Icon: FileKey2,
    title: "Authentication",
    description:
      "Authentication is provided through Supabase Auth. Mandatory multi-factor authentication for administrative roles is planned and not currently evidenced as enforced.",
  },
  {
    Icon: ShieldCheck,
    title: "Security review in progress",
    description:
      "Security architecture and row-level security guidance are documented. No CyberGuard certification or compliance attestation is claimed by this page.",
  },
  {
    Icon: ServerCrash,
    title: "Request-level access checks",
    description:
      "Protected application routes and server actions use authentication and authorization checks. Coverage is being validated across routes and database policies.",
  },
];

export function SecuritySection() {
  return (
    <section
      className="section-padding relative overflow-hidden border-t border-surface-800/60"
      aria-labelledby="security-heading"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-cta-gradient pointer-events-none" aria-hidden />

      <div className="container-wide relative z-10">
        {/* Heading */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-400 mb-3">Security First</p>
          <h2 id="security-heading" className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Security built into the design{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-brand-400">
              ground up
            </span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Security requirements are part of the product design. Controls, environment configuration, and compliance claims must be verified before production use.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-accent-500/10 bg-surface-900/50 p-6 hover:border-accent-500/25 hover:bg-surface-800/60 transition-all duration-300"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 border border-accent-500/20 mb-5">
                <Icon className="h-5 w-5 text-accent-400" aria-hidden />
              </div>
              <h3 className="font-display text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Certifications bar */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          {["Supabase Auth", "Postgres RLS", "Role-aware application", "Security review ongoing"].map((cert) => (
            <span
              key={cert}
              className="flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/5 px-4 py-2 text-xs font-semibold text-accent-400"
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {cert}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
