import { z } from 'zod';

export const AssessmentSessionStatusSchema = z.enum([
  'Draft',
  'In Progress',
  'Completed',
  'Cancelled',
  'Archived',
]);

export const AssessmentSessionSchema = z.object({
  template_id: z.string().uuid({ message: 'Template is required' }),
  template_name: z.string().trim().min(1, { message: 'Template name is required' }).max(255),
  template_version: z.string().trim().min(1, { message: 'Template version is required' }).max(64),
  template_framework: z
    .string()
    .trim()
    .min(1, { message: 'Template framework is required' })
    .max(255),
  status: AssessmentSessionStatusSchema.default('Draft'),
  progress_percent: z.number().int().min(0).max(100).default(0),
  started_by: z.string().uuid().nullable().optional(),
  due_at: z.string().datetime({ offset: true }).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type AssessmentSessionInput = z.infer<typeof AssessmentSessionSchema>;

export interface AssessmentSession {
  id: string;
  organization_id: string;
  template_id: string;
  template_name: string;
  template_version: string;
  template_framework: string;
  template_snapshot: Record<string, unknown>;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Cancelled' | 'Archived';
  progress_percent: number;
  started_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AssessmentSessionAssignment {
  id: string;
  session_id: string;
  profile_id: string;
  assigned_by: string | null;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Skipped';
  assigned_at: string;
  completed_at: string | null;
  metadata: Record<string, unknown>;
}
