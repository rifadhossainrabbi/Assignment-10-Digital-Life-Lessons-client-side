'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
// React Icons Imports
import { FaLock, FaCrown, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { MdCloudUpload, MdInfoOutline } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { HiOutlineLightBulb } from 'react-icons/hi';

import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function AddLessonPage() {
  const router = useRouter();
  const { data: session, isPending: authLoading } = authClient.useSession();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [emotionalTone, setEmotionalTone] = useState('');
  const [accessLevel, setAccessLevel] = useState('Free');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(['Personal Growth']);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef(null);

  const [myLessonCount, setMyLessonCount] = useState(0);

  const user = session?.user;
  const isPremiumUser = user?.plan === 'premium';
  const freeLimit = 5;
  const isLimitReached = !isPremiumUser && myLessonCount >= freeLimit;

  useEffect(() => {
    if (user?.id) {
      fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/lessons/user/${user.id}`)
        .then(res => res.json())
        .then(data => setMyLessonCount(data.length))
        .catch(err => console.error(err));
    }
  }, [user?.id]);

  if (authLoading)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center font-mono text-[#E5A93C]">
        AUTHENTICATING...
      </div>
    );
  if (!session?.user)
    return (
      <div className="text-center mt-20 text-[#9C9485]">
        Please login to access this archive.
      </div>
    );

  const handleSubmit = async e => {
    e.preventDefault();
    if (isLimitReached) {
      toast.error('Free capacity full!');
      return;
    }

    setIsPublishing(true);
    const processToast = toast.loading('Archiving your wisdom...');

    try {
      let finalImageUrl = '';
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
          {
            method: 'POST',
            body: formData,
          },
        );
        const imgData = await res.json();
        finalImageUrl = imgData.data.url;
      }

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
        const err = await response.json();
        throw new Error(err.message);
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
      <div className="max-w-6xl mx-auto">
        {/* --- DYNAMIC CAPACITY METER --- */}
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
                  ? 'Premium Lifetime Access'
                  : 'Standard Journal Capacity'}
              </h3>
              <p className="text-xs text-[#9C9485]">
                {isPremiumUser
                  ? 'You have unlimited slots to share wisdom.'
                  : `Slot Usage: ${myLessonCount} of ${freeLimit} shared lessons.`}
              </p>
            </div>
          </div>

          {!isPremiumUser && (
            <div className="w-full md:w-72">
              <div className="flex justify-between mb-2 px-1">
                <span className="text-[10px] font-bold text-[#9C9485] uppercase">
                  Storage Status
                </span>
                <span className="text-[10px] font-bold text-[#E5A93C]">
                  {Math.round((myLessonCount / freeLimit) * 100)}%
                </span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(freeLimit)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 flex-1 rounded-sm transition-all duration-700 ${
                      i < myLessonCount
                        ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(229,169,60,0.3)]'
                        : 'bg-[#1C1812] border border-[#2E281D]'
                    }`}
                  />
                ))}
              </div>
              {isLimitReached && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="mt-3 w-full text-[10px] py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded hover:bg-amber-500 hover:text-black transition-all font-bold"
                >
                  UPGRADE FOR UNLIMITED SLOTS
                </button>
              )}
            </div>
          )}
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* LEFT: CORE CONTENT */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#14110C] border border-[#231E15] p-8 rounded-xl space-y-6 shadow-xl">
              <div className="flex flex-col gap-2">
                <label className="text-[#9C9485] text-[10px] uppercase font-black tracking-widest">
                  Lesson Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter a descriptive title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="bg-[#0F0D0A] border border-[#231E15] p-4 rounded-lg outline-none focus:border-amber-500/50 transition-all text-sm"
                />
              </div>

              {/* ACCESS CONTROL */}
              <div className="p-5 bg-[#0F0D0A] rounded-xl border border-[#231E15]">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[#9C9485] text-[10px] uppercase font-black tracking-widest">
                    Access Policy
                  </label>
                  {!isPremiumUser && (
                    <span className="flex items-center gap-1.5 text-[9px] text-amber-500 font-bold bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                      <FaLock size={8} /> PREMIUM ONLY
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 text-sm cursor-pointer group">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${accessLevel === 'Free' ? 'border-amber-500' : 'border-[#2E281D]'}`}
                    >
                      {accessLevel === 'Free' && (
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                      )}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      checked={accessLevel === 'Free'}
                      onChange={() => setAccessLevel('Free')}
                    />
                    <span
                      className={
                        accessLevel === 'Free'
                          ? 'text-amber-500'
                          : 'text-[#9C9485]'
                      }
                    >
                      Public Access
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-3 text-sm ${!isPremiumUser ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer group'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${accessLevel === 'Premium' ? 'border-amber-500' : 'border-[#2E281D]'}`}
                    >
                      {accessLevel === 'Premium' && (
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                      )}
                    </div>
                    <input
                      type="radio"
                      className="hidden"
                      disabled={!isPremiumUser}
                      checked={accessLevel === 'Premium'}
                      onChange={() => setAccessLevel('Premium')}
                    />
                    <span
                      className={
                        accessLevel === 'Premium'
                          ? 'text-amber-500'
                          : 'text-[#9C9485]'
                      }
                    >
                      Premium Restricted
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9C9485] text-[10px] uppercase font-black tracking-widest">
                  Wisdom Description
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Write your insight here..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-[#0F0D0A] border border-[#231E15] p-5 rounded-lg outline-none focus:border-amber-500/50 transition-all resize-none text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: ASSETS & ACTION */}
          <div className="lg:col-span-5 space-y-6">
            <div
              onClick={() => !previewUrl && fileInputRef.current.click()}
              className={`bg-[#14110C] border-2 border-dashed rounded-xl h-72 flex flex-col items-center justify-center transition-all overflow-hidden relative ${previewUrl ? 'border-amber-500/50' : 'border-[#231E15] hover:border-amber-500/30 cursor-pointer'}`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="absolute top-4 right-4 bg-black/60 p-2 rounded-full hover:bg-red-500 transition-all"
                  >
                    <IoClose size={18} />
                  </button>
                </>
              ) : (
                <div className="text-center group">
                  <MdCloudUpload
                    size={48}
                    className="mx-auto mb-4 text-[#2E281D] group-hover:text-amber-500 transition-all"
                  />
                  <p className="text-xs font-bold text-[#9C9485] tracking-widest uppercase">
                    Upload Cover Image
                  </p>
                  <p className="text-[10px] text-[#2E281D] mt-1">
                    PNG, JPG or WebP preferred
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
              />
            </div>

            <div className="bg-[#14110C] border border-[#231E15] p-6 rounded-xl">
              <p className="text-[10px] font-black uppercase text-[#9C9485] mb-4 tracking-widest">
                Metadata Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 bg-[#0F0D0A] border border-[#231E15] px-3 py-1.5 rounded-md text-[11px] text-amber-500 font-medium"
                  >
                    {tag}{' '}
                    <IoClose
                      className="cursor-pointer hover:text-red-400"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                    />
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const t = prompt('Enter Tag:');
                    if (t) setTags([...tags, t]);
                  }}
                  className="px-3 py-1.5 border border-dashed border-[#231E15] rounded-md text-[11px] text-[#9C9485] hover:border-amber-500 transition-all"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            <motion.button
              whileHover={!isLimitReached ? { scale: 1.02 } : {}}
              whileTap={!isLimitReached ? { scale: 0.98 } : {}}
              type="submit"
              disabled={isPublishing || isLimitReached}
              className={`w-full h-16 rounded-xl font-black tracking-[0.2em] uppercase text-xs transition-all shadow-lg ${
                isLimitReached
                  ? 'bg-[#1C1812] text-[#2E281D] cursor-not-allowed border border-red-900/10'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/10 hover:shadow-amber-500/20'
              }`}
            >
              {isLimitReached ? (
                <span className="flex items-center justify-center gap-2">
                  <FaTimes /> Capacity Exceeded
                </span>
              ) : isPublishing ? (
                'Archiving...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Publish Masterpiece <FaCheckCircle />
                </span>
              )}
            </motion.button>

            {isLimitReached && (
              <div className="flex items-center gap-2 justify-center p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                <MdInfoOutline className="text-red-500" size={16} />
                <p className="text-[10px] text-red-500 font-bold uppercase">
                  Free limit of 5 lessons reached.
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
