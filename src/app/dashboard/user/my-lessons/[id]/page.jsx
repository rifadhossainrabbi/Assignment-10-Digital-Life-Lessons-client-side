'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiImage, FiUpload } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function UpdateLessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const imgBBKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

  const isPremiumUser = user?.plan === 'premium';

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    emotionalTone: '',
    image: '',
    visibility: 'Public',
    accessLevel: 'Free',
  });

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const res = await fetch(`${serverUrl}/lessons/${id}`);
        const data = await res.json();

        if (res.ok) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            emotionalTone: data.emotionalTone || '',
            image: data.image || '',
            visibility: data.visibility || 'Public',
            accessLevel: data.accessLevel || 'Free',
          });
          setPreviewUrl(data.image);
        }
      } catch (error) {
        toast.error('Failed to retrieve archive data');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLessonData();
  }, [id, serverUrl]);

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadToImgBB = async file => {
    const body = new FormData();
    body.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgBBKey}`, {
      method: 'POST',
      body: body,
    });
    const data = await res.json();
    if (data.success) {
      return data.data.display_url;
    } else {
      throw new Error('ImgBB Upload Failed');
    }
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setUpdating(true);

    try {
      let finalImageUrl = formData.image;

      if (selectedFile) {
        toast.loading('Uploading new image...', { id: 'upload' });
        finalImageUrl = await uploadToImgBB(selectedFile);
        toast.success('Image uploaded!', { id: 'upload' });
      }

      const updatedLesson = {
        ...formData,
        image: finalImageUrl,
        updatedAt: new Date(),
      };

      const res = await fetch(`${serverUrl}/lessons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLesson),
      });

      if (res.ok) {
        toast.success('Wisdom updated!', {
          style: { background: '#1A1612', color: '#E5A93C' },
        });
        setTimeout(() => router.push('/dashboard/user/my-lessons'), 1500);
      } else {
        toast.error('Sync failed');
      }
    } catch (error) {
      toast.error(error.message || 'Server error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center text-[#E5A93C] font-mono animate-pulse p-4 text-center">
        RETRIEVING ARCHIVE DATA...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-4 md:p-8 lg:p-12">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/dashboard/user/my-lessons"
          className="flex items-center gap-2 text-[#5C544A] hover:text-[#E5A93C] transition-colors mb-6 md:mb-10 font-mono text-[10px] uppercase tracking-widest"
        >
          <FiArrowLeft /> Back to Archives
        </Link>

        {/* Header */}
        <header className="mb-8 md:mb-12 border-b border-[#231E15] pb-6">
          <h1 className="text-3xl md:text-5xl font-serif text-[#E6DFD3]">
            Edit Insight
          </h1>
          <p className="text-[9px] md:text-[10px] text-[#5C544A] mt-2 font-mono uppercase tracking-[0.3em]">
            Refine your shared wisdom
          </p>
        </header>

        <form onSubmit={handleUpdate} className="space-y-8 md:space-y-12">
          {/* Image Upload Section */}
          <section className="bg-[#14110C] border border-[#231E15] p-5 md:p-8 rounded-2xl md:rounded-3xl">
            <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-6 tracking-widest">
              Visual Representation
            </label>
            <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-10">
              {/* Preview Box */}
              <div className="w-full lg:w-56 h-56 md:h-64 bg-black/40 border border-[#231E15] rounded-2xl overflow-hidden flex items-center justify-center relative group shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Lesson"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500"
                  />
                ) : (
                  <FiImage size={40} className="text-[#231E15]" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-[9px] font-mono uppercase text-white bg-black/60 px-3 py-1 rounded-full">
                    Current View
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 md:h-48 border-2 border-dashed border-[#231E15] rounded-2xl cursor-pointer hover:border-[#E5A93C]/30 transition-all bg-black/20 group">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <FiUpload className="text-[#E5A93C] mb-3 text-xl group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] md:text-xs text-[#E6DFD3] font-mono uppercase tracking-widest">
                      Upload New Image
                    </p>
                    <p className="text-[8px] text-[#5C544A] mt-2 uppercase tracking-tighter">
                      JPG, PNG or WEBP (Max 2MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
                {selectedFile && (
                  <p className="text-[10px] text-[#E5A93C] mt-3 font-mono italic text-center lg:text-left">
                    ✓ Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-3 tracking-widest">
                Lesson Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-[#14110C] border border-[#231E15] rounded-xl p-4 md:p-5 text-[#E6DFD3] focus:border-[#E5A93C] outline-none transition-colors"
              />
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] tracking-widest">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#14110C] border border-[#231E15] rounded-xl p-4 md:p-5 text-[#E6DFD3] outline-none appearance-none focus:border-[#E5A93C] cursor-pointer"
              >
                <option value="Personal Growth">Personal Growth</option>
                <option value="Career">Career</option>
                <option value="Relationships">Relationships</option>
                <option value="Mindset">Mindset</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Mistakes Learned">Mistakes Learned</option>
              </select>
            </div>

            {/* Emotional Tone */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] tracking-widest">
                Emotional Tone
              </label>
              <select
                name="emotionalTone"
                value={formData.emotionalTone}
                onChange={handleChange}
                className="w-full bg-[#14110C] border border-[#231E15] rounded-xl p-4 md:p-5 text-[#E6DFD3] outline-none appearance-none focus:border-[#E5A93C] cursor-pointer"
              >
                <option value="Motivational">Motivational</option>
                <option value="Sad">Sad</option>
                <option value="Realization">Realization</option>
                <option value="Gratitude">Gratitude</option>
                <option value="Contemplative">Contemplative</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-3 tracking-widest">
                Full Insight / Story
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={8}
                required
                className="w-full bg-[#14110C] border border-[#231E15] rounded-xl p-4 md:p-5 text-[#E6DFD3] outline-none resize-none focus:border-[#E5A93C] transition-colors"
              ></textarea>
            </div>

            {/* Visibility */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] tracking-widest">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full bg-[#14110C] border border-[#231E15] rounded-xl p-4 md:p-5 text-[#E6DFD3] outline-none focus:border-[#E5A93C] cursor-pointer"
              >
                <option value="Public">Public Access</option>
                <option value="Private">Private Vault</option>
              </select>
            </div>

            {/* Access Level */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] tracking-widest">
                Access Control
              </label>
              <select
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleChange}
                disabled={!isPremiumUser}
                className={`w-full bg-[#14110C] border border-[#231E15] rounded-xl p-4 md:p-5 text-[#E6DFD3] outline-none focus:border-[#E5A93C] ${!isPremiumUser && 'opacity-40 cursor-not-allowed'}`}
              >
                <option value="Free">Open for All (Free)</option>
                <option value="Premium">Premium Subscribers ⭐</option>
              </select>
              {!isPremiumUser && (
                <p className="text-[8px] text-amber-500/50 uppercase tracking-widest pl-1">
                  Premium required for tiered access
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={updating}
              type="submit"
              className="w-full bg-[#E5A93C] text-black py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-amber-900/10 hover:bg-white transition-all duration-300"
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Syncing...
                </span>
              ) : (
                <>
                  <FiSave className="text-lg" /> Update Wisdom
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
