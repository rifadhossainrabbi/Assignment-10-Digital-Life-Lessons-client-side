'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLock, FiEye, FiTag, FiBookOpen } from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/reusableApi';

export default function AuthorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;

  // State Management
  const [author, setAuthor] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch author profile + lessons
  useEffect(() => {
    if (!params?.id) return;

    const fetchAuthorData = async () => {
      try {
        setLoading(true);

        const data = await api.get(`/author-profile/${params.id}`);

        setAuthor(data);
        setLessons(data.lessons || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to establish connection to the archives');
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [params.id]);

  // Authentication check
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  // Helper to get initials
  const getInitials = name => {
    if (!name) return '??';

    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Loading UI
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
          className="flex items-center gap-2 text-[#5C544A] hover:text-[#E5A93C] transition-all text-xs hover:cursor-pointer font-mono uppercase tracking-widest mb-12"
        >
          <FiArrowLeft /> Return to Library
        </button>

        {/* --- AUTHOR IDENTITY HEADER --- */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] p-8 md:p-12 rounded-3xl mb-16 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden">
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#E5A93C]/5 blur-[100px] rounded-full"></div>

          {author?.image ? (
            <img
              src={author.image}
              className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-2 border-[#1A1612] grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl z-10"
              alt="Author Identity"
            />
          ) : (
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-[#1A1612] flex items-center justify-center border-2 border-[#E5A93C]/20 shadow-2xl z-10 text-4xl md:text-6xl font-serif text-[#E5A93C] uppercase">
              {getInitials(author?.name)}
            </div>
          )}

          <div className="text-center md:text-left flex-1 z-10">
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-2 leading-tight">
              {author?.name || 'Unknown Contributor'}
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
                  ALL LiKES
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- COLLECTION GRID --- */}
        <div className="mb-10 flex items-center gap-3">
          <FiBookOpen className="text-[#E5A93C] text-xl" />
          <h2 className="text-xl font-serif text-white uppercase tracking-widest">
            Published Lessons
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#1A1612] rounded-3xl bg-[#0F0E0C]">
              <FiBookOpen className="text-6xl text-[#E5A93C]/40 mb-6" />

              <h3 className="text-2xl font-serif text-white mb-2">
                No Lessons Added Yet
              </h3>

              <p className="text-[#8C8275] font-mono text-xs uppercase tracking-[0.25em] text-center">
                This contributor hasn't published any lessons yet.
              </p>
            </div>
          ) : (
            lessons.map(lesson => {
              const isLocked =
                lesson.accessLevel === 'Premium' &&
                currentUser?.plan !== 'premium';

              return (
                <motion.div
                  key={lesson._id}
                  whileHover={{ y: -6 }}
                  className={`bg-[#0F0E0C] border border-[#1A1612] rounded-2xl overflow-hidden flex flex-col h-full group transition-all duration-500 shadow-xl cursor-pointer ${
                    isLocked
                      ? 'hover:border-red-900/30'
                      : 'hover:border-[#E5A93C]/40'
                  }`}
                  onClick={() => {
                    if (isLocked) {
                      router.push('/pricing');
                    } else {
                      router.push(`/public-lessons/${lesson._id}`);
                    }
                  }}
                >
                  {/* Visual Asset Section */}
                  <div className="relative h-56 overflow-hidden bg-[#0A0908]">
                    <img
                      src={
                        lesson.image || 'https://via.placeholder.com/800x450'
                      }
                      className={`w-full h-full object-cover transition-transform duration-1000 ${
                        !isLocked
                          ? 'group-hover:scale-110 brightness-75'
                          : 'blur-3xl grayscale opacity-40'
                      }`}
                      alt="Lesson Asset"
                    />

                    <div className="absolute top-4 left-4">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded shadow-lg ${
                          lesson.accessLevel === 'Premium'
                            ? 'bg-[#E5A93C] text-black'
                            : 'bg-white/10 text-white backdrop-blur-md border border-white/10'
                        }`}
                      >
                        {lesson.accessLevel}
                      </span>
                    </div>

                    {isLocked && (
                      <div className="absolute inset-0 bg-[#0A0908]/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                        <FiLock className="text-[#E5A93C] text-3xl mb-3 animate-bounce" />
                        <p className="text-white font-serif text-sm font-bold uppercase tracking-widest">
                          Restricted Entry
                        </p>
                        <p className="text-[10px] text-[#E5A93C] mt-1 font-mono uppercase">
                          Upgrade to Read
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#8C8275] uppercase tracking-[0.25em] mb-4">
                      <FiTag className="text-[#E5A93C]" /> {lesson.category}
                    </div>

                    <h3
                      className={`text-xl font-serif text-white mb-4 line-clamp-2 leading-relaxed transition-colors group-hover:text-[#E5A93C] ${isLocked ? 'opacity-30' : ''}`}
                    >
                      {lesson.title}
                    </h3>

                    <p
                      className={`text-[#8C8275] text-sm font-serif italic mb-8 line-clamp-3 leading-relaxed flex-grow ${isLocked ? 'opacity-10' : ''}`}
                    >
                      "{lesson.description}"
                    </p>

                    <div className="mt-auto pt-6 border-t border-[#1A1612] flex items-center justify-between">
                      <span className="text-[9px] font-mono text-[#5C544A] uppercase tracking-widest">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </span>

                      {!isLocked ? (
                        <span className="flex items-center gap-2 text-[10px] font-black text-[#E5A93C] uppercase tracking-[0.2em] group-hover:text-white transition-all">
                          Read Entry <FiEye />
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-red-500 font-bold uppercase tracking-tighter">
                          Locked Archive
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
