import React, { ReactNode } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={['employee']}>{children}</RoleGuard>;
}
