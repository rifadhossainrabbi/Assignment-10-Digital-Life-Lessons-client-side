'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiHeart,
  FiBookmark,
  FiAlertTriangle,
  FiClock,
  FiEye,
  FiLock,
  FiCalendar,
  FiShare2,
  FiPlus,
  FiSend,
  FiInfo,
  FiUser,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
// Optional: If you install react-share, you can use it here.
// For now, I will implement a "Copy Link" share.

export default function PublicLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');

  const currentUserId = useMemo(() => session?.user?.id || null, [session]);
  const isPremiumUser = useMemo(
    () => session?.user?.isPremium || false,
    [session],
  );

  // Reading Time Logic
  const readingTime = useMemo(() => {
    if (!lesson?.description) return 1;
    const words = lesson.description.split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [lesson]);

  useEffect(() => {
    if (!params?.id || isPending) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/lessons/${params.id}?userId=${currentUserId || ''}`,
        );
        const data = await res.json();
        setLesson(data);
        setIsLiked(data.hasLiked);
        setIsFavorited(data.hasFavorited);
        setComments(data.comments || []);
      } catch (error) {
        toast.error('Failed to fetch lesson details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [params.id, currentUserId, isPending]);

  const handleLike = async () => {
    if (!currentUserId) return router.push('/login');
    try {
      const res = await fetch(
        `http://localhost:5000/lessons/${lesson._id}/like`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );
      const data = await res.json();
      setIsLiked(data.liked);
      setLesson(prev => ({
        ...prev,
        likesCount: data.liked ? prev.likesCount + 1 : prev.likesCount - 1,
      }));
    } catch (err) {
      toast.error('Like interaction failed');
    }
  };

  const handleFavorite = async () => {
    if (!currentUserId) return toast.error('Please login to save');
    try {
      const res = await fetch(
        `http://localhost:5000/lessons/${lesson._id}/favorite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );
      const data = await res.json();
      setIsFavorited(data.favorited);
      toast.success(data.message);
    } catch (err) {
      toast.error('Save interaction failed');
    }
  };

  const shareLesson = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center text-[#E5A93C] font-mono animate-pulse">
        SYNCHRONIZING WISDOM...
      </div>
    );
  if (!lesson)
    return (
      <div className="text-center py-20 text-white font-mono">
        Archive entry not found.
      </div>
    );

  const isLocked = lesson.accessLevel === 'Premium' && !isPremiumUser;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0A0908] text-[#BAB0A3] pb-20 font-sans"
    >
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Navigation & Category */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-[#8C8275] hover:text-[#E5A93C] transition-all"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="flex gap-2">
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {lesson.category}
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {lesson.emotionalTone}
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight font-medium max-w-4xl">
            {lesson.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Article Column */}
          <div className="lg:col-span-8 space-y-10">
            <div className="relative group overflow-hidden rounded-sm">
              <img
                src={lesson.image}
                className={`w-full aspect-video object-cover transition-all duration-1000 ${isLocked ? 'blur-3xl grayscale' : 'brightness-75 group-hover:brightness-90'}`}
                alt="Featured"
              />

              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0908]/60 border border-[#E5A93C]/20 text-center">
                  <FiLock className="text-5xl text-[#E5A93C] mb-4" />
                  <h3 className="text-2xl font-serif text-white">
                    Premium Lesson
                  </h3>
                  <p className="text-sm text-[#8C8275] mb-8 max-w-xs px-4">
                    This personal growth insight is exclusive to Premium
                    members.
                  </p>
                  <Link
                    href="/pricing"
                    className="bg-[#E5A93C] text-black font-bold px-10 py-3 uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl"
                  >
                    Upgrade to View
                  </Link>
                </div>
              )}
            </div>

            {/* Content Logic */}
            <div
              className={`prose prose-invert max-w-none text-lg leading-relaxed font-serif text-[#BAB0A3] ${isLocked ? 'hidden' : 'block'}`}
            >
              <p className="first-letter:text-6xl first-letter:font-serif first-letter:text-white first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                {lesson.description}
              </p>
              <blockquote className="border-l-4 border-blue-500 bg-blue-500/5 p-8 italic my-12 text-white font-serif text-xl">
                "Focus is not the absence of distractions, but the presence of
                intent."
              </blockquote>
            </div>

            {/* Interactions Bar */}
            <div className="flex items-center justify-between border-y border-[#1A1612] py-8">
              <div className="flex items-center gap-8">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 group text-xs font-mono tracking-widest uppercase transition-all"
                >
                  <FiHeart
                    className={`text-xl ${isLiked ? 'fill-red-500 text-red-500' : 'group-hover:text-red-400'}`}
                  />
                  <span>{lesson.likesCount} Likes</span>
                </button>
                <button
                  onClick={handleFavorite}
                  className="flex items-center gap-2 group text-xs font-mono tracking-widest uppercase transition-all"
                >
                  <FiBookmark
                    className={`text-xl ${isFavorited ? 'fill-[#E5A93C] text-[#E5A93C]' : 'group-hover:text-[#E5A93C]'}`}
                  />
                  <span>{isFavorited ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={shareLesson}
                  className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase hover:text-white transition-all"
                >
                  <FiShare2 size={18} /> Share
                </button>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 text-[10px] font-mono text-red-900/50 hover:text-red-400 transition-all uppercase tracking-[0.2em]"
              >
                <FiAlertTriangle /> Report
              </button>
            </div>

            {/* Comments Section */}
            <div className="space-y-12">
              <h3 className="text-2xl font-serif text-white">
                Reflections ({comments.length})
              </h3>
              {currentUserId ? (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex-shrink-0 flex items-center justify-center">
                    <FiUser className="text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className="w-full bg-[#0F0E0C] border border-[#1A1612] p-5 text-white focus:border-blue-500 outline-none transition-all font-serif resize-none"
                      rows={3}
                      placeholder="Share your thoughts on this life lesson..."
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          toast.success('Reflection shared');
                          setNewComment('');
                        }}
                        className="bg-blue-600 text-white font-bold px-8 py-3 uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all"
                      >
                        Post Reflection
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0F0E0C] p-6 text-center border border-dashed border-[#1A1612]">
                  <p className="text-sm">
                    Please{' '}
                    <Link href="/login" className="text-[#E5A93C] underline">
                      Login
                    </Link>{' '}
                    to post a comment.
                  </p>
                </div>
              )}

              <div className="space-y-8">
                {comments.map(c => (
                  <div
                    key={c._id}
                    className="flex gap-5 border-t border-[#1A1612] pt-8"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.userName}`}
                      className="w-10 h-10 rounded-full bg-[#1A1612]"
                      alt="user"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-sm tracking-wide">
                          {c.userName}
                        </span>
                        <span className="text-[10px] text-[#5C544A] font-mono uppercase tracking-tighter">
                          Verified Reader
                        </span>
                      </div>
                      <p className="text-sm text-[#8C8275] leading-relaxed font-serif italic">
                        "{c.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <aside className="lg:col-span-4 space-y-12">
            {/* Author Section */}
            <div className="bg-[#0F0E0C] border border-[#1A1612] p-8 rounded-sm">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={lesson.author?.image}
                  className="w-14 h-14 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  alt="Author"
                  onError={e => {
                    e.target.src =
                      'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex';
                  }}
                />
                <div>
                  <h4 className="text-white font-bold text-sm">
                    {lesson.author?.name}
                  </h4>
                  <p className="text-[9px] text-blue-400 font-mono tracking-widest uppercase mt-1">
                    Contributor • Insight Hunter
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#8C8275] leading-relaxed mb-8 font-serif italic">
                Dedicated to preserving personal wisdom and mindful reflections
                for future generations.
              </p>

              <div className="grid grid-cols-2 gap-4 border-y border-[#1A1612] py-6 mb-8 text-center">
                <div>
                  <p className="text-white font-bold text-lg">
                    {lesson.author?.lessonsCount || 0}
                  </p>
                  <p className="text-[8px] text-[#5C544A] uppercase font-mono tracking-tighter">
                    Lessons Created
                  </p>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">
                    {lesson.likesCount}
                  </p>
                  <p className="text-[8px] text-[#5C544A] uppercase font-mono tracking-tighter">
                    Total Impact
                  </p>
                </div>
              </div>

              <Link
                href={`/profile/${lesson.author?.userId}`}
                className="block w-full bg-blue-600/5 border border-blue-600/30 text-blue-400 text-center font-bold py-3 uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all"
              >
                View All Lessons
              </Link>
            </div>

            {/* Lesson Metadata Block */}
            <div className="space-y-6">
              <h4 className="text-[11px] text-[#5C544A] font-mono tracking-[0.3em] uppercase border-b border-[#1A1612] pb-2 flex items-center gap-2">
                <FiInfo /> Metadata
              </h4>
              <div className="space-y-4 font-mono text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#5C544A]">CREATED</span>
                  <span className="text-[#BAB0A3]">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C544A]">LAST UPDATED</span>
                  <span className="text-[#BAB0A3]">
                    {lesson.updatedAt
                      ? new Date(lesson.updatedAt).toLocaleDateString()
                      : 'Original'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C544A]">VISIBILITY</span>
                  <span className="text-[#E5A93C] uppercase">
                    {lesson.visibility}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C544A]">READ TIME</span>
                  <span className="text-[#BAB0A3] uppercase">
                    {readingTime} MINS
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C544A]">ID REFERENCE</span>
                  <span className="text-[#BAB0A3]">
                    {lesson._id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Similar Lessons (Dynamic filter from backend recommended) */}
            <div className="space-y-6">
              <h4 className="text-[11px] text-[#5C544A] font-mono tracking-[0.3em] uppercase border-b border-[#1A1612] pb-2">
                Recommended Wisdom
              </h4>
              {lesson.recommendedLessons?.slice(0, 6).map((item, idx) => (
                <Link
                  href={`/lessons/${item._id}`}
                  key={idx}
                  className="block group"
                >
                  <div className="bg-[#0F0E0C]/40 border border-[#1A1612] p-5 hover:border-blue-500/50 transition-all">
                    <span className="text-[9px] text-emerald-400 font-mono uppercase mb-2 block">
                      {item.category}
                    </span>
                    <h5 className="text-white font-serif text-sm group-hover:text-white leading-snug transition-all">
                      {item.title}
                    </h5>
                  </div>
                </Link>
              ))}
            </div>

            {/* Newsletter Subscription (Visual Standalone) */}
            <div className="bg-gradient-to-br from-[#1D2029] to-[#0A0908] p-8 border border-blue-500/10">
              <h4 className="text-white font-bold text-sm mb-2">
                Preserve Your Wisdom
              </h4>
              <p className="text-xs text-[#8C8275] mb-6 leading-relaxed">
                Subscribe to get the week's most profound life lessons delivered
                to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  className="w-full bg-[#0A0908] border border-[#1A1612] p-3 text-white text-xs outline-none focus:border-blue-500 transition-all"
                  placeholder="Enter email"
                />
                <button className="w-full bg-[#F4EFEA] text-black font-bold py-3 uppercase text-[10px] tracking-widest hover:bg-[#E5A93C] transition-all">
                  Keep Me Updated
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Requirement: Report Modal with Dropdown Reason */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReportModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-[#0F0E0C] border border-[#1A1612] p-10 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-3">
                <FiAlertTriangle className="text-red-500" /> Flag Wisdom
              </h3>
              <p className="text-xs text-[#8C8275] mb-6 font-mono">
                Select a reason for reporting this content. Our admins will
                review it within 24 hours.
              </p>
              <div className="space-y-3">
                {[
                  'Inappropriate Content',
                  'Spam / Advertisement',
                  'Plagiarism / Copyright',
                  'Hate Speech',
                  'Other',
                ].map(r => (
                  <button
                    key={r}
                    onClick={() => setReportReason(r)}
                    className={`w-full text-left p-4 text-[10px] font-mono border transition-all ${reportReason === r ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-[#1A1612] text-[#5C544A] hover:border-blue-500/20'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-4 text-[10px] font-mono border border-[#1A1612] uppercase tracking-widest hover:text-white transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={() => {
                    toast.success('Flag Submitted');
                    setShowReportModal(false);
                  }}
                  className="flex-1 py-4 text-[10px] font-mono bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-all"
                >
                  Submit Flag
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
