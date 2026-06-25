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
  ShieldCheck,
} from '@gravity-ui/icons';
import { authClient } from '@/lib/auth-client';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session;
  const user = session?.user;
  const userRole = user?.role || 'user';
  const isPremium = user?.plan;

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileDrawerOpen]);

  const handleLogout = async () => {
    await authClient.signOut();
    setIsDropdownOpen(false);
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
  } else  {
    navLinks.push(
      { name: 'Add Lesson', href: '/dashboard/user/add-lesson' },
      { name: 'My Lessons', href: '/dashboard/user/my-lessons' },
    );
  }

  if (isLoggedIn && isPremium == 'free') {
    navLinks.push({ name: 'Upgrade✨', href: '/pricing' });
  }

  return (
    <>
      <nav className="bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-[50] border-b border-white/5 py-3 md:py-4">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex justify-between items-center">
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

          <ul className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className={`text-[12px] font-bold uppercase tracking-widest transition-all duration-300 ${
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
                className="hidden md:block bg-[#d4af37] text-black px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em]"
              >
                Login
              </Link>
            ) : (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 p-[2px] transition-all duration-300 ${isDropdownOpen ? 'border-[#d4af37]' : 'border-white/10'}`}
                  >
                    <Image
                      src={user?.image || 'https://i.ibb.co/L5M0Y8Y/avatar.png'}
                      alt="User"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <ChevronDown
                    className={`text-[#d4af37] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    width={16}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-4 w-72 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] overflow-hidden"
                    >
                      <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-white font-bold truncate">
                          {user?.name}
                        </p>
                        <div className="flex items-center mt-1">
                          <p className="text-[#d4af37] text-[10px] uppercase font-bold tracking-widest">
                            {userRole} Member
                          </p>
                          {isPremium && (
                            <ShieldCheck
                              className="ml-1 text-blue-400"
                              width={12}
                            />
                          )}
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <LayoutColumns className="mr-3" width={18} />{' '}
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                          <Person className="mr-3" width={18} /> Profile
                          Settings
                        </Link>
                      </div>
                      <div className="p-2 border-t border-white/5 bg-black/20">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-bold"
                        >
                          <ArrowRightFromSquare className="mr-3" width={18} />{' '}
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden text-[#d4af37] p-2 active:scale-90 transition-transform"
            >
              <Bars width={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE DRAWER (Tailwind Animation) --- */}
      <div
        className={`fixed inset-0 z-[9999] transition-visibility duration-300 ${isMobileDrawerOpen ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop Overlay */}
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isMobileDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-[350px] bg-[#0a0a0a] shadow-2xl flex flex-col border-l border-white/10 transform transition-transform duration-300 ease-in-out ${isMobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 flex justify-between items-center border-b border-white/5">
            <span className="text-[#d4af37] font-black text-[10px] uppercase tracking-[0.4em]">
              Menu
            </span>
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <Xmark width={30} />
            </button>
          </div>

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

            <div className="flex flex-col space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`text-sm font-bold uppercase tracking-widest py-4 border-b border-white/5 ${pathname === link.href ? 'text-[#d4af37]' : 'text-gray-400'}`}
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
                <ArrowRightFromSquare className="mr-3" width={18} /> Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
