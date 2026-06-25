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

  // Open Modal logic
  const openDeleteModal = lesson => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  // Close Modal logic
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLessonToDelete(null);
  };

  // Execute Delete
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

  // Visibility & Access logic remains same...
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#14110C] border border-[#231E15] rounded-2xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Artistic Background Element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <FiAlertTriangle className="text-red-500 text-2xl" />
                </div>

                <h3 className="text-2xl font-serif text-[#F4EFEA] mb-2">
                  Erase Wisdom?
                </h3>
                <p className="text-sm text-[#5C544A] font-mono leading-relaxed mb-8">
                  You are about to permanently remove{' '}
                  <span className="text-[#E6DFD3]">
                    "{lessonToDelete?.title}"
                  </span>{' '}
                  from the collective archives. This action is irreversible.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={closeDeleteModal}
                    className="py-3 rounded-xl border border-[#231E15] text-[#5C544A] text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancele
                  </button>
                  <button
                    onClick={executeDelete}
                    className="py-3 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.15)]"
                  >
                    Confirm Erasure
                  </button>
                </div>
              </div>

              <button
                onClick={closeDeleteModal}
                className="absolute top-4 right-4 text-[#231E15] hover:text-[#E6DFD3] transition-colors"
              >
                <FiX size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#231E15] pb-8">
          <div>
            <h1 className="text-4xl font-serif text-[#E6DFD3]">
              My Lessons Archive
            </h1>
            <p className="text-[10px] text-[#5C544A] mt-2 font-mono uppercase tracking-[0.3em]">
              Curation of your personal wisdom
            </p>
          </div>
          <Link
            href="/dashboard/user/add-lesson"
            className="bg-[#E5A93C] text-black px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-all"
          >
            + Add New Insight
          </Link>
        </div>

        {/* Tabular View */}
        <div className="bg-[#14110C] border border-[#231E15] rounded-xl overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#231E15] text-[10px] font-mono uppercase text-[#5C544A] bg-[#1C1812]/50">
                <th className="py-6 px-8">Insight & Category</th>
                <th className="py-6 px-6">Visibility</th>
                <th className="py-6 px-6">Access Control</th>
                <th className="py-6 px-6 text-center">Engagement</th>
                <th className="py-6 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#231E15]/30">
              {lessons.map(lesson => (
                <motion.tr
                  key={lesson._id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-7 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/5 flex items-center justify-center text-[#E5A93C] rounded-lg">
                        <FiBookOpen />
                      </div>
                      <div>
                        <h4 className="font-serif text-base text-[#F4EFEA] group-hover:text-[#E5A93C] transition-colors">
                          {lesson.title}
                        </h4>
                        <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-[#5C544A] uppercase font-mono mt-1 inline-block">
                          {lesson.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-7 px-6">
                    <button
                      onClick={() =>
                        handleToggleVisibility(lesson._id, lesson.visibility)
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-mono uppercase transition-all ${lesson.visibility === 'Public' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                    >
                      {lesson.visibility === 'Public' ? (
                        <FiGlobe />
                      ) : (
                        <FiLock />
                      )}{' '}
                      {lesson.visibility}
                    </button>
                  </td>
                  <td className="py-7 px-6">
                    <button
                      onClick={() =>
                        handleToggleAccess(lesson._id, lesson.accessLevel)
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-mono uppercase transition-all ${lesson.accessLevel === 'Premium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-white/5 text-[#5C544A] border border-white/5'}`}
                    >
                      {lesson.accessLevel === 'Premium' ? <FiStar /> : null}{' '}
                      {lesson.accessLevel}
                    </button>
                  </td>
                  <td className="py-7 px-6 text-center text-[11px] font-mono text-[#5C544A]">
                    <div className="flex justify-center items-center gap-6">
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
                  <td className="py-7 px-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/public-lessons/${lesson._id}`}
                        className="p-2.5 bg-white/5 border border-white/5 text-[#5C544A] hover:text-[#E5A93C] rounded-lg transition-all"
                      >
                        <FiEye size={14} />
                      </Link>
                      <Link
                        href={`/dashboard/user/my-lessons/${lesson._id}`}
                        className="p-2.5 bg-white/5 border border-white/5 text-[#5C544A] hover:text-blue-400 rounded-lg transition-all"
                      >
                        <FiEdit2 size={14} />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(lesson)} // Changed to Modal
                        className="p-2.5 bg-white/5 border border-white/5 text-[#5C544A] hover:text-red-500 rounded-lg transition-all"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
