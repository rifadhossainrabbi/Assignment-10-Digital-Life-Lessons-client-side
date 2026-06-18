'use client';

import React from 'react';
import { Star, ChevronDown, ArrowRight, Clock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { authClient } from '@/lib/auth-client';

const UserProfile = () => {
  // 1. Fetch data from session
  const { data: session, isPending } = authClient.useSession();

  // 2. Handle loading state
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0d0d0b] flex items-center justify-center">
        <Loader2 className="text-amber-500 animate-spin" size={40} />
      </div>
    );
  }

  // 3. User variables
  const user = session?.user;
  const isPremium = user?.isPremium || false;

  // Static lesson data (to be replaced with DB data)
  const lessons = [
    {
      title: 'The Architecture of Silence',
      category: 'PHILOSOPHY',
      desc: 'How to build mental sanctuaries in an age...',
      time: '12 min read',
      img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=500',
    },
    {
      title: 'The Soul in the Machine',
      category: 'AESTHETICS',
      desc: 'Evaluating the moral landscape of...',
      time: '18 min read',
      img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500',
    },
    {
      title: 'Digital Minimalism',
      category: 'PRODUCTIVITY',
      desc: 'A framework for choosing the few tool...',
      time: '8 min read',
      img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=500',
    },
    {
      title: 'The Ripple of Intent',
      category: 'PSYCHOLOGY',
      desc: 'Understanding how micro-decisions in ou...',
      time: '15 min read',
      img: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0b] text-gray-300 font-sans px-4 py-8 sm:px-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* --- Header Section (Responsive Flex) --- */}
        <header className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-6 md:gap-10 mb-12 md:mb-16">
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-amber-600/30 ring-4 ring-amber-500/5 shadow-2xl">
              <Image
                src={user?.image || 'https://i.pravatar.cc/150'}
                alt={user?.name || 'User Profile'}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
            {isPremium && (
              <div className="absolute bottom-1 right-1 bg-amber-500 p-1.5 rounded-full text-black shadow-lg">
                <Star size={14} fill="currentColor" />
              </div>
            )}
          </div>

          <div className="flex-grow">
            <div className="flex flex-col items-center md:items-start gap-2">
              {isPremium && (
                <span className="bg-amber-600/20 text-amber-500 text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/20">
                  Premium Member ⭐
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight mt-1">
                {user?.name || 'Mysterious Seeker'}
              </h1>
            </div>
            <p className="max-w-xl text-gray-500 text-xs sm:text-sm leading-relaxed italic mt-4 px-2 md:px-0">
              <span className="text-amber-700/60 not-italic block mb-1">
                {user?.email}
              </span>
              Exploring the intersection of ancient wisdom and modern digital
              insights. Always learning, always growing.
            </p>

            <div className="mt-6">
              <button className="w-full sm:w-auto bg-[#ffb247] hover:bg-amber-500 text-black px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-lg shadow-amber-500/10 active:scale-95">
                Follow Wisdom
              </button>
            </div>
          </div>
        </header>

        {/* --- Stats Section (Responsive Grid) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-20">
          <div className="bg-[#141412] p-6 sm:p-8 rounded-xl border border-white/5 text-center sm:text-left hover:border-amber-500/20 transition-all">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#ffb247]">
              12
            </h2>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gray-600 mt-2">
              Lessons Contributed
            </p>
          </div>

          <div className="bg-[#141412] p-6 sm:p-8 rounded-xl border border-white/5 text-center sm:text-left hover:border-amber-500/20 transition-all">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#ffb247]">
              342
            </h2>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gray-600 mt-2">
              Wisdom Favorites
            </p>
          </div>

          <div className="bg-[#141412] p-6 sm:p-8 rounded-xl border border-white/5 flex items-center justify-between sm:col-span-2 lg:col-span-1 hover:border-amber-500/20 transition-all">
            <div className="text-left">
              <h3 className="text-amber-500 font-bold text-xs sm:text-sm">
                Mastery Progress
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                Journey to Elder status.
              </p>
            </div>
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#ffb247]"
                  strokeWidth="3"
                  strokeDasharray="45, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                45%
              </span>
            </div>
          </div>
        </div>

        {/* --- Shared Wisdom Section (Dynamic Card Grid) --- */}
        <section className="mb-12 md:mb-20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Your Sanctuary
            </h2>
            <div className="flex gap-4 sm:gap-6 text-[10px] uppercase tracking-widest font-bold">
              <button className="flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors">
                Latest <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-400 transition-colors">
                Popular <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
            {lessons.map((lesson, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 border border-white/5">
                  <Image
                    src={lesson.img}
                    alt={lesson.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-bold text-amber-500 tracking-tighter uppercase">
                    {lesson.category}
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#ffb247] transition-colors leading-tight line-clamp-1">
                  {lesson.title}
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                  {lesson.desc}
                </p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-gray-600 flex items-center gap-1">
                    <Clock size={10} /> {lesson.time}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-amber-600 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Footer Section (Responsive Wrap) --- */}
        <footer className="pt-12 border-t border-amber-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <div className="w-full md:w-auto text-center md:text-left">
            <h2 className="text-xl font-serif font-bold text-[#ffb247]">
              Digital Life Lessons
            </h2>
            <p className="text-[9px] sm:text-[10px] text-gray-600 mt-2 italic tracking-widest uppercase">
              © {new Date().getFullYear()} Digital Life Lessons • All Chapters
              Reserved
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-10 sm:gap-16 w-full md:w-auto">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                Platform
              </h4>
              <ul className="space-y-2">
                <li className="text-[11px] text-gray-500 hover:text-white cursor-pointer transition-colors">
                  Digital Ethics
                </li>
                <li className="text-[11px] text-gray-500 hover:text-white cursor-pointer transition-colors">
                  The Vault
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                Legal
              </h4>
              <ul className="space-y-2">
                <li className="text-[11px] text-gray-500 hover:text-white cursor-pointer transition-colors">
                  Terms Scroll
                </li>
                <li className="text-[11px] text-gray-500 hover:text-white cursor-pointer transition-colors">
                  Privacy Shield
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default UserProfile;
