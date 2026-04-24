"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);

  const { data: userDoc, isLoading: isDocLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    } else if (!isUserLoading && user && !isDocLoading && userDoc) {
      const role = userDoc.role as UserRole;
      if (!allowedRoles.includes(role)) {
        if (role === 'admin') router.replace('/admin/dashboard');
        else if (role === 'company') router.replace('/company/dashboard');
        else if (role === 'employee') router.replace('/employee/dashboard');
        else router.replace('/login');
      }
    }
  }, [user, isUserLoading, userDoc, isDocLoading, allowedRoles, router]);

  if (isUserLoading || isDocLoading || !user || !userDoc || !allowedRoles.includes(userDoc.role as UserRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080A0F]">
        <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
