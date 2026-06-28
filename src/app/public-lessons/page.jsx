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
  FiBarChart2,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/reusableApi';

export default function PublicLessonsPage() {
  // Login kora user er session check kora hocche
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;
  const router = useRouter();

  // STATE MANAGEMENT
  const [lessons, setLessons] = useState([]); // Database theke asha lessons store korar jonno
  const [loading, setLoading] = useState(true); // Data load hoyar somoy spinner dekhate
  const [search, setSearch] = useState(''); // Search text dhore rakhar jonno
  const [category, setCategory] = useState('All'); // Category filter er jonno
  const [tone, setTone] = useState('All'); // Emotional tone filter er jonno

  // CHALLENGE 1: Sorting State
  // Default bhabe 'newest' set kora thakbe
  const [sortBy, setSortBy] = useState('newest');

  // CHALLENGE 3: Pagination States
  const [currentPage, setCurrentPage] = useState(1); // Bartoman page number
  const [totalPages, setTotalPages] = useState(1); // Mot koita page ache
  const [totalResults, setTotalResults] = useState(0); // Mot koita lesson ache

  // DATA FETCHING FUNCTION
  // Database theke data niye ashar main function
  const fetchLessons = async () => {
    try {
      setLoading(true);

      // Backend a pathanor jonno query parameters banano hocche
      const query = new URLSearchParams({
        search: search,
        category: category === 'All' ? '' : category,
        emotionalTone: tone === 'All' ? '' : tone,
        sortBy: sortBy, //  Sorting data pathano hocche
        page: currentPage, // Current page pathano hocche
        limit: 8, // Ek page a koita card dekhabe
      }).toString();

      // Reusable api helper diye backend call kora
      const data = await api.get(`/lessons?${query}`);

      // Data states update kora
      setLessons(data.lessons || []);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalLessons || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to connect to archives');
    } finally {
      setLoading(false);
    }
  };

  // Category, Tone, Sort ba Page change hoilei autometic data fetch korbe
  useEffect(() => {
    fetchLessons();
  }, [category, tone, sortBy, currentPage]);

  // Search form submit korle prothom page theke search hobe
  const handleSearchSubmit = e => {
    e.preventDefault();
    setCurrentPage(1); // Notun search a page reset kora bhalo
    fetchLessons();
  };

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#BAB0A3] p-6 md:p-12 antialiased">
      <Toaster position="top-center" />

      {/* PAGE HEADER */}
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

      {/* Search and filter gulo ekta card layout er bhitore rakha hoyeche */}
      <div className="max-w-7xl mx-auto bg-[#0F0E0C] border border-[#1A1612] p-6 mb-16 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-2xl rounded-2xl">
        {/* Search Input Field */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full lg:max-w-md"
        >
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C544A]" />
          <input
            type="text"
            placeholder="Type and press Enter to search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0A0908] border border-[#1A1612] text-white placeholder:text-[#5C544A] text-sm pl-11 pr-4 h-12 outline-none focus:border-[#E5A93C]/50 transition-all rounded-xl"
          />
        </form>

        {/* Filters and Sorting Dropdowns */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-end">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 bg-[#0A0908] border border-[#1A1612] rounded-xl px-3">
            <FiBarChart2 className="text-[#E5A93C] text-xs" />
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setCurrentPage(1); // Sorting change korle page 1 a niye jabe
              }}
              className="bg-black text-white text-[10px] h-11 outline-none cursor-pointer font-bold uppercase tracking-widest"
            >
              <option value="newest">Newest First</option>
              <option value="mostSaved">Most Saved</option>
            </select>
          </div>

          {/* Category Filter */}
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

          {/* Tone Filter */}
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

      {/* Public lessons */}
      <div className="max-w-7xl mx-auto">
        {/* Data load hoyar somoy skeleton loading animation */}
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
          /* Empty state: Jodi kono lesson khuje na pawa jay */
          <div className="text-center py-32 border border-dashed border-[#1A1612] rounded-3xl">
            <FiInbox className="mx-auto text-[#1A1612] mb-4" size={48} />
            <p className="text-[#5C544A] font-serif italic text-xl">
              No wisdom found matching your search.
            </p>
          </div>
        ) : (
          /* Lessons displaying grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {lessons.map(lesson => {
                // Lesson Premium kintu user Premium na hole card blur hobe
                const isLocked =
                  lesson.accessLevel === 'Premium' &&
                  currentUser?.plan !== 'premium';

                return (
                  <motion.div
                    key={lesson._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className={`bg-[#0F0E0C] border border-[#1A1612] rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-500 shadow-xl cursor-pointer ${
                      isLocked
                        ? 'hover:border-red-900/30'
                        : 'hover:border-[#E5A93C]/30'
                    }`}
                    onClick={() => {
                      // Locked thakle pricing page a pathabe, nahole detail page a
                      if (isLocked) router.push('/pricing');
                      else router.push(`/public-lessons/${lesson._id}`);
                    }}
                  >
                    {/* Lesson Image and Access Badge */}
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

                      {/* Access Badge: Free/Premium */}
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

                      {/* Locked Overlay for Free Users */}
                      {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <FiLock className="text-[#E5A93C] text-3xl mb-2 animate-bounce" />
                          <h4 className="text-white font-serif text-sm font-bold uppercase tracking-widest">
                            Premium Lesson
                          </h4>
                          <p className="text-[9px] text-[#E5A93C] mt-1 font-mono uppercase">
                            Upgrade to View
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Content Section */}
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
                      <div className='flex justify-between'>
                        <p>CreatedAt:</p>
                        <p>
                          {new Date(lesson.createdAt).toDateString('en-GB')}
                        </p>
                      </div>

                      {/* Footer Info: Author and Button */}
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

        {/* Jodi data load sesh hoy ebong lesson thake, tokhon pagination dekhabe */}
        {!loading && lessons.length > 0 && (
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              {/* Previous Page Button */}
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

              {/* Current Page Display */}
              <div className="flex items-center gap-3 px-6 py-3 bg-[#0F0E0C] border border-[#1A1612] rounded-2xl font-mono text-xs">
                <span className="text-white font-bold">{currentPage}</span>
                <span className="text-[#5C544A]">/</span>
                <span className="text-[#8C8275]">{totalPages}</span>
              </div>

              {/* Next Page Button */}
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
