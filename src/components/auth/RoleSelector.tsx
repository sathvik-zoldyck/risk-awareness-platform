import React from 'react';
import { cn } from '@/lib/utils';

export type Role = 'employee' | 'company';

interface RoleSelectorProps {
  activeRole: Role;
  onChange: (role: Role) => void;
}

export function RoleSelector({ activeRole, onChange }: RoleSelectorProps) {
  return (
    <div className="flex p-1 space-x-1 bg-black/20 rounded-xl border border-white/10">
      <button
        type="button"
        onClick={() => onChange('employee')}
        className={cn(
          "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300",
          activeRole === 'employee'
            ? "bg-[#00D4FF] text-[#080A0F] shadow-[0_0_16px_rgba(0,212,255,0.25)]"
            : "text-white/40 hover:text-[#E8EDF2] hover:bg-white/5"
        )}
      >
        Employee
      </button>
      <button
        type="button"
        onClick={() => onChange('company')}
        className={cn(
          "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300",
          activeRole === 'company'
            ? "bg-[#00D4FF] text-[#080A0F] shadow-[0_0_16px_rgba(0,212,255,0.25)]"
            : "text-white/40 hover:text-[#E8EDF2] hover:bg-white/5"
        )}
      >
        Company
      </button>
    </div>
  );
}
