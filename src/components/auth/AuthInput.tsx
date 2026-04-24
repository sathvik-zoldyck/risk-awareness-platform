import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#E8EDF2] transition-all duration-300",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-white/40",
            "focus-visible:outline-none focus-visible:border-[#00D4FF] focus-visible:ring-1 focus-visible:ring-[#00D4FF]/20 focus-visible:bg-white/10 hover:bg-white/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-11", // Add padding if icon exists
            className
          )}
          {...props}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-[#00D4FF]">
            {icon}
          </div>
        )}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";
