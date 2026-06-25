'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Person,
  LayoutColumns,
  ArrowRightFromSquare,
  ChevronDown,
  Bars,
  Xmark,
} from '@gravity-ui/icons';
import { authClient } from '@/lib/auth-client';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session;
  const user = session?.user;
  const userRole = user?.role || 'user';

  // Desktop Dropdown logic
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll lock when drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileDrawerOpen]);

  const handleLogout = async () => {
    await authClient.signOut();
    setIsMobileDrawerOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Public Lessons', href: '/public-lessons' },
  ];

  if (userRole === 'admin') {
    navLinks.push(
      { name: 'Manage Lessons', href: '/dashboard/admin/manage-lessons' },
      { name: 'Manage Users', href: '/dashboard/admin/manage-users' },
    );
  } else if (isLoggedIn) {
    navLinks.push(
      { name: 'Add Lesson', href: '/dashboard/user/add-lesson' },
      { name: 'My Lessons', href: '/dashboard/user/my-lessons' },
    );
  }

  return (
    <>
      <nav className="bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-[50] border-b border-white/5 py-3 md:py-4">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex justify-between items-center">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <Image
                width={160}
                height={50}
                alt="Logo"
                src="/asstes/Untitled_design__5_-removebg-preview.png"
                className="w-auto h-9 md:h-12 object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <li key={index} className="relative">
                <Link
                  href={link.href}
                  className={`text-[13px] font-bold uppercase tracking-widest transition-all duration-300 ${
                    pathname === link.href
                      ? 'text-[#d4af37]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center space-x-6">
            {!isLoggedIn ? (
              <Link
                href="/signin"
                className="hidden lg:block bg-[#d4af37] text-black px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em]"
              >
                Login
              </Link>
            ) : (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-full border border-[#d4af37] p-[2px]">
                    <Image
                      src={user?.image || 'https://i.ibb.co/L5M0Y8Y/avatar.png'}
                      alt="P"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden text-[#d4af37] p-2"
            >
              <Bars width={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- DRAWER SYSTEM --- */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-[9999] overflow-hidden">
            {/*  Backdrop  */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-lg"
            />

            {/* 2. Drawer Panel  */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-[80%] max-w-[350px] bg-[#0a0a0a] shadow-2xl flex flex-col border-l border-white/10"
            >
              {/* Drawer Header */}
              <div className="p-6 flex justify-between items-center border-b border-white/5">
                <span className="text-[#d4af37] font-black text-[10px] uppercase tracking-[0.4em]">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-gray-400"
                >
                  <Xmark width={30} />
                </button>
              </div>

              {/* User Profile Info (if logged in) */}
              <div className="flex-1 overflow-y-auto p-8">
                {isLoggedIn && (
                  <div className="flex items-center space-x-4 mb-10 pb-6 border-b border-white/5">
                    <Image
                      src={user?.image || 'https://i.ibb.co/L5M0Y8Y/avatar.png'}
                      alt="user"
                      width={50}
                      height={50}
                      className="rounded-full border border-[#d4af37]"
                    />
                    <div>
                      <p className="text-white font-bold">{user?.name}</p>
                      <p className="text-[#d4af37] text-[10px] uppercase">
                        {userRole}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                <div className="flex flex-col space-y-2">
                  {navLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={`text-sm font-bold uppercase tracking-widest py-4 border-b border-white/5 ${
                        pathname === link.href
                          ? 'text-[#d4af37]'
                          : 'text-gray-400'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {isLoggedIn && (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="flex items-center text-sm font-bold uppercase py-4 border-b border-white/5 text-gray-400"
                      >
                        <LayoutColumns className="mr-4" width={18} /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="flex items-center text-sm font-bold uppercase py-4 border-b border-white/5 text-gray-400"
                      >
                        <Person className="mr-4" width={18} /> Profile
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-8 border-t border-white/5">
                {!isLoggedIn ? (
                  <Link
                    href="/signin"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="block text-center bg-[#d4af37] text-black py-4 rounded-lg font-black uppercase text-xs"
                  >
                    Login Now
                  </Link>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex justify-center items-center bg-red-500/10 text-red-500 py-4 rounded-lg font-bold uppercase text-xs"
                  >
                    <ArrowRightFromSquare className="mr-3" width={18} /> Sign
                    Out
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
