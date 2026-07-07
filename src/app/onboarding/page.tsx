import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingWizard from '@/features/onboarding/components/OnboardingWizard';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Complete your CyberGuard organization and profile setup.',
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if onboarding is already complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_complete) {
    redirect('/dashboard');
  }

  // Prepopulate from user metadata if available
  const defaultFirstName = user.user_metadata?.first_name || '';
  const defaultLastName = user.user_metadata?.last_name || '';

  return (
    <div className="relative min-h-screen bg-surface-950 flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid pointer-events-none opacity-30" />

      {/* Header Logo */}
      <div className="relative z-10 flex items-center gap-2.5 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-glow-sm">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="font-display text-2xl font-bold text-white">
          Cyber<span className="text-brand-400">Guard</span>
        </span>
      </div>

      {/* Wizard Card Container */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-surface-800/80 bg-surface-900/90 p-8 shadow-card backdrop-blur-md transition-all duration-300">
        <OnboardingWizard
          defaultFirstName={defaultFirstName}
          defaultLastName={defaultLastName}
        />
      </div>
    </div>
  );
}
