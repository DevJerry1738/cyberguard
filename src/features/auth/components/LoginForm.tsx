'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

type FormErrors = {
  email?: string;
  password?: string;
  rememberMe?: string;
  server?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (Array.isArray(result.errors)) {
          const fieldErrors: FormErrors = {};
          result.errors.forEach((error: { field: string; message: string }) => {
            if (error.field) {
              fieldErrors[error.field as keyof FormErrors] = error.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setServerError(result.message ?? 'Unable to sign in.');
        }
        return;
      }

      router.push('/dashboard');
    } catch (error: any) {
      setServerError(error?.message ?? 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        label="Work Email"
        name="email"
        type="email"
        placeholder="you@company.com"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      {errors.email ? <p className="text-sm text-rose-400">{errors.email}</p> : null}

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••••••"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {errors.password ? <p className="text-sm text-rose-400">{errors.password}</p> : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            name="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
          />
          <label htmlFor="rememberMe" className="text-sm text-slate-300">
            Remember me
          </label>
        </div>
        <Link href="/forgot-password" className="text-sm text-brand-400 hover:underline">
          Forgot password?
        </Link>
      </div>

      {serverError ? <p className="text-sm text-rose-400">{serverError}</p> : null}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
