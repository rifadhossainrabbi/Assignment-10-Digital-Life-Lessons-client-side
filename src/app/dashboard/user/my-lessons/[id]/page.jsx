'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiInfo, FiImage, FiUpload } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';

export default function UpdateLessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // ImgBB API Key from your environment variables
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
    image: '', // This will store the final URL (existing or new ImgBB link)
    visibility: 'Public',
    accessLevel: 'Free',
  });

  // 1. Fetch existing lesson data to pre-fill the form
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
          // Set the initial preview to the current image in database
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

  // Handle local file selection and create temporary preview
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create local URL for preview
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Upload to ImgBB helper function
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

  // 3. Handle the main update process
  const handleUpdate = async e => {
    e.preventDefault();
    setUpdating(true);

    try {
      let finalImageUrl = formData.image;

      // If a new file was selected, upload it to ImgBB first
      if (selectedFile) {
        toast.loading('Uploading new image...', { id: 'upload' });
        finalImageUrl = await uploadToImgBB(selectedFile);
        toast.success('Image uploaded!', { id: 'upload' });
      }

      // Prepare final data with the new (or old) image URL
      const updatedLesson = { ...formData, image: finalImageUrl };

      const res = await fetch(`${serverUrl}/lessons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLesson),
      });

      if (res.ok) {
        toast.success('Wisdom updated in the archives!', {
          style: { background: '#1A1612', color: '#E5A93C' },
        });
        setTimeout(() => router.push('/dashboard/user/my-lessons'), 1500);
      } else {
        toast.error('Could not sync updates to database');
      }
    } catch (error) {
      toast.error(error.message || 'Server connection failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center text-[#E5A93C] font-mono animate-pulse">
        RETRIEVING ARCHIVE DATA...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-6 md:p-12">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard/user/my-lessons"
          className="flex items-center gap-2 text-[#5C544A] hover:text-[#E5A93C] transition-colors mb-8 font-mono text-xs uppercase tracking-widest"
        >
          <FiArrowLeft /> Back to Archives
        </Link>

        <header className="mb-10 border-b border-[#231E15] pb-6">
          <h1 className="text-4xl font-serif text-[#E6DFD3]">Edit Insight</h1>
          <p className="text-[10px] text-[#5C544A] mt-2 font-mono uppercase tracking-[0.3em]">
            Refine your shared wisdom
          </p>
        </header>

        <form onSubmit={handleUpdate} className="space-y-8">
          {/* Image Preview and Upload Section */}
          <div className="bg-[#14110C] border border-[#231E15] p-6 rounded-xl">
            <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-4 tracking-widest">
              Visual Representation
            </label>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Preview Box */}
              <div className="w-full md:w-48 h-48 bg-black/40 border border-[#231E15] rounded-lg overflow-hidden flex items-center justify-center relative group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Lesson"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <FiImage size={40} className="text-[#231E15]" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-[8px] font-mono uppercase text-white">
                    Current View
                  </p>
                </div>
              </div>

              {/* Upload Input */}
              <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#231E15] rounded-lg cursor-pointer hover:border-[#E5A93C]/30 transition-colors bg-black/20">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="text-[#E5A93C] mb-2" />
                    <p className="text-[10px] text-[#E6DFD3] font-mono uppercase tracking-tighter">
                      Click to upload new image
                    </p>
                    <p className="text-[8px] text-[#5C544A] mt-1 uppercase">
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
                  <p className="text-[10px] text-[#E5A93C] mt-2 font-mono italic">
                    New image selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-2 tracking-widest">
                Lesson Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-[#14110C] border border-[#231E15] rounded-lg p-4 text-[#E6DFD3] focus:border-[#E5A93C] outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-2 tracking-widest">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-[#14110C] border border-[#231E15] rounded-lg p-4 text-[#E6DFD3] outline-none"
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
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-2 tracking-widest">
                Emotional Tone
              </label>
              <select
                name="emotionalTone"
                value={formData.emotionalTone}
                onChange={handleChange}
                className="w-full bg-[#14110C] border border-[#231E15] rounded-lg p-4 text-[#E6DFD3] outline-none"
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
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-2 tracking-widest">
                Full Insight / Story
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
                className="w-full bg-[#14110C] border border-[#231E15] rounded-lg p-4 text-[#E6DFD3] outline-none resize-none"
              ></textarea>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-2 tracking-widest">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full bg-[#14110C] border border-[#231E15] rounded-lg p-4 text-[#E6DFD3] outline-none"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            {/* Access Level */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#5C544A] mb-2 tracking-widest">
                Access Control
              </label>
              <select
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleChange}
                disabled={!isPremiumUser}
                className={`w-full bg-[#14110C] border border-[#231E15] rounded-lg p-4 text-[#E6DFD3] outline-none ${!isPremiumUser && 'opacity-50'}`}
              >
                <option value="Free">Free Access</option>
                <option value="Premium">Premium ⭐</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={updating}
            type="submit"
            className="w-full bg-[#E5A93C] text-black py-4 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {updating ? (
              'SYNCING ARCHIVE...'
            ) : (
              <>
                <FiSave /> Update Wisdom
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
