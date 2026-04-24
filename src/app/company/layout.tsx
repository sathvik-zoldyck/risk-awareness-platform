import React, { ReactNode } from 'react';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return <RoleGuard allowedRoles={['company']}>{children}</RoleGuard>;
}
