'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  phone: z.string().optional(),
});

export async function updateProfileAction(userId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    jobTitle: formData.get('jobTitle') as string,
    phone: formData.get('phone') as string,
  };

  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' };
  }

  const { firstName, lastName, jobTitle, phone } = parsed.data;

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      job_title: jobTitle,
      phone: phone || null,
    })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
