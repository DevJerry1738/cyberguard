"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormRegister } from "react-hook-form";
import { Building2, User, Rocket, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Step2Schema, Step3Schema, type Step2Input, type Step3Input } from "@/features/onboarding/schemas/onboarding";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────
interface WizardData {
  step2: Partial<Step2Input>;
  step3: Partial<Step3Input>;
}

const STORAGE_KEY = "cyberguard_onboarding";

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Healthcare", "Legal", "Manufacturing",
  "Retail & E-Commerce", "Education", "Government", "Energy & Utilities", "Other",
];

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Singapore", "Nigeria", "South Africa", "Other",
];

const TIMEZONES = [
  "UTC", "Europe/London", "Europe/Paris", "America/New_York",
  "America/Chicago", "America/Los_Angeles", "Africa/Lagos",
  "Asia/Singapore", "Australia/Sydney",
];

// ─── Step indicator ───────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              i < current ? "bg-brand-500 w-6" : i === current ? "bg-brand-400 w-8" : "bg-surface-700 w-6"
            }`}
          />
        </React.Fragment>
      ))}
      <span className="ml-2 text-xs text-slate-500">Step {current + 1} of {total}</span>
    </div>
  );
}

// ─── Select field ─────────────────────────────────────────
function SelectField({
  label,
  name,
  options,
  register,
  error,
}: {
  label: string;
  name: any;
  options: string[];
  register: UseFormRegister<any>;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <select
        {...register(name)}
        className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-white focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
      >
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

// ─── Step 1: Welcome ────────────────────────────────────
interface Step1Props {
  onNext: () => void;
}
function Step1({ onNext }: Step1Props) {
  return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10 border border-brand-500/20 shadow-glow-sm">
          <Rocket className="h-10 w-10 text-brand-400" />
        </div>
      </div>
      <h2 className="font-display text-3xl font-bold text-white mb-3">Let's set up your workspace</h2>
      <p className="text-slate-400 mb-8 leading-relaxed max-w-sm mx-auto">
        This takes about 2 minutes. We'll create your organization, configure your profile, and initialize your compliance workspace.
      </p>
      <ul className="text-left space-y-3 max-w-xs mx-auto mb-8">
        {[
          "Organization details",
          "Owner profile",
          "Workspace initialization",
        ].map((item, i) => (
          <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex-shrink-0">
              {i + 1}
            </div>
            {item}
          </li>
        ))}
      </ul>
      <Button
        variant="primary"
        size="lg"
        className="w-full max-w-xs mx-auto"
        onClick={onNext}
      >
        Get started <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// ─── Step 2: Organization Details ───────────────────────
interface Step2FormProps {
  defaultValues: Partial<Step2Input>;
  onBack: () => void;
  onNext: (data: Step2Input) => void;
}
function Step2Form({ defaultValues, onBack, onNext }: Step2FormProps) {
  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<Step2Input>({
    defaultValues: defaultValues as any
  });

  function onSubmit(values: Step2Input) {
    clearErrors();
    const result = Step2Schema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach(i => setError(i.path[0] as keyof Step2Input, { message: i.message }));
      return;
    }
    onNext(result.data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <h2 className="font-display text-2xl font-bold text-white mb-1">Organization details</h2>
        <p className="text-slate-400 text-sm mb-6">Tell us about your company.</p>
      </div>
      <Input
        label="Organization Name"
        {...register("organizationName")}
        defaultValue={defaultValues.organizationName}
        placeholder="Acme Corp"
        error={errors.organizationName?.message}
      />
      <SelectField label="Industry" name="industry" options={INDUSTRIES} register={register} error={errors.industry?.message} />
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Company Size" name="companySize" options={COMPANY_SIZES} register={register} error={errors.companySize?.message} />
        <SelectField label="Country" name="country" options={COUNTRIES} register={register} error={errors.country?.message} />
      </div>
      <SelectField label="Timezone" name="timezone" options={TIMEZONES} register={register} error={errors.timezone?.message} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </form>
  );
}

// ─── Step 3: Your Profile ───────────────────────────────
interface Step3FormProps {
  defaultValues: Partial<Step3Input>;
  defaultFirstName?: string;
  defaultLastName?: string;
  onBack: () => void;
  onNext: (data: Step3Input) => void;
}
function Step3Form({ defaultValues, defaultFirstName, defaultLastName, onBack, onNext }: Step3FormProps) {
  const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm<Step3Input>({
    defaultValues: {
      firstName: defaultValues.firstName || defaultFirstName,
      lastName: defaultValues.lastName || defaultLastName,
      jobTitle: defaultValues.jobTitle,
      phone: defaultValues.phone,
    } as any
  });

  function onSubmit(values: Step3Input) {
    clearErrors();
    const result = Step3Schema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach(i => setError(i.path[0] as keyof Step3Input, { message: i.message }));
      return;
    }
    onNext(result.data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <h2 className="font-display text-2xl font-bold text-white mb-1">Your profile</h2>
        <p className="text-slate-400 text-sm mb-6">This will be your owner profile.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          {...register("firstName")}
          defaultValue={defaultValues.firstName || defaultFirstName}
          placeholder="Jane"
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          {...register("lastName")}
          defaultValue={defaultValues.lastName || defaultLastName}
          placeholder="Doe"
          error={errors.lastName?.message}
        />
      </div>
      <Input
        label="Job Title"
        {...register("jobTitle")}
        defaultValue={defaultValues.jobTitle}
        placeholder="Head of Security"
        error={errors.jobTitle?.message}
      />
      <Input
        label="Phone (optional)"
        {...register("phone")}
        defaultValue={defaultValues.phone}
        type="tel"
        placeholder="+44 7700 000000"
      />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Continue <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </form>
  );
}

// ─── Step 4: Workspace Initialization ───────────────────
interface Step4InitProps {
  wizardData: WizardData;
  onComplete: () => void;
  onBackToProfile: () => void;
}
function Step4Init({ wizardData, onComplete, onBackToProfile }: Step4InitProps) {
  const router = useRouter();
  const [progress, setProgress] = React.useState(0);
  const [initError, setInitError] = React.useState<string | null>(null);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (started) return;
    setStarted(true);

    const run = async () => {
      const steps = [
        "Creating organization…",
        "Initializing your profile…",
        "Assigning Owner role…",
        "Configuring workspace settings…",
        "Writing audit log…",
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setProgress(Math.round(((i + 1) / steps.length) * 80));
      }

      const body = {
        ...wizardData.step2,
        ...wizardData.step3,
      };

      try {
        const res = await fetch("/api/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          if (res.status === 409) {
            // Already complete — skip to dashboard
            onComplete();
            return;
          }
          setInitError(json.message ?? "Setup failed. Please try again.");
          return;
        }

        setProgress(100);
        await new Promise(r => setTimeout(r, 400));
        onComplete();
      } catch (err) {
        setInitError("Network or server connection failed. Please try again.");
      }
    };

    run();
  }, [started, wizardData, onComplete]);

  return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10 border border-brand-500/20">
          <Loader2 className="h-10 w-10 text-brand-400 animate-spin" />
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold text-white mb-2">Initializing your workspace</h2>
      <p className="text-slate-400 text-sm mb-8">This only takes a moment…</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mx-auto bg-surface-800 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="h-2 bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{progress}% complete</p>

      {initError && (
        <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <p className="text-sm text-rose-400">{initError}</p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={onBackToProfile}
          >
            Go back and retry
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Step 5: Success ────────────────────────────────────
interface Step5SuccessProps {
  onGoToDashboard: () => void;
}
function Step5Success({ onGoToDashboard }: Step5SuccessProps) {
  return (
    <div className="text-center py-4">
      <div className="flex justify-center mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-500/10 border border-accent-500/30">
          <CheckCircle2 className="h-10 w-10 text-accent-400" />
        </div>
      </div>
      <h2 className="font-display text-3xl font-bold text-white mb-3">
        Your CyberGuard workspace is ready.
      </h2>
      <p className="text-slate-400 mb-8 leading-relaxed">
        Your organization has been created and your profile is all set. Welcome aboard!
      </p>
      <Button
        variant="primary"
        size="lg"
        className="w-full max-w-xs mx-auto"
        onClick={onGoToDashboard}
      >
        Go to Dashboard <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────
export default function OnboardingWizard({
  defaultFirstName,
  defaultLastName,
}: {
  defaultFirstName?: string;
  defaultLastName?: string;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(0);
  const [wizardData, setWizardData] = React.useState<WizardData>({ step2: {}, step3: {} });

  // Restore from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { step: number; data: WizardData };
        setStep(parsed.step ?? 0);
        setWizardData(parsed.data ?? { step2: {}, step3: {} });
      }
    } catch {}
  }, []);

  // Persist to localStorage
  const persist = React.useCallback((s: number, d: WizardData) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: s, data: d })); } catch {}
  }, []);

  const handleStep1Next = () => {
    const nextStep = 1;
    setStep(nextStep);
    persist(nextStep, wizardData);
  };

  const handleStep2Next = (data: Step2Input) => {
    const nextStep = 2;
    const updated = { ...wizardData, step2: data };
    setWizardData(updated);
    setStep(nextStep);
    persist(nextStep, updated);
  };

  const handleStep3Next = (data: Step3Input) => {
    const nextStep = 3;
    const updated = { ...wizardData, step3: data };
    setWizardData(updated);
    setStep(nextStep);
    persist(nextStep, updated);
  };

  const handleComplete = () => {
    const nextStep = 4;
    localStorage.removeItem(STORAGE_KEY);
    setStep(nextStep);
    persist(nextStep, wizardData);
  };

  const TOTAL = 5;

  return (
    <div className="w-full max-w-lg">
      {step < TOTAL - 1 && step !== 3 && (
        <StepIndicator current={step} total={TOTAL} />
      )}
      <div className="animate-fade-in">
        {step === 0 && <Step1 onNext={handleStep1Next} />}
        {step === 1 && (
          <Step2Form
            defaultValues={wizardData.step2}
            onBack={() => { setStep(0); persist(0, wizardData); }}
            onNext={handleStep2Next}
          />
        )}
        {step === 2 && (
          <Step3Form
            defaultValues={wizardData.step3}
            defaultFirstName={defaultFirstName}
            defaultLastName={defaultLastName}
            onBack={() => { setStep(1); persist(1, wizardData); }}
            onNext={handleStep3Next}
          />
        )}
        {step === 3 && (
          <Step4Init
            wizardData={wizardData}
            onComplete={handleComplete}
            onBackToProfile={() => { setStep(2); persist(2, wizardData); }}
          />
        )}
        {step === 4 && (
          <Step5Success
            onGoToDashboard={() => {
              // Ensure we do a hard push or reset to update the main page layout / navbar correctly
              router.push("/dashboard");
              router.refresh();
            }}
          />
        )}
      </div>
    </div>
  );
}
