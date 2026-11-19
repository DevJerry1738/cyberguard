-- Original CyberGuard-authored starter questions.
-- This pack is deliberately left Draft/pending until a human content review
-- records approval and publication metadata. No external framework mappings
-- or scoring semantics are asserted here.

insert into public.assessment_packs (id, pack_key, display_name, description)
values (
  '10000000-0000-4000-8000-000000000001',
  'cyberguard-baseline',
  'CyberGuard Baseline',
  'Original starter questions for a practical organization-wide security assessment.'
)
on conflict (pack_key) do nothing;

insert into public.assessment_pack_versions (
  id, pack_id, version_label, status, source_name, source_reference,
  usage_terms, attribution, review_status
)
select
  '10000000-0000-4000-8000-000000000002',
  p.id,
  '1.0.0',
  'draft',
  'CyberGuard',
  null,
  'Original CyberGuard-authored content. Internal use in CyberGuard assessment templates; verify product terms before redistribution.',
  '© CyberGuard. Original content.',
  'pending'
from public.assessment_packs p
where p.pack_key = 'cyberguard-baseline'
on conflict (pack_id, version_label) do nothing;

insert into public.assessment_pack_domains (pack_version_id, domain_key, name, description, sort_order)
values
  ('10000000-0000-4000-8000-000000000002', 'governance-risk', 'Governance and Risk Management', 'Security ownership, policy oversight, and risk decisions.', 0),
  ('10000000-0000-4000-8000-000000000002', 'asset-management', 'Asset Management', 'Ownership, inventory, and lifecycle of information assets.', 1),
  ('10000000-0000-4000-8000-000000000002', 'identity-access', 'Identity and Access Management', 'Identity lifecycle, authentication, and access review practices.', 2),
  ('10000000-0000-4000-8000-000000000002', 'data-protection', 'Data Protection', 'Classification, handling, retention, and protection of organizational data.', 3),
  ('10000000-0000-4000-8000-000000000002', 'security-operations', 'Security Operations and Vulnerability Management', 'Logging, vulnerability handling, and operational security processes.', 4),
  ('10000000-0000-4000-8000-000000000002', 'incident-response', 'Incident Response', 'Preparation, escalation, response, and learning from incidents.', 5),
  ('10000000-0000-4000-8000-000000000002', 'continuity-recovery', 'Business Continuity and Recovery', 'Resilience planning, backups, and service recovery.', 6),
  ('10000000-0000-4000-8000-000000000002', 'security-awareness', 'Security Awareness', 'Role-appropriate security guidance and awareness activities.', 7)
on conflict (pack_version_id, domain_key) do nothing;

insert into public.assessment_pack_questions (
  pack_version_id, pack_domain_id, question_key, question_text, help_text,
  question_type, is_required, weight, sort_order, evidence_guidance, review_status
)
select
  '10000000-0000-4000-8000-000000000002', d.id, q.question_key, q.question_text,
  q.help_text, q.question_type, q.is_required, q.weight, q.sort_order,
  q.evidence_guidance, 'pending'
