'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Person,
  LayoutColumns,
  ArrowRightFromSquare,
  ChevronDown,
  Bars, // Hamburger icon
  Xmark, // Close icon
} from '@gravity-ui/icons';
import { authClient } from '@/lib/auth-client';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const { data: session, isPending } = authClient.useSession();
  const isLoggedIn = !!session;
  const user = session?.user;
  console.log('user info', user)
  const isPremium = user?.isPremium || false;

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Public Lessons', href: '/public-lessons' },
    { name: 'Add Lesson', href: '/dashboard/user/add-lesson' },
    { name: 'My Lessons', href: '/dashboard/user/my-lessons' },
  ];

  if (isLoggedIn && !isPremium) {
    navLinks.push({ name: 'Pricing', href: '/pricing' });
  }

  return (
    <nav className="bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-50 py-5 px-5 md:px-10 border-b border-white/5">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center">
        {/* 1. Brand Logo Section */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              width={180}
              height={60}
              alt="Digital Life Lessons"
              src="/asstes/Untitled_design__5_-removebg-preview.png"
              className="w-auto h-10 md:h-12 drop-shadow-[0_0_15px_rgba(255,178,71,0.1)] object-contain transition-transform duration-500 hover:scale-[1.02]"
              priority
            />
          </Link>
        </div>

        {/* 2. Desktop Navigation Links */}
        <ul className="hidden lg:flex items-center space-x-10 list-none">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <li key={index}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-300 pb-1 border-b-2 ${
                    isActive
                      ? 'text-[#d4af37] border-[#d4af37]'
                      : 'text-gray-400 border-transparent hover:text-[#d4af37]'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 3. User Controls & Mobile Toggle */}
        <div className="flex items-center space-x-4 md:space-x-8">
          {!isLoggedIn ? (
            <div className="flex items-center space-x-3 md:space-x-5">
              <Link
                href="/signin"
                className="bg-[#d4af37] text-black px-4 py-1.5 md:px-5 md:py-2 rounded-md text-xs md:text-sm font-bold hover:bg-[#f2c94c] transition-all"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 md:space-x-3 group cursor-pointer focus:outline-none bg-transparent border-none"
              >
                {/* User Avatar Circle */}
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-700 group-hover:border-[#d4af37] transition-all flex items-center justify-center bg-[#1a1a1a] ring-1 ring-white/5 shadow-inner">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'User'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                      <span className="text-[13px] md:text-sm font-bold text-[#d4af37] tracking-tight uppercase">
                        {user?.name ? user.name.slice(0, 2) : '??'}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-gray-400 group-hover:text-[#d4af37] text-sm font-medium hidden sm:block">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>
                <ChevronDown
                  className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  width={14}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-[#111111] border border-white/10 rounded-xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="px-5 py-2 border-b border-white/5 mb-2">
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">
                      {isPremium ? 'Premium ⭐' : 'Free Member'}
                    </p>
                    <p className="text-sm font-bold text-[#d4af37] truncate">
                      {user?.name}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/profile/user-profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-5 py-2.5 text-sm text-gray-300 hover:bg-[#d4af37] hover:text-black transition-all"
                  >
                    <Person className="mr-3" width={16} /> Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-5 py-2.5 text-sm text-gray-300 hover:bg-[#d4af37] hover:text-black transition-all"
                  >
                    <LayoutColumns className="mr-3" width={16} /> Dashboard
                  </Link>
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-5 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-all border-none focus:outline-none cursor-pointer"
                    >
                      <ArrowRightFromSquare className="mr-3" width={16} />{' '}
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Toggle (Visible only on mobile/tablet) */}
          <button
            className="lg:hidden text-[#d4af37] bg-transparent border-none cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <Xmark width={24} /> : <Bars width={24} />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Navigation Links */}
      {isMobileMenuOpen && (
        <div className="lg:hidden flex flex-col bg-[#0a0a0a] border-t border-white/5 mt-5 space-y-4 py-5 animate-in slide-in-from-top duration-300">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-sm font-medium px-5 transition-all ${pathname === link.href ? 'text-[#d4af37]' : 'text-gray-400'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
