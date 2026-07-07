export const PERMISSIONS = {
  ORGANIZATION_VIEW: 'organization.view',
  ORGANIZATION_UPDATE: 'organization.update',

  MEMBERS_VIEW: 'members.view',
  MEMBERS_INVITE: 'members.invite',
  MEMBERS_UPDATE: 'members.update',
  MEMBERS_REMOVE: 'members.remove',

  DEPARTMENTS_VIEW: 'departments.view',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_ARCHIVE: 'departments.archive',
  DEPARTMENTS_DELETE: 'departments.delete',

  SECURITY_DOMAINS_VIEW: 'security_domains.view',
  SECURITY_DOMAINS_CREATE: 'security_domains.create',
  SECURITY_DOMAINS_UPDATE: 'security_domains.update',
  SECURITY_DOMAINS_ARCHIVE: 'security_domains.archive',
  SECURITY_DOMAINS_DELETE: 'security_domains.delete',
  SECURITY_DOMAINS_REORDER: 'security_domains.reorder',

  ASSESSMENTS_VIEW: 'assessments.view',
  ASSESSMENTS_CREATE: 'assessments.create',

  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',

  AUDIT_VIEW: 'audit.view',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