from (values
  ('governance-risk', 'gov-security-owner', 'Who is accountable for coordinating the organization’s information-security program?', 'Identify the role or team and how accountability is communicated.', 'text', true, 1, 0, 'A role description, organization chart, or approved responsibility record.'),
  ('governance-risk', 'gov-policy-review', 'How often are information-security policies reviewed and approved?', 'Describe the review interval and who approves material changes.', 'textarea', true, 1, 1, 'Policy review records, approval history, or a documented review schedule.'),
  ('governance-risk', 'gov-risk-process', 'Is there a documented process for identifying and recording information-security risks?', 'Answer Yes only if the process is documented and used.', 'yes_no', true, 1, 2, 'A risk procedure or a sanitized example of a recorded risk.'),
  ('asset-management', 'asset-inventory', 'Does the organization maintain an inventory of information systems and important devices?', 'Include the owner and how inventory changes are recorded.', 'yes_no', true, 1, 0, 'A sanitized inventory sample and its ownership/update procedure.'),
  ('asset-management', 'asset-owner', 'How are owners assigned to business-critical systems and information assets?', 'Describe how an owner is identified when an asset is created or acquired.', 'textarea', true, 1, 1, 'Asset records showing ownership or an asset-owner assignment procedure.'),
  ('asset-management', 'asset-retirement', 'How does the organization securely retire or dispose of devices and storage media?', 'Include sanitization, reuse, and disposal practices where applicable.', 'textarea', true, 1, 2, 'A disposal procedure or sanitized retirement record.'),
  ('identity-access', 'iam-unique-accounts', 'Are individual user accounts used instead of shared accounts for routine access?', 'Document approved exceptions separately; do not include credentials.', 'yes_no', true, 1, 0, 'Account-management guidance or a sanitized sample of individual account assignments.'),
  ('identity-access', 'iam-mfa-scope', 'Which systems require multi-factor authentication, and how are exceptions approved?', 'List the systems or system categories and describe exception handling.', 'textarea', true, 1, 1, 'Authentication policy or configuration evidence with secrets removed.'),
  ('identity-access', 'iam-access-review', 'How frequently is access to sensitive systems reviewed by an accountable owner?', 'State the review interval and how resulting changes are tracked.', 'multiple_choice', true, 1, 2, 'A review schedule or a sanitized completed access review.'),
  ('data-protection', 'data-classification', 'Does the organization classify information according to its sensitivity or business impact?', 'Answer Yes only if categories and handling expectations are defined.', 'yes_no', true, 1, 0, 'A classification policy or example showing labels and handling guidance.'),
  ('data-protection', 'data-encryption', 'How does the organization determine where encryption is required for stored or transmitted data?', 'Describe the policy and how relevant systems are checked.', 'textarea', true, 1, 1, 'Encryption standards or configuration records with secrets removed.'),
  ('data-protection', 'data-retention', 'How are retention periods and secure deletion requirements established for important data?', 'Include responsibility for exceptions and disposal verification.', 'textarea', true, 1, 2, 'A retention schedule or approved disposal procedure.'),
  ('security-operations', 'ops-logging', 'Are security-relevant events logged for important systems?', 'Describe the principal event categories and system coverage.', 'yes_no', true, 1, 0, 'Logging standard or a sanitized example event and source inventory.'),
  ('security-operations', 'ops-log-review', 'How are security alerts reviewed, escalated, and documented?', 'Describe monitoring coverage, ownership, and escalation expectations.', 'textarea', true, 1, 1, 'Alert handling procedure or sanitized incident/ticket records.'),
  ('security-operations', 'ops-vulnerability', 'How are identified software vulnerabilities prioritized and tracked to remediation or an approved exception?', 'Include ownership and how overdue items are escalated.', 'textarea', true, 1, 2, 'Vulnerability handling procedure or sanitized remediation tracking evidence.'),
  ('incident-response', 'ir-plan', 'Does the organization maintain a documented process for responding to security incidents?', 'Include roles, escalation, and communication responsibilities.', 'yes_no', true, 1, 0, 'Incident response plan or procedure.'),
  ('incident-response', 'ir-reporting', 'How can staff report a suspected security incident, including outside normal business hours?', 'Describe the reporting channel and how urgent reports are escalated.', 'textarea', true, 1, 1, 'Staff guidance or the documented incident-reporting route.'),
  ('incident-response', 'ir-exercises', 'When was the incident-response process last exercised or reviewed using a scenario?', 'Provide the date or explain the current plan for an exercise.', 'text', true, 1, 2, 'Exercise record, lessons learned, or a scheduled exercise plan.'),
  ('continuity-recovery', 'bc-impact', 'Has the organization identified important services and the business impact of their interruption?', 'Describe how critical services and dependencies are identified.', 'yes_no', true, 1, 0, 'Business impact analysis or a service criticality register.'),
  ('continuity-recovery', 'recovery-targets', 'How are recovery priorities and recovery time expectations approved for critical services?', 'State where priorities are documented and who approves them.', 'textarea', true, 1, 1, 'Approved recovery objectives or continuity plans.'),
  ('continuity-recovery', 'backup-restore-test', 'When was restoration from backup last tested for a critical system?', 'Include the system category, test date, and whether issues were tracked.', 'text', true, 1, 2, 'A sanitized restore-test record; do not attach production data.'),
  ('security-awareness', 'awareness-training', 'Do personnel receive security guidance appropriate to their roles?', 'Describe onboarding and recurring awareness activities.', 'yes_no', true, 1, 0, 'Training materials, completion summaries, or role-specific guidance.'),
  ('security-awareness', 'awareness-reporting', 'Are personnel shown how to report suspicious messages or other security concerns?', 'Describe the reporting method and how staff learn to use it.', 'yes_no', true, 1, 1, 'Staff instructions or the reporting workflow.'),
  ('security-awareness', 'awareness-followup', 'How does the organization identify and address recurring security-awareness needs?', 'Describe how feedback, incidents, or role changes inform follow-up.', 'textarea', true, 1, 2, 'A sanitized training improvement plan or review record.')
) as q(domain_key, question_key, question_text, help_text, question_type, is_required, weight, sort_order, evidence_guidance)
join public.assessment_pack_domains d
  on d.pack_version_id = '10000000-0000-4000-8000-000000000002'
 and d.domain_key = q.domain_key
on conflict (pack_version_id, question_key) do nothing;

insert into public.assessment_pack_question_options (pack_version_id, pack_question_id, label, value, sort_order)
select
  '10000000-0000-4000-8000-000000000002', q.id, o.label, o.value, o.sort_order
from (values
  ('iam-access-review', 'At least quarterly', 'quarterly', 0),
  ('iam-access-review', 'At least annually', 'annually', 1),
  ('iam-access-review', 'Less frequently than annually', 'less_than_annually', 2),
  ('iam-access-review', 'No defined review interval', 'no_defined_interval', 3)
) as o(question_key, label, value, sort_order)
join public.assessment_pack_questions q
  on q.pack_version_id = '10000000-0000-4000-8000-000000000002'
 and q.question_key = o.question_key
on conflict (pack_version_id, pack_question_id, sort_order) do nothing;
