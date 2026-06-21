'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiHeart,
  FiBookmark,
  FiBookOpen,
  FiLock,
  FiGlobe,
  FiStar,
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function MyLessonsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isPremiumUser = user?.isPremium || false;

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchMyLessons = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/user/${user.id}`,
        );
        const data = await res.json();
        setLessons(data);
      } catch (error) {
        toast.error('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };
    fetchMyLessons();
  }, [user?.id]);

  // Local Toggle Logic (UI Only for now)
  const toggleVisibility = (id, current) => {
    const next = current === 'Public' ? 'Private' : 'Public';
    setLessons(prev =>
      prev.map(l => (l._id === id ? { ...l, visibility: next } : l)),
    );
    toast.success(`Visibility: ${next}`);
  };

  const toggleAccess = (id, current) => {
    if (!isPremiumUser) {
      toast.error('Only Premium members can set Premium access');
      return;
    }
    const next = current === 'Premium' ? 'Free' : 'Premium';
    setLessons(prev =>
      prev.map(l => (l._id === id ? { ...l, accessLevel: next } : l)),
    );
    toast.success(`Access Level: ${next}`);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center text-[#E5A93C] font-mono uppercase tracking-widest">
        Accessing Archives...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-6 md:p-12 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#231E15] pb-10">
          <div>
            <h1 className="text-4xl font-serif text-[#E6DFD3] tracking-tight">
              Personal Library
            </h1>
            <p className="text-xs text-[#5C544A] mt-2 font-mono uppercase tracking-[0.3em]">
              Vault of your curated wisdom
            </p>
          </div>
          <Link
            href="/dashboard/user/add-lesson"
            className="bg-[#E5A93C] text-black px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl"
          >
            + New Life Lesson
          </Link>
        </div>

        {/* Table View */}
        <div className="bg-[#14110C] border border-[#231E15] overflow-hidden rounded-sm shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#231E15] text-[10px] font-mono uppercase text-[#5C544A] bg-[#1C1812]/50">
                <th className="py-6 px-8">Insight Title</th>
                <th className="py-6 px-6">Visibility Toggle</th>
                <th className="py-6 px-6">Access Control</th>
                <th className="py-6 px-6 text-center">Engagement</th>
                <th className="py-6 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#231E15]/60">
              <AnimatePresence>
                {lessons.map(lesson => (
                  <motion.tr
                    key={lesson._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#1C1812]/30 transition-colors group"
                  >
                    <td className="py-7 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#1C1812] border border-[#2E281D] flex items-center justify-center text-[#E5A93C]">
                          <FiBookOpen />
                        </div>
                        <div>
                          <h4 className="font-serif text-base text-[#E6DFD3] group-hover:text-[#E5A93C] transition-colors">
                            {lesson.title}
                          </h4>
                          <p className="text-[10px] text-[#5C544A] font-mono mt-1 uppercase tracking-tighter">
                            {lesson.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Visibility Segmented Toggle */}
                    <td className="py-7 px-6">
                      <div className="inline-flex bg-[#0F0D0A] p-1 border border-[#231E15] relative overflow-hidden">
                        <button
                          onClick={() =>
                            toggleVisibility(lesson._id, lesson.visibility)
                          }
                          className={`relative z-10 px-4 py-1.5 text-[9px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors ${lesson.visibility === 'Public' ? 'text-black font-bold' : 'text-[#5C544A]'}`}
                        >
                          <FiGlobe size={11} /> Public
                        </button>
                        <button
                          onClick={() =>
                            toggleVisibility(lesson._id, lesson.visibility)
                          }
                          className={`relative z-10 px-4 py-1.5 text-[9px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors ${lesson.visibility === 'Private' ? 'text-black font-bold' : 'text-[#5C544A]'}`}
                        >
                          <FiLock size={11} /> Private
                        </button>
                        {/* The Sliding Background */}
                        <motion.div
                          className="absolute top-1 bottom-1 bg-[#E5A93C] w-[calc(50%-4px)]"
                          animate={{
                            x: lesson.visibility === 'Public' ? 0 : '100%',
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      </div>
                    </td>

                    {/* Access Level Segmented Toggle */}
                    <td className="py-7 px-6">
                      <div className="inline-flex bg-[#0F0D0A] p-1 border border-[#231E15] relative">
                        <button
                          onClick={() =>
                            toggleAccess(lesson._id, lesson.accessLevel)
                          }
                          className={`relative z-10 px-4 py-1.5 text-[9px] font-mono uppercase tracking-widest transition-colors ${lesson.accessLevel === 'Free' ? 'text-black font-bold' : 'text-[#5C544A]'}`}
                        >
                          Free
                        </button>
                        <button
                          onClick={() =>
                            toggleAccess(lesson._id, lesson.accessLevel)
                          }
                          className={`relative z-10 px-4 py-1.5 text-[9px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors ${lesson.accessLevel === 'Premium' ? 'text-black font-bold' : 'text-[#5C544A]'}`}
                        >
                          <FiStar size={11} /> Premium
                        </button>
                        <motion.div
                          className="absolute top-1 bottom-1 bg-blue-500 w-[calc(50%-4px)]"
                          animate={{
                            x: lesson.accessLevel === 'Free' ? 0 : '100%',
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-7 px-6 text-center">
                      <div className="flex justify-center items-center gap-6 text-[11px] font-mono">
                        <div className="flex items-center gap-2 text-[#9C9485]">
                          <FiHeart className="text-red-500" />{' '}
                          {lesson.likesCount}
                        </div>
                        <div className="flex items-center gap-2 text-[#9C9485]">
                          <FiBookmark className="text-blue-400" />{' '}
                          {lesson.favoritesCount}
                        </div>
                      </div>
                    </td>

                    <td className="py-7 px-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          href={`/lessons/${lesson._id}`}
                          className="p-2.5 bg-[#1C1812] border border-[#2E281D] hover:border-[#E5A93C] text-[#5C544A] hover:text-[#E5A93C] transition-all"
                        >
                          <FiEye size={14} />
                        </Link>
                        <Link
                          href={`/dashboard/user/update-lesson/${lesson._id}`}
                          className="p-2.5 bg-[#1C1812] border border-[#2E281D] hover:border-blue-400 text-[#5C544A] hover:text-blue-400 transition-all"
                        >
                          <FiEdit2 size={14} />
                        </Link>
                        <button className="p-2.5 bg-[#1C1812] border border-[#2E281D] hover:border-red-500 text-[#5C544A] hover:text-red-500 transition-all">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
