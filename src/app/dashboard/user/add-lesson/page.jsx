'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIn, Lock, Plus, Xmark } from '@gravity-ui/icons';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client'; // নিশ্চিত করুন এটি সঠিক পাথ
import { useRouter } from 'next/navigation';

export default function AddLessonPage() {
  const router = useRouter();
  // 🔐 Better Auth-এর সঠিক সেশন হ্যান্ডলিং (isPending ব্যবহার করা হয়েছে)
  const { data: session, isPending: authLoading } = authClient.useSession();

  // Core form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [emotionalTone, setEmotionalTone] = useState('');
  const [accessLevel, setAccessLevel] = useState('Free');
  const [description, setDescription] = useState('');

  // Tags
  const [tags, setTags] = useState(['Stoicism', 'Digital Minimalism', 'Focus']);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Asset pipelines
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef(null);

  // ১. লোডিং চেক (ফিক্সড)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center font-mono text-[#E5A93C] animate-pulse">
        AUTHENTICATING SESSION...
      </div>
    );
  }

  // ২. লগইন না থাকলে এক্সেস ডিনাইড
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center p-6">
        <div className="text-center max-w-md border border-[#231E15] bg-[#14110C] p-8 space-y-4">
          <h2 className="text-xl font-serif text-[#E6DFD3]">Access Denied</h2>
          <p className="text-sm text-[#9C9485]">
            Please log in to your account to publish a masterpiece.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="text-[#E5A93C] underline text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const user = session.user;

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImageToImgBB = async () => {
    if (!selectedFile) return '';
    const formData = new FormData();
    formData.append('image', selectedFile);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const result = await response.json();
    if (result.success) return result.data.url;
    throw new Error(result.error?.message || 'ImgBB upload failed');
  };

  const handleAddTag = e => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const cleanTag = newTag.trim();
      if (cleanTag && !tags.includes(cleanTag) && tags.length < 10) {
        setTags([...tags, cleanTag]);
        setNewTag('');
        setShowTagInput(false);
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsPublishing(true);
    const processToast = toast.loading('Initiating publication sequence...');

    try {
      let finalImageUrl = '';
      if (selectedFile) {
        toast.loading('Uploading asset to ImgBB...', { id: processToast });
        finalImageUrl = await uploadImageToImgBB();
      }

      const lessonData = {
        title,
        category,
        emotionalTone,
        accessLevel: user.isPremium ? accessLevel : 'Free',
        description,
        tags,
        image: finalImageUrl,
        visibility: 'Public',
        createdAt: new Date(),
        author: {
          userId: user.id, // আপনার সার্ভারের কোয়েরি অনুযায়ী userId সেট করা হয়েছে
          name: user.name,
          email: user.email,
          image: user.image,
        },
      };

      toast.loading('Storing wisdom in database...', { id: processToast });

      // ফিক্সড: ব্যাকটিক (``) ব্যবহার করা হয়েছে
      const serverResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/lessons`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData),
        },
      );

      if (serverResponse.ok) {
        toast.success('🎉 Wisdom Published Successfully!', {
          id: processToast,
        });
        router.push('/dashboard/user/my-lessons'); // সাকসেস হলে রিডাইরেক্ট
      } else {
        throw new Error('Failed to save data on server');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred.', { id: processToast });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-6 md:p-12 font-sans antialiased">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="text-[10px] font-mono text-[#E5A93C]/60 uppercase tracking-[0.3em] mb-1">
                Step 01
              </p>
              <h1 className="text-3xl font-serif text-[#E6DFD3] tracking-wide">
                Core Attributes
              </h1>
            </div>

            <div className="bg-[#14110C] border border-[#231E15] p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col gap-2">
                <label className="text-[#9C9485] font-medium text-xs uppercase">
                  Lesson Title *
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] text-sm p-3 outline-none focus:border-[#E5A93C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#9C9485] font-medium text-xs uppercase">
                    Category *
                  </label>
                  <select
                    required
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] text-sm p-3 outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Career">Career</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Relationships">Relationships</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#9C9485] font-medium text-xs uppercase">
                    Tone *
                  </label>
                  <select
                    required
                    value={emotionalTone}
                    onChange={e => setEmotionalTone(e.target.value)}
                    className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] text-sm p-3 outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Motivational">Motivational</option>
                    <option value="Realization">Realization</option>
                    <option value="Sad">Sad</option>
                    <option value="Gratitude">Gratitude</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[#9C9485] font-medium text-xs uppercase">
                  Access Level
                </label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      checked={accessLevel === 'Free'}
                      onChange={() => setAccessLevel('Free')}
                      className="accent-[#E5A93C]"
                    />{' '}
                    Standard (Free)
                  </label>
                  <div className="relative group flex items-center">
                    <label
                      className={`flex items-center gap-2 text-sm ${!user.isPremium ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        disabled={!user.isPremium}
                        checked={accessLevel === 'Premium'}
                        onChange={() => setAccessLevel('Premium')}
                        className="accent-[#E5A93C]"
                      />{' '}
                      Premium ⭐
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#9C9485] font-medium text-xs uppercase">
                  Description *
                </label>
                <textarea
                  required
                  rows={6}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] p-4 outline-none focus:border-[#E5A93C] resize-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-mono text-[#E5A93C]/60 uppercase tracking-[0.3em] mb-1">
                  Step 02
                </p>
                <h1 className="text-3xl font-serif text-[#E6DFD3] tracking-wide">
                  Visual Identity
                </h1>
              </div>

              <div className="bg-[#14110C] border border-dashed border-[#2E281D] flex flex-col items-center justify-center p-6 min-h-[300px] relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="w-full relative">
                    <img
                      src={previewUrl}
                      className="w-full h-48 object-cover rounded border border-[#231E15]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="absolute top-2 right-2 bg-black/80 p-1 rounded"
                    >
                      <Xmark className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="text-center space-y-4 cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <CloudArrowUpIn className="w-10 h-10 text-[#E5A93C] mx-auto" />
                    <p className="text-xs text-[#9C9485]">
                      Click to upload hero imagery
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-[#14110C] border border-[#231E15] p-6 space-y-4">
                <p className="text-xs text-[#9C9485] uppercase">
                  Tags ({tags.length}/10)
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span
                      key={t}
                      className="bg-[#1C1812] border border-[#2E281D] text-[#E5A93C] text-[10px] px-2 py-1 flex items-center gap-1"
                    >
                      {t}{' '}
                      <Xmark
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setTags(tags.filter(tag => tag !== t))}
                      />
                    </span>
                  ))}
                  {showTagInput ? (
                    <input
                      autoFocus
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-transparent border-b border-[#E5A93C] text-xs outline-none w-20"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      className="text-[10px] text-[#9C9485] border border-dashed border-[#2E281D] px-2 py-1"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isPublishing}
              className={`w-full bg-[#E5A93C] text-black font-bold h-16 tracking-widest uppercase ${isPublishing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#d4982f]'}`}
            >
              {isPublishing ? 'PUBLISHING...' : 'PUBLISH MASTERPIECE'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
