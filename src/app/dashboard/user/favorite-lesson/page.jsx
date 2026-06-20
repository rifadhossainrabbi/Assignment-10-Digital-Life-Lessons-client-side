'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiEye, FiBookmark, FiFilter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';

export default function UserFavoritePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

  // ফেভরিট ডেটা নিয়ে আসার ফাংশন (useCallback দিয়ে অপ্টিমাইজড করা হয়েছে)
  const fetchFavorites = useCallback(async () => {
    if (!session?.user) return;
    const currentUserId = session.user.id || session.user._id;

    try {
      setLoading(true);
      let url = `http://localhost:5000/favorites/${currentUserId}?`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedTone) url += `emotionalTone=${selectedTone}`;

      console.log(
        '%c[Favorites Page] Fetching data from:',
        'color: #3b82f6;',
        url,
      );
      const res = await fetch(url);
      const data = await res.json();

      console.log(
        '%c[Favorites Page] Received Matrix Data:',
        'color: #44ff44;',
        data,
      );
      setFavorites(data);
    } catch (error) {
      console.error('[Favorites Page] Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  }, [session, selectedCategory, selectedTone]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchFavorites();
  }, [status, fetchFavorites, router]);

  const handleRemoveFavorite = async lessonId => {
    if (!session?.user) return;
    const currentUserId = session.user.id || session.user._id;

    const confirmRemove = window.confirm(
      'Are you sure you want to remove this wisdom entry from favorites?',
    );
    if (!confirmRemove) return;

    try {
      const res = await fetch(
        `http://localhost:5000/lessons/${lessonId}/favorite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );

      if (res.ok) {
        setFavorites(favorites.filter(fav => fav._id !== lessonId));
        toast.success(
          'Successfully removed from your Matrix Favorites Archive.',
        );
      }
    } catch (error) {
      toast.error('Could not execute delete sequence.');
    }
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center text-center font-mono text-sm text-[#E5A93C] tracking-widest animate-pulse">
        SYNCHRONIZING SAVED ARCHIVES...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] p-6 md:p-10 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER BLOCK */}
        <div className="border-b border-[#1A1612] pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#E5A93C] tracking-[0.25em] uppercase mb-1">
              // COMPILATION
            </div>
            <h1 className="text-3xl font-serif text-[#F4EFEA] font-medium tracking-wide">
              My Saved Wisdom
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275]">
            <FiBookmark className="text-[#E5A93C]" /> {favorites.length} LESSONS
            PRESERVED
          </div>
        </div>

        {/* FILTER BAR SECTION */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C8275] uppercase tracking-wider">
            <FiFilter className="text-[#E5A93C]" /> Filter Logs:
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-black border border-[#26221C] text-xs font-mono text-[#D1C7BD] px-3 py-2 focus:outline-none focus:border-[#E5A93C]"
          >
            <option value="">All Categories</option>
            <option value="Personal Growth">Personal Growth</option>
            <option value="Career">Career</option>
            <option value="Relationships">Relationships</option>
            <option value="Mindset">Mindset</option>
            <option value="Mistakes Learned">Mistakes Learned</option>
          </select>

          <select
            value={selectedTone}
            onChange={e => setSelectedTone(e.target.value)}
            className="bg-black border border-[#26221C] text-xs font-mono text-[#D1C7BD] px-3 py-2 focus:outline-none focus:border-[#E5A93C]"
          >
            <option value="">All Emotional Tones</option>
            <option value="Motivational">Motivational</option>
            <option value="Sad">Sad</option>
            <option value="Realization">Realization</option>
            <option value="Gratitude">Gratitude</option>
          </select>
        </div>

        {/* TABLE LOGS */}
        {favorites.length === 0 ? (
          <div className="bg-[#0F0E0C] border border-[#1A1612] border-dashed text-center py-20 font-serif italic text-[#8C8275]">
            No life lessons found matching the selected archive metrics.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#1A1612] bg-[#0F0E0C]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A1612] bg-black text-[10px] font-mono tracking-widest text-[#8C8275] uppercase">
                  <th className="p-4 font-semibold">Lesson Insight</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Tone</th>
                  <th className="p-4 font-semibold">Metrics</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1612]/60 font-serif text-sm">
                {favorites.map(lesson => (
                  <tr
                    key={lesson._id}
                    className="hover:bg-black/40 transition-colors"
                  >
                    <td className="p-4 max-w-xs">
                      <div className="font-medium text-[#F4EFEA] truncate">
                        {lesson.title}
                      </div>
                      <div className="text-xs text-[#8C8275] font-sans line-clamp-1 mt-0.5">
                        By {lesson.author?.name || 'Anonymous Mentor'}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      <span className="px-2.5 py-1 bg-[#1A150E] border border-[#E5A93C]/20 text-[#E5A93C]">
                        {lesson.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#8C8275]">
                      {lesson.emotionalTone || 'Neutral'}
                    </td>
                    <td className="p-4 font-mono text-xs text-[#BAB0A3]">
                      ❤️ {lesson.likesCount || 0} Likes
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(`/public-lessons/${lesson._id}`)
                          }
                          className="p-2 border border-[#26221C] text-[#8C8275] hover:text-[#E5A93C] hover:border-[#E5A93C]/40 transition-colors"
                          title="View Details"
                        >
                          <FiEye className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(lesson._id)}
                          className="p-2 border border-[#26221C] text-[#8C8275] hover:text-red-400 hover:border-red-500/30 transition-colors"
                          title="Remove from Saved"
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
