'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation'; // Import for navigation
import { authClient } from '@/lib/auth-client';

const MostSavedLessons = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch top lessons on component mount or session change
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

  // Navigate to detail page if user is logged in
  const handleNavigateDetail = lessonId => {
    if (!session?.user) {
      toast.error('Please login to explore this wisdom!');
      return;
    }
    router.push(`/public-lessons/${lessonId}`);
  };

  // Handle bookmark toggle logic
  const handleToggleFavorite = async (e, lessonId) => {
    e.stopPropagation();

    if (!session?.user) return toast.error('Please login to save wisdom!');

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${lessonId}/favorite`,
        { userId: session.user.id },
      );

      // Optimistically update the UI state
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
      <div className="w-full h-64 flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-pulse text-[#d4af37] font-serif tracking-widest uppercase text-sm">
          Loading Wisdom...
        </div>
      </div>
    );

  return (
    <section className="bg-[#0a0a0a] w-full py-20 px-5 md:px-10 overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
              Top Rated Archives
            </span>
            <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight leading-none">
              Most Saved <span className="italic">Wisdom</span>
            </h2>
          </div>
          <div className="h-[1px] flex-1 bg-white/5 mx-8 hidden md:block mb-4"></div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleNavigateDetail(lesson._id)} 
              className="group relative bg-[#111] border border-white/5 rounded-[32px] overflow-hidden hover:border-[#d4af37]/30 transition-all duration-500 shadow-2xl cursor-pointer"
            >
              {/* Media Container */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={lesson.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={lesson.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-60" />

                {/* Floating Bookmark Button */}
                <button
                  onClick={e => handleToggleFavorite(e, lesson._id)}
                  className={`absolute top-5 right-5 p-3 rounded-2xl backdrop-blur-md transition-all duration-300 border z-20 ${
                    lesson.hasFavorited
                      ? 'bg-[#d4af37] border-[#d4af37] text-black scale-110'
                      : 'bg-black/40 border-white/10 text-white hover:bg-[#d4af37] hover:text-black'
                  }`}
                >
                  <Bookmark
                    size={20}
                    fill={lesson.hasFavorited ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* Card Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full">
                    {lesson.category}
                  </span>
                  <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    {lesson.favoritesCount || 0} Saves
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-serif text-[#e8e2d9] leading-snug group-hover:text-white transition-colors line-clamp-2">
                  {lesson.title}
                </h3>

                {/* Card Footer Indicator */}
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Read Wisdom
                  </span>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#d4af37] group-hover:border-[#d4af37] transition-all duration-300">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="group-hover:text-black text-white"
                    >
                      <path
                        d="M1 11L11 1M11 1H1M11 1V11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostSavedLessons;
