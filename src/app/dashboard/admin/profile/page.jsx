'use client';

import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaUserShield,
  FaEdit,
  FaEnvelope,
  FaShieldAlt,
  FaSave,
  FaUserCircle,
} from 'react-icons/fa';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/reusableApi';

const AdminProfilePage = () => {
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', image: '' });

  // Redirect if not logged in
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    } else if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        image: currentUser.image || currentUser.photoURL || '',
      });
      setLoading(false);
    }
  }, [session, isPending, router, currentUser]);

  const handleUpdate = async e => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Name is required');

    try {
      const response = await api.patch(
        `/profile/update/${currentUser.id}`,
        formData,
      );

      if (response?.success) {
        toast.success('Admin profile updated successfully');
        setIsEditing(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading || isPending) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#E5A93C]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E6DFD3] p-6 md:p-12 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#231E15] pb-8 gap-4">
          <h2 className="text-3xl font-serif text-white uppercase italic tracking-tight flex items-center gap-3">
            <FaUserShield className="text-[#E5A93C]" /> Admin Profile
          </h2>
          <div className="bg-[#E5A93C] text-black px-5 py-2 rounded-full text-xs font-black uppercase tracking-[2px] flex items-center gap-2 shadow-[0_0_15px_rgba(229,169,60,0.3)]">
            <FaShieldAlt /> {currentUser?.role?.toUpperCase() || 'ADMIN'}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-[#14110C] border border-[#231E15] p-10 rounded-2xl text-center shadow-2xl flex flex-col items-center">
            {/* Profile Image / Initials Logic */}
            <div className="w-40 h-40 rounded-full border-4 border-[#231E15] p-1 bg-[#0A0A0A] overflow-hidden mb-6 flex items-center justify-center">
              {currentUser?.image || currentUser?.photoURL ? (
                <img
                  src={currentUser?.image || currentUser?.photoURL}
                  alt="Admin"
                  className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="text-5xl font-serif font-bold text-[#E5A93C] uppercase tracking-tighter">
                  {currentUser?.name ? currentUser.name.slice(0, 2) : 'AD'}
                </div>
              )}
            </div>

            <h3 className="text-2xl font-serif text-white tracking-wide">
              {currentUser?.name}
            </h3>
            <p className="text-[#5C544A] text-sm mt-2 flex items-center justify-center gap-2 font-mono italic">
              <FaEnvelope className="text-[#E5A93C]" /> {currentUser?.email}
            </p>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-10 w-full text-[#E5A93C] text-[10px] font-bold uppercase tracking-[2px] border border-[#231E15] py-4 rounded-xl hover:bg-[#1A1612] transition-all flex items-center justify-center gap-2"
            >
              <FaEdit /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <div className="bg-[#14110C] border border-[#231E15] rounded-2xl p-1">
            {isEditing ? (
              <form
                onSubmit={handleUpdate}
                className="p-8 space-y-6 h-full flex flex-col justify-center"
              >
                <div className="text-center mb-4">
                  <h4 className="text-[#E5A93C] text-[10px] font-black uppercase tracking-[4px]">
                    Update Registry
                  </h4>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[#5C544A] tracking-widest ml-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-[#0A0A0A] border border-[#231E15] p-4 text-sm text-white focus:border-[#E5A93C] outline-none rounded-xl font-mono"
                    placeholder="Admin Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[#5C544A] tracking-widest ml-1">
                    Profile Photo URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={e =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full bg-[#0A0A0A] border border-[#231E15] p-4 text-sm text-white focus:border-[#E5A93C] outline-none rounded-xl font-mono"
                    placeholder="https://image-url.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#E5A93C] text-black py-4 rounded-xl text-xs font-black uppercase tracking-[3px] hover:bg-white transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <FaSave /> Save Changes
                </button>
              </form>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                <FaUserCircle className="text-6xl text-[#231E15]" />
                <p className="text-[#5C544A] text-sm font-serif italic">
                  Manage your administrative credentials. You can modify your
                  display name and profile image to be recognized across the
                  platform.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
