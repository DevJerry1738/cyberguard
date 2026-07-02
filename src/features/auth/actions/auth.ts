'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@/features/auth/schemas/auth';
import { redirect } from 'next/navigation';

export async function signUpAction(formData: FormData): Promise<void> {
  const data = {
    firstName: formData.get('firstName')?.toString() ?? '',
    lastName: formData.get('lastName')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? '',
    confirmPassword: formData.get('confirmPassword')?.toString() ?? '',
    acceptTerms: Boolean(formData.get('acceptTerms')),
  };

  const parseResult = RegisterSchema.safeParse(data);
  if (!parseResult.success) {
    // Validation failed – could set error handling in UI
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parseResult.data.email,
    password: parseResult.data.password,
    options: {
      data: {
        first_name: parseResult.data.firstName,
        last_name: parseResult.data.lastName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email`,
    },
  });

  if (error) {
    // Could surface error via UI
    return;
  }

  redirect('/verify-email');
}

export async function signInAction(formData: FormData): Promise<void> {
  const data = {
    email: formData.get('email')?.toString() ?? '',
    password: formData.get('password')?.toString() ?? '',
    rememberMe: Boolean(formData.get('rememberMe')),
  };

  const parseResult = LoginSchema.safeParse(data);
  if (!parseResult.success) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parseResult.data.email,
    password: parseResult.data.password,
  });

  if (error) {
    return;
  }

  redirect('/dashboard');
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function forgotPasswordAction(formData: FormData): Promise<void> {
  const data = { email: formData.get('email')?.toString() ?? '' };
  const parseResult = ForgotPasswordSchema.safeParse(data);
  if (!parseResult.success) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parseResult.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });
  if (error) {
    return;
  }
  // Success could be handled in UI
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
  const data = {
    password: formData.get('password')?.toString() ?? '',
    confirmPassword: formData.get('confirmPassword')?.toString() ?? '',
    token: formData.get('token')?.toString() ?? '',
  };
  const parseResult = ResetPasswordSchema.safeParse(data);
  if (!parseResult.success) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parseResult.data.password });
  if (error) {
    return;
  }

  redirect('/login');
}
