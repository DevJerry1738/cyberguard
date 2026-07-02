import Link from "next/link";
import { Shield, Twitter, Github, Linkedin } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features",    href: "/features" },
    { label: "Pricing",     href: "/pricing" },
    { label: "Changelog",   href: "#" },
    { label: "Roadmap",     href: "#" },
  ],
  Company: [
    { label: "About",       href: "/about" },
    { label: "Blog",        href: "#" },
    { label: "Careers",     href: "#" },
    { label: "Contact",     href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference",  href: "#" },
    { label: "Security Guide", href: "#" },
    { label: "Status",         href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy",  href: "#" },
    { label: "Security",       href: "#" },
  ],
};

const socials = [
  { label: "Twitter / X",  href: "#", Icon: Twitter },
  { label: "GitHub",       href: "#", Icon: Github },
  { label: "LinkedIn",     href: "#", Icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="border-t border-surface-800/60 bg-surface-950" role="contentinfo">
      {/* Main footer grid */}
      <div className="container-wide px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit" aria-label="CyberGuard Home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
                <Shield className="h-4 w-4 text-white" aria-hidden />
              </div>
              <span className="font-display text-lg font-bold text-white">
                Cyber<span className="text-brand-400">Guard</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Enterprise-grade cybersecurity compliance and risk assessment platform
              helping organizations build and maintain a stronger security posture.
            </p>
            {/* Social links */}
            <div className="mt-6 flex gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-700 text-slate-400 transition-all hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-400"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                {category}
              </h3>
              <ul className="space-y-2.5" role="list">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface-800/60">
        <div className="container-wide flex flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CyberGuard, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse-slow" aria-hidden />
            <span className="text-xs text-slate-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
