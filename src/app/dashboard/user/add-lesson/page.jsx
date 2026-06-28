'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCrown, FaCheckCircle, FaTags } from 'react-icons/fa';
import { MdCloudUpload, MdInfoOutline } from 'react-icons/md';
import { IoClose, IoAdd } from 'react-icons/io5';
import { HiOutlineLightBulb } from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/reusableApi';
import Link from 'next/link';

export default function AddLessonPage() {
  const router = useRouter();
  const { data: session, isPending: authLoading } = authClient.useSession();

  //  Form er data gulo save korar jonno states (Title, Cat, Tone, ityadi)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [emotionalTone, setEmotionalTone] = useState('');
  const [accessLevel, setAccessLevel] = useState('Free'); // Free ba Premium set korar jonno
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(['Personal Growth']);
  const [newTag, setNewTag] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // Image file dhorar jonno
  const [previewUrl, setPreviewUrl] = useState(''); // Image preview dekhannor jonno
  const [isPublishing, setIsPublishing] = useState(false); // Submit button control korar jonno

  // Capacity check korar states
  const [myLessonCount, setMyLessonCount] = useState(0); // User koita lesson create korse tar count
  const fileInputRef = useRef(null); // File input trigger korar jonno ref

  const user = session?.user;
  const isPremiumUser = user?.plan === 'premium'; // User premium ki na ta check kora
  const freeLimit = 5; // Free user-er jonno limit set kora
  const isLimitReached =
    !isPremiumUser && myLessonCount >= freeLimit && user?.role !== 'admin';

  // User-er koto gulo lesson archive-e ache ta fetch korar hook
  useEffect(() => {
    if (user?.id) {
      const getCount = async () => {
        try {
          const data = await api.get(`/lessons/user/${user.id}`);
          setMyLessonCount(data.length);
        } catch (err) {
          console.error('Archive Sync Error:', err.message);
        }
      };
      getCount();
    }
  }, [user?.id]);

  // Login na thakle sign-in page-e redirect korar hook 
  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/signin');
    }
  }, [session, authLoading, router]);

  //  Authentication loading state UI
  if (authLoading)
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center font-mono text-[#E5A93C] animate-pulse uppercase tracking-[0.3em]">
        Accessing Wisdom Vault...
      </div>
    );

  // Tag system-e tag add r remove korar logic
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Form submit logic: Image upload r Database-e lesson save kora
  const handleSubmit = async e => {
    e.preventDefault();

    // Capacity limit check
    if (isLimitReached) {
      toast.error('Archive limit reached. Please upgrade to Premium.');
      return;
    }

    // Required field check
    if (!category || !emotionalTone) {
      toast.error('Category and Emotional Tone are required!');
      return;
    }

    setIsPublishing(true);
    const processToast = toast.loading('Archiving your wisdom...');

    try {
      let finalImageUrl =
        'https://placehold.co/600x400/14110C/E5A93C?text=NO+VISUAL+ARCHIVED';

      // photo thakle ImgBB-te upload korar logic
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const imgRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
          { method: 'POST', body: formData },
        );
        const imgData = await imgRes.json();
        if (imgData.success) finalImageUrl = imgData.data.url;
      }

      // Database-e lesson data pathano
      const lessonData = {
        title,
        category,
        emotionalTone,
        accessLevel: isPremiumUser ? accessLevel : 'Free',
        description,
        tags,
        image: finalImageUrl,
        visibility: 'Public',
        author: {
          userId: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      };

      await api.post('/lessons', lessonData);
      toast.success('Wisdom successfully archived!', { id: processToast });
      router.push('/dashboard/user/my-lessons');
    } catch (error) {
      toast.error(error.message || 'Sync failed', { id: processToast });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#BAB0A3] p-6 lg:p-12 antialiased">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        {/* Header Section: Title r Membership Status */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
              Preserve Your{' '}
              <span className="italic text-[#E5A93C]">Wisdom</span>
            </h1>
            <p className="text-[10px] text-[#5C544A] mt-2 font-mono uppercase tracking-[0.5em]">
              Contribution Interface :: Registry 007
            </p>
          </div>
          {/* User premium naki standard ta eikhane dekha jabe */}
          <div
            className={`px-6 py-2 rounded-full border font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 ${isPremiumUser ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-gray-500'}`}
          >
            {isPremiumUser ? (
              <>
                <FaCrown /> Premium Member
              </>
            ) : (
              'Standard Member'
            )}
          </div>
        </div>

        {/* Capacity Meter: User koita slot baki ache ta eikhane bar-e dekhabe */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-[#0F0E0C] border border-[#1A1612] p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl"
        >
          <div className="flex items-center gap-6">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isPremiumUser ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-blue-500/10 text-blue-400'}`}
            >
              {isPremiumUser ? (
                <FaCrown size={32} />
              ) : (
                <HiOutlineLightBulb size={32} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-serif text-white tracking-wide">
                {isPremiumUser
                  ? 'Unlimited Archive Slots'
                  : 'Journal Storage Level'}
              </h3>
              <p className="text-[11px] text-[#E5A93C] font-mono uppercase tracking-widest mt-1 font-bold">
                {isPremiumUser
                  ? 'Premium Account Active'
                  : `${freeLimit - myLessonCount} free slots remaining`}
              </p>
            </div>
          </div>
          {/* Progress bar logic - sudhu free user-er jonno */}
          {!isPremiumUser && user?.role !== 'admin' && (
            <div className="w-full md:w-80 bg-black/20 p-5 rounded-2xl border border-white/5">
              <div className="flex justify-between mb-3 text-[11px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Storage Density</span>
                <span className="text-[#E5A93C]">
                  {Math.round((myLessonCount / freeLimit) * 100)}%
                </span>
              </div>
              <div className="flex gap-2 h-3">
                {[...Array(freeLimit)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full flex-1 transition-all duration-700 ${i < myLessonCount ? 'bg-[#E5A93C] shadow-[0_0_15px_rgba(229,169,60,0.4)]' : 'bg-[#1A1612]'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          {/* --- Left Column: Main form field gulo (Title, Cat, Tone, Description) --- */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#0F0E0C] border border-[#1A1612] p-8 md:p-10 rounded-[40px] space-y-10 shadow-2xl">
              {/* Lesson Title input field */}
              <div className="space-y-4">
                <label className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] ml-1">
                  Lesson title
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="w-full bg-[#0A0908] border border-[#1A1612] p-5 rounded-2xl outline-none focus:border-[#E5A93C]/40 text-white font-serif text-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category select dropdown */}
                <div className="space-y-4">
                  <label className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] ml-1">
                    Category
                  </label>
                  <select
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#0A0908] border border-[#1A1612] p-5 rounded-2xl outline-none text-gray-300 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Career">Career</option>
                    <option value="Relationships">Relationships</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Mistakes">Mistakes</option>
                    <option value="Learned">Learned</option>
                    <option value="Mistakes Learned">Mistakes Learned</option>
                  </select>
                </div>

                {/* Emotional Tone select dropdown */}
                <div className="space-y-4">
                  <label className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] ml-1">
                    Emotional Tone
                  </label>
                  <select
                    required
                    value={emotionalTone}
                    onChange={e => setEmotionalTone(e.target.value)}
                    className="w-full bg-[#0A0908] border border-[#1A1612] p-5 rounded-2xl outline-none text-gray-300 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Tone
                    </option>
                    <option value="Motivational">Motivational</option>
                    <option value="Sad">Sad</option>
                    <option value="Realization">Realization</option>
                    <option value="Gratitude">Gratitude</option>
                  </select>
                </div>
              </div>

              {/* Access Policy Section */}
              <div className="p-8 bg-[#0A0908] rounded-3xl border border-[#1A1612] space-y-6">
                <label className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] block">
                  Access Policy
                </label>
                <div className="flex flex-wrap gap-10">
                  {['Free', 'Premium'].map(level => {
                    const isDisabled = level === 'Premium' && !isPremiumUser;

                    return (
                      <div key={level} className="relative group">
                        {/* Tooltip Logic: Sudhu disabled thaklei hover-e tooltip dekhabe */}
                        {isDisabled && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-[0_10px_20px_rgba(0,0,0,0.4)] border border-indigo-400/30">
                            Upgrade to Premium to create paid lessons.
                            {/* Tooltip-er niche chotto arrow/tri-angle design */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-indigo-600"></div>
                          </div>
                        )}

                        <label
                          className={`flex items-center gap-4 transition-all ${
                            isDisabled
                              ? 'cursor-not-allowed opacity-40'
                              : 'cursor-pointer group'
                          }`}
                          onClick={() => {
                            if (isDisabled) {
                              toast.error(
                                'Upgrade to Premium to unlock this feature!',
                              );
                            }
                          }}
                        >
                          {/* Custom Radio Button Design */}
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              accessLevel === level
                                ? 'border-[#E5A93C] bg-[#E5A93C]/10'
                                : 'border-[#1A1612]'
                            } ${isDisabled ? 'grayscale' : ''}`}
                          >
                            {accessLevel === level && (
                              <div className="w-2.5 h-2.5 bg-[#E5A93C] rounded-full shadow-[0_0_10px_#E5A93C]" />
                            )}
                          </div>

                          <input
                            type="radio"
                            className="hidden"
                            disabled={isDisabled}
                            checked={accessLevel === level}
                            onChange={() => {
                              if (!isDisabled) setAccessLevel(level);
                            }}
                          />

                          <span
                            className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                              accessLevel === level
                                ? 'text-amber-500'
                                : 'text-[#5C544A]'
                            }`}
                          >
                            {level === 'Free'
                              ? 'Public (Free)'
                              : 'Premium Archive'}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Insight/Description textarea field */}
              <div className="space-y-4">
                <label className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em] ml-1">
                  Deep Insight
                </label>
                <textarea
                  required
                  rows={10}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Pour your soul into the archives..."
                  className="w-full bg-[#0A0908] border border-[#1A1612] p-8 rounded-[32px] outline-none text-lg leading-relaxed font-serif italic text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* --- Right Column: Image upload r Tag system section --- */}
          <div className="lg:col-span-5 space-y-10">
            {/* Image Upload Box: Click korle gallery open hobe */}
            <div
              onClick={() => !previewUrl && fileInputRef.current.click()}
              className={`bg-[#0F0E0C] border-2 border-dashed rounded-[40px] h-[350px] flex flex-col items-center justify-center transition-all overflow-hidden relative group ${previewUrl ? 'border-[#E5A93C]/20' : 'border-[#1A1612] hover:border-[#E5A93C]/30 cursor-pointer'}`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="bg-red-600 text-white p-4 rounded-full"
                    >
                      <IoClose size={24} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-10">
                  <div className="w-20 h-20 bg-[#0A0908] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#1A1612] group-hover:text-[#E5A93C]">
                    <MdCloudUpload size={32} />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                    Attach Visual Artifact
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) {
                    setSelectedFile(f);
                    setPreviewUrl(URL.createObjectURL(f));
                  }
                }}
              />
            </div>

            {/* Tags System: User tag add r delete korte parbe */}
            <div className="bg-[#0F0E0C] border border-[#1A1612] p-8 rounded-[32px] shadow-2xl">
              <label className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-500 mb-6 tracking-[0.3em]">
                <FaTags className="text-[#E5A93C]" /> Wisdom Tags
              </label>
              <div className="flex flex-wrap gap-3 mb-8">
                <AnimatePresence>
                  {tags.map(tag => (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      key={tag}
                      className="flex items-center gap-2 bg-[#0A0908] border border-[#1A1612] pl-4 pr-2 py-2 rounded-xl text-[10px] text-white font-bold uppercase tracking-widest"
                    >
                      {tag}{' '}
                      <IoClose
                        className="cursor-pointer hover:text-red-500"
                        size={14}
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={e =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                  }
                  placeholder="Add tag..."
                  className="flex-1 bg-[#0A0908] border border-[#1A1612] px-5 py-4 rounded-xl text-xs outline-none text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-[#1A1612] p-4 rounded-xl text-[#E5A93C] hover:bg-[#E5A93C] hover:text-black"
                >
                  <IoAdd size={20} />
                </button>
              </div>
            </div>

            {/* Submit Button Section: Limit thakle "Archive" button dekhabe naile "Upgrade" link hobe */}
            <div className="space-y-6 pt-4">
              {isLimitReached ? (
                <Link
                  href="/pricing"
                  className="w-full h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center gap-4 font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-indigo-500"
                >
                  <FaCrown className="text-amber-400 text-xl animate-bounce" />{' '}
                  Upgrade to Expand Archive
                </Link>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPublishing}
                  className="w-full h-20 rounded-2xl bg-[#E5A93C] text-black font-black uppercase tracking-[0.3em] text-xs shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isPublishing ? (
                    'Synchronizing...'
                  ) : (
                    <>
                      <FaCheckCircle size={18} /> Archive Wisdom
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
