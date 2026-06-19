'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// React Icons আমদানি করা হয়েছে
import {
  FiSearch,
  FiChevronDown,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiHeart,
  FiBookmark,
  FiBookOpen,
} from 'react-icons/fi';
import { FaRegStar } from 'react-icons/fa6';
import toast, { Toaster } from 'react-hot-toast';

export default function MyLessonsPage() {
  const [isPremiumUser, setIsPremiumUser] = useState(true); // Toggle based on logged-in user state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Public, Private

  // Dummy Data mapped carefully from image_4983c1.png structure
  const [lessons, setLessons] = useState([
    {
      id: '1',
      title: 'Mastering Stoicism in Chaos',
      category: 'Mental Models',
      readTime: '12 mins read',
      visibility: 'Public',
      accessLevel: 'Premium',
      createdDate: 'Oct 24, 2023',
      likes: 1204,
      favorites: 450,
    },
    {
      id: '2',
      title: "Compound Interest: Life's Secret Weapon",
      category: 'Finance',
      readTime: '15 mins read',
      visibility: 'Public',
      accessLevel: 'Free',
      createdDate: 'Nov 02, 2023',
      likes: 892,
      favorites: 210,
    },
    {
      id: '3',
      title: 'Networking for Introverts',
      category: 'Interpersonal',
      readTime: '8 mins read',
      visibility: 'Private',
      accessLevel: 'Premium',
      createdDate: 'Dec 15, 2023',
      likes: 0,
      favorites: 0,
    },
    {
      id: '4',
      title: 'The 4 AM Routine: Fact or Fiction?',
      category: 'Lifestyle',
      readTime: '10 mins read',
      visibility: 'Public',
      accessLevel: 'Free',
      createdDate: 'Jan 08, 2024',
      likes: 4521,
      favorites: 1294,
    },
  ]);

  // Analytics Stats Blocks from the top of image_4983c1.png
  const stats = [
    {
      title: 'Total Lessons',
      value: '42',
      change: '+12%',
      icon: <FiBookOpen className="w-5 h-5 text-[#E5A93C]" />,
    },
    {
      title: 'Total Views',
      value: '12.8k',
      change: '+8%',
      icon: <FiEye className="w-5 h-5 text-[#E5A93C]" />,
    },
    {
      title: 'Total Likes',
      value: '3.2k',
      change: '+4%',
      icon: <FiHeart className="w-5 h-5 text-[#E5A93C]" />,
    },
    {
      title: 'Mentor Rating',
      value: '4.9',
      change: 'Top 1%',
      icon: <FaRegStar className="w-5 h-5 text-[#E5A93C]" />,
    },
  ];

  // Handlers for Inline Updates (Requirements)
  const handleVisibilityToggle = (id, currentVisibility) => {
    const nextVisibility =
      currentVisibility === 'Public' ? 'Private' : 'Public';
    setLessons(prev =>
      prev.map(lesson =>
        lesson.id === id ? { ...lesson, visibility: nextVisibility } : lesson,
      ),
    );
    toast.success(`Visibility updated to ${nextVisibility}`);
  };

  const handleAccessLevelToggle = (id, currentAccess) => {
    if (!isPremiumUser) {
      toast.error('Upgrade to Premium to alter advanced access levels.');
      return;
    }
    const nextAccess = currentAccess === 'Premium' ? 'Free' : 'Premium';
    setLessons(prev =>
      prev.map(lesson =>
        lesson.id === id ? { ...lesson, accessLevel: nextAccess } : lesson,
      ),
    );
    toast.success(`Access level updated to ${nextAccess}`);
  };

  const handleDeleteLesson = id => {
    if (
      confirm(
        'Are you absolutely sure you want to permanently delete this masterpiece?',
      )
    ) {
      setLessons(prev => prev.filter(lesson => lesson.id !== id));
      toast.success('Wisdom record removed permanently.');
    }
  };

  // Filter & Search Logic
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || lesson.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'All' || lesson.visibility === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-6 md:p-12 font-sans antialiased selection:bg-[#E5A93C] selection:text-black">
      <Toaster
        toastOptions={{
          style: {
            background: '#14110C',
            color: '#E6DFD3',
            border: '1px solid #231E15',
            borderRadius: '0px',
          },
        }}
      />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#231E15] pb-6">
          <div>
            <p className="text-[10px] font-mono text-[#E5A93C]/60 uppercase tracking-[0.3em] mb-1">
              Dashboard
            </p>
            <h1 className="text-3xl font-serif text-[#E6DFD3] tracking-wide">
              My Published Wisdom
            </h1>
          </div>
          <button className="self-start md:self-auto border border-[#E5A93C] text-[#E5A93C] hover:bg-[#E5A93C] hover:text-black font-mono text-xs uppercase tracking-wider h-11 px-6 transition-all duration-300">
            + Draft New Lesson
          </button>
        </div>

        {/* 4 Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#14110C] border border-[#231E15] p-6 shadow-xl flex flex-col justify-between relative group hover:border-[#E5A93C]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9C9485] font-medium uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className="w-9 h-9 bg-[#1C1812] border border-[#2E281D] flex items-center justify-center rounded-lg">
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-serif tracking-tight text-[#E6DFD3]">
                  {stat.value}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${idx === 3 ? 'bg-[#E5A93C]/10 text-[#E5A93C]' : 'bg-emerald-500/10 text-emerald-400'}`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Matrix Controller Box */}
        <div className="bg-[#14110C] border border-[#231E15] p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Search Inputs & Dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C9485]/50" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#1C1812] border border-[#2E281D] text-sm text-[#E6DFD3] placeholder:text-[#9C9485]/30 pl-10 pr-4 h-11 outline-none focus:border-[#E5A93C] transition-colors"
              />
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="appearance-none bg-[#1C1812] border border-[#2E281D] text-sm text-[#E6DFD3] pl-4 pr-10 h-11 outline-none cursor-pointer focus:border-[#E5A93C] min-w-[160px]"
              >
                <option value="All">All Categories</option>
                <option value="Mental Models">Mental Models</option>
                <option value="Finance">Finance</option>
                <option value="Interpersonal">Interpersonal</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C9485]/50 pointer-events-none" />
            </div>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#2E281D]">
            <span className="text-xs text-[#9C9485] font-mono mr-2 hidden sm:inline">
              Filter by Status:
            </span>
            <div className="bg-[#1C1812] border border-[#2E281D] p-1 flex gap-1">
              {['All', 'Public', 'Private'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 h-8 text-xs font-mono transition-all ${statusFilter === status ? 'bg-[#E5A93C] text-black font-semibold' : 'text-[#9C9485] hover:text-[#E6DFD3]'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Matrix Tabular View Component Layout */}
        <div className="bg-[#14110C] border border-[#231E15] shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#231E15] text-[11px] font-mono uppercase tracking-wider text-[#9C9485]/70 bg-[#1C1812]/40">
                <th className="py-4 px-6 font-medium">Lesson</th>
                <th className="py-4 px-6 font-medium">Visibility</th>
                <th className="py-4 px-6 font-medium">Access Level</th>
                <th className="py-4 px-6 font-medium">Created Date</th>
                <th className="py-4 px-6 font-medium text-center">Likes</th>
                <th className="py-4 px-6 font-medium text-center">Favorites</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#231E15]/60">
              <AnimatePresence initial={false}>
                {filteredLessons.length > 0 ? (
                  filteredLessons.map(lesson => (
                    <motion.tr
                      key={lesson.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-[#1C1812]/20 transition-colors group"
                    >
                      {/* Column 1: Lesson Main Info */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#1C1812] border border-[#2E281D] flex items-center justify-center rounded text-[#E5A93C]/80 group-hover:border-[#E5A93C]/30 transition-colors">
                            <FiBookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-serif text-sm font-medium text-[#E6DFD3] tracking-wide group-hover:text-[#E5A93C] transition-colors">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-[#9C9485] mt-0.5">
                              {lesson.category}{' '}
                              <span className="mx-1.5 text-[#2E281D]">•</span>{' '}
                              {lesson.readTime}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Visibility Toggle Button */}
                      <td className="py-5 px-6">
                        <button
                          onClick={() =>
                            handleVisibilityToggle(lesson.id, lesson.visibility)
                          }
                          className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                            lesson.visibility === 'Public'
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                              : 'bg-zinc-500/5 border-zinc-500/20 text-zinc-400 hover:bg-zinc-500/10'
                          }`}
                        >
                          ● {lesson.visibility}
                        </button>
                      </td>

                      {/* Column 3: Access Level Badge */}
                      <td className="py-5 px-6">
                        <button
                          onClick={() =>
                            handleAccessLevelToggle(
                              lesson.id,
                              lesson.accessLevel,
                            )
                          }
                          className={`text-[11px] font-mono px-3 py-1 uppercase tracking-wider font-semibold transition-all ${
                            lesson.accessLevel === 'Premium'
                              ? 'bg-[#E5A93C]/10 text-[#E5A93C] border border-[#E5A93C]/20 hover:bg-[#E5A93C]/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                          }`}
                        >
                          {lesson.accessLevel}
                        </button>
                      </td>

                      {/* Column 4: Created Date */}
                      <td className="py-5 px-6 text-xs font-mono text-[#9C9485]">
                        {lesson.createdDate}
                      </td>

                      {/* Column 5: Likes & Favorites Counter */}
                      <td className="py-5 px-6 text-sm font-mono text-center text-[#E6DFD3]">
                        {lesson.likes.toLocaleString()}
                      </td>

                      <td className="py-5 px-6 text-sm font-mono text-center text-[#E6DFD3]">
                        {lesson.favorites.toLocaleString()}
                      </td>

                      {/* Column 6: Action Buttons Container */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="View Details"
                            className="w-8 h-8 bg-[#1C1812] border border-[#2E281D] hover:border-[#E5A93C] text-[#9C9485] hover:text-[#E5A93C] flex items-center justify-center transition-all"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Update Lesson"
                            className="w-8 h-8 bg-[#1C1812] border border-[#2E281D] hover:border-blue-400 text-[#9C9485] hover:text-blue-400 flex items-center justify-center transition-all"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            title="Delete Lesson"
                            className="w-8 h-8 bg-[#1C1812] border border-[#2E281D] hover:border-red-500 text-[#9C9485] hover:text-red-400 flex items-center justify-center transition-all"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm font-mono text-[#9C9485]/50 bg-[#1C1812]/10"
                    >
                      No records found matching current query configuration.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
