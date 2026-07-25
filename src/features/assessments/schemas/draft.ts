import { z } from 'zod';

export const DraftResponseValueSchema = z.unknown();

export const DraftResponsesSchema = z.record(z.string(), DraftResponseValueSchema);

export const SaveDraftInputSchema = z.object({
  sessionId: z.string().uuid(),
  responses: DraftResponsesSchema,
  currentDomain: z.string().uuid().optional().nullable(),
  currentQuestion: z.string().uuid().optional().nullable(),
  version: z.number().int().positive().optional(),
  forceOverwrite: z.boolean().optional(),
});

export const CreateDraftInputSchema = z.object({
  sessionId: z.string().uuid(),
  responses: DraftResponsesSchema.optional(),
  currentDomain: z.string().uuid().optional().nullable(),
  currentQuestion: z.string().uuid().optional().nullable(),
});

export const SyncOfflineDraftInputSchema = z.object({
  sessionId: z.string().uuid(),
  responses: DraftResponsesSchema,
  currentDomain: z.string().uuid().optional().nullable(),
  currentQuestion: z.string().uuid().optional().nullable(),
  clientVersion: z.number().int().positive(),
  lastSavedAt: z.string().datetime().optional(),
});

export type DraftResponses = z.infer<typeof DraftResponsesSchema>;
export type SaveDraftInput = z.infer<typeof SaveDraftInputSchema>;
export type CreateDraftInput = z.infer<typeof CreateDraftInputSchema>;
export type SyncOfflineDraftInput = z.infer<typeof SyncOfflineDraftInputSchema>;

export interface AssessmentDraftRecord {
  id: string;
  session_id: string;
  user_id: string;
  organization_id: string;
  responses: DraftResponses;
  current_domain: string | null;
  current_question: string | null;
  progress: number;
  version: number;
  checksum: string | null;
  last_saved_at: string;
  created_at: string;
  updated_at: string;
}

export type SaveStatus = 
  | 'saved'
  | 'saving'
  | 'unsaved'
  | 'sync_pending'
  | 'offline'
  | 'conflict'
  | 'error';
