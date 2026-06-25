'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft,
  FiHeart,
  FiBookmark,
  FiAlertTriangle,
  FiEye,
  FiShare2,
  FiInfo,
  FiUser,
  FiSend,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import ReportModal from '@/components/ReportModal';

export default function PublicLessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // State Management
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');

  const currentUserId = useMemo(() => session?.user?.id || null, [session]);

  // Dynamic Logic: Calculation for reading time
  const readingTime = useMemo(() => {
    if (!lesson?.description) return 1;
    const words = lesson.description.split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [lesson]);

  // Static Views (as per requirement)
  const staticViews = useMemo(
    () => Math.floor(Math.random() * 8000) + 1500,
    [],
  );

  // Fetch Lesson Details
  useEffect(() => {
    if (!params?.id || isPending) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${params.id}?userId=${currentUserId || ''}`,
        );
        const data = await res.json();
        setLesson(data);
        setIsLiked(data.hasLiked);
        setIsFavorited(data.hasFavorited);
        setComments(data.comments || []);
      } catch (error) {
        toast.error('Connection to archives failed');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [params.id, currentUserId, isPending]);

  // Interaction: Like Logic
  const handleLike = async () => {
    if (!currentUserId) return router.push('/signin');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${lesson._id}/like`,
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
        likesCount: data.liked
          ? (prev.likesCount || 0) + 1
          : Math.max(0, (prev.likesCount || 0) - 1),
      }));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  // Interaction: Favorite Logic
  const handleFavorite = async () => {
    if (!currentUserId) return toast.error('Please login to save to favorites');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${lesson._id}/favorite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );
      const data = await res.json();
      setIsFavorited(data.favorited);
      setLesson(prev => ({
        ...prev,
        favoritesCount: data.favorited
          ? (prev.favoritesCount || 0) + 1
          : Math.max(0, prev.favoritesCount - 1),
      }));
      toast.success(data.message);
    } catch (err) {
      toast.error('Save action failed');
    }
  };

  // Interaction: Comment Logic
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${lesson._id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUserId,
            userName: session.user.name,
            text: newComment,
          }),
        },
      );
      const data = await res.json();
      setComments([data, ...comments]);
      setNewComment('');
      toast.success('Reflection posted');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  // Interaction: Report Logic
  const handleReport = async (selectedReason, details) => {
    if (!session?.user) return toast.error('Please login to report');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/${lesson._id}/report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            userEmail: session.user.email,
            reason: selectedReason,
            additionalDetails: details,
            lessonTitle: lesson.title,
            timestamp: new Date(),
          }),
        },
      );

      if (response.ok) {
        toast.success('Content flagged for moderator review');
        setShowReportModal(false);
      }
    } catch (err) {
      toast.error('Network failure');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0A0908] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#E5A93C]/20 border-t-[#E5A93C] rounded-full animate-spin"></div>
        <p className="text-[#E5A93C] font-mono text-xs uppercase tracking-widest text-center">
          Opening Archives...
        </p>
      </div>
    );

  if (!lesson)
    return (
      <div className="text-white text-center py-20 font-serif">
        Lesson entry not found in the collective archives.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0A0908] text-[#BAB0A3] pb-24"
    >
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#8C8275] hover:text-[#E5A93C] font-mono text-[10px] uppercase tracking-widest transition-all"
          >
            <FiArrowLeft /> Back to Library
          </button>
          <div className="flex gap-4">
            <span className="bg-blue-500/5 text-blue-400 border border-blue-500/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
              {lesson.category}
            </span>
            <span className="bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
              {lesson.emotionalTone}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            <h1 className="text-4xl md:text-6xl font-serif text-white leading-[1.1]">
              {lesson.title}
            </h1>

            {/* Featured Visual Section */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5">
              <img
                src={lesson.image}
                className="w-full aspect-video object-cover brightness-90 hover:scale-105 transition-all duration-1000"
                alt="Insight Visual"
              />
            </div>

            {/* Engagement Statistics */}
            <div className="grid grid-cols-3 bg-[#0F0E0C] border border-[#1A1612] p-8 rounded-xl shadow-inner group">
              <div className="flex flex-col items-center border-r border-[#1A1612]">
                <FiHeart
                  className="text-red-500 mb-2 fill-red-500/10"
                  size={24}
                />
                <p className="text-white font-bold text-3xl mb-1">
                  {lesson.likesCount >= 1000
                    ? (lesson.likesCount / 1000).toFixed(1) + 'k'
                    : lesson.likesCount || 0}
                </p>
                <p className="text-[9px] uppercase font-mono text-[#5C544A] tracking-widest">
                  Likes
                </p>
              </div>
              <div className="flex flex-col items-center border-r border-[#1A1612]">
                <FiBookmark
                  className="text-blue-500 mb-2 fill-blue-500/10"
                  size={24}
                />
                <p className="text-white font-bold text-3xl mb-1">
                  {lesson.favoritesCount || 0}
                </p>
                <p className="text-[9px] uppercase font-mono text-[#5C544A] tracking-widest">
                  Saves
                </p>
              </div>
              <div className="flex flex-col items-center">
                <FiEye className="text-emerald-500 mb-2" size={26} />
                <p className="text-white font-bold text-3xl mb-1">
                  {staticViews.toLocaleString()}
                </p>
                <p className="text-[9px] uppercase font-mono text-[#5C544A] tracking-widest">
                  Views
                </p>
              </div>
            </div>

            {/* Interactive Actions Bar */}
            <div className="flex flex-wrap items-center justify-between border-y border-[#1A1612] py-8">
              <div className="flex items-center gap-10">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] transition-all hover:text-white group"
                >
                  <FiHeart
                    className={
                      isLiked
                        ? 'text-red-500 fill-red-500 scale-125'
                        : 'group-hover:scale-110'
                    }
                    size={22}
                  />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button
                  onClick={handleFavorite}
                  className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] transition-all hover:text-white group"
                >
                  <FiBookmark
                    className={
                      isFavorited
                        ? 'text-[#E5A93C] fill-[#E5A93C] scale-125'
                        : 'group-hover:scale-110'
                    }
                    size={22}
                  />
                  <span>{isFavorited ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard');
                  }}
                  className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] hover:text-white transition-all"
                >
                  <FiShare2 size={20} /> Share
                </button>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 rounded-lg text-[10px] font-mono text-red-500 bg-red-500/5 hover:bg-red-500/20 transition-all uppercase tracking-[0.3em]"
              >
                <FiAlertTriangle /> Report
              </button>
            </div>

            {/* Main Content Body */}
            <div className="prose prose-invert max-w-none text-xl leading-[1.8] font-serif text-[#BAB0A3] space-y-8 first-letter:text-8xl first-letter:text-white first-letter:mr-4 first-letter:float-left first-letter:leading-none">
              {lesson.description}
              <blockquote className="border-l-4 border-[#E5A93C] pl-8 py-6 my-16 bg-[#1A1612]/30 italic text-white text-2xl font-serif">
                "Wisdom is the reward you get for a lifetime of listening when
                you would have rather talked."
              </blockquote>
            </div>

            {/* Discussion / Reflections Section */}
            <div className="space-y-16 mt-20">
              <h3 className="text-4xl font-serif text-white">
                Reflections ({comments.length})
              </h3>
              {currentUserId ? (
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full bg-[#1A1612] flex items-center justify-center border border-[#E5A93C]/20 flex-shrink-0">
                    <FiUser className="text-[#E5A93C] text-xl" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className="w-full bg-[#0F0E0C] border border-[#1A1612] p-6 text-white focus:border-[#E5A93C]/50 outline-none font-serif text-lg resize-none min-h-[160px] shadow-inner"
                      placeholder="Share your reflection on this life lesson..."
                    />
                    <button
                      onClick={handlePostComment}
                      className="bg-blue-600 text-white px-10 py-4 uppercase text-[10px] font-bold tracking-[0.2em] hover:bg-blue-700 flex items-center gap-3 transition-all"
                    >
                      <FiSend /> Post Reflection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0F0E0C] border border-dashed border-[#1A1612] p-12 text-center rounded-xl">
                  <p className="text-sm font-mono uppercase tracking-widest text-[#8C8275]">
                    Authentication Required. Please{' '}
                    <Link href="/signin" className="text-[#E5A93C] underline">
                      Sign In
                    </Link>{' '}
                    to share wisdom.
                  </p>
                </div>
              )}
              <div className="space-y-12">
                {comments.map((c, i) => (
                  <div
                    key={i}
                    className="flex gap-6 border-t border-[#1A1612] pt-12"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center text-sm font-bold border border-white/5">
                      {c.userName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-white font-bold">{c.userName}</h5>
                        <span className="text-[10px] font-mono text-[#5C544A] uppercase tracking-tighter">
                          {new Date(c.createdAt).toDateString()}
                        </span>
                      </div>
                      <p className="text-lg text-[#BAB0A3] leading-relaxed font-serif italic bg-[#1A1612]/10 p-6 rounded-sm">
                        "{c.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <aside className="lg:col-span-4 space-y-16">
            {/* Author Profile Information */}
            <div className="bg-[#0F0E0C] border border-[#1A1612] p-10 rounded-2xl shadow-xl sticky top-28">
              <div className="text-center mb-8">
                <img
                  src={lesson.author?.image}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-[#1A1612] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                  alt="Creator"
                />
                <h4 className="text-white font-bold text-2xl mt-4">
                  {lesson.author?.name}
                </h4>
                <p className="text-[10px] text-blue-400 uppercase font-mono tracking-[0.3em] mt-1">
                  Verified Insight Provider
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 border-y border-[#1A1612] py-8 mb-8 text-center text-white">
                <div>
                  <p className="font-bold text-2xl">
                    {lesson.author?.lessonsCount || 0}
                  </p>
                  <p className="text-[10px] text-[#5C544A] uppercase font-mono mt-1">
                    Archived Lessons
                  </p>
                </div>
                <div>
                  <p className="font-bold text-2xl">{lesson.likesCount}</p>
                  <p className="text-[10px] text-[#5C544A] uppercase font-mono mt-1">
                    Impact Score
                  </p>
                </div>
              </div>
              <Link
                href={`/author-profile/${lesson.author?.userId}`}
                className="block w-full border border-blue-500/30 text-blue-400 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                View Contributor Profile
              </Link>

              {/* Technical Logs / Metadata */}
              <div className="mt-16 space-y-6 pt-16 border-t border-[#1A1612] text-[11px] font-mono tracking-tighter">
                <h4 className="text-[11px] text-[#5C544A] font-mono uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <FiInfo /> Internal Records
                </h4>
                <div className="flex justify-between items-center mb-4">
                  <span>PUBLISHED DATE</span>
                  <span className="text-white">
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>READ VELOCITY</span>
                  <span className="text-white">{readingTime} MINS</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>STATUS</span>
                  <span className="text-[#E5A93C]">{lesson.visibility}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>HASH ID</span>
                  <span className="text-white font-bold">
                    {lesson._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Flagging / Reporting System Modal */}
      <AnimatePresence>
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
          reason={reportReason}
          setReason={setReportReason}
          lessonId={lesson._id}
        />
      </AnimatePresence>
    </motion.div>
  );
}
