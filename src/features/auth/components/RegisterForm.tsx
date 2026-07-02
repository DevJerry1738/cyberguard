

import { signUpAction } from '@/features/auth/actions/auth';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterForm() {
  return (
    <form action={signUpAction} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="First Name" name="firstName" placeholder="Jane" required />
        <Input label="Last Name" name="lastName" placeholder="Doe" required />
      </div>
      <Input label="Work Email" name="email" type="email" placeholder="jane@company.com" required />
      <Input label="Password" name="password" type="password" placeholder="********" required />
      <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="********" required />
      <div className="flex items-center space-x-2">
        <Checkbox id="acceptTerms" name="acceptTerms" required />
        <label htmlFor="acceptTerms" className="text-sm text-slate-300">
          I agree to the <a href="#" className="text-brand-400 hover:underline">Terms of Service</a>
        </label>
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full">
        Create Free Account
      </Button>
    </form>
  );
}
