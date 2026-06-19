'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiLock, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function PublicLessonsPage() {
  const { data: session } = useSession();
  const currentUser = session?.user;

  // State Management
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tone, setTone] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch real-time operational data from backend instead of dummy configurations
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await fetch('http://localhost:5000/lessons');
        if (!response.ok) {
          throw new Error('Network query validation failed.');
        }
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error('Failed to resolve wisdom vault data stream:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Filter & Sort Logic execution mapping layer
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
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center font-mono text-[#E5A93C]">
        Loading wisdom vault archive...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-6 md:p-12 font-sans antialiased selection:bg-[#E5A93C] selection:text-black">
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-12 text-center md:text-left">
        <p className="text-[10px] font-mono text-[#E5A93C]/60 uppercase tracking-[0.3em] mb-2">
          The Knowledge Vault
        </p>
        <h1 className="text-4xl font-serif text-[#E6DFD3] tracking-wide">
          Browse Public Lessons
        </h1>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="max-w-7xl mx-auto bg-[#14110C] border border-[#231E15] p-6 mb-10 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-xl">
        {/* Search Input with react-icons */}
        <div className="relative w-full lg:max-w-md">
          <FiSearch className="absolute left-4 top-3.5 text-[#9C9485]/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search lessons by wisdom, author, or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] placeholder:text-[#9C9485]/30 text-sm pl-11 pr-4 h-11 outline-none hover:border-[#E5A93C]/30 focus:border-[#E5A93C] transition-colors"
          />
        </div>

        {/* Dropdowns filters */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-end">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] text-xs h-11 px-4 outline-none cursor-pointer focus:border-[#E5A93C]"
          >
            <option value="All">All Categories</option>
            <option value="Philosophy">Philosophy</option>
            <option value="Finance">Finance</option>
            <option value="Personal Growth">Personal Growth</option>
            <option value="Relationships">Relationships</option>
          </select>

          <select
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] text-xs h-11 px-4 outline-none cursor-pointer focus:border-[#E5A93C]"
          >
            <option value="All">All Tones</option>
            <option value="Contemplative">Contemplative</option>
            <option value="Realization">Realization</option>
            <option value="Motivational">Motivational</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] text-xs h-11 px-4 outline-none cursor-pointer focus:border-[#E5A93C]"
          >
            <option value="newest">Sort by: Newest</option>
          </select>
        </div>
      </div>

      {/* 3-COLUMN GRID LAYOUT */}
      <div className="max-w-7xl mx-auto">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#2E281D]">
            <p className="text-[#9C9485] font-mono text-sm">
              No lessons found matching the criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLessons.map(lesson => {
              // Lock premium evaluation logic
              const isLocked =
                lesson.accessLevel === 'Premium' && !currentUser?.isPremium;

              return (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#14110C] border border-[#231E15] flex flex-col justify-between overflow-hidden shadow-2xl relative group h-[480px]"
                >
                  {/* Card Header (Image) */}
                  <div className="relative w-full h-48 overflow-hidden bg-[#0F0D0A] border-b border-[#231E15]">
                    <img
                      src={
                        lesson.image || 'https://via.placeholder.com/800x450'
                      }
                      alt={lesson.title}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        isLocked
                          ? 'blur-md grayscale scale-100'
                          : 'grayscale contrast-115'
                      }`}
                    />

                    <div className="absolute top-4 right-4 flex gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 ${
                          lesson.accessLevel === 'Premium'
                            ? 'bg-[#E5A93C] text-black font-bold'
                            : 'bg-[#1C1812] border border-[#2E281D] text-[#9C9485]'
                        }`}
                      >
                        {lesson.accessLevel} Access
                      </span>
                    </div>

                    {/* Lock Screen Frame overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10">
                        <div className="w-10 h-10 bg-[#1C1812] border border-[#2E281D] flex items-center justify-center rounded-full mb-2">
                          <FiLock className="w-4 h-4 text-[#E5A93C]" />
                        </div>
                        <p className="text-xs font-serif text-[#E5A93C] uppercase tracking-wider">
                          Premium Lesson
                        </p>
                        <Link
                          href="/dashboard/pricing"
                          className="text-[10px] font-mono text-[#9C9485] underline hover:text-[#E6DFD3] mt-1"
                        >
                          Upgrade to View
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex gap-2 text-[10px] font-mono uppercase tracking-wider text-[#E5A93C]/70">
                        <span>{lesson.category}</span>
                        <span className="text-[#2E281D]">•</span>
                        <span>{lesson.emotionalTone}</span>
                      </div>

                      <h3
                        className={`font-serif text-lg tracking-wide line-clamp-1 group-hover:text-[#E5A93C] transition-colors ${
                          isLocked ? 'opacity-40 select-none' : ''
                        }`}
                      >
                        {lesson.title}
                      </h3>

                      <p
                        className={`text-xs text-[#9C9485] leading-relaxed line-clamp-3 ${
                          isLocked ? 'opacity-20 select-none' : ''
                        }`}
                      >
                        {lesson.description}
                      </p>
                    </div>

                    {/* Footer / Author Block */}
                    <div className="pt-4 mt-4 border-t border-[#1C1812] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            lesson.author?.image ||
                            'https://via.placeholder.com/150'
                          }
                          alt={lesson.author?.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#2E281D] grayscale"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[#E6DFD3]">
                            {lesson.author?.name || 'Anonymous Tier'}
                          </span>
                          <span className="text-[9px] font-mono text-[#9C9485]/50">
                            {lesson.createdAt
                              ? new Date(lesson.createdAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  },
                                )
                              : 'No Date Specified'}
                          </span>
                        </div>
                      </div>

                      {/* Action Triggers with React Icons */}
                      {isLocked ? (
                        <button
                          disabled
                          className="text-[11px] font-mono tracking-wider uppercase text-[#9C9485]/40 flex items-center gap-1.5 cursor-not-allowed"
                        >
                          Locked <FiLock className="w-3 h-3" />
                        </button>
                      ) : (
                        <Link
                          href={`/lessons/${lesson._id}`}
                          className="text-[11px] font-mono tracking-wider uppercase text-[#E5A93C] hover:text-[#E6DFD3] flex items-center gap-1.5 group/btn transition-colors"
                        >
                          See Details{' '}
                          <FiEye className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
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
