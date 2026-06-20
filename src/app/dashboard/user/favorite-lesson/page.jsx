'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiEye, FiBookmark, FiFilter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

export default function UserFavoritePage() {
  const router = useRouter();
  const { data: session, isPending: authLoading } = authClient.useSession();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTone, setSelectedTone] = useState('');

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
    } finally {
      setLoading(false);
    }
  }, [session, selectedCategory, selectedTone]);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
      return;
    }
    if (session) fetchFavorites();
  }, [authLoading, session, fetchFavorites, router]);

  const handleRemoveFavorite = async lessonId => {
    const currentUserId = session.user.id;
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

  if (authLoading || loading)
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center font-mono text-[#E5A93C]">
        SYNCING ARCHIVE...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="border-b border-[#1A1612] pb-5 flex justify-between items-center">
          <h1 className="text-3xl font-serif text-[#F4EFEA]">Saved Wisdom</h1>
          <div className="text-xs font-mono">
            <FiBookmark className="inline mb-1" /> {favorites.length} Preserved
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] p-4 flex gap-4">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-black border border-[#26221C] text-xs p-2 outline-none"
          >
            <option value="">All Categories</option>
            <option value="Personal Growth">Personal Growth</option>
            <option value="Career">Career</option>
            <option value="Mindset">Mindset</option>
          </select>
          <select
            value={selectedTone}
            onChange={e => setSelectedTone(e.target.value)}
            className="bg-black border border-[#26221C] text-xs p-2 outline-none"
          >
            <option value="">All Tones</option>
            <option value="Motivational">Motivational</option>
            <option value="Realization">Realization</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#0F0E0C] border border-[#1A1612]">
          <table className="w-full text-left">
            <thead className="bg-black text-[10px] uppercase font-mono text-[#8C8275]">
              <tr>
                <th className="p-4">Lesson</th>
                <th className="p-4">Category</th>
                <th className="p-4">Impact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1612]/60 text-sm">
              {favorites.map(lesson => (
                <tr key={lesson._id} className="hover:bg-black/40">
                  <td className="p-4 text-[#F4EFEA]">{lesson.title}</td>
                  <td className="p-4 font-mono text-[11px] text-[#E5A93C]">
                    {lesson.category}
                  </td>
                  <td className="p-4 font-mono text-xs text-[#8C8275]">
                    ❤️ {lesson.likesCount}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => router.push(`/lessons/${lesson._id}`)}
                      className="p-2 border border-[#26221C] hover:text-[#E5A93C]"
                    >
                      <FiEye size={14} />
                    </button>
                    <button
                      onClick={() => handleRemoveFavorite(lesson._id)}
                      className="p-2 border border-[#26221C] hover:text-red-400"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
