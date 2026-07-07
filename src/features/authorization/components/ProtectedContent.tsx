import React from 'react';
import { PermissionGate } from './PermissionGate';

interface ProtectedContentProps {
  role: string | null | undefined;
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedContent({ role, permission, fallback = null, children }: ProtectedContentProps) {
  return (
    <PermissionGate role={role} permission={permission} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
