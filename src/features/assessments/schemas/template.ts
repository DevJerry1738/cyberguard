import { z } from 'zod';

export const FrameworksList = [
  'CyberGuard Baseline',
  'International Organization for Standardization / IEC 27001',
  'National Institute of Standards and Technology Cybersecurity Framework',
  'Center for Internet Security Controls',
  'SOC 2',
  'PCI DSS',
  'Custom',
] as const;

export const AssessmentTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(255, { message: 'Name must be 255 characters or fewer' }),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Description must be 1000 characters or fewer' })
    .optional()
    .nullable(),
  framework: z
    .string()
    .trim()
    .min(2, { message: 'Framework must be at least 2 characters' })
    .max(255, { message: 'Framework must be 255 characters or fewer' }),
  version: z
    .string()
    .trim()
    .regex(/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/, {
      message: 'Version must be a valid semantic version (e.g. 1.0.0)',
    }),
});

export type AssessmentTemplateInput = z.infer<typeof AssessmentTemplateSchema>;

export interface AssessmentTemplate {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  framework: string;
  version: string;
  status: 'Draft' | 'Active' | 'Archived';
  parent_template_id: string | null;
  root_template_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  archived_at: string | null;
  archived_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface AssessmentTemplateDomain {
  template_id: string;
  domain_id: string;
  sort_order: number;
}
