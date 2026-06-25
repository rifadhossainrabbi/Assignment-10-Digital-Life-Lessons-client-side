'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  PlusSquare,
  BookOpen,
  Sparkles,
  User,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const userRole = session?.user?.role || 'user';

  const userNavItems = [
    { icon: LayoutDashboard, href: '/dashboard', label: 'Dashboard' },
    { icon: PlusSquare, href: '/dashboard/user/add-lesson', label: 'Add' },
    { icon: BookOpen, href: '/dashboard/user/my-lessons', label: 'Lessons' },
    { icon: Sparkles, href: '/dashboard/user/favorite-lesson', label: 'Saved' },
    { icon: User, href: '/dashboard/profile', label: 'Profile' },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, href: '/dashboard/admin', label: 'Admin' },
    { icon: Users, href: '/dashboard/admin/manage-users', label: 'Users' },
    {
      icon: BookOpen,
      href: '/dashboard/admin/manage-lessons',
      label: 'Lessons',
    },
    {
      icon: ShieldAlert,
      href: '/dashboard/admin/reported-lessons',
      label: 'Reports',
    },
    { icon: User, href: '/dashboard/admin/profile', label: 'Profile' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : userNavItems;

  if (isPending) return null;

  return (
    <>
      {/* --- DESKTOP VERTICAL SIDEBAR --- */}
      <aside className="hidden lg:flex w-72 h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/5 flex-col shrink-0">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-xl font-serif font-bold text-[#d4af37] tracking-widest uppercase">
            {userRole === 'admin' ? 'DLL Admin' : 'DLL User'}
          </h1>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-600 mt-1">
            Management Archive
          </p>
        </div>

        <nav className="flex-grow px-4 py-6 space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? 'text-[#d4af37] bg-white/5'
                    : 'hover:text-white hover:bg-white/5 text-gray-400'
                }`}
              >
                <item.icon size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute right-0 top-3 bottom-3 w-[2px] bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- MOBILE FULL-WIDTH TOP NAV --- */}
      <div className="lg:hidden sticky top-0 z-[100] w-full bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        {/* Header Title for Mobile */}
        <div className="px-5 pt-3 pb-1">
          <span className="text-[#d4af37] font-serif font-black uppercase tracking-[0.2em] text-[9px] opacity-60">
            Menu System
          </span>
        </div>

        {/* Distributed Nav Links */}
        <nav className="flex items-center justify-between w-full px-2 pb-2">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all duration-300 ${
                  isActive ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'text-gray-500'
                }`}
              >
                <item.icon size={18} className={isActive ? 'mb-1' : 'mb-1.5'} />
                <span
                  className={`text-[8px] font-black uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-[#d4af37] rounded-full mt-1 shadow-[0_0_5px_#d4af37]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default DashboardSidebar;
