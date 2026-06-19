'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIn, Lock, Plus, Xmark } from '@gravity-ui/icons';
import toast, { Toaster } from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';
// আপনার auth লাইব্রেরি অনুযায়ী useSession ইমপোর্ট করুন
// import { useSession } from 'next-auth/react';

export default function AddLessonPage() {
  // 🔐 সেশন থেকে রিয়েল ডেটা নেওয়া হচ্ছে
  const { data: session, status } = useSession();

  // ফর্মে ব্যবহৃত স্টেটসমূহ
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Philosophy');
  const [emotionalTone, setEmotionalTone] = useState('Contemplative');
  const [accessLevel, setAccessLevel] = useState('Free');
  const [description, setDescription] = useState('');

  // ট্যাগস স্টেট
  const [tags, setTags] = useState(['Stoicism', 'Digital Minimalism', 'Focus']);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // ইমেজ এবং পাবলিশিং স্টেট
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef(null);

  // সেশন লোড হওয়া পর্যন্ত ওয়েট করা
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center font-mono text-[#E5A93C]">
        Authenticating session sequence...
      </div>
    );
  }

  // যদি ইউজার লগইন না থাকে
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center p-6">
        <div className="text-center max-w-md border border-[#231E15] bg-[#14110C] p-8 space-y-4">
          <h2 className="text-xl font-serif text-[#E6DFD3]">Access Denied</h2>
          <p className="text-sm text-[#9C9485]">
            Please log in to your account to publish a masterpiece.
          </p>
        </div>
      </div>
    );
  }

  // ডাটাবেজ স্ট্রাকচার অনুযায়ী রিয়েল ইউজার অবজেক্ট
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
    if (!title || !description) {
      toast.error('Please fill in all required core attributes.');
      return;
    }

    setIsPublishing(true);
    const processToast = toast.loading('Initiating publication sequence...');

    try {
      let finalImageUrl = '';
      if (selectedFile) {
        toast.loading('Uploading asset to ImgBB...', { id: processToast });
        finalImageUrl = await uploadImageToImgBB();
      }

      // 🎯 আপনার ডাটাবেজ স্ট্রাকচারের সাথে ইউজারকে সম্পূর্ণ ম্যাপ করা হয়েছে
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
        // 🔐 আপনার স্ক্রিনশটের অবজেক্ট স্ট্রাকচার অনুযায়ী ম্যাপিং
        author: {
          userId: user.id || user.uid, // MongoDB ObjectId কে রিপ্রেজেন্ট করবে
          name: user.name,
          email: user.email,
          image: user.image, // গুগলের অবতার ইমেজ ইউআরএল
        },
      };

      toast.loading('Storing wisdom in database...', { id: processToast });
      const serverResponse = await fetch('http://localhost:5000/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
      });

      const serverResult = await serverResponse.json();

      if (serverResult.insertedId) {
        toast.success('🎉 Wisdom Published Successfully!', {
          id: processToast,
        });
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setPreviewUrl('');
        setTags(['Stoicism', 'Digital Minimalism', 'Focus']);
      } else {
        throw new Error('Failed to save data on server');
      }
    } catch (error) {
      console.error('Publication Error:', error);
      toast.error(error.message || 'An error occurred during publication.', {
        id: processToast,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-6 md:p-12 font-sans antialiased selection:bg-[#E5A93C] selection:text-black">
      <Toaster
        toastOptions={{
          style: {
            background: '#14110C',
            color: '#E6DFD3',
            border: '1px solid #231E15',
            borderRadius: '0px',
          },
        }}
      />

      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* LEFT COLUMN: Core Attributes */}
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
                <label className="text-[#9C9485] font-medium text-xs uppercase tracking-wider">
                  Lesson Title <span className="text-[#E5A93C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Stoic Path to Digital Silence"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] placeholder:text-[#9C9485]/30 text-sm p-3 outline-none hover:border-[#E5A93C]/50 focus:border-[#E5A93C] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#9C9485] font-medium text-xs uppercase tracking-wider">
                    Domain Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] text-sm p-3 outline-none cursor-pointer focus:border-[#E5A93C]"
                  >
                    <option value="Philosophy">Philosophy</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Career">Career</option>
                    <option value="Mindset">Mindset</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#9C9485] font-medium text-xs uppercase tracking-wider">
                    Narrative Tone
                  </label>
                  <select
                    value={emotionalTone}
                    onChange={e => setEmotionalTone(e.target.value)}
                    className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] text-sm p-3 outline-none cursor-pointer focus:border-[#E5A93C]"
                  >
                    <option value="Contemplative">Contemplative</option>
                    <option value="Motivational">Motivational</option>
                    <option value="Realization">Realization</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[#9C9485] font-medium text-xs uppercase tracking-wider">
                  Access Level
                </label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#E6DFD3] cursor-pointer">
                    <input
                      type="radio"
                      name="accessLevel"
                      value="Free"
                      checked={accessLevel === 'Free'}
                      onChange={() => setAccessLevel('Free')}
                      className="w-4 h-4 accent-[#E5A93C] bg-black border-[#2E281D]"
                    />
                    Standard (Free)
                  </label>

                  <div className="relative group flex items-center">
                    <label
                      className={`flex items-center gap-2 text-sm font-medium transition-opacity ${!user.isPremium ? 'text-[#9C9485]/40 cursor-not-allowed' : 'text-[#E6DFD3] cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        name="accessLevel"
                        value="Premium"
                        disabled={!user.isPremium}
                        checked={accessLevel === 'Premium'}
                        onChange={() =>
                          user.isPremium && setAccessLevel('Premium')
                        }
                        className="w-4 h-4 accent-[#E5A93C] bg-black border-[#2E281D]"
                      />
                      Premium ⭐
                      {!user.isPremium && (
                        <Lock className="w-3.5 h-3.5 text-[#9C9485]/40 mb-0.5" />
                      )}
                    </label>
                    {!user.isPremium && (
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-72 p-3 bg-[#1C1812] text-[#E5A93C] border border-[#2E281D] text-xs leading-relaxed shadow-xl z-20">
                        Upgrade to Premium to create locked lessons.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[#9C9485] font-medium text-xs uppercase tracking-wider">
                  Lesson Abstract <span className="text-[#E5A93C]">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Distill the essence of this lesson in 3-5 sentences..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="bg-[#1C1812] border border-[#2E281D] text-[#E6DFD3] placeholder:text-[#9C9485]/30 text-base p-4 outline-none hover:border-[#E5A93C]/30 focus:border-[#E5A93C] transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Visual Identity & Tags */}
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

              {/* Upload Zone */}
              <div className="bg-[#14110C] border border-dashed border-[#2E281D] flex flex-col items-center justify-center p-6 shadow-2xl relative group min-h-[300px]">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="w-full flex flex-col space-y-4">
                    <div className="relative w-full aspect-video overflow-hidden border border-[#231E15] bg-[#0F0D0A]">
                      <img
                        src={previewUrl}
                        className="w-full h-full object-cover grayscale contrast-115 transition-all duration-300 group-hover:scale-[1.02]"
                        alt="preview"
                      />
                      <button
                        type="button"
                        className="absolute top-3 right-3 bg-black/80 text-[#E6DFD3] p-1.5 border border-[#2E281D] backdrop-blur-sm transition-colors"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl('');
                        }}
                      >
                        <Xmark className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-mono text-[#E5A93C]/80 text-center animate-pulse">
                      Asset staged (Will upload upon final submission)
                    </p>
                  </div>
                ) : (
                  <div className="text-center flex flex-col items-center max-w-sm space-y-4 py-8">
                    <div
                      className="w-14 h-14 bg-[#1C1812] border border-[#2E281D] flex items-center justify-center rounded-xl shadow-inner group-hover:border-[#E5A93C]/40 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <CloudArrowUpIn className="w-6 h-6 text-[#E5A93C]" />
                    </div>
                    <h3 className="font-serif text-lg text-[#E6DFD3]">
                      Hero Imagery
                    </h3>
                    <p className="text-xs text-[#9C9485] px-4">
                      Drag and drop high-fidelity visual assets here to anchor
                      the lesson's aesthetic.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="border border-[#E5A93C] text-[#E5A93C] font-medium tracking-wide transition-all h-10 px-6 text-xs uppercase font-mono"
                    >
                      Select Archive Files
                    </button>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className="bg-[#14110C] border border-[#231E15] p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[#9C9485] font-semibold uppercase tracking-wider">
                    Content Tags
                  </p>
                  <span className="text-[10px] font-mono text-[#9C9485]/40">
                    {tags.length}/10 used
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {tags.map(t => (
                    <span
                      key={t}
                      className="bg-[#1C1812] border border-[#2E281D] text-[#E5A93C] font-mono text-xs px-2.5 py-1 flex items-center gap-1.5"
                    >
                      {t}{' '}
                      <Xmark
                        className="w-3 h-3 cursor-pointer text-[#9C9485] hover:text-[#E5A93C]"
                        onClick={() => setTags(tags.filter(tag => tag !== t))}
                      />
                    </span>
                  ))}

                  {showTagInput ? (
                    <input
                      type="text"
                      autoFocus
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      onBlur={() => setShowTagInput(false)}
                      className="bg-[#1C1812] border border-[#E5A93C]/50 text-xs text-[#E6DFD3] font-mono px-2 py-1 outline-none w-24"
                    />
                  ) : (
                    tags.length < 10 && (
                      <button
                        type="button"
                        onClick={() => setShowTagInput(true)}
                        className="bg-transparent border border-dashed border-[#2E281D] text-[#9C9485] hover:text-[#E5A93C] hover:border-[#E5A93C]/40 text-xs font-mono px-2.5 py-1 flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add Tag
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isPublishing ? 1 : 1.01 }}
              whileTap={{ scale: isPublishing ? 1 : 0.99 }}
              type="submit"
              disabled={isPublishing}
              className={`w-full bg-[#E5A93C] text-black font-semibold font-serif h-16 text-md tracking-widest uppercase transition-all duration-300 shadow-xl ${isPublishing ? 'opacity-50 cursor-not-allowed bg-[#9C9485]' : 'hover:bg-[#d4982f]'}`}
            >
              {isPublishing ? 'PUBLISHING...' : 'PUBLISH MASTERPIECE'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
