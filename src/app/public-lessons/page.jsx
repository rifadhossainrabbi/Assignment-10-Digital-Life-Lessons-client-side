'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiLock, FiEye, FiTag } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { getLessons } from '@/lib/api/getlessons';

export default function PublicLessonsPage() {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const router = useRouter();

  // State Management
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tone, setTone] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch initial data
  useEffect(() => {
    const fetchLessonsData = async () => {
      try {
        const data = await getLessons();
        setLessons(data);
      } catch (error) {
        console.error('Wisdom vault archive connection failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonsData();
  }, []);

  // Filter & Sort Logic execution
  const filteredLessons = lessons
    .filter(lesson => {
      const matchesSearch =
        lesson.title?.toLowerCase().includes(search.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === 'All' || lesson.category === category;
      const matchesTone = tone === 'All' || lesson.emotionalTone === tone;
      return matchesSearch && matchesCategory && matchesTone;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center font-mono text-[#E5A93C] uppercase tracking-widest">
        Loading Wisdom Vault...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#BAB0A3] p-6 md:p-12 antialiased">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <span className="text-[#E5A93C] font-mono text-xs uppercase tracking-[0.3em] mb-3 block">
          Public Archives
        </span>
        <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight">
          Explore Collective Wisdom
        </h1>
      </div>

      {/* Search & Filtering Bar */}
      <div className="max-w-7xl mx-auto bg-[#0F0E0C] border border-[#1A1612] p-6 mb-16 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-2xl rounded-2xl">
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="absolute left-4 top-3.5 text-[#5C544A] w-4 h-4" />
          <input
            type="text"
            placeholder="Search insights by keywords..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0A0908] border border-[#1A1612] text-white placeholder:text-[#5C544A] text-sm pl-11 pr-4 h-11 outline-none focus:border-[#E5A93C]/50 transition-all rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-end">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-[#0A0908] border border-[#1A1612] text-white text-xs h-11 px-4 outline-none cursor-pointer focus:border-[#E5A93C] rounded-lg"
          >
            <option value="All">All Categories</option>
            <option value="Personal Growth">Personal Growth</option>
            <option value="Philosophy">Philosophy</option>
            <option value="Finance">Finance</option>
            <option value="Relationships">Relationships</option>
          </select>

          <select
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="bg-[#0A0908] border border-[#1A1612] text-white text-xs h-11 px-4 outline-none cursor-pointer focus:border-[#E5A93C] rounded-lg"
          >
            <option value="All">All Tones</option>
            <option value="Motivational">Motivational</option>
            <option value="Contemplative">Contemplative</option>
            <option value="Realization">Realization</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-[#0A0908] border border-[#1A1612] text-white text-xs h-11 px-4 outline-none cursor-pointer focus:border-[#E5A93C] rounded-lg"
          >
            <option value="newest">Sort: Newest First</option>
          </select>
        </div>
      </div>

      {/* 4-COLUMN DYNAMIC GRID (Matches FeaturedSection) */}
      <div className="max-w-7xl mx-auto">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#1A1612] rounded-2xl">
            <p className="text-[#5C544A] font-mono text-xs uppercase tracking-widest">
              No matching wisdom entries found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredLessons.map(lesson => {
              const isLocked =
                lesson.accessLevel === 'Premium' && !currentUser?.isPremium;

              return (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#0F0E0C] border border-[#1A1612] rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-500 shadow-xl ${
                    !isLocked
                      ? 'hover:border-[#E5A93C]/30 cursor-pointer'
                      : 'cursor-default'
                  }`}
                  onClick={() =>
                    !isLocked && router.push(`/public-lessons/${lesson._id}`)
                  }
                >
                  {/* Image Section with Lockdown Logic */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        lesson.image || 'https://via.placeholder.com/800x450'
                      }
                      alt={lesson.title}
                      className={`w-full h-full object-cover transition-transform duration-700 brightness-75 ${
                        !isLocked
                          ? 'group-hover:scale-110'
                          : 'blur-xl grayscale'
                      }`}
                    />

                    {/* Access Level Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-1 rounded ${
                          lesson.accessLevel === 'Premium'
                            ? 'bg-[#E5A93C] text-black'
                            : 'bg-white/10 text-white backdrop-blur-md'
                        }`}
                      >
                        {lesson.accessLevel}
                      </span>
                    </div>

                    {/* Lockdown Overlay for Free Users */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-[#0A0908]/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                        <FiLock className="text-[#E5A93C] text-2xl mb-2 animate-pulse" />
                        <h4 className="text-white font-serif text-sm">
                          Premium Lesson
                        </h4>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            router.push('/dashboard/pricing');
                          }}
                          className="mt-2 text-[10px] font-mono text-[#E5A93C] underline uppercase tracking-tighter"
                        >
                          Upgrade to view
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Body Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#8C8275] uppercase tracking-wider mb-3">
                      <FiTag className="text-[#E5A93C]" /> {lesson.category}
                    </div>

                    <h3
                      className={`text-xl font-serif text-white mb-4 line-clamp-2 leading-snug transition-colors ${
                        !isLocked ? 'group-hover:text-[#E5A93C]' : 'opacity-40'
                      }`}
                    >
                      {lesson.title}
                    </h3>

                    <p
                      className={`text-[#8C8275] text-sm font-serif italic mb-6 line-clamp-3 leading-relaxed ${
                        isLocked ? 'opacity-20' : ''
                      }`}
                    >
                      "{lesson.description}"
                    </p>

                    {/* Footer: Creator Info & Interaction */}
                    <div className="mt-auto pt-6 border-t border-[#1A1612] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            lesson.author?.image ||
                            'https://via.placeholder.com/150'
                          }
                          className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all border border-white/5"
                          alt="creator"
                        />
                        <span className="text-[10px] text-white uppercase tracking-tighter font-mono">
                          {lesson.author?.name?.split(' ')[0] || 'Unknown'}
                        </span>
                      </div>

                      {!isLocked ? (
                        <span className="text-[10px] font-bold text-[#E5A93C] uppercase tracking-[0.2em] flex items-center gap-1 group-hover:text-white transition-all">
                          See Details <FiEye />
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#5C544A] uppercase">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
