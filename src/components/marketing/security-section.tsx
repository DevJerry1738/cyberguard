import { Lock, ShieldCheck, FileKey2, UserCheck, ServerCrash, Eye } from "lucide-react";

const pillars = [
  {
    Icon: Lock,
    title: "End-to-End Encryption",
    description:
      "All data is encrypted in transit with TLS 1.3 and at rest using AES-256. Your compliance data never leaves our secured infrastructure unencrypted.",
  },
  {
    Icon: UserCheck,
    title: "Role-Based Access Control",
    description:
      "Granular RBAC ensures team members only access the data they're authorised to see. Permissions cascade by role, department, and organisation scope.",
  },
  {
    Icon: Eye,
    title: "Immutable Audit Trails",
    description:
      "Every action in CyberGuard is logged in a tamper-proof audit log. Prove accountability to regulators, auditors, and internal stakeholders.",
  },
  {
    Icon: FileKey2,
    title: "Secure Authentication",
    description:
      "Multi-factor authentication, secure session management, and automatic token rotation protect every user account on the platform.",
  },
  {
    Icon: ShieldCheck,
    title: "Compliance-Ready Architecture",
    description:
      "Our infrastructure is designed around SOC 2 Type II, ISO 27001, and GDPR principles, so your security posture starts strong on day one.",
  },
  {
    Icon: ServerCrash,
    title: "Zero Trust Principles",
    description:
      "Access is never assumed, always verified. Every request is authenticated and authorised against up-to-date policies, regardless of network origin.",
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
            Built secure from the{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-brand-400">
              ground up
            </span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            We hold ourselves to the same standards we help you achieve.
            CyberGuard's infrastructure, codebase, and processes are built with security as the
            foundation — not an afterthought.
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
          {["SOC 2 Type II", "ISO 27001", "GDPR Compliant", "NIST CSF", "HIPAA Ready"].map((cert) => (
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
