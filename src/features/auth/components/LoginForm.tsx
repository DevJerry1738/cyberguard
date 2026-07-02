import { signInAction } from '@/features/auth/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export default function LoginForm() {
  return (
    <form action={signInAction} className="space-y-5" noValidate>
      <Input label="Work Email" name="email" type="email" placeholder="you@company.com" required />
      <Input label="Password" name="password" type="password" placeholder="••••••••••••" required />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox name="rememberMe" />
          <label htmlFor="rememberMe" className="text-sm text-slate-300">Remember me</label>
        </div>
        <Link href="/forgot-password" className="text-sm text-brand-400 hover:underline">Forgot password?</Link>
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full">Sign In</Button>
    </form>
  );
}
