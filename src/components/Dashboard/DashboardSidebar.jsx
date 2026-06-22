'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  PlusSquare,
  BookOpen,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { Button, Drawer, DrawerContent, DrawerBody } from '@heroui/react';
import { authClient } from '@/lib/auth-client';

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  // State to manage mobile drawer visibility
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => setIsOpen(!isOpen);
  const closeDrawer = () => setIsOpen(false);

  const userRole = session?.user?.role || 'user';
  const user = session?.user;

  // --- NAVIGATION CONFIGURATIONS ---
  const userNavItems = [
    { icon: LayoutDashboard, href: '/dashboard', label: 'Dashboard' },
    {
      icon: PlusSquare,
      href: '/dashboard/user/add-lesson',
      label: 'Add Lesson',
    },
    { icon: BookOpen, href: '/dashboard/user/my-lessons', label: 'My Lessons' },
    {
      icon: Sparkles,
      href: '/dashboard/user/favorite-lesson',
      label: 'Favorites',
    },
    { icon: User, href: '/dashboard/profile', label: 'Profile' },
  ];

  const adminNavItems = [
    {
      icon: LayoutDashboard,
      href: '/dashboard/admin',
      label: 'Admin Panel',
    },
    {
      icon: Users,
      href: '/dashboard/admin/manage-users',
      label: 'Manage Users',
    },
    {
      icon: BookOpen,
      href: '/dashboard/admin/manage-lessons',
      label: 'Manage Lessons',
    },
    {
      icon: ShieldAlert,
      href: '/dashboard/admin/reported-lessons',
      label: 'Reported',
    },
    {
      icon: User,
      href: '/dashboard/admin/profile',
      label: 'Admin Profile'
    },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    await authClient.signOut();
  };

  // Shared navigation content
  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-gray-400 border-r border-amber-900/10 shadow-2xl">
      {/* Brand Header Section */}
      <div className="p-8 mb-2 border-b border-amber-900/5">
        <h1 className="text-xl font-serif font-bold text-[#ffb247] leading-tight tracking-wide uppercase">
          {userRole === 'admin' ? 'DLL Admin' : 'Life Lessons'}
        </h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 mt-1">
          {userRole === 'admin' ? 'Management Suite' : 'Curated Wisdom'}
        </p>
      </div>

      {/* Role Badge Section (Image/Name সরানো হয়েছে) */}
      {user && (
        <div className="px-8 py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-amber-500 uppercase font-bold tracking-[0.1em]">
              Active {userRole}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links Mapping */}
      <nav className="flex-grow px-4 space-y-2 mt-2">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeDrawer}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-300 group relative ${
                isActive
                  ? 'text-[#ffb247] bg-amber-500/5 font-medium shadow-[inset_0_0_10px_rgba(255,178,71,0.05)]'
                  : 'hover:text-amber-400 hover:bg-white/5'
              }`}
            >
              <item.icon
                size={20}
                className={`${isActive ? 'text-[#ffb247]' : 'text-gray-600 group-hover:text-amber-500'}`}
              />
              <span className="text-sm tracking-wide">{item.label}</span>

              {isActive && (
                <div className="absolute right-0 top-1/4 bottom-1/4 w-[2px] bg-[#ffb247] shadow-[0_0_12px_rgba(255,178,71,0.8)]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logout Action */}
      <div className="p-6 border-t border-amber-900/10 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-sm text-gray-500 hover:text-red-400 transition-colors group"
        >
          <LogOut
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Logout Archives</span>
        </button>
      </div>
    </div>
  );

  if (isPending)
    return (
      <div className="w-72 h-screen bg-[#0a0a0a] animate-pulse border-r border-amber-900/10" />
    );

  return (
    <>
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 overflow-y-auto overflow-x-hidden">
        <NavContent />
      </aside>

      {/* Mobile Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-amber-900/10 w-full sticky top-0 z-[60]">
        <div className="flex flex-col">
          <h1 className="text-sm font-serif font-bold text-[#ffb247] uppercase tracking-wider">
            Dashboard
          </h1>
          <span className="text-[8px] text-gray-600 uppercase tracking-widest italic">
            {userRole} access
          </span>
        </div>

        <Button
          onPress={toggleDrawer}
          isIconOnly
          variant="light"
          className="text-[#ffb247] hover:bg-amber-500/10 rounded-full"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </Button>
      </div>

      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="left"
        size="xs"
        backdrop="blur"
        className="bg-transparent"
        hideCloseButton
      >
        <DrawerContent className="bg-transparent">
          {() => (
            <DrawerBody className="p-0">
              <div className="w-[280px] h-full shadow-2xl">
                <NavContent />
              </div>
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DashboardSidebar;
