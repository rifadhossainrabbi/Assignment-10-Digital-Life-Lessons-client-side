'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiHeart,
  FiShare2,
  FiBookmark,
  FiAlertTriangle,
  FiClock,
  FiEye,
  FiLock,
  FiUser,
  FiCalendar,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function PublicLessonDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [viewsCount] = useState(Math.floor(Math.random() * 10000));

  const { data: session, isPending } = authClient.useSession();

  // useMemo ব্যবহার করে অবজেক্ট রেফারেন্স লুপ হওয়া বন্ধ করা হলো
  const currentUserId = useMemo(() => session?.user?.id || null, [session]);
  const isPremiumUser = useMemo(
    () => session?.user?.isPremium || false,
    [session],
  );

  useEffect(() => {
    if (!params || !params.id) return;
    if (isPending) return;

    const fetchSingleLesson = async () => {
      try {
        setLoading(true);
        const userIdParam = currentUserId ? `?userId=${currentUserId}` : '';
        const res = await fetch(
          `http://localhost:5000/lessons/${params.id}${userIdParam}`,
        );
        if (!res.ok) throw new Error('Network error pulling source');
        const data = await res.json();

        setLesson(data);
        setIsLiked(data.hasLiked || false);
        setIsFavorited(data.hasFavorited || false);

        setComments([
          {
            _id: 'c1',
            userName: 'Julian Dreyer',
            text: 'The point about the dichotomy of control really resonated. Applying this to my corporate role has changed my stress levels significantly.',
            createdAt: new Date(),
          },
          {
            _id: 'c2',
            userName: 'Mia Elwing',
            text: 'Premeditatio Malorum is hard to practice but incredibly effective. Thank you for this clear breakdown.',
            createdAt: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Error fetching lesson details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleLesson();
  }, [params.id, currentUserId, isPending]);

  const handleLikeToggle = async () => {
    if (!currentUserId) {
      toast.error('Please log in to like this lesson');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/lessons/${lesson._id}/like`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLesson(prev => ({
          ...prev,
          likesCount: data.liked
            ? (prev.likesCount || 0) + 1
            : Math.max(0, (prev.likesCount || 0) - 1),
        }));
        toast.success(data.message || 'Updated likes');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not process like interaction.');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!currentUserId) {
      toast.error('Please log in to save favorites');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/lessons/${lesson._id}/favorite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.favorited);
        setLesson(prev => ({
          ...prev,
          favoritesCount: data.favorited
            ? (prev.favoritesCount || 0) + 1
            : Math.max(0, (prev.favoritesCount || 0) - 1),
        }));
        toast.success(data.message || 'Updated favorites');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not process favorite interaction.');
    }
  };

  const handleReportSubmit = e => {
    e.preventDefault();
    toast.success('Lesson reported successfully.');
    setShowReportModal(false);
  };

  const handleCommentSubmit = e => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const addedComment = {
      _id: Date.now().toString(),
      userName: session?.user?.name || 'Current User',
      text: newComment,
      createdAt: new Date(),
    };

    setComments([addedComment, ...comments]);
    setNewComment('');
    toast.success('Reflection posted successfully!');
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center font-mono text-[#E5A93C]">
        Loading Digital Wisdom Matrix...
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex flex-col items-center justify-center font-mono text-[#E5A93C] gap-4">
        <p>The requested life lesson could not be retrieved.</p>
        <button
          onClick={() => router.back()}
          className="text-sm underline text-[#D1C7BD] hover:text-[#E5A93C]"
        >
          Return to Public Lessons
        </button>
      </div>
    );
  }

  const isBlurLocked = lesson.accessLevel === 'Premium' && !isPremiumUser;

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] font-sans antialiased selection:bg-[#E5A93C] selection:text-black">
      {/* HERO BANNER SECTION */}
      <div className="relative w-full border-b border-[#1A1612] bg-[#0F0E0C]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[#1A1612]/50">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#8C8275] hover:text-[#E5A93C] transition-colors uppercase"
          >
            <FiArrowLeft className="text-xs" /> BACK TO ARCHIVE
          </button>
          <div className="text-[10px] font-mono text-[#E5A93C] tracking-[0.25em] uppercase">
            CATEGORY // {lesson.category || 'PHILOSOPHY'}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 pt-14 pb-12 text-center md:text-left space-y-4">
          <div className="flex justify-center md:justify-start gap-2">
            <span className="text-[9px] font-mono uppercase tracking-widest bg-[#1A150E] border border-[#E5A93C]/30 px-2.5 py-1 text-[#E5A93C]">
              {lesson.category || 'Philosophy'}
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest bg-[#141311] border border-[#26221C] px-2.5 py-1 text-[#8C8275]">
              {lesson.emotionalTone || 'Mindset'}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-[#F4EFEA] leading-[1.15] tracking-wide font-normal max-w-3xl">
            {lesson.title}
          </h1>
          <p className="text-sm font-serif italic text-[#8C8275] font-light max-w-xl">
            {lesson.subtitle ||
              'Understanding why the most profound lessons are often found in the spaces between the noise.'}
          </p>
        </div>
      </div>

      {/* CORE TWO-COLUMN CONTENT LAYOUT */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-10">
          <div className="w-full aspect-[16/10] max-h-[480px] overflow-hidden border border-[#1A1612] bg-[#000000] flex items-center justify-center">
            <img
              src={
                lesson.image ||
                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200'
              }
              alt={lesson.title}
              className="w-full h-full object-contain"
            />
          </div>

          <div className={`relative ${isBlurLocked ? 'p-1' : ''}`}>
            <div
              className={`prose prose-invert max-w-none text-[15px] text-[#BAB0A3] leading-relaxed space-y-6 font-serif ${isBlurLocked ? 'blur-lg select-none pointer-events-none max-h-56 overflow-hidden' : ''}`}
            >
              <blockquote className="border-l-0 pl-0 font-serif text-lg text-[#E5A93C] italic my-6 text-center md:text-left md:max-w-xl">
                "The happiness of your life depends upon the quality of your
                thoughts." — Marcus Aurelius
              </blockquote>
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:text-[#E5A93C] first-letter:mr-3 first-letter:float-left first-letter:font-normal">
                {lesson.description ||
                  'Silence is not merely the absence of sound, but the presence of focus...'}
              </p>
            </div>

            {isBlurLocked && (
              <div className="absolute inset-0 bg-[#0A0908]/85 flex flex-col items-center justify-center text-center p-8 border border-[#E5A93C]/20">
                <FiLock className="text-[#E5A93C] text-3xl mb-3" />
                <h4 className="font-serif text-lg text-[#F4EFEA] tracking-wider uppercase">
                  Expand Your Mind
                </h4>
                <Link
                  href="/pricing"
                  className="bg-[#E5A93C] text-black text-xs px-8 py-3 font-mono uppercase tracking-widest hover:bg-[#D4982B] transition-all font-semibold mt-4"
                >
                  Unlock Premium
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#1A1612]">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLikeToggle}
                className={`flex items-center gap-2 px-4 py-2 text-[11px] font-mono tracking-wider border transition-colors ${isLiked ? 'bg-[#E5A93C] text-black border-[#E5A93C]' : 'border-[#1A1612] hover:border-[#E5A93C]/40 text-[#D1C7BD]'}`}
              >
                <FiHeart className={isLiked ? 'fill-current' : ''} />{' '}
                {lesson.likesCount || 0} LIKES
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`flex items-center gap-2 px-4 py-2 text-[11px] font-mono tracking-wider border transition-colors ${isFavorited ? 'bg-[#E5A93C] text-black border-[#E5A93C]' : 'border-[#1A1612] hover:border-[#E5A93C]/40 text-[#D1C7BD]'}`}
              >
                <FiBookmark className={isFavorited ? 'fill-current' : ''} />{' '}
                {isFavorited ? 'SAVED' : 'SAVE LESSON'}
              </button>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 text-[10px] font-mono text-[#8C8275] hover:text-red-400 transition-colors tracking-widest"
            >
              <FiAlertTriangle /> REPORT
            </button>
          </div>

          {/* COMMENTS */}
          <div className="space-y-6 pt-4">
            <h3 className="font-serif text-lg text-[#F4EFEA] tracking-wide border-b border-[#1A1612] pb-3 font-medium">
              Wisdom Exchange ({comments.length})
            </h3>
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your reflection on this life lesson..."
                rows={3}
                className="w-full bg-[#0F0E0C] border border-[#1A1612] p-4 text-sm text-[#F4EFEA] focus:outline-none focus:border-[#E5A93C]/50 resize-none font-serif placeholder-[#5C544A]"
              />
              <button
                type="submit"
                className="bg-[#1A1612] border border-[#26221C] text-[#E5A93C] px-6 py-2.5 text-[11px] font-mono tracking-widest hover:bg-[#E5A93C] hover:text-black transition-all font-bold uppercase"
              >
                Post Reflection
              </button>
            </form>

            <div className="space-y-4">
              {comments.map(comment => (
                <div
                  key={comment._id}
                  className="bg-[#0F0E0C] border border-[#1A1612] p-5 space-y-3"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-[#8C8275]">
                    <span className="text-[#E5A93C] font-semibold uppercase">
                      {comment.userName}
                    </span>
                    <span>4 HOURS AGO</span>
                  </div>
                  <p className="text-xs text-[#BAB0A3] font-serif leading-relaxed font-light pl-4 border-l border-[#26221C]">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="bg-[#0F0E0C] border border-[#1A1612] p-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <img
                src={
                  lesson.author?.image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'
                }
                alt={lesson.author?.name || 'Dr. Elias Thorne'}
                className="w-12 h-12 rounded-full border border-[#26221C] grayscale object-cover"
              />
              <div>
                <h4 className="font-serif text-md text-[#F4EFEA] font-medium">
                  {lesson.author?.name || 'Anonymous Mentor'}
                </h4>
                <span className="text-[9px] font-mono text-[#E5A93C] uppercase tracking-widest block mt-0.5">
                  AUTHOR // CONTRIBUTOR
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-[#1A1612]/60 pt-4 mb-5 text-center">
              <div>
                <div className="text-sm font-serif text-[#F4EFEA]">
                  {lesson.author?.lessonsCount ?? 0}
                </div>
                <div className="text-[8px] font-mono text-[#8C8275] tracking-widest uppercase">
                  Lessons Published
                </div>
              </div>
              <div>
                <div className="text-sm font-serif text-[#F4EFEA]">
                  {lesson.favoritesCount || 0}
                </div>
                <div className="text-[8px] font-mono text-[#8C8275] tracking-widest uppercase">
                  Total Saves
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F0E0C] border border-[#1A1612] p-5 space-y-3.5 text-xs font-mono text-[#8C8275]">
            <span className="text-[9px] uppercase tracking-widest block border-b border-[#1A1612] pb-2 text-[#5C544A]">
              // METADATA
            </span>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <FiCalendar /> Created:
              </span>
              <span className="text-[#D1C7BD]">
                {lesson.createdAt
                  ? new Date(lesson.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <FiClock /> Reading Time:
              </span>
              <span className="text-[#D1C7BD]">5 mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5">
                <FiEye /> Views:
              </span>
              <span className="text-[#D1C7BD]">
                {viewsCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F0E0C] border border-[#1A1612] max-w-sm w-full p-6 space-y-4">
            <h3 className="font-serif text-md text-[#F4EFEA] flex items-center gap-2 font-medium uppercase tracking-wide">
              <FiAlertTriangle className="text-red-400" /> Report Lesson
            </h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <select
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                className="w-full bg-black border border-[#1A1612] p-2.5 text-xs text-[#D1C7BD] font-mono focus:outline-none focus:border-[#E5A93C]"
              >
                <option value="Inappropriate Content">
                  Inappropriate Content
                </option>
                <option value="Plagiarism / Copy">Plagiarism / Copy</option>
                <option value="Other">Other Reason</option>
              </select>
              <div className="flex justify-end gap-3 text-[11px] font-mono tracking-wider">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-[#8C8275] hover:text-[#F4EFEA]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-1.5 hover:bg-red-500 hover:text-black transition-colors font-bold"
                >
                  SUBMIT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
