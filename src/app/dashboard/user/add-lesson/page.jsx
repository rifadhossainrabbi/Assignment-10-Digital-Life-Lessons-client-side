'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock,
  FaCrown,
  FaCheckCircle,
  FaTimes,
  FaTags,
} from 'react-icons/fa';
import { MdCloudUpload, MdInfoOutline } from 'react-icons/md';
import { IoClose, IoAdd } from 'react-icons/io5';
import { HiOutlineLightBulb } from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function AddLessonPage() {
  const router = useRouter();
  const { data: session, isPending: authLoading } = authClient.useSession();

  // --- Form States ---
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [emotionalTone, setEmotionalTone] = useState('');
  const [accessLevel, setAccessLevel] = useState('Free');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(['Personal Growth']);
  const [newTag, setNewTag] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // --- Capacity States ---
  const [myLessonCount, setMyLessonCount] = useState(0);
  const fileInputRef = useRef(null);

  const user = session?.user;
  const isPremiumUser = user?.plan === 'premium';
  const freeLimit = 5;
  const isLimitReached = !isPremiumUser && myLessonCount >= freeLimit;

  // 1. Fetch user's current lesson count for limit validation
  useEffect(() => {
    if (user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/user/${user.id}`)
        .then(res => res.json())
        .then(data => setMyLessonCount(data.length))
        .catch(err => console.error('Archive Sync Error:', err));
    }
  }, [user?.id]);

  if (authLoading)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center font-mono text-[#E5A93C] animate-pulse">
        AUTHENTICATING ARCHIVE ACCESS...
      </div>
    );

  if (!session?.user)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center text-[#9C9485] font-mono uppercase tracking-widest">
        Please login to access the wisdom archives.
      </div>
    );

  // 2. Helper: Add New Tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // 3. Helper: Remove Tag
  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // 4. Main Submit Handler
  const handleSubmit = async e => {
    e.preventDefault();
    if (isLimitReached) {
      toast.error('Free archive capacity reached. Please upgrade.');
      return;
    }
    if (!category || !emotionalTone) {
      toast.error('Please select Category and Emotional Tone');
      return;
    }

    setIsPublishing(true);
    const processToast = toast.loading('Syncing masterpiece to archives...');

    try {
      let finalImageUrl =
        'https://placehold.co/600x400/14110C/E5A93C?text=NO+VISUAL+ARCHIVED';

      // Upload image to ImgBB if a file is selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const imgRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
          {
            method: 'POST',
            body: formData,
          },
        );
        const imgData = await imgRes.json();
        if (imgData.success) finalImageUrl = imgData.data.url;
      }

      const lessonData = {
        title,
        category,
        emotionalTone,
        accessLevel: isPremiumUser ? accessLevel : 'Free', // Force Free for non-premium
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        },
      );

      if (response.ok) {
        toast.success('Wisdom successfully archived!', { id: processToast });
        router.push('/dashboard/user/my-lessons');
      } else {
        throw new Error('Database synchronization failed');
      }
    } catch (error) {
      toast.error(error.message, { id: processToast });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-4 md:p-10 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto">
        {/* --- CAPACITY METER SECTION --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-[#14110C] border border-[#231E15] p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${isPremiumUser ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'}`}
            >
              {isPremiumUser ? (
                <FaCrown size={24} />
              ) : (
                <HiOutlineLightBulb size={24} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">
                {isPremiumUser
                  ? 'Premium Archive Status'
                  : 'Standard Journal Capacity'}
              </h3>
              <p className="text-xs text-[#9C9485] font-mono uppercase tracking-tighter">
                {isPremiumUser
                  ? 'Unlimited wisdom slots available'
                  : `Used ${myLessonCount} of ${freeLimit} free slots`}
              </p>
            </div>
          </div>
          {!isPremiumUser && (
            <div className="w-full md:w-72">
              <div className="flex justify-between mb-2 px-1 text-[10px] font-bold uppercase">
                <span className="text-[#9C9485]">Storage Level</span>
                <span className="text-[#E5A93C]">
                  {Math.round((myLessonCount / freeLimit) * 100)}%
                </span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(freeLimit)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-sm flex-1 ${i < myLessonCount ? 'bg-amber-500 shadow-[0_0_8px_rgba(229,169,60,0.4)]' : 'bg-[#1C1812]'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* --- LEFT COLUMN: CORE WISDOM --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#14110C] border border-[#231E15] p-8 rounded-xl space-y-8 shadow-2xl">
              {/* Title Field */}
              <div className="space-y-2">
                <label className="text-[#9C9485] text-[10px] uppercase font-black tracking-widest">
                  Masterpiece Title
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. The Silence of Growth"
                  className="w-full bg-[#0F0D0A] border border-[#231E15] p-4 rounded-lg outline-none focus:border-amber-500/50 transition-all text-sm"
                />
              </div>

              {/* Dynamic Selectors: Category & Emotional Tone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[#9C9485] text-[10px] uppercase font-black tracking-widest">
                    Archive Category
                  </label>
                  <select
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#0F0D0A] border border-[#231E15] p-4 rounded-lg outline-none focus:border-amber-500/50 text-sm cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Career">Career</option>
                    <option value="Relationships">Relationships</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Mistakes Learned">Mistakes Learned</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[#9C9485] text-[10px] uppercase font-black tracking-widest">
                    Emotional Tone
                  </label>
                  <select
                    required
                    value={emotionalTone}
                    onChange={e => setEmotionalTone(e.target.value)}
                    className="w-full bg-[#0F0D0A] border border-[#231E15] p-4 rounded-lg outline-none focus:border-amber-500/50 text-sm cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Tone
                    </option>
                    <option value="Motivational">Motivational</option>
                    <option value="Sad">Sad</option>
                    <option value="Realization">Realization</option>
                    <option value="Gratitude">Gratitude</option>
                    <option value="Contemplative">Contemplative</option>
                  </select>
                </div>
              </div>

              {/* Access Policy Control */}
              <div className="p-6 bg-[#0F0D0A] rounded-xl border border-[#231E15] space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[#9C9485] text-[10px] uppercase font-black tracking-widest">
                    Access Policy
                  </label>
                  {!isPremiumUser && (
                    <span className="text-[8px] font-bold text-amber-500 bg-amber-500/5 px-2 py-1 rounded border border-amber-500/20 uppercase tracking-widest">
                      Premium Only
                    </span>
                  )}
                </div>
                <div className="flex gap-8">
                  {['Free', 'Premium'].map(level => (
                    <label
                      key={level}
                      className={`flex items-center gap-3 text-xs cursor-pointer ${level === 'Premium' && !isPremiumUser ? 'opacity-30 cursor-not-allowed' : 'group'}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${accessLevel === level ? 'border-amber-500' : 'border-[#231E15]'}`}
                      >
                        {accessLevel === level && (
                          <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        )}
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        disabled={level === 'Premium' && !isPremiumUser}
                        checked={accessLevel === level}
                        onChange={() => setAccessLevel(level)}
                      />
                      <span
                        className={
                          accessLevel === level
                            ? 'text-amber-500'
                            : 'text-[#9C9485]'
                        }
                      >
                        {level === 'Free'
                          ? 'Standard Access'
                          : 'Premium Restricted'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description TextArea */}
              <div className="space-y-2">
                <label className="text-[#9C9485] text-[10px] uppercase font-black tracking-widest">
                  Full Insight Description
                </label>
                <textarea
                  required
                  rows={10}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Pour your wisdom into the collective archives..."
                  className="w-full bg-[#0F0D0A] border border-[#231E15] p-5 rounded-lg outline-none focus:border-amber-500/50 text-sm leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: VISUALS & TAGS --- */}
          <div className="lg:col-span-5 space-y-8">
            {/* Image Upload Area */}
            <div
              onClick={() => !previewUrl && fileInputRef.current.click()}
              className={`bg-[#14110C] border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center transition-all overflow-hidden relative ${previewUrl ? 'border-amber-500/40' : 'border-[#231E15] hover:border-amber-500/30 cursor-pointer group'}`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover brightness-75 hover:brightness-100 transition-all"
                  />
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="absolute top-4 right-4 bg-black/80 p-2 rounded-full hover:bg-red-500 transition-all text-white"
                  >
                    <IoClose size={18} />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <MdCloudUpload
                    size={40}
                    className="mx-auto mb-3 text-[#2E281D] group-hover:text-amber-500 transition-colors"
                  />
                  <p className="text-[10px] font-bold text-[#9C9485] uppercase tracking-widest">
                    Select Archive Image
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

            {/* Tag Management System */}
            <div className="bg-[#14110C] border border-[#231E15] p-6 rounded-xl">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-[#9C9485] mb-4 tracking-widest">
                <FaTags /> Content Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                <AnimatePresence>
                  {tags.map(tag => (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      key={tag}
                      className="flex items-center gap-1.5 bg-[#0F0D0A] border border-[#231E15] px-3 py-1.5 rounded text-[10px] text-amber-500 font-bold uppercase tracking-tighter"
                    >
                      {tag}{' '}
                      <IoClose
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={e =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                  }
                  placeholder="New tag..."
                  className="flex-1 bg-[#0F0D0A] border border-[#231E15] px-4 py-2 rounded text-xs outline-none focus:border-amber-500/30"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-[#231E15] p-2 rounded text-[#9C9485] hover:text-white transition-colors"
                >
                  <IoAdd size={20} />
                </button>
              </div>
            </div>

            {/* Action Button: Publish */}
            <div className="space-y-4 pt-4">
              <motion.button
                whileHover={!isLimitReached ? { scale: 1.02 } : {}}
                whileTap={!isLimitReached ? { scale: 0.98 } : {}}
                type="submit"
                disabled={isPublishing || isLimitReached}
                className={`w-full h-16 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all ${isLimitReached ? 'bg-[#1C1812] text-[#2E281D] cursor-not-allowed border border-[#231E15]' : 'bg-[#E5A93C] text-black shadow-2xl hover:bg-white'}`}
              >
                {isLimitReached ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaTimes /> Capacity Full
                  </span>
                ) : isPublishing ? (
                  'Synchronizing...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Archiving Wisdom <FaCheckCircle />
                  </span>
                )}
              </motion.button>

              {isLimitReached && (
                <div className="flex items-center gap-2 justify-center p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <MdInfoOutline className="text-red-500" size={16} />
                  <p className="text-[10px] text-red-500 font-bold uppercase">
                    Archive limit (5) reached. Please upgrade.
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
