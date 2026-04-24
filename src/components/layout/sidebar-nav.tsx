"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield, LayoutDashboard, ClipboardList, Trophy,
  History, Users, FileText, Settings,
  BarChart3, ChevronLeft, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/common/Logo';

type Role = 'admin' | 'company' | 'employee';

const NAV_GROUPS: Record<Role, { title: string; items: { href: string; label: string; icon: React.ElementType }[] }[]> = {
  employee: [
    {
      title: 'MENU',
      items: [
        { href: '/employee/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
        { href: '/employee/assessment', label: 'Assessment',  icon: ClipboardList   },
        { href: '/employee/results',    label: 'Results',     icon: Trophy          },
        { href: '/employee/history',    label: 'History',     icon: History         },
      ]
    },
    {
      title: 'TOOLS',
      items: []
    }
  ],
  company: [
    {
      title: 'MENU',
      items: [
        { href: '/company/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
        { href: '/company/employees',  label: 'Employees',   icon: Users           },
        { href: '/company/reports',    label: 'Reports',     icon: FileText        },
      ]
    },
    {
      title: 'TOOLS',
      items: []
    }
  ],
  admin: [
    {
      title: 'MENU',
      items: [
        { href: '/admin/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
        { href: '/admin/questions',  label: 'Questions',   icon: ClipboardList   },
        { href: '/admin/companies',  label: 'Companies',   icon: Users           },
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { href: '/admin/reports',    label: 'Global Analytics', icon: BarChart3       },
      ]
    }
  ],
};

const ROLE_COLOR = {
  admin: '#00D4FF',
  company: '#7B61FF',
  employee: '#22C55E'
};

interface SidebarNavProps {
  role: Role;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const groups = NAV_GROUPS[role];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/5 bg-[#080A0F] transition-all duration-[280ms] ease-in-out',
          collapsed ? 'w-[60px]' : 'w-[228px]',
        )}
      >
        {/* Logo */}
        <Link href={`/${role}/dashboard`} className={cn('flex items-center h-16 px-4 border-b border-white/5', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="shrink-0 flex items-center justify-center">
            <Logo size={24} />
          </div>
          {!collapsed && (
             <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em', color: '#E8EDF2' }}>
              ALCYONE SECURE
            </span>
          )}
        </Link>

        {/* Role Chip */}
        {!collapsed && (
          <div className="px-5 py-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 bg-white/2" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ROLE_COLOR[role] }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_COLOR[role] }} />
              {role} portal
            </span>
          </div>
        )}

        {/* Nav groups */}
        <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
          {groups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn('nav-item', active && 'active')}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom controls */}
        <div className="px-3 pb-6 space-y-1 border-t border-white/5 pt-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item w-full"
            suppressHydrationWarning
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed ? 'rotate-180' : '')} />
            {!collapsed && <span>Collapse Menu</span>}
          </button>
        </div>

      </aside>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-14 bg-[#080A0F]/95 backdrop-blur-xl border-t border-white/5 px-2">
        {groups[0].items.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 transition-all',
                active ? 'text-[#00D4FF]' : 'text-white/30'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}