'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiLock,
  FiEye,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiInbox,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import toast, { Toaster } from 'react-hot-toast';

export default function PublicLessonsPage() {
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const router = useRouter();

  // --- States ---
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tone, setTone] = useState('All');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // --- Fetch Data from Backend ---
  const fetchLessons = async () => {
    try {
      setLoading(true);
      // Backend API URL with Query Params
      const query = new URLSearchParams({
        search: search,
        category: category === 'All' ? '' : category,
        emotionalTone: tone === 'All' ? '' : tone,
        page: currentPage,
        limit: 8, // Per page limit
      }).toString();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons?${query}`,
      );
      const data = await res.json();

      if (res.ok) {
        setLessons(data.lessons || []);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalLessons || 0);
      }
    } catch (error) {
      toast.error('Failed to connect to the wisdom archives');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filter or page changes
  useEffect(() => {
    fetchLessons();
  }, [category, tone, currentPage]);

  // Search Submit Handler
  const handleSearch = e => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
    fetchLessons();
  };

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#BAB0A3] p-6 md:p-12 antialiased">
      <Toaster position="top-center" />

      {/* --- PAGE HEADER --- */}
      <div className="max-w-7xl mx-auto mb-12">
        <span className="text-[#E5A93C] font-mono text-[10px] uppercase tracking-[0.4em] mb-3 block">
          Public Archives
        </span>
        <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight">
          Explore Collective Wisdom
        </h1>
        <p className="text-[#5C544A] mt-4 font-mono text-xs uppercase">
          Total Insights Preserved: {totalResults}
        </p>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="max-w-7xl mx-auto bg-[#0F0E0C] border border-[#1A1612] p-6 mb-16 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-2xl rounded-2xl">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C544A]" />
          <input
            type="text"
            placeholder="Search by keywords and press enter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0A0908] border border-[#1A1612] text-white placeholder:text-[#5C544A] text-sm pl-11 pr-4 h-12 outline-none focus:border-[#E5A93C]/50 transition-all rounded-xl"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2 bg-[#0A0908] border border-[#1A1612] rounded-xl px-3">
            <FiFilter className="text-[#5C544A] text-xs" />
            <select
              value={category}
              onChange={e => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-black text-white text-[10px] h-11 outline-none cursor-pointer font-bold uppercase tracking-widest"
            >
              <option value="All">All Categories</option>
              <option value="Personal Growth">Personal Growth</option>
              <option value="Philosophy">Philosophy</option>
              <option value="Relationships">Relationships</option>
              <option value="Career">Career</option>
              <option value="Mistakes Learned">Mistakes Learned</option>
            </select>
          </div>

          <select
            value={tone}
            onChange={e => {
              setTone(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0A0908] border border-[#1A1612] text-white text-[10px] h-11 px-4 outline-none cursor-pointer rounded-xl font-bold uppercase tracking-widest"
          >
            <option value="All">All Tones</option>
            <option value="Motivational">Motivational</option>
            <option value="Contemplative">Contemplative</option>
            <option value="Gratitude">Gratitude</option>
            <option value="Realization">Realization</option>
          </select>
        </div>
      </div>

      {/* --- LESSONS GRID --- */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-[#0F0E0C] border border-[#1A1612] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-[#1A1612] rounded-3xl">
            <FiInbox className="mx-auto text-[#1A1612] mb-4" size={48} />
            <p className="text-[#5C544A] font-serif italic text-xl">
              No wisdom matches your search in the archives.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {lessons.map(lesson => {
                // LOCK LOGIC: Premium check
                const isLocked =
                  lesson.accessLevel === 'Premium' &&
                  currentUser?.plan !== 'premium';

                return (
                  <motion.div
                    key={lesson._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5 }}
                    className={`bg-[#0F0E0C] border border-[#1A1612] rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-500 shadow-xl cursor-pointer ${
                      isLocked
                        ? 'hover:border-red-900/30'
                        : 'hover:border-[#E5A93C]/30'
                    }`}
                    onClick={() => {
                      if (isLocked) router.push('/pricing');
                      else router.push(`/public-lessons/${lesson._id}`);
                    }}
                  >
                    {/* Media Container */}
                    <div className="relative h-48 overflow-hidden bg-black">
                      <img
                        src={
                          lesson.image || 'https://via.placeholder.com/400x300'
                        }
                        alt={lesson.title}
                        className={`w-full h-full object-cover transition-transform duration-1000 ${
                          !isLocked
                            ? 'group-hover:scale-110 brightness-75'
                            : 'blur-3xl grayscale opacity-30'
                        }`}
                      />

                      {/* Access Badge */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded shadow-lg ${
                            lesson.accessLevel === 'Premium'
                              ? 'bg-[#E5A93C] text-black'
                              : 'bg-white/10 text-white backdrop-blur-md'
                          }`}
                        >
                          {lesson.accessLevel}
                        </span>
                      </div>

                      {/* Lock Overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <FiLock className="text-[#E5A93C] text-3xl mb-2 animate-bounce" />
                          <h4 className="text-white font-serif text-sm font-bold uppercase tracking-widest">
                            Premium Wisdom
                          </h4>
                          <p className="text-[9px] text-[#E5A93C] mt-1 font-mono uppercase">
                            Click to Upgrade
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-[9px] font-mono text-[#8C8275] uppercase tracking-widest mb-3">
                        <FiTag className="text-[#E5A93C]" /> {lesson.category}
                      </div>

                      <h3
                        className={`text-xl font-serif text-white mb-4 line-clamp-2 leading-tight transition-colors ${!isLocked ? 'group-hover:text-[#E5A93C]' : 'opacity-40'}`}
                      >
                        {lesson.title}
                      </h3>

                      <p
                        className={`text-[#8C8275] text-sm font-serif italic mb-6 line-clamp-3 leading-relaxed flex-grow ${isLocked ? 'opacity-10' : ''}`}
                      >
                        "{lesson.description}"
                      </p>

                      <div className="mt-auto pt-6 border-t border-[#1A1612] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              lesson.author?.image ||
                              'https://i.ibb.co.com/vP99Tpx/user.png'
                            }
                            className="w-6 h-6 rounded-full grayscale group-hover:grayscale-0 transition-all"
                            alt="avatar"
                          />
                          <span className="text-[10px] text-white uppercase tracking-tighter font-mono">
                            {lesson.author?.name?.split(' ')[0]}
                          </span>
                        </div>

                        {!isLocked ? (
                          <span className="text-[10px] font-bold text-[#E5A93C] uppercase tracking-widest flex items-center gap-1 group-hover:text-white transition-all">
                            Detail <FiEye />
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-red-500 uppercase font-bold tracking-tighter">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* --- CHALLENGE 3: PAGINATION CONTROLS --- */}
        {!loading && lessons.length > 0 && (
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="w-12 h-12 flex items-center justify-center bg-[#0F0E0C] border border-[#1A1612] rounded-2xl text-[#E5A93C] disabled:opacity-20 hover:bg-[#E5A93C] hover:text-black transition-all group"
              >
                <FiChevronLeft
                  size={24}
                  className="group-active:scale-75 transition-transform"
                />
              </button>

              <div className="flex items-center gap-3 px-6 py-3 bg-[#0F0E0C] border border-[#1A1612] rounded-2xl font-mono text-xs">
                <span className="text-white font-bold">{currentPage}</span>
                <span className="text-[#5C544A]">/</span>
                <span className="text-[#8C8275]">{totalPages}</span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="w-12 h-12 flex items-center justify-center bg-[#0F0E0C] border border-[#1A1612] rounded-2xl text-[#E5A93C] disabled:opacity-20 hover:bg-[#E5A93C] hover:text-black transition-all group"
              >
                <FiChevronRight
                  size={24}
                  className="group-active:scale-75 transition-transform"
                />
              </button>
            </div>

            <p className="text-[9px] text-[#5C544A] font-mono uppercase tracking-[0.3em]">
              Page Navigation Archives
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
