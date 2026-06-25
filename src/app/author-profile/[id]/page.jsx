'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLock, FiEye, FiTag, FiBookOpen } from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';

export default function AuthorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user;

  // State Management
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all lessons created by this specific author
  useEffect(() => {
    if (!params?.id) return;
    const fetchAuthorData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/user/${params.id}`,
        );
        const data = await res.json();
        setLessons(data);
      } catch (error) {
        toast.error('Failed to establish connection to the archives');
      } finally {
        setLoading(false);
      }
    };
    fetchAuthorData();
  }, [params.id]);

  // 2. Extract author identity metadata from the first lesson object
  const authorInfo = useMemo(() => {
    return lessons.length > 0 ? lessons[0].author : null;
  }, [lessons]);

  // 3. Loading State UI
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center font-mono text-[#E5A93C] uppercase tracking-widest">
        Synchronizing Author Archives...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#BAB0A3] p-6 md:p-12 antialiased">
      <div className="max-w-7xl mx-auto">
        {/* Navigation: Return to previous directory */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#5C544A] hover:text-[#E5A93C] transition-all text-xs font-mono uppercase tracking-widest mb-12"
        >
          <FiArrowLeft /> Return to Library
        </button>

        {/* --- AUTHOR IDENTITY HEADER --- */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] p-8 md:p-12 rounded-3xl mb-16 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#E5A93C]/5 blur-[100px] rounded-full"></div>

          <img
            src={authorInfo?.image || 'https://via.placeholder.com/150'}
            className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-2 border-[#1A1612] grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl z-10"
            alt="Author Identity"
          />

          <div className="text-center md:text-left flex-1 z-10">
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-2 leading-tight">
              {authorInfo?.name}
            </h1>
            <p className="text-[#E5A93C] font-mono text-[10px] uppercase tracking-[0.5em] mb-8">
              Verified Insight Contributor
            </p>

            {/* Impact Statistics */}
            <div className="flex flex-wrap justify-center md:justify-start gap-12 border-t border-[#1A1612] pt-8">
              <div className="flex flex-col">
                <span className="text-white font-bold text-3xl">
                  {lessons.length}
                </span>
                <span className="text-[9px] uppercase font-mono text-[#5C544A] tracking-[0.2em] mt-1">
                  Shared Lessons
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-3xl">
                  {lessons.reduce(
                    (acc, curr) => acc + (curr.likesCount || 0),
                    0,
                  )}
                </span>
                <span className="text-[9px] uppercase font-mono text-[#5C544A] tracking-[0.2em] mt-1">
                  Wisdom Points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- COLLECTION GRID --- */}
        <div className="mb-10 flex items-center gap-3">
          <FiBookOpen className="text-[#E5A93C] text-xl" />
          <h2 className="text-xl font-serif text-white uppercase tracking-widest">
            Published Chronicles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.map(lesson => {
            // 4. Access Level Restriction Logic (Locked if Premium and User is Free)
            const isLocked =
              lesson.accessLevel === 'Premium' && !currentUser?.isPremium;

            return (
              <motion.div
                key={lesson._id}
                whileHover={!isLocked ? { y: -8 } : {}}
                className={`bg-[#0F0E0C] border border-[#1A1612] rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-500 shadow-xl ${
                  !isLocked
                    ? 'hover:border-[#E5A93C]/40 cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
                // 5. Navigate to dynamic lesson details page on click
                onClick={() =>
                  !isLocked && router.push(`/public-lessons/${lesson._id}`)
                }
              >
                {/* Visual Asset Section */}
                <div className="relative h-56 overflow-hidden bg-[#0A0908]">
                  <img
                    src={lesson.image || 'https://via.placeholder.com/800x450'}
                    className={`w-full h-full object-cover transition-transform duration-1000 ${!isLocked ? 'group-hover:scale-110 brightness-75' : 'blur-3xl grayscale'}`}
                    alt="Lesson Asset"
                  />

                  {/* Premium Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-[#0A0908]/50 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center">
                      <FiLock className="text-[#E5A93C] text-3xl mb-3 animate-pulse" />
                      <p className="text-white font-serif text-sm mb-4">
                        Premium Entry
                      </p>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          router.push('/pricing');
                        }}
                        className="bg-[#E5A93C] text-black text-[9px] px-5 py-2 font-black uppercase tracking-widest rounded-sm hover:bg-white transition-all shadow-lg"
                      >
                        Upgrade Account
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#8C8275] uppercase tracking-[0.25em] mb-4">
                    <FiTag className="text-[#E5A93C]" /> {lesson.category}
                  </div>

                  <h3
                    className={`text-xl font-serif text-white mb-4 line-clamp-2 leading-relaxed transition-colors group-hover:text-[#E5A93C] ${isLocked ? 'opacity-20' : ''}`}
                  >
                    {lesson.title}
                  </h3>

                  <p
                    className={`text-[#8C8275] text-sm font-serif italic mb-8 line-clamp-3 leading-relaxed flex-grow ${isLocked ? 'opacity-5' : ''}`}
                  >
                    "{lesson.description}"
                  </p>

                  {/* Metadata Footer */}
                  <div className="mt-auto pt-6 border-t border-[#1A1612] flex items-center justify-between">
                    <span className="text-[9px] font-mono text-[#5C544A] uppercase tracking-widest">
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>

                    {!isLocked ? (
                      <span className="flex items-center gap-2 text-[10px] font-black text-[#E5A93C] uppercase tracking-[0.2em] group-hover:text-white transition-all">
                        Read Entry <FiEye />
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-red-900/50 uppercase tracking-tighter">
                        Locked Archive
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
