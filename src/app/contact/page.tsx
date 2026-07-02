"use client";

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";

/* Note: Metadata export won't work in a "use client" file.
   Move metadata to a server wrapper if needed. Using client here for the form. */

const contactOptions = [
  { Icon: Mail,          label: "Email Us",       detail: "hello@cyberguard.io",       sub: "We reply within one business day" },
  { Icon: MessageSquare, label: "Sales Enquiry",  detail: "sales@cyberguard.io",        sub: "For demos and pricing questions" },
  { Icon: MapPin,        label: "Registered Office", detail: "London, United Kingdom", sub: "Remote-first, globally accessible" },
];

const roleOptions = ["CISO / Security Officer", "IT Manager", "Compliance Manager", "Startup Founder", "Developer", "Other"];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-labelledby="contact-heading">
        <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-64 bg-hero-gradient pointer-events-none" aria-hidden />
        <div className="container-wide relative z-10 max-w-2xl">
          <Badge variant="brand" className="mb-6">Get In Touch</Badge>
          <h1 id="contact-heading" className="font-display text-5xl font-bold text-white mb-4">
            Let&rsquo;s talk about your security programme
          </h1>
          <p className="text-lg text-slate-400">
            Whether you have a question about features, pricing, compliance frameworks, or
            want to see a personalised demo — our team is ready to help.
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24" aria-label="Contact options and form">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact options */}
          <div className="lg:col-span-2 space-y-5">
            {contactOptions.map(({ Icon, label, detail, sub }) => (
              <div key={label} className="flex gap-4 rounded-2xl border border-surface-700/60 bg-surface-900/60 p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <Icon className="h-4.5 w-4.5 text-brand-400" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-sm text-brand-400">{detail}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            {/* FAQ pointer */}
            <div className="rounded-2xl border border-surface-700/60 bg-surface-900/40 p-5">
              <p className="text-sm font-semibold text-white mb-1">Looking for quick answers?</p>
              <p className="text-sm text-slate-400 mb-3">
                Our FAQ covers common questions about features, security, and pricing.
              </p>
              <Link href="/#faq" className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:underline">
                Browse FAQ <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-surface-700/60 bg-surface-900/60 p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-500/10 border border-accent-500/20">
                    <Mail className="h-7 w-7 text-accent-400" aria-hidden />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white">Message received!</h2>
                  <p className="text-slate-400 max-w-sm">
                    Thanks for reaching out. A member of our team will be in touch within one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
                  <h2 className="font-display text-2xl font-bold text-white mb-6">Send us a message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <Input label="First Name" placeholder="Jane" required />
                    <Input label="Last Name"  placeholder="Smith" required />
                  </div>
                  <div className="space-y-5 mb-5">
                    <Input label="Work Email"  type="email" placeholder="jane@company.com" required />
                    <Input label="Company"     placeholder="Acme Corp" />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="role" className="text-sm font-medium text-slate-300">Your Role</label>
                      <select
                        id="role"
                        className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-white focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      >
                        <option value="" className="bg-surface-900">Select your role…</option>
                        {roleOptions.map((r) => (
                          <option key={r} value={r} className="bg-surface-900">{r}</option>
                        ))}
                      </select>
                    </div>
                    <Textarea label="Message" placeholder="Tell us about your security programme or what questions you have…" rows={5} required />
                  </div>
                  <Button type="submit" variant="primary" size="lg" className="w-full gap-2">
                    Send Message <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                  <p className="mt-4 text-center text-xs text-slate-500">
                    By submitting, you agree to our{" "}
                    <Link href="#" className="text-brand-400 hover:underline">Privacy Policy</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
