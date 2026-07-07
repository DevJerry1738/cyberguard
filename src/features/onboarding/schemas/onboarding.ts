import { z } from 'zod';

export const Step2Schema = z.object({
  organizationName: z.string().min(2, { message: 'Organization name must be at least 2 characters' }),
  industry: z.string().min(1, { message: 'Please select an industry' }),
  companySize: z.string().min(1, { message: 'Please select a company size' }),
  country: z.string().min(1, { message: 'Please select a country' }),
  timezone: z.string().min(1, { message: 'Please select a timezone' }),
});

export const Step3Schema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  jobTitle: z.string().min(1, { message: 'Job title is required' }),
  phone: z.string().optional(),
});

export const OnboardingSchema = Step2Schema.merge(Step3Schema);

export type Step2Input = z.infer<typeof Step2Schema>;
export type Step3Input = z.infer<typeof Step3Schema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;
