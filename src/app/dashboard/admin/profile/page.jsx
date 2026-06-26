'use client';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaUserShield,
  FaEdit,
  FaCheckCircle,
  FaStar,
  FaHistory,
  FaEnvelope,
  FaFingerprint,
  FaShieldAlt,
} from 'react-icons/fa';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AdminProfilePage = () => {
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;
  const router = useRouter();

  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', image: '' });

  useEffect(() => {
    if (currentUser) {
      fetchAdminProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  const fetchAdminProfile = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/users`,
      );
      const allUsers = await response.json();

      const currentAdmin = allUsers.find(
        u => u.role === 'admin' && u.email === currentUser.email,
      );

      if (currentAdmin) {
        setAdminData(currentAdmin);
        setFormData({
          name: currentAdmin.name,
          image: currentAdmin.image || currentAdmin.photoURL || '',
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Core archive scan failed:', error);
      setLoading(false);
    }
  };

  const handleUpdate = async e => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/profile/update/${adminData._id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        toast.success('Admin profile credentials updated successfully!');
        setIsEditing(false);
        fetchAdminProfile();
      }
    } catch (err) {
      toast.error('Registry sync failed');
    }
  };

  // name er first 2 digit 
  const getInitials = name => {
    if (!name) return 'AD';
    return name.substring(0, 2).toUpperCase();
  };

  if (loading)
    return (
      <div className="p-20 text-center text-[#fcd34d] font-mono tracking-widest bg-[#0a0a0a] min-h-screen">
        SCANNING CORE REGISTRY...
      </div>
    );

  if (!adminData)
    return (
      <div className="p-20 text-center text-red-500 font-bold uppercase tracking-widest bg-[#0a0a0a] min-h-screen">
        ACCESS DENIED: MASTER ARCHIVE RECORD NOT FOUND
      </div>
    );

  return (
    <div className="p-4 md:p-10 bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-[#fcd34d] selection:text-black">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-b border-gray-800 pb-8">
          <h2 className="text-3xl font-light tracking-[6px] text-[#fcd34d] uppercase flex items-center gap-4">
            <FaUserShield className="text-2xl" /> Master Administrator Profile
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Identity Section */}
          <div className="lg:col-span-4 bg-gray-900/30 border border-gray-800 p-10 rounded-sm text-center shadow-2xl h-fit">
            <div className="relative inline-block mb-8">
              {/* Profile Image Logic */}
              <div className="w-40 h-40 rounded-full border-2 border-[#fcd34d]/20 p-2 overflow-hidden bg-black shadow-inner flex items-center justify-center">
                {adminData.image || adminData.photoURL ? (
                  <Image
                    width={30}
                    height={30}
                    src={adminData.image || adminData.photoURL}
                    alt="admin"
                    className="w-full h-full rounded-full object-cover grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-700"
                  />
                ) : (
                  /* image na thkale nam dekhabe */
                  <div className="text-5xl font-black text-[#fcd34d] font-mono tracking-tighter">
                    {getInitials(adminData.name)}
                  </div>
                )}
              </div>

              {/* Official Admin Role Badge */}
              <div className="absolute -bottom-2 -right-2 bg-[#fcd34d] text-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0a0a]">
                <FaShieldAlt size={18} />
              </div>
            </div>

            <h3 className="text-2xl font-bold tracking-wide text-gray-100 uppercase">
              {adminData.name}
            </h3>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-3 mb-8 italic">
              <FaEnvelope /> {adminData.email}
            </div>

            <div className="bg-[#fcd34d]/5 border border-[#fcd34d]/30 text-[#fcd34d] px-8 py-2 text-[10px] font-black tracking-[4px] uppercase inline-block">
              {adminData.role} Authority Verified
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-10 flex items-center gap-2 mx-auto text-gray-600 hover:text-[#fcd34d] transition-all text-[9px] uppercase font-bold tracking-[3px]"
            >
              <FaEdit /> {isEditing ? 'Cancel Edit' : 'Modify Credentials'}
            </button>
          </div>

          {/* Details & Activity Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-gray-900/20 border border-gray-800 p-8 rounded-sm">
              <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-[4px] mb-8 flex items-center gap-2">
                <FaHistory className="text-[#fcd34d]" /> Operational Activity
                Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 border-l-2 border-[#fcd34d]">
                  <p className="text-[9px] text-gray-600 uppercase mb-2 font-bold tracking-widest">
                    Total Lessons Authored
                  </p>
                  <p className="text-4xl font-mono font-bold text-gray-200">
                    {adminData.totalLessons || 0}
                  </p>
                </div>
                <div className="bg-black/40 p-6 border-l-2 border-indigo-500">
                  <p className="text-[9px] text-gray-600 uppercase mb-2 font-bold tracking-widest">
                    Platform Moderation
                  </p>
                  <p className="text-4xl font-mono font-bold text-indigo-400 uppercase">
                    Active
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Update Form */}
            {isEditing && (
              <form
                onSubmit={handleUpdate}
                className="bg-[#fcd34d]/5 border border-[#fcd34d]/20 p-10 rounded-sm animate-in fade-in duration-500"
              >
                <h4 className="text-[#fcd34d] text-[10px] font-bold uppercase tracking-[3px] mb-8">
                  Override Registry Credentials
                </h4>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-gray-600 tracking-widest ml-1">
                      Identity Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-black border border-gray-800 p-4 text-sm text-gray-300 focus:border-[#fcd34d] outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase font-bold text-gray-600 tracking-widest ml-1">
                      Visual Archive URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={e =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="Leave empty to use initials"
                      className="w-full bg-black border border-gray-800 p-4 text-sm text-gray-300 focus:border-[#fcd34d] outline-none transition-all font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#fcd34d] text-black w-full py-4 text-[10px] font-black uppercase tracking-[3px] hover:bg-white transition-all shadow-xl"
                  >
                    Save to Central Database
                  </button>
                </div>
              </form>
            )}

            {/* System Registry Metadata */}
            <div className="bg-gray-900/10 border border-gray-800 p-8 rounded-sm">
              <h4 className="text-gray-700 text-[10px] font-bold uppercase tracking-[4px] mb-8">
                System Registry Metadata
              </h4>
              <div className="space-y-6 text-xs text-gray-500 font-mono">
                <div className="flex justify-between border-b border-gray-900 pb-3">
                  <span className="flex items-center gap-2">
                    <FaFingerprint /> Unique Identifier
                  </span>
                  <span className="text-gray-300 uppercase">
                    {adminData._id}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-900 pb-3">
                  <span className="flex items-center gap-2 tracking-widest">
                    Authority Status
                  </span>
                  <span className="text-[#fcd34d] uppercase font-bold tracking-widest">
                    Level 1 Admin
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 tracking-widest text-emerald-600 font-bold">
                    Encrypted Sync
                  </span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1 uppercase tracking-tighter">
                    <FaCheckCircle /> Online & Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
