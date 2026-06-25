'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';

const MostSavedLessons = () => {
  const { data: session } = authClient.useSession();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopLessons = async () => {
      try {
        const userId = session?.user?.id || '';
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/most-saved-lessons?userId=${userId}`,
        );
        setLessons(res.data);
      } catch (error) {
        console.error('Error fetching lessons', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopLessons();
  }, [session?.user?.id]);

  const handleToggleFavorite = async lessonId => {
    if (!session?.user) return toast.error('Please login to save wisdom!');

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${lessonId}/favorite`,
        { userId: session.user.id },
      );

      setLessons(prev =>
        prev.map(lesson =>
          lesson._id === lessonId
            ? {
                ...lesson,
                hasFavorited: res.data.favorited,
                favoritesCount: res.data.favorited
                  ? (lesson.favoritesCount || 0) + 1
                  : Math.max(0, (lesson.favoritesCount || 0) - 1),
              }
            : lesson,
        ),
      );
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading)
    return (
      <div className="text-center py-10 text-amber-200">Loading Wisdom...</div>
    );

  return (
    <section className="bg-[#12100e] container py-16 px-6 md:px-20 font-serif">
      <div className="mx-auto">
        <h2 className="text-4xl md:text-5xl text-[#e8e2d9] font-medium mb-10">
          Most Saved Wisdom
        </h2>
        <div className="flex flex-col gap-4">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-center justify-between bg-[#1c1815] p-5 rounded-xl border border-zinc-800/50"
            >
              <div className="flex items-center gap-6">
                <img
                  src={lesson.image}
                  className="w-24 h-16 rounded-lg object-cover"
                  alt=""
                />
                <div>
                  <p className="text-amber-500 text-xs font-sans uppercase">
                    {lesson.category} • {lesson.favoritesCount || 0} Saves
                  </p>
                  <h3 className="text-lg md:text-2xl text-[#e8e2d9]">
                    {lesson.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => handleToggleFavorite(lesson._id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full border text-sm transition-all
                  ${lesson.hasFavorited ? 'bg-amber-900/20 border-amber-800 text-amber-200' : 'border-zinc-700 text-zinc-300'}`}
              >
                <Bookmark
                  size={16}
                  fill={lesson.hasFavorited ? 'currentColor' : 'none'}
                />
                <span>{lesson.hasFavorited ? 'Saved' : 'Save'}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostSavedLessons;
