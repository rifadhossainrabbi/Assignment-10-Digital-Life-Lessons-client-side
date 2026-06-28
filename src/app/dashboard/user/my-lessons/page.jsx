'use client';

import React, { useState, useEffect } from 'react';
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
  FiCalendar,
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/reusableApi';
import DeleteLessonModal from '../../DeleteLessonModal';

export default function MyLessonsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const isPremiumUser = user?.plan === 'premium' || false;

  // Database theke data anar states
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal r Delete er states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  // Login check kora hocche eikhane
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  // Archive theke nijer lesson fetch korar function
  const fetchMyLessons = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await api.get(`/lessons/user/${user.id}`);
      setLessons(data);
    } catch (error) {
      toast.error(error.message || 'Could not sync with archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLessons();
  }, [user?.id]);

  // Date shundor kore dekhate helper function
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Delete modal handles
  const openDeleteModal = lesson => {
    setLessonToDelete(lesson);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLessonToDelete(null);
  };

  // Lesson delete korar main logic
  const executeDelete = async () => {
    if (!lessonToDelete) return;
    try {
      await api.delete(`/lessons/${lessonToDelete._id}`);
      setLessons(prev => prev.filter(l => l._id !== lessonToDelete._id));
      toast.success('Wisdom erased from archives');
      closeDeleteModal();
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  // Public/Private toggle korar logic
  const handleToggleVisibility = async (id, current) => {
    const next = current === 'Public' ? 'Private' : 'Public';
    try {
      await api.patch(`/lessons/${id}`, { visibility: next });
      setLessons(prev =>
        prev.map(l => (l._id === id ? { ...l, visibility: next } : l)),
      );
      toast.success(`Wisdom is now ${next}`);
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  // Free/Premium toggle korar logic
  const handleToggleAccess = async (id, current) => {
    if (!isPremiumUser) {
      toast.error('Premium access required for this action');
      return;
    }
    const next = current === 'Premium' ? 'Free' : 'Premium';
    try {
      await api.patch(`/lessons/${id}`, { accessLevel: next });
      setLessons(prev =>
        prev.map(l => (l._id === id ? { ...l, accessLevel: next } : l)),
      );
      toast.success(`Access set to ${next}`);
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center text-[#E5A93C] font-mono animate-pulse uppercase tracking-[0.2em]">
        SYNCING YOUR ARCHIVES...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-5 md:p-10 lg:p-12 antialiased">
      <Toaster position="top-right" />
      <DeleteLessonModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={executeDelete}
        lessonTitle={lessonToDelete?.title}
      />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section: Title ebong Add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#231E15] pb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
              Archives
            </h1>
            <p className="text-[10px] text-[#5C544A] mt-2 font-mono uppercase tracking-[0.4em]">
              Your Preserved Wisdom Registry
            </p>
          </div>
          <Link
            href="/dashboard/user/add-lesson"
            className="w-full sm:w-auto text-center bg-[#E5A93C] text-black px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all cursor-pointer shadow-lg active:scale-95"
          >
            + New Insight
          </Link>
        </div>

        {/* --- Mobile & Tablet View (Grid Layout) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden">
          {lessons.map(lesson => (
            <div
              key={lesson._id}
              className="bg-[#14110C] border border-[#231E15] rounded-[32px] p-6 flex flex-col h-full shadow-xl"
            >
              {/* Card Header: Image r Title */}
              <div className="flex gap-4 items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#0F0D0A] border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                  {lesson.image ? (
                    <img
                      src={lesson.image}
                      className="w-full h-full object-cover"
                      alt="thumb"
                    />
                  ) : (
                    <FiBookOpen className="text-[#E5A93C] text-xl" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/public-lessons/${lesson._id}`}
                    className="font-serif text-lg text-white leading-snug hover:text-[#E5A93C] transition-colors line-clamp-2 block mb-1"
                  >
                    {lesson.title}
                  </Link>
                  <span className="text-[9px] font-mono uppercase text-[#5C544A] tracking-wider">
                    {lesson.category}
                  </span>
                </div>
              </div>

              {/* Status Section: Visibility r Access */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-[#5C544A]">Registry Info</span>
                  <span className="text-[#E5A93C] flex items-center gap-1">
                    <FiCalendar size={12} /> {formatDate(lesson.createdAt)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleToggleVisibility(lesson._id, lesson.visibility)
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${lesson.visibility === 'Public' ? 'bg-green-500/5 text-green-400 border-green-500/10' : 'bg-red-500/5 text-red-400 border-red-500/10'}`}
                  >
                    {lesson.visibility === 'Public' ? <FiGlobe /> : <FiLock />}{' '}
                    {lesson.visibility}
                  </button>
                  <button
                    onClick={() =>
                      handleToggleAccess(lesson._id, lesson.accessLevel)
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${lesson.accessLevel === 'Premium' ? 'bg-[#E5A93C]/5 text-[#E5A93C] border-[#E5A93C]/10' : 'bg-white/5 text-[#5C544A] border-white/5'}`}
                  >
                    {lesson.accessLevel === 'Premium' && <FiStar />}{' '}
                    {lesson.accessLevel}
                  </button>
                </div>
              </div>

              {/* Card Footer: Engagement stats ebong Actions */}
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5C544A]">
                    <FiHeart className="text-rose-500" />{' '}
                    {lesson.likesCount || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5C544A]">
                    <FiBookmark className="text-sky-400" />{' '}
                    {lesson.favoritesCount || 0}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/user/my-lessons/${lesson._id}`}
                    className="p-3 bg-white/5 text-gray-400 rounded-xl hover:text-white transition-all"
                  >
                    <FiEdit2 size={16} />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(lesson)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- Desktop View: Table layout (Desktop e shudhu dekhabe) --- */}
        <div className="hidden lg:block bg-[#14110C] border border-[#231E15] rounded-[40px] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#231E15] text-[9px] font-black uppercase text-[#5C544A] tracking-[0.2em]">
                <th className="py-8 px-10">Archive Identity</th>
                <th className="py-8 px-6">Status</th>
                <th className="py-8 px-6">Access</th>
                <th className="py-8 px-6">Registry Date</th>
                <th className="py-8 px-6 text-center">Engagement</th>
                <th className="py-8 px-10 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#231E15]/30">
              {lessons.map(lesson => (
                <tr
                  key={lesson._id}
                  className="hover:bg-white/[0.01] transition-colors group"
                >
                  <td className="py-7 px-10">
                    <Link
                      href={`/public-lessons/${lesson._id}`}
                      className="flex items-center gap-5 group/link"
                    >
                      <div className="w-14 h-14 bg-[#0F0D0A] border border-white/5 flex items-center justify-center text-[#E5A93C] rounded-2xl overflow-hidden shrink-0 group-hover/link:border-[#E5A93C]/30 transition-all">
                        {lesson.image ? (
                          <img
                            src={lesson.image}
                            className="w-full h-full object-cover"
                            alt="lesson"
                          />
                        ) : (
                          <FiBookOpen size={20} />
                        )}
                      </div>
                      <div className="max-w-[280px]">
                        <h4 className="font-serif text-base text-white truncate group-hover/link:text-[#E5A93C] transition-colors">
                          {lesson.title}
                        </h4>
                        <span className="text-[9px] text-[#5C544A] uppercase font-mono tracking-widest">
                          {lesson.category}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="py-7 px-6">
                    <button
                      onClick={() =>
                        handleToggleVisibility(lesson._id, lesson.visibility)
                      }
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${lesson.visibility === 'Public' ? 'bg-green-500/5 text-green-400 border-green-500/10 hover:bg-green-500/10' : 'bg-red-500/5 text-red-400 border-red-500/10 hover:bg-red-500/10'}`}
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
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${lesson.accessLevel === 'Premium' ? 'bg-[#E5A93C]/5 text-[#E5A93C] border-[#E5A93C]/10 hover:bg-[#E5A93C]/10' : 'bg-white/5 text-[#5C544A] border-white/10 hover:text-white'}`}
                    >
                      {lesson.accessLevel === 'Premium' && <FiStar />}{' '}
                      {lesson.accessLevel}
                    </button>
                  </td>
                  <td className="py-7 px-6">
                    <span className="text-[10px] font-mono text-[#8C8275] flex items-center gap-2 uppercase tracking-tighter">
                      <FiCalendar className="text-[#E5A93C]" />{' '}
                      {formatDate(lesson.createdAt)}
                    </span>
                  </td>
                  <td className="py-7 px-6 text-center">
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
                  <td className="py-7 px-10 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/user/my-lessons/${lesson._id}`}
                        className="p-3 bg-white/5 border border-white/5 text-gray-500 hover:text-blue-400 hover:border-blue-400/30 rounded-2xl transition-all"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(lesson)}
                        className="p-3 bg-white/5 border border-white/5 text-gray-500 hover:text-red-500 hover:border-red-500/30 rounded-2xl transition-all cursor-pointer"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State: Jodi kono lesson na thake */}
        {lessons.length === 0 && !loading && (
          <div className="text-center py-24 bg-[#14110C] rounded-[40px] border border-dashed border-[#231E15] shadow-inner">
            <FiBookOpen
              size={48}
              className="mx-auto text-[#231E15] mb-6 opacity-50"
            />
            <p className="text-[#5C544A] font-serif italic text-xl">
              The archives are silent. No wisdom found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
