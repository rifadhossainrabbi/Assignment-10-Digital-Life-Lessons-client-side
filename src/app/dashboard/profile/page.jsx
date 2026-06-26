'use client';

import React, { useState, useEffect } from 'react';
import {
  FiStar,
  FiEdit3,
  FiSave,
  FiBook,
  FiHeart,
  FiUser,
  FiLoader,
} from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const UserProfile = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [userLessons, setUserLessons] = useState([]);
  const [favCount, setFavCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user?.name);
      setPhotoURL(user.image || '');

      fetch(`${serverUrl}/lessons/user/${user.id}`)
        .then(res => res.json())
        .then(data => setUserLessons(data))
        .catch(() => toast.error('Could not load your archive'));

      fetch(`${serverUrl}/favorites/${user.id}`)
        .then(res => res.json())
        .then(data => setFavCount(data.length))
        .catch(() => console.error('Fav count error'));
    }
  }, [user, serverUrl]);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  // --- Helper: Get Initials from Name ---
  const getInitials = fullName => {
    if (!fullName) return '??';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // --- Helper: Format Join Date ---
  const formattedJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown';

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${serverUrl}/admin/profile/update/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image: photoURL }),
      });

      if (res.ok) {
        toast.success('Profile updated in the archives');
        setIsEditing(false);
        window.location.reload();
      }
    } catch (err) {
      toast.error('Archive sync failed');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isPending)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center">
        <FiLoader className="text-[#E5A93C] animate-spin" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-6 md:p-12 font-sans">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* --- PROFILE HEADER --- */}
        <section className="bg-[#14110C] border border-[#231E15] rounded-2xl p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5A93C]/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            {/* Avatar Logic: Image vs Initials */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-[#231E15] ring-2 ring-[#E5A93C]/20 flex items-center justify-center bg-[#1A1612]">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={user?.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <span className="text-4xl md:text-6xl font-serif text-[#E5A93C] tracking-tighter">
                    {getInitials(user?.name)}
                  </span>
                )}
              </div>
              {user?.plan === 'premium' && (
                <div className="absolute bottom-2 right-2 bg-[#E5A93C] p-2 rounded-full text-black shadow-lg">
                  <FiStar size={18} fill="currentColor" />
                </div>
              )}
            </div>

            <div className="flex-grow text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4 max-w-md mx-auto md:mx-0">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#0F0D0A] border border-[#231E15] p-3 rounded-lg outline-none focus:border-[#E5A93C] transition-all text-sm"
                    placeholder="Update Name"
                  />
                  <input
                    type="text"
                    value={photoURL}
                    onChange={e => setPhotoURL(e.target.value)}
                    className="w-full bg-[#0F0D0A] border border-[#231E15] p-3 rounded-lg outline-none focus:border-[#E5A93C] transition-all text-sm"
                    placeholder="Photo URL"
                  />
                  <div className="flex gap-3 justify-center md:justify-start">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="bg-[#E5A93C] text-black px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all"
                    >
                      {isUpdating ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiSave />
                      )}{' '}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-transparent border border-[#231E15] text-[#5C544A] px-6 py-2 rounded-lg text-xs font-bold uppercase hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <h1 className="text-3xl md:text-5xl font-serif text-white">
                      {user?.name}
                    </h1>
                    {user?.plan === 'premium' && (
                      <span className="text-[10px] font-mono text-[#E5A93C] bg-[#E5A93C]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#E5A93C]/20">
                        Premium ⭐
                      </span>
                    )}
                  </div>
                  <p className="text-[#5C544A] font-mono text-sm mt-2">
                    {user?.email}
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 flex items-center gap-2 text-[#E5A93C] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    <FiEdit3 /> Edit Archive Identity
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#14110C] border border-[#231E15] p-8 rounded-xl group hover:border-[#E5A93C]/30 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-4xl font-serif text-[#E5A93C]">
                  {userLessons.length}
                </h3>
                <p className="text-[10px] uppercase font-mono text-[#5C544A] tracking-widest mt-2">
                  Lessons Created
                </p>
              </div>
              <FiBook
                className="text-[#231E15] group-hover:text-[#E5A93C] transition-colors"
                size={24}
              />
            </div>
          </div>

          <div className="bg-[#14110C] border border-[#231E15] p-8 rounded-xl group hover:border-[#E5A93C]/30 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-4xl font-serif text-[#E5A93C]">
                  {favCount}
                </h3>
                <p className="text-[10px] uppercase font-mono text-[#5C544A] tracking-widest mt-2">
                  Saved in Favorites
                </p>
              </div>
              <FiHeart
                className="text-[#231E15] group-hover:text-rose-500 transition-colors"
                size={24}
              />
            </div>
          </div>

          <div className="bg-[#14110C] border border-[#231E15] p-8 rounded-xl flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-[#E5A93C]/10 rounded-full flex items-center justify-center text-[#E5A93C]">
              <FiUser />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#E6DFD3]">
                Active Author Since
              </h4>
              <p className="text-[10px] font-mono text-[#E5A93C] mt-1 italic font-bold">
                {formattedJoinDate}
              </p>
            </div>
          </div>
        </div>

        {/* --- MY LESSONS GRID --- */}
        <section>
          <div className="flex items-center justify-between mb-10 border-b border-[#231E15] pb-4">
            <h2 className="text-2xl font-serif text-white italic">
              Public Contributions
            </h2>
            <p className="text-[10px] font-mono text-[#5C544A] uppercase tracking-widest">
              Archive Collection
            </p>
          </div>

          {userLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userLessons
                .filter(l => l.visibility === 'Public')
                .map(lesson => (
                  <motion.div
                    key={lesson._id}
                    whileHover={{ y: -5 }}
                    className="bg-[#14110C] border border-[#231E15] rounded-xl overflow-hidden group"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={lesson.image}
                        alt={lesson.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-60 group-hover:opacity-100"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-[#E5A93C] uppercase tracking-tighter">
                        {lesson.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="text-sm font-serif text-white line-clamp-1 group-hover:text-[#E5A93C] transition-colors">
                        {lesson.title}
                      </h4>
                      <p className="text-[10px] text-[#5C544A] font-mono mt-2 flex items-center gap-2">
                        {lesson.accessLevel === 'Premium' ? (
                          <FiStar className="text-[#E5A93C]" />
                        ) : (
                          <FiStar />
                        )}{' '}
                        {lesson.accessLevel}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-[#231E15] rounded-2xl text-[#5C544A] font-mono text-sm uppercase tracking-widest">
              No public entries found in your archive.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
