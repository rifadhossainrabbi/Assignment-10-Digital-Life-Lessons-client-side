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
  FiTag,
  FiCopy,
  FiDownload, // PDF icon er jonno
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import ReportModal from '@/components/ReportModal';
import { api } from '@/lib/reusableApi';
import { jsPDF } from 'jspdf'; // Official jspdf import standard follow kora holo

// Professional Social Sharing Components
import {
  FacebookShareButton,
  LinkedinShareButton,
  XShareButton,
  FacebookIcon,
  XIcon,
  LinkedinIcon,
} from 'react-share';

export default function PublicLessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, isPending } = authClient.useSession();
  console.log(session, 'session');

  // State management
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [similarLessons, setSimilarLessons] = useState([]);

  const [showShareOptions, setShowShareOptions] = useState(false);

  const shareUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/public-lessons/${params.id}`;

  const currentUserId = useMemo(() => session?.user?.id || null, [session]);

  // Image URL theke base64 format a convert korar function
  const loadImageAsBase64 = url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous'); // CORS jhamela thik korbe
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg')); // JPEG format a return korbe
      };
      img.onerror = err => reject(err);
      img.src = url;
    });
  };

  // pdf download logic
  const exportToPDF = async () => {
    if (!lesson) return;

    // Premium Check: Free user premium wisdom download korte parbe na
    const isLocked =
      lesson.accessLevel === 'Premium' && session?.user?.plan !== 'premium';
    if (isLocked) {
      toast.error('Please go to Upgrade and buy premium for download!');
      return;
    }

    const loadToast = toast.loading('Generating Wisdom PDF with Visuals...');

    try {
      const doc = new jsPDF(); // official standard instantiation

      // 1. Text styling (Title)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0); // black color theme
      doc.text(lesson.title, 20, 25);

      // 2. Image process (Jodi image thake)
      let currentY = 35;
      if (lesson.image) {
        try {
          const imgData = await loadImageAsBase64(lesson.image);
          // doc.addImage(imageData, format, x, y, width, height)
          doc.addImage(imgData, 'JPEG', 20, currentY, 170, 95);
          currentY += 105; // Image er porer content ektu niche nambe
        } catch (err) {
          console.error('Image PDF a add hoite pare nai, skip kora holo.');
        }
      }

      // 3. Metadata (Category & Author)
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Category: ${lesson.category} | EmotionalTone: ${
          lesson.emotionalTone
        } | Contributor: ${lesson.author?.name}`,
        20,
        currentY,
      );

      doc.setDrawColor(229, 169, 60);
      doc.line(20, currentY + 5, 190, currentY + 5); // Divider line

      // 4. Main Description (Text wrapping)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(40, 40, 40);

      // text ke page er width onujayi wrap korlam
      const splitText = doc.splitTextToSize(lesson.description, 170);
      doc.text(splitText, 20, currentY + 15);

      // 5. Footer
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.text(
        `Sanctuary: Digital Life Lessons | Date: ${new Date().toLocaleDateString()}`,
        20,
        285,
      );

      // doc.save() diye download trigger hobe
      // lesson.title.replace(/\s+/g, '_' underscore diya title replace kora hoyse jemon How_To_Be_Successful_Archive.pdf
      doc.save(`${lesson.title.replace(/\s+/g, '_')}_Archive.pdf`);
      toast.success('Wisdom archived as PDF!', { id: loadToast });
    } catch (error) {
      console.error(error);
      toast.error('An Error Occured!', {
        id: loadToast,
      });
    }
  };

  const readingTime = useMemo(() => {
    if (!lesson?.description) return 1;
    const words = lesson.description.split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [lesson]);

  const staticViews = useMemo(
    () => Math.floor(Math.random() * 8000) + 1500,
    [],
  );

  useEffect(() => {
    if (!params?.id || isPending) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await api.get(
          `/lessons/${params.id}?userId=${currentUserId || ''}`,
        );

        setLesson(data);
        setIsLiked(data.hasLiked);
        setIsFavorited(data.hasFavorited);
        setComments(data.comments || []);
      } catch (error) {
        toast.error(error.message || 'Connection to archives failed');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [params.id, currentUserId, isPending]);
  console.log(lesson, 'lesson data');

  useEffect(() => {
    if (!params?.id) return;
    const fetchSimilar = async () => {
      try {
        const data = await api.get(`/lessons/${params.id}/similar`);
        setSimilarLessons(data);
      } catch (error) {
        console.error('Similar lessons fetch failed:', error.message);
      }
    };
    fetchSimilar();
  }, [params.id]);

  // handle like
  const handleLike = async () => {
    if (!currentUserId) return router.push('/signin');
    try {
      const data = await api.post(`/lessons/${lesson._id}/like`, {
        userId: currentUserId,
      });

      setIsLiked(data.liked);
      setLesson(prev => ({
        ...prev,
        likesCount: data.liked
          ? (prev.likesCount || 0) + 1
          : Math.max(0, (prev.likesCount || 0) - 1),
      }));
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  // handel favourite
  const handleFavorite = async () => {
    if (!currentUserId) return toast.error('Please login to save to favorites');
    try {
      const data = await api.post(`/lessons/${lesson._id}/favorite`, {
        userId: currentUserId,
      });

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

  // handle comment
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const data = await api.post(`/lessons/${lesson._id}/comments`, {
        userId: currentUserId,
        userName: session.user.name,
        text: newComment,
      });

      setComments([data, ...comments]);
      setNewComment('');
      toast.success('Reflection posted');
    } catch (err) {
      toast.error(err.message || 'Failed to post reflection');
    }
  };

  // handle report
  const handleReport = async (selectedReason, details) => {
    if (!session?.user) return toast.error('Please login to report');

    try {
      await api.post(`/lessons/${lesson._id}/report`, {
        userId: session.user.id,
        userEmail: session.user.email,
        reason: selectedReason,
        additionalDetails: details,
        lessonTitle: lesson.title,
        timestamp: new Date(),
      });

      toast.success('Content flagged for moderator review');
      setShowReportModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
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
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* top header action buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#8C8275] hover:text-[#E5A93C] font-mono text-[10px] uppercase tracking-widest transition-all"
          >
            <FiArrowLeft /> Back to Library
          </button>

          {/* pdf download button */}
          <button
            onClick={exportToPDF}
            className="bg-[#E5A93C] text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl shadow-amber-900/10 w-full md:w-auto"
          >
            <FiDownload size={16} /> Export as PDF
          </button>
        </div>

        {/* category and emotional tone */}
        <div className="flex gap-4 mb-6">
          <span className="bg-blue-500/5 text-blue-400 border border-blue-500/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
            {lesson.category}
          </span>
          <span className="bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
            {lesson.emotionalTone}
          </span>
        </div>

        {/* main div */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            {/* lesson title */}
            <h1 className="text-4xl md:text-6xl font-serif text-white leading-[1.1]">
              {lesson.title}
            </h1>

            {/* lesson image and stats */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5">
              <img
                src={lesson.image}
                className="w-full aspect-video object-cover brightness-90 hover:scale-105 transition-all duration-1000"
                alt="Insight Visual"
              />
            </div>

            {/* lesson stats */}
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

            {/* lessons actions buttons */}
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

                <div className="relative">
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] hover:text-white transition-all group"
                  >
                    <FiShare2
                      size={20}
                      className={
                        showShareOptions
                          ? 'text-[#E5A93C]'
                          : 'group-hover:scale-110'
                      }
                    />
                    <span>Share</span>
                  </button>

                  {/* share options */}
                  <AnimatePresence>
                    {showShareOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.9 }}
                        className="absolute bottom-full left-0 mb-6 bg-[#0F0E0C] border border-[#1A1612] p-5 rounded-[24px] shadow-2xl flex items-center gap-6 z-50 min-w-max"
                      >
                        <FacebookShareButton
                          url={shareUrl}
                          quote={lesson?.title}
                        >
                          <FacebookIcon
                            size={38}
                            round
                            className="hover:scale-110 transition-transform shadow-lg"
                          />
                        </FacebookShareButton>

                        <XShareButton url={shareUrl} title={lesson?.title}>
                          <XIcon
                            size={38}
                            round
                            className="hover:scale-110 transition-transform shadow-lg"
                          />
                        </XShareButton>

                        <LinkedinShareButton
                          url={shareUrl}
                          title={lesson?.title}
                          source="Digital Life Lessons"
                        >
                          <LinkedinIcon
                            size={38}
                            round
                            className="hover:scale-110 transition-transform shadow-lg"
                          />
                        </LinkedinShareButton>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            toast.success('Archive URL copied');
                            setShowShareOptions(false);
                          }}
                          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#BAB0A3] hover:text-[#E5A93C] hover:bg-white/10 transition-all"
                          title="Copy Link"
                        >
                          <FiCopy size={18} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 rounded-lg text-[10px] font-mono text-red-500 bg-red-500/5 hover:bg-red-500/20 transition-all uppercase tracking-[0.3em]"
              >
                <FiAlertTriangle /> Report
              </button>
            </div>

            {/* lesson description */}
            <div className="prose prose-invert max-w-none text-xl leading-[1.8] font-serif text-[#BAB0A3] space-y-8 first-letter:text-8xl first-letter:text-white first-letter:mr-4 first-letter:float-left first-letter:leading-none">
              {lesson.description}
            </div>

            {/* lesson comments */}
            <div className="space-y-16 mt-20">
              <h3 className="text-4xl font-serif text-white">
                Comments ({comments.length})
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
                      <FiSend /> Post Comment
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
                          {new Date(c.createdAt).toDateString('en-GB')}
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

            {/* similar lesson */}
            {similarLessons.length > 0 && (
              <div className="mt-24 pt-16 border-t border-[#1A1612]">
                <div className="mb-10">
                  <span className="text-[#E5A93C] font-mono text-xs uppercase tracking-[0.3em] mb-2 block">
                    You May Also Like
                  </span>
                  <h3 className="text-3xl font-serif text-white">
                    Similar Wisdom
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarLessons.map(similar => {
                    const isLocked =
                      similar.accessLevel === 'Premium' &&
                      session?.user?.plan !== 'premium';

                    return (
                      <motion.div
                        key={similar._id}
                        whileHover={{ y: -5 }}
                        onClick={() => {
                          if (isLocked) {
                            router.push('/pricing');
                          } else {
                            router.push(`/public-lessons/${similar._id}`);
                          }
                        }}
                        className="bg-[#0F0E0C] border border-[#1A1612] rounded-2xl overflow-hidden group cursor-pointer hover:border-[#E5A93C]/30 transition-all duration-500 shadow-xl"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={
                              similar.image ||
                              'https://via.placeholder.com/800x450'
                            }
                            alt={similar.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ${
                              !isLocked
                                ? 'group-hover:scale-110 brightness-75'
                                : 'blur-2xl grayscale opacity-40'
                            }`}
                          />
                          <div className="absolute top-3 left-3">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-1 rounded shadow-lg ${
                                similar.accessLevel === 'Premium'
                                  ? 'bg-[#E5A93C] text-black'
                                  : 'bg-white/10 text-white backdrop-blur-md border border-white/10'
                              }`}
                            >
                              {similar.accessLevel}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center gap-2 text-[9px] font-mono text-[#8C8275] uppercase tracking-wider mb-2">
                            <FiTag className="text-[#E5A93C]" />{' '}
                            {similar.category}
                          </div>
                          <h4
                            className={`text-base font-serif text-white line-clamp-2 leading-snug group-hover:text-[#E5A93C] transition-colors ${isLocked ? 'opacity-40' : ''}`}
                          >
                            {similar.title}
                          </h4>
                          <div className="mt-4 pt-4 border-t border-[#1A1612] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {similar.author?.image ? (
                                <img
                                  src={similar.author.image}
                                  className="w-5 h-5 rounded-full grayscale group-hover:grayscale-0 transition-all"
                                  alt="author"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-[#1A1612] flex items-center justify-center text-[8px] font-mono text-[#E5A93C] border border-white/5 uppercase">
                                  {similar.author?.name?.slice(0, 2) || '??'}
                                </div>
                              )}
                              <span className="text-[9px] text-white uppercase tracking-tighter font-mono">
                                {similar.author?.name?.split(' ')[0]}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-[9px] font-mono text-[#5C544A]">
                              <FiHeart size={10} /> {similar.likesCount || 0}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* author section  */}
          <aside className="lg:col-span-4 space-y-16">
            <div className="bg-[#0F0E0C] border border-[#1A1612] p-10 rounded-2xl shadow-xl sticky top-28">
              <div className="text-center mb-8">
                {lesson.author?.image ? (
                  <img
                    src={lesson.author.image}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-2 border-[#1A1612] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                    alt="Creator"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-[#1A1612] flex items-center justify-center border-2 border-[#E5A93C]/20 shadow-2xl text-3xl font-serif text-[#E5A93C] uppercase">
                    {lesson.author?.name?.slice(0, 2) || '??'}
                  </div>
                )}
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

              <div className="mt-16 space-y-6 pt-16 border-t border-[#1A1612] text-[11px] font-mono tracking-tighter">
                <h4 className="text-[11px] text-[#5C544A] font-mono uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <FiInfo /> Internal Records
                </h4>
                <div className="flex justify-between items-center mb-4">
                  <span>PUBLISHED DATE</span>
                  <span className="text-white">
                    {new Date(lesson.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>Update DATE</span>
                  <span className="text-white">
                    {new Date(lesson.updatedAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>READ VELOCITY</span>
                  <span className="text-white">{readingTime} MINS</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>VISIBILITY</span>
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

      <AnimatePresence>
        {showReportModal && (
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReport}
            reason={reportReason}
            setReason={setReportReason}
            lessonId={lesson._id}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
