'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiHeart,
  FiBookmark,
  FiBookOpen,
  FiLock,
  FiGlobe,
  FiStar,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function MyLessonsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isPremiumUser = user?.plan === 'premium' || false;
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  const fetchMyLessons = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`${serverUrl}/lessons/user/${user.id}`);
      const data = await res.json();
      setLessons(data);
    } catch (error) {
      toast.error('Could not sync with archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLessons();
  }, [user?.id]);

  const openDeleteModal = lesson => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLessonToDelete(null);
  };

  const executeDelete = async () => {
    if (!lessonToDelete) return;
    try {
      const res = await fetch(`${serverUrl}/lessons/${lessonToDelete._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLessons(prev => prev.filter(l => l._id !== lessonToDelete._id));
        toast.success('Wisdom erased from archives', {
          style: {
            background: '#1A1612',
            color: '#E5A93C',
            border: '1px solid #231E15',
          },
        });
        closeDeleteModal();
      }
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const handleToggleVisibility = async (id, current) => {
    const next = current === 'Public' ? 'Private' : 'Public';
    try {
      const res = await fetch(`${serverUrl}/lessons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: next }),
      });
      if (res.ok) {
        setLessons(prev =>
          prev.map(l => (l._id === id ? { ...l, visibility: next } : l)),
        );
        toast.success(`Wisdom is now ${next}`, {
          style: { background: '#1A1612', color: '#E5A93C' },
        });
      }
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const handleToggleAccess = async (id, current) => {
    if (!isPremiumUser) {
      toast.error('Premium access required');
      return;
    }
    const next = current === 'Premium' ? 'Free' : 'Premium';
    try {
      const res = await fetch(`${serverUrl}/lessons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessLevel: next }),
      });
      if (res.ok) {
        setLessons(prev =>
          prev.map(l => (l._id === id ? { ...l, accessLevel: next } : l)),
        );
        toast.success(`Access level set to ${next}`);
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center text-[#E5A93C] font-mono animate-pulse">
        SYNCING ARCHIVES...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-4 md:p-12">
      <Toaster />

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#14110C] border border-[#231E15] rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <FiAlertTriangle className="text-red-500 text-3xl" />
                </div>
                <h3 className="text-2xl font-serif text-[#F4EFEA] mb-3">
                  Erase Wisdom?
                </h3>
                <p className="text-sm text-[#5C544A] leading-relaxed mb-10">
                  You are about to permanently remove{' '}
                  <span className="text-white">"{lessonToDelete?.title}"</span>.
                  This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 py-4 rounded-xl border border-[#231E15] text-[#5C544A] text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="flex-1 py-4 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg"
                  >
                    Erase Forever
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif text-[#E6DFD3]">
              Archives
            </h1>
            <p className="text-[10px] text-[#5C544A] mt-2 font-mono uppercase tracking-[0.4em]">
              Curation of your personal wisdom
            </p>
          </div>
          <Link
            href="/dashboard/user/add-lesson"
            className="w-full md:w-auto text-center bg-[#E5A93C] text-black px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
          >
            + New Insight
          </Link>
        </div>

        {/* --- MOBILE CARD VIEW (Hidden on Desktop) --- */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {lessons.map(lesson => (
            <div
              key={lesson._id}
              className="bg-[#14110C] border border-[#231E15] rounded-3xl p-6 space-y-6"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-serif text-lg text-[#F4EFEA] leading-tight">
                    {lesson.title}
                  </h4>
                  <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-[#5C544A] uppercase font-mono inline-block">
                    {lesson.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/user/my-lessons/${lesson._id}`}
                    className="p-2 bg-white/5 border border-white/5 text-gray-400 rounded-lg"
                  >
                    <FiEdit2 size={14} />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(lesson)}
                    className="p-2 bg-red-500/10 border border-red-500/10 text-red-500 rounded-lg"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    handleToggleVisibility(lesson._id, lesson.visibility)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${lesson.visibility === 'Public' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                >
                  {lesson.visibility === 'Public' ? <FiGlobe /> : <FiLock />}{' '}
                  {lesson.visibility}
                </button>
                <button
                  onClick={() =>
                    handleToggleAccess(lesson._id, lesson.accessLevel)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${lesson.accessLevel === 'Premium' ? 'bg-[#E5A93C]/10 text-[#E5A93C] border-[#E5A93C]/20' : 'bg-white/5 text-[#5C544A] border-white/5'}`}
                >
                  {lesson.accessLevel === 'Premium' && <FiStar />}{' '}
                  {lesson.accessLevel}
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="flex gap-4 text-[11px] font-mono text-[#5C544A]">
                  <span className="flex items-center gap-1.5">
                    <FiHeart className="text-rose-500" />{' '}
                    {lesson.likesCount || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiBookmark className="text-sky-400" />{' '}
                    {lesson.favoritesCount || 0}
                  </span>
                </div>
                <Link
                  href={`/public-lessons/${lesson._id}`}
                  className="text-[#E5A93C] text-[10px] font-black uppercase tracking-widest"
                >
                  View Insight →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
        <div className="hidden lg:block bg-[#14110C] border border-[#231E15] rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#231E15] text-[9px] font-black uppercase text-[#5C544A] tracking-widest">
                <th className="py-6 px-8">Insight</th>
                <th className="py-6 px-6">Status</th>
                <th className="py-6 px-6">Access</th>
                <th className="py-6 px-6 text-center">Engagement</th>
                <th className="py-6 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#231E15]/30">
              {lessons.map(lesson => (
                <tr
                  key={lesson._id}
                  className="hover:bg-white/[0.01] transition-colors group"
                >
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-[#E5A93C] rounded-xl group-hover:scale-110 transition-transform">
                        <FiBookOpen />
                      </div>
                      <div className="max-w-[250px]">
                        <h4 className="font-serif text-base text-[#F4EFEA] truncate">
                          {lesson.title}
                        </h4>
                        <span className="text-[9px] text-[#5C544A] uppercase font-mono tracking-wider">
                          {lesson.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <button
                      onClick={() =>
                        handleToggleVisibility(lesson._id, lesson.visibility)
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${lesson.visibility === 'Public' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                    >
                      {lesson.visibility === 'Public' ? (
                        <FiGlobe />
                      ) : (
                        <FiLock />
                      )}{' '}
                      {lesson.visibility}
                    </button>
                  </td>
                  <td className="py-6 px-6">
                    <button
                      onClick={() =>
                        handleToggleAccess(lesson._id, lesson.accessLevel)
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${lesson.accessLevel === 'Premium' ? 'bg-[#E5A93C]/10 text-[#E5A93C] border-[#E5A93C]/20' : 'bg-white/5 text-[#5C544A] border-white/10'}`}
                    >
                      {lesson.accessLevel === 'Premium' && <FiStar />}{' '}
                      {lesson.accessLevel}
                    </button>
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex justify-center items-center gap-6 text-[11px] font-mono text-[#5C544A]">
                      <span className="flex items-center gap-1.5">
                        <FiHeart className="text-rose-500" />{' '}
                        {lesson.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiBookmark className="text-sky-400" />{' '}
                        {lesson.favoritesCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/public-lessons/${lesson._id}`}
                        className="p-2.5 bg-white/5 border border-white/10 text-gray-500 hover:text-[#E5A93C] rounded-xl transition-all"
                      >
                        <FiEye size={14} />
                      </Link>
                      <Link
                        href={`/dashboard/user/my-lessons/${lesson._id}`}
                        className="p-2.5 bg-white/5 border border-white/10 text-gray-500 hover:text-blue-400 rounded-xl transition-all"
                      >
                        <FiEdit2 size={14} />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(lesson)}
                        className="p-2.5 bg-white/5 border border-white/10 text-gray-500 hover:text-red-500 rounded-xl transition-all"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lessons.length === 0 && !loading && (
          <div className="text-center py-20 bg-[#14110C] rounded-3xl border border-dashed border-[#231E15]">
            <FiBookOpen size={40} className="mx-auto text-[#231E15] mb-4" />
            <p className="text-[#5C544A] font-serif italic text-lg">
              No wisdom recorded in this archive yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
