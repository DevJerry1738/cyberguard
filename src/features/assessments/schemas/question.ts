import { z } from 'zod';

// ── Supported question types ──────────────────────────────
export const QUESTION_TYPES = [
  'yes_no',
  'multiple_choice',
  'checkbox',
  'text',
  'textarea',
  'number',
  'date',
  'file_upload',
] as const;

export type QuestionType = typeof QUESTION_TYPES[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  yes_no: 'Yes / No',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkbox',
  text: 'Short Text',
  textarea: 'Long Text',
  number: 'Number',
  date: 'Date',
  file_upload: 'File Upload',
};

export const CHOICE_BASED_TYPES: QuestionType[] = ['multiple_choice', 'checkbox'];
export const QuestionTypeSchema = z.enum(QUESTION_TYPES);

// ── Zod Schemas ───────────────────────────────────────────

export const QuestionOptionSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, 'Option label is required').max(500),
  value: z.string().trim().min(1, 'Option value is required').max(255),
  sort_order: z.number().int().default(0),
});

export const CreateQuestionSchema = z.object({
  domain_id: z.string().uuid({ message: 'Security domain is required' }),
  question_text: z
    .string()
    .trim()
    .min(5, { message: 'Question must be at least 5 characters' })
    .max(2000, { message: 'Question must be 2000 characters or fewer' }),
  help_text: z
    .string()
    .trim()
    .max(1000, { message: 'Help text must be 1000 characters or fewer' })
    .optional()
    .nullable(),
  question_type: QuestionTypeSchema,
  is_required: z.boolean().default(true),
  weight: z
    .number()
    .int()
    .min(1, { message: 'Weight must be at least 1' })
    .max(10, { message: 'Weight must be 10 or fewer' })
    .default(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
export type QuestionOptionInput = z.infer<typeof QuestionOptionSchema>;

// ── TypeScript Interfaces ─────────────────────────────────

export interface QuestionOption {
  id: string;
  question_id: string;
  label: string;
  value: string;
  sort_order: number;
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  organization_id: string;
  template_id: string;
  domain_id: string;
  question_text: string;
  help_text: string | null;
  question_type: QuestionType;
  is_required: boolean;
  weight: number;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
  // Joined
  options?: QuestionOption[];
}

// Grouped by domain for the builder workspace
export interface QuestionsByDomain {
  domain_id: string;
  domain_name: string;
  questions: AssessmentQuestion[];
}
