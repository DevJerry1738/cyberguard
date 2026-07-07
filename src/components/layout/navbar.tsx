"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

const navLinks = [
  { label: "Features",  href: "/features" },
  { label: "Pricing",   href: "/pricing" },
  { label: "About",     href: "/about" },
  { label: "Contact",   href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Hide navbar on app/auth/onboarding routes
  const hideNavbar =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/departments") ||
    pathname.startsWith("/members") ||
    pathname.startsWith("/organization") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/assessments") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/invitations") ||
    pathname.startsWith("/accept-invite") ||
    pathname.startsWith("/verify-success");

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (hideNavbar) {
    return null;
  }

  return (
    <header
      role="banner"
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface-950/90 backdrop-blur-xl border-b border-surface-800/70 shadow-card"
          : "bg-transparent"
      )}
    >
      <nav
        className="container-wide flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
          aria-label="CyberGuard — Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 shadow-glow-sm">
            <Shield className="h-4.5 w-4.5 text-white" strokeWidth={2.5} aria-hidden />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">
            Cyber<span className="text-brand-400">Guard</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-surface-800 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden border-t border-surface-800 bg-surface-950/95 backdrop-blur-xl overflow-hidden transition-all duration-300",
          open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!open}
      >
        <ul className="flex flex-col px-4 py-4 gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-surface-800 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 px-4 pb-6 pt-2">
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button variant="secondary" size="md" className="w-full">Sign In</Button>
          </Link>
          <Link href="/register" onClick={() => setOpen(false)}>
            <Button variant="primary" size="md" className="w-full">Get Started Free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
