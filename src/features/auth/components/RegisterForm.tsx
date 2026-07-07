

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@/features/auth/schemas/auth";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegisterInput>();

  async function onSubmit(values: RegisterInput) {
    // Reset any previous errors
    setServerError(null);
    clearErrors();
    setLoading(true);

    // Manual client-side validation
    const result = RegisterSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterInput;
        setError(field, { type: "manual", message: issue.message });
      });
      setLoading(false);
      return;
    }

    // ----- Server request -----
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        // Server‑side validation errors (if any)
        if (json.errors && Array.isArray(json.errors)) {
          for (const e of json.errors) {
            if (e.field) {
              setError(e.field as any, { type: 'server', message: e.message });
            } else {
              setServerError(e.message);
            }
          }
        } else if (json.message) {
          setServerError(json.message);
        } else {
          setServerError('Registration failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      // success – redirect to verification page
      router.push('/verify-email');
    } catch (err) {
      setServerError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="First Name" {...register('firstName')} placeholder="Jane" error={errors.firstName?.message} />
        <Input label="Last Name" {...register('lastName')} placeholder="Doe" error={errors.lastName?.message} />
      </div>
      <Input label="Work Email" {...register('email')} type="email" placeholder="jane@company.com" error={errors.email?.message} />
      <Input label="Password" {...register('password')} type="password" placeholder="********" error={errors.password?.message} />
      <Input label="Confirm Password" {...register('confirmPassword')} type="password" placeholder="********" error={errors.confirmPassword?.message} />
      
      <Checkbox id="acceptTerms" {...register('acceptTerms')} label="I agree to the Terms of Service" />
      {errors.acceptTerms && (<p className="text-xs text-rose-400">{errors.acceptTerms.message}</p>)}

      {serverError && <p className="text-xs text-rose-400">{serverError}</p>}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Free Account'}
      </Button>
    </form>
  );
}
