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
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function MyLessonsPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isPremiumUser = user?.isPremium || false;
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch lessons from your existing backend route
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

  // Handle Visibility Update (Public/Private)
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
      toast.error('Visibility sync failed');
    }
  };

  // Handle Access Update (Free/Premium)
  const handleToggleAccess = async (id, current) => {
    if (!isPremiumUser) {
      toast.error('Only Premium members can set Premium access', {
        icon: '⭐',
      });
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
      toast.error('Access update failed');
    }
  };

  // Custom Toast Confirmation for Deleting
  const confirmDelete = id => {
    toast(
      t => (
        <div className="flex flex-col gap-3 p-1">
          <p className="text-xs font-bold text-[#E6DFD3]">
            Erase this wisdom permanently?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await executeDelete(id);
              }}
              className="bg-red-500 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-[#231E15] text-[#5C544A] px-3 py-1.5 rounded text-[10px] font-bold uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: 'top-center',
        style: { background: '#0F0D0A', border: '1px solid #231E15' },
      },
    );
  };

  // Execute Delete after confirmation
  const executeDelete = async id => {
    try {
      const res = await fetch(`${serverUrl}/lessons/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLessons(prev => prev.filter(l => l._id !== id));
        toast.success('Wisdom erased from archives', { icon: '🗑️' });
      }
    } catch (err) {
      toast.error('Failed to delete');
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
              <AnimatePresence>
                {lessons.map(lesson => (
                  <motion.tr
                    key={lesson._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-7 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 border border-white/5 flex items-center justify-center text-[#E5A93C] rounded-lg shadow-inner">
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

                    {/* Visibility Toggle Button */}
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

                    {/* Access Level Toggle Button */}
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

                    {/* Engagement Stats */}
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

                    {/* Action Buttons */}
                    <td className="py-7 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/lessons/${lesson._id}`}
                          className="p-2.5 bg-white/5 border border-white/5 text-[#5C544A] hover:text-[#E5A93C] transition-all rounded-lg"
                        >
                          <FiEye size={14} />
                        </Link>
                        <Link
                          href={`/dashboard/user/update-lesson/${lesson._id}`}
                          className="p-2.5 bg-white/5 border border-white/5 text-[#5C544A] hover:text-blue-400 transition-all rounded-lg"
                        >
                          <FiEdit2 size={14} />
                        </Link>
                        <button
                          onClick={() => confirmDelete(lesson._id)}
                          className="p-2.5 bg-white/5 border border-white/5 text-[#5C544A] hover:text-red-500 transition-all rounded-lg"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {lessons.length === 0 && (
            <div className="py-20 text-center text-[#5C544A] font-mono text-xs italic">
              Your wisdom vault is currently empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
