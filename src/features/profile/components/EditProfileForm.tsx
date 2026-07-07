'use client';

import React, { useState, useTransition } from 'react';
import { updateProfileAction } from '../actions/profile';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface EditProfileFormProps {
  userId: string;
  defaultValues: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    phone: string;
  };
}

export default function EditProfileForm({ userId, defaultValues }: EditProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfileAction(userId, formData);
      if (result.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="profile-first-name"
          name="firstName"
          label="First Name"
          defaultValue={defaultValues.firstName}
          placeholder="Jane"
          required
        />
        <FormField
          id="profile-last-name"
          name="lastName"
          label="Last Name"
          defaultValue={defaultValues.lastName}
          placeholder="Doe"
          required
        />
      </div>
      <FormField
        id="profile-job-title"
        name="jobTitle"
        label="Job Title"
        defaultValue={defaultValues.jobTitle}
        placeholder="Head of Security"
        required
      />
      <FormField
        id="profile-phone"
        name="phone"
        label="Phone (optional)"
        defaultValue={defaultValues.phone}
        placeholder="+44 7700 000000"
        type="tel"
      />

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent-400 flex-shrink-0" />
          <p className="text-sm text-accent-400">Profile updated successfully.</p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          id="save-profile-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
}

function FormField({
  id,
  name,
  label,
  defaultValue,
  placeholder,
  type = 'text',
  required,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
      />
    </div>
  );
}
