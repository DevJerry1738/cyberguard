import { z } from 'zod';
import { QuestionTypeSchema } from './question';

const SnapshotOptionSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  value: z.string(),
  sort_order: z.number().int().nonnegative(),
}).passthrough();

const SnapshotControlSchema = z.object({
  framework_control_id: z.string().uuid(),
  framework_key: z.string().min(1),
  framework_name: z.string().min(1),
  framework_version: z.string().min(1),
  control_identifier: z.string().min(1),
  mapping_source: z.string().nullable(),
  source_reference: z.string().nullable(),
  review_status: z.enum(['pending', 'verified', 'rejected']),
}).passthrough();

const SnapshotQuestionSchema = z.object({
  id: z.string().uuid(),
  domain_id: z.string().uuid(),
  question_text: z.string().min(1),
  question_type: QuestionTypeSchema,
  is_required: z.boolean(),
  weight: z.number().int().min(1).max(10),
  sort_order: z.number().int().nonnegative(),
  options: z.array(SnapshotOptionSchema),
  source_pack_id: z.string().uuid().nullable(),
  source_pack_version_id: z.string().uuid().nullable(),
  source_pack_question_id: z.string().uuid().nullable(),
  controls: z.array(SnapshotControlSchema),
}).passthrough().superRefine((question, context) => {
  const sourceIdsPresent = [
    question.source_pack_id,
    question.source_pack_version_id,
    question.source_pack_question_id,
  ].filter(id => id !== null).length;
  if (sourceIdsPresent !== 0 && sourceIdsPresent !== 3) {
    context.addIssue({
      code: 'custom',
      message: 'Pack version and source question identifiers must both be present or both be null',
      path: ['source_pack_question_id'],
    });
  }
});

export const AssessmentSnapshotSchema = z.object({
  snapshot_schema_version: z.literal(2),
  id: z.string().uuid(),
  name: z.string(),
  version: z.string(),
  framework: z.string(),
  domains: z.array(z.object({
    domain_id: z.string().uuid(),
    domain_name: z.string(),
    sort_order: z.number().int(),
  }).passthrough()),
  questions: z.array(SnapshotQuestionSchema),
}).passthrough().superRefine((snapshot, context) => {
  const domainIds = new Set(snapshot.domains.map(domain => domain.domain_id));
  if (domainIds.size !== snapshot.domains.length) {
    context.addIssue({ code: 'custom', message: 'Snapshot domain identifiers must be unique', path: ['domains'] });
  }

  const questionIds = new Set<string>();
  snapshot.questions.forEach((question, index) => {
    if (questionIds.has(question.id)) {
      context.addIssue({ code: 'custom', message: 'Snapshot question identifiers must be unique', path: ['questions', index, 'id'] });
    }
    questionIds.add(question.id);

    if (!domainIds.has(question.domain_id)) {
      context.addIssue({ code: 'custom', message: 'Question domain must exist in the snapshot', path: ['questions', index, 'domain_id'] });
    }

    if (['multiple_choice', 'checkbox'].includes(question.question_type) && question.options.length < 2) {
      context.addIssue({ code: 'custom', message: 'Choice questions require at least two options', path: ['questions', index, 'options'] });
    }
  });
});

export type AssessmentSnapshot = z.infer<typeof AssessmentSnapshotSchema>;
