'use client';
import React, { useState, useEffect } from 'react';
import { FiTrash2, FiEye, FiBookmark, FiFilter, FiInfo } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/reusableApi';
import { motion } from 'framer-motion';
import DeleteConfirmModal from '../../DeleteConfirmModal';


export default function UserFavoritePage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const router = useRouter();

  // Component States
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal tracking state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    lesson: null,
  });

  /**
   * Fetch saved wisdom from the archives using reusable API
   * Re-runs when category filter or session changes
   */
  useEffect(() => {
    const fetchFavoritesData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const query = new URLSearchParams({
          category: selectedCategory,
        }).toString();

        // Fetching data via reusable instance
        const data = await api.get(`/favorites/${session.user.id}?${query}`);
        setFavorites(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message || 'Failed to sync archives');
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchFavoritesData();
  }, [session, selectedCategory]);

  /**
   * Auth Guard: Redirect unauthenticated users
   */
  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/signin');
    }
  }, [session, authLoading, router]);

  /**
   * Opens the confirmation modal for a specific lesson
   */
  const handleOpenModal = lesson => {
    setConfirmModal({ isOpen: true, lesson });
  };

  /**
   * Logic to trigger the actual removal from backend
   * Re-uses the toggle favorite endpoint
   */
  const executeRemove = async () => {
    const lessonId = confirmModal.lesson?._id;
    setConfirmModal({ isOpen: false, lesson: null }); // Close modal immediately

    try {
      // POST request automatically attaches Better Auth token via apiInstance
      await api.post(`/lessons/${lessonId}/favorite`, {
        userId: session?.user?.id,
      });

      // Optimistic UI update: filter out the removed item
      setFavorites(prev => prev.filter(fav => fav._id !== lessonId));
      toast.success('Wisdom removed from archive');
    } catch (error) {
      toast.error('Action failed');
    }
  };

  // Global Loading State
  if (authLoading || (session && loading)) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#E5A93C]/20 border-t-[#E5A93C] rounded-full animate-spin" />
          <p className="text-[#E5A93C] font-mono text-[10px] tracking-widest uppercase text-center">
            Accessing Archives...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] p-4 md:p-8 lg:p-8 relative">
      <Toaster position="bottom-right" />

      {/* REUSABLE SEPARATE MODAL COMPONENT */}
      <DeleteConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, lesson: null })}
        onConfirm={executeRemove}
        title={confirmModal.lesson?.title}
      />

      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* HEADER & FILTER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-[#1A1612] pb-8 gap-8">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-serif text-[#F4EFEA] tracking-tight">
              Saved Wisdom
            </h1>
            <p className="text-[10px] md:text-xs font-mono text-[#8C8275] uppercase tracking-[0.2em] flex items-center gap-2">
              <FiBookmark className="text-[#E5A93C]" /> {favorites.length}{' '}
              Entries Preserved
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#0F0E0C] border border-[#1A1612] px-4 py-2 rounded-xl flex items-center gap-2">
              <FiFilter className="text-gray-600 text-xs" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent text-[10px] font-mono outline-none text-[#E5A93C] uppercase tracking-widest cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Personal Growth">Personal Growth</option>
                <option value="Career">Career</option>
                <option value="Relationships">Relationships</option>
              </select>
            </div>
          </div>
        </div>

        {/* WISDOM CARDS GRID */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map(lesson => (
              <motion.div
                key={lesson._id}
                whileHover={{ y: -5 }}
                className="bg-[#0F0E0C] border border-[#1A1612] rounded-2xl overflow-hidden group shadow-xl"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={lesson.image}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    alt="insight"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-[#F4EFEA] font-serif text-base line-clamp-1 mb-4">
                    {lesson.title}
                  </h3>
                  <div className="flex justify-between items-center border-t border-[#1A1612] pt-4">
                    <button
                      onClick={() =>
                        router.push(`/public-lessons/${lesson._id}`)
                      }
                      className="text-[#E5A93C] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-all"
                    >
                      View <FiEye />
                    </button>
                    <button
                      onClick={() => handleOpenModal(lesson)}
                      className="text-red-500/40 hover:text-red-500 transition-colors p-2"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-[#0F0E0C] border border-[#1A1612] rounded-3xl">
            <FiInfo className="mx-auto text-[#26221C] mb-4 text-3xl" />
            <p className="text-sm font-mono uppercase tracking-[0.2em] text-[#5C544A]">
              Archive is empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
