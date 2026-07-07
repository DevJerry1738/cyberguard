import { z } from 'zod';

export const SecurityDomainSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(100, { message: 'Name must be 100 characters or fewer' }),
  description: z
    .string()
    .trim()
    .max(500, { message: 'Description must be 500 characters or fewer' })
    .optional()
    .nullable(),
});

export type SecurityDomainInput = z.infer<typeof SecurityDomainSchema>;

export interface SecurityDomain {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_archived: boolean;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
