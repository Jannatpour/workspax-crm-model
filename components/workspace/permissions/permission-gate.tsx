'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-client-context';

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders UI elements based on user permissions
 *
 * @example
 * <PermissionGate
 *   permission="workspace:members:invite"
 *   fallback={<p>You don't have permission to invite members</p>}
 * >
 *   <Button>Invite Member</Button>
 * </PermissionGate>
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission } = useWorkspace();

  // If user has the required permission, render children
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  // Otherwise, render fallback or nothing
  return <>{fallback}</>;
}
