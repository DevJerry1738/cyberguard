import { useMemo } from 'react';
import { roleHasPermission } from '../roles';

export function useCan(role: string | null | undefined, permission: string) {
  return useMemo(() => roleHasPermission(role, permission as any), [role, permission]);
}
