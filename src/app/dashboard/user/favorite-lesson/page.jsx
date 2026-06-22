'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { redirect, useRouter } from 'next/navigation'; // redirect ইমপোর্ট করা হয়েছে
import { FiTrash2, FiEye, FiBookmark } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

export default function UserFavoritePage() {
  const router = useRouter(); // বাটন ক্লিকের নেভিগেশনের জন্য লাগবে
  const { data: session, isPending: authLoading } = authClient.useSession();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

  // ১. অথেনটিকেশন গার্ড (Redirect Logic)
  // লোডিং শেষ হওয়ার পর সেশন না থাকলে সরাসরি রিডাইরেক্ট করবে
  if (!authLoading && !session) {
    redirect('/signin');
  }

  const fetchFavorites = useCallback(async () => {
    if (!session?.user) return;
    const currentUserId = session.user.id;

    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_SERVER_URL}/favorites/${currentUserId}?`;
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedTone) url += `emotionalTone=${selectedTone}`;

      const res = await fetch(url);
      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load archive');
    } finally {
      setLoading(false);
    }
  }, [session, selectedCategory, selectedTone]);

  useEffect(() => {
    if (session) fetchFavorites();
  }, [session, fetchFavorites]);

  const handleRemoveFavorite = async lessonId => {
    const currentUserId = session?.user?.id;
    if (!window.confirm('Remove from favorites?')) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${lessonId}/favorite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );

      if (res.ok) {
        setFavorites(favorites.filter(fav => fav._id !== lessonId));
        toast.success('Removed from archive.');
      }
    } catch (error) {
      toast.error('Failed to remove.');
    }
  };

  // লোডিং স্টেট হ্যান্ডলিং
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center font-mono text-[#E5A93C]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-t-transparent border-[#E5A93C] rounded-full animate-spin"></div>
          <span>SYNCING ARCHIVE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#1A1612] pb-5 flex justify-between items-center">
          <h1 className="text-3xl font-serif text-[#F4EFEA]">Saved Wisdom</h1>
          <div className="text-xs font-mono text-[#8C8275] bg-[#0F0E0C] px-3 py-1 rounded-full border border-[#1A1612]">
            <FiBookmark className="inline mb-1 mr-1 text-[#E5A93C]" />{' '}
            {favorites.length} Preserved
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-[#8C8275] text-xs uppercase font-mono mr-2">
            Filter By:
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-black border border-[#26221C] text-xs p-2 outline-none focus:border-[#E5A93C] transition-colors"
          >
            <option value="">All Categories</option>
            <option value="Personal Growth">Personal Growth</option>
            <option value="Career">Career</option>
            <option value="Mindset">Mindset</option>
            <option value="Relationships">Relationships</option>
          </select>
          <select
            value={selectedTone}
            onChange={e => setSelectedTone(e.target.value)}
            className="bg-black border border-[#26221C] text-xs p-2 outline-none focus:border-[#E5A93C] transition-colors"
          >
            <option value="">All Tones</option>
            <option value="Motivational">Motivational</option>
            <option value="Realization">Realization</option>
            <option value="Gratitude">Gratitude</option>
          </select>

          {(selectedCategory || selectedTone) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedTone('');
              }}
              className="text-[10px] text-red-400/70 hover:text-red-400 uppercase font-mono"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Table / Content */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] overflow-hidden rounded-sm">
          {favorites.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/50 text-[10px] uppercase font-mono text-[#8C8275]">
                  <tr>
                    <th className="p-4 font-medium">Lesson Title</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Community Impact</th>
                    <th className="p-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1612]/60 text-sm">
                  {favorites.map(lesson => (
                    <tr
                      key={lesson._id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-4 text-[#F4EFEA] font-medium">
                        {lesson.title}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-[10px] text-[#E5A93C] bg-amber-500/5 px-2 py-0.5 border border-amber-500/10">
                          {lesson.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-[#8C8275]">
                        <span className="group-hover:text-red-400/80 transition-colors">
                          ❤️
                        </span>{' '}
                        {lesson.likesCount || 0}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/lessons/${lesson._id}`)
                            }
                            className="p-2 border border-[#26221C] text-[#8C8275] hover:text-[#E5A93C] hover:border-[#E5A93C]/30 transition-all"
                            title="View Details"
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(lesson._id)}
                            className="p-2 border border-[#26221C] text-[#8C8275] hover:text-red-400 hover:border-red-400/30 transition-all"
                            title="Remove"
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
          ) : (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <FiBookmark size={40} className="text-[#26221C]" />
              <p className="text-sm font-mono text-[#8C8275]">
                No wisdom preserved in this category yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

