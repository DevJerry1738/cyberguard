import React from 'react';
import { useCan } from '../hooks/useCan';

interface PermissionGateProps {
  role: string | null | undefined;
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ role, permission, children, fallback = null }: PermissionGateProps) {
  const ok = useCan(role, permission);
  return <>{ok ? children : fallback}</>;
}
