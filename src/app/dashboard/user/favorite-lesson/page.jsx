'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FiTrash2, FiEye, FiBookmark, FiFilter, FiInfo } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function UserFavoritePage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const router = useRouter();

  // --- State Management ---
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

  // --- Fetch Favorites with Filters ---
  const fetchFavorites = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      // Construct URL with query parameters for filtering
      let url = `${process.env.NEXT_PUBLIC_SERVER_URL}/favorites/${session.user.id}?`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedTone) url += `emotionalTone=${selectedTone}`;

      const res = await fetch(url);
      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error('Archive Sync Error:', error);
      toast.error('Failed to sync archives');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, selectedCategory, selectedTone]);

  useEffect(() => {
    if (session) fetchFavorites();
  }, [session, fetchFavorites]);

  // --- Action: Remove Favorite ---
  const handleRemoveFavorite = async lessonId => {
    if (
      !window.confirm(
        'Are you sure you want to remove this wisdom from your preserved collection?',
      )
    )
      return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${lessonId}/favorite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id }),
        },
      );

      if (res.ok) {
        // Optimistic UI update
        setFavorites(prev => prev.filter(fav => fav._id !== lessonId));
        toast.success('Removed from archive');
      } else {
        toast.error('Action failed');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  // --- Loading State ---
  if (authLoading || loading)
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E5A93C]/10 border-t-[#E5A93C] rounded-full animate-spin"></div>
          <p className="text-[#E5A93C] font-mono text-[10px] tracking-[0.3em] uppercase">
            Syncing Archive...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#1A1612] pb-8 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif text-[#F4EFEA] tracking-tight">
              Saved Wisdom
            </h1>
            <p className="text-xs font-mono text-[#8C8275] uppercase tracking-[0.2em] flex items-center gap-2">
              <FiBookmark className="text-[#E5A93C]" /> {favorites.length}{' '}
              Entries Preserved in Collective Archive
            </p>
          </div>

          {/* --- Filtering Controls --- */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-[#0F0E0C] border border-[#1A1612] px-3 py-1 rounded-sm">
              <FiFilter className="text-[#8C8275] text-xs" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent text-[11px] font-mono outline-none text-[#E5A93C] cursor-pointer uppercase tracking-widest"
              >
                <option value="">All Categories</option>
                <option value="Personal Growth">Personal Growth</option>
                <option value="Career">Career</option>
                <option value="Mindset">Mindset</option>
                <option value="Relationships">Relationships</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#0F0E0C] border border-[#1A1612] px-3 py-1 rounded-sm">
              <select
                value={selectedTone}
                onChange={e => setSelectedTone(e.target.value)}
                className="bg-transparent text-[11px] font-mono outline-none text-[#E5A93C] cursor-pointer uppercase tracking-widest"
              >
                <option value="">All Tones</option>
                <option value="Motivational">Motivational</option>
                <option value="Sad">Sad</option>
                <option value="Realization">Realization</option>
                <option value="Gratitude">Gratitude</option>
              </select>
            </div>

            {(selectedCategory || selectedTone) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedTone('');
                }}
                className="text-[10px] font-mono text-red-500/70 hover:text-red-500 underline underline-offset-4"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* --- Main Table Content --- */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] rounded-sm overflow-hidden shadow-2xl">
          {favorites.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-black/40 text-[10px] uppercase font-mono text-[#8C8275] tracking-[0.2em] border-b border-[#1A1612]">
                  <tr>
                    <th className="p-6 font-medium">Preview</th>
                    <th className="p-6 font-medium">Wisdom Entry</th>
                    <th className="p-6 font-medium">Classification</th>
                    <th className="p-6 font-medium">Community Impact</th>
                    <th className="p-6 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1612]/40">
                  {favorites.map(lesson => (
                    <tr
                      key={lesson._id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Image Preview */}
                      <td className="p-6">
                        <div className="w-16 h-12 rounded bg-zinc-900 overflow-hidden border border-[#26221C]">
                          <img
                            src={
                              lesson.image || 'https://via.placeholder.com/150'
                            }
                            alt="thumb"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                          />
                        </div>
                      </td>

                      {/* Title */}
                      <td className="p-6">
                        <h3 className="text-[#F4EFEA] font-serif text-base line-clamp-1 group-hover:text-[#E5A93C] transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-[10px] font-mono text-[#5C544A] mt-1 uppercase">
                          Ref: {lesson._id.slice(-6).toUpperCase()}
                        </p>
                      </td>

                      {/* Classification Tags */}
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-mono text-[#E5A93C] bg-[#E5A93C]/5 border border-[#E5A93C]/10 px-2 py-0.5 w-fit rounded-sm">
                            {lesson.category}
                          </span>
                          <span className="text-[9px] font-mono text-[#8C8275] uppercase tracking-tighter">
                            Tone: {lesson.emotionalTone}
                          </span>
                        </div>
                      </td>

                      {/* Impact Score */}
                      <td className="p-6">
                        <div className="flex items-center gap-2 font-mono text-xs text-[#8C8275]">
                          <span className="text-red-500/60">❤️</span>{' '}
                          {lesson.likesCount || 0}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-6">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() =>
                              router.push(`/public-lessons/${lesson._id}`)
                            }
                            className="p-2.5 bg-black/40 border border-[#26221C] text-[#8C8275] hover:text-[#E5A93C] hover:border-[#E5A93C]/40 transition-all rounded-sm"
                            title="Examine Details"
                          >
                            <FiEye size={15} />
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(lesson._id)}
                            className="p-2.5 bg-black/40 border border-[#26221C] text-[#8C8275] hover:text-red-500 hover:border-red-500/40 transition-all rounded-sm"
                            title="Discard from Archive"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="py-32 px-10 text-center flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-[#0A0908] border border-[#1A1612] rounded-full flex items-center justify-center">
                <FiInfo className="text-[#5C544A] text-2xl" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-serif italic text-[#8C8275]">
                  "Silence in the archive."
                </p>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5C544A]">
                  No preserved wisdom matches your current criteria.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
