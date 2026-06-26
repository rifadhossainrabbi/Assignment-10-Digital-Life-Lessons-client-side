'use client';
import { authClient } from '@/lib/auth-client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaTrashAlt,
  FaUsersCog,
  FaSearch,
  FaShieldAlt,
  FaCrown,
} from 'react-icons/fa';

const ManageUsersByAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    getUsers();
  }, []);

  // Security Check: Redirect if session is missing
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  // Fetch all users from the database
  const getUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/users`,
      );
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setLoading(false);
    }
  };

  // Filter users based on Search Term (Name Only)
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Update user role to Admin
  const handlePromote = async user => {
    if (!window.confirm(`Promote ${user.name} to Administrator?`)) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/users/role/${user._id}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' } },
      );
      const resData = await response.json();
      if (resData.modifiedCount > 0) {
        getUsers();
        toast.success(`${user.name} is now an Admin!`);
      }
    } catch (err) {
      toast.error('Failed to promote user.');
    }
  };

  // Delete user account permanently
  const handleDelete = async user => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`))
      return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/users/${user._id}`,
        {
          method: 'DELETE',
        },
      );
      const resData = await response.json();
      if (resData.deletedCount > 0) {
        getUsers();
        toast.success('User removed from system.');
      }
    } catch (err) {
      toast.error('Deletion failed.');
    }
  };

  // Helper: Get initials for avatar fallback
  const getInitials = name =>
    name ? name.substring(0, 2).toUpperCase() : '??';

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4af37]"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-[#0a0a0a] min-h-screen text-white font-sans">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-gray-800 pb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#d4af37] flex items-center gap-3 uppercase tracking-tighter">
              <FaUsersCog className="text-white" /> User Management
            </h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-1 font-bold">
              System Personnel Registry
            </p>
          </div>

          {/* Search Box - Specific for Name */}
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="SEARCH BY USER NAME..."
              className="w-full bg-[#111] border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-[11px] font-bold focus:border-[#d4af37] outline-none transition-all uppercase tracking-widest text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop View: Table Layout */}
        <div className="hidden lg:block bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
              <tr>
                <th className="px-8 py-5">User Identity</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Authority</th>
                <th className="px-8 py-5 text-center">Lessons</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {filteredUsers.map(user => (
                <tr
                  key={user._id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-gray-700 p-0.5 flex items-center justify-center bg-black overflow-hidden shrink-0">
                        {user.image || user.photoURL ? (
                          <Image
                            width={30}
                            height={30}
                            src={user.image || user.photoURL}
                            className="w-full h-full rounded-full object-cover grayscale"
                            alt="user img"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-[#d4af37] font-mono">
                            {getInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200 uppercase tracking-tight">
                          {user.name}
                        </p>
                        {user.isPremium && (
                          <span className="text-[8px] text-[#d4af37] font-black uppercase flex items-center gap-1">
                            <FaCrown size={8} /> Premium Subscriber
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 font-mono italic">
                    {user.email}
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`text-[9px] font-black px-3 py-1 rounded-full border ${user.role === 'admin' ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5' : 'border-gray-800 text-gray-500'} uppercase tracking-widest`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center text-[#d4af37] font-black font-mono text-lg">
                    {user.totalLessons || 0}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handlePromote(user)}
                          className="text-[9px] font-black uppercase tracking-widest border border-gray-700 px-4 py-2 hover:bg-[#d4af37] hover:text-black hover:border-[#d4af37] transition-all"
                        >
                          Promote
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Card Layout */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className="bg-[#111] p-6 rounded-2xl border border-white/5 relative group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-gray-700 p-1 flex items-center justify-center shrink-0">
                  {user.image || user.photoURL ? (
                    <Image
                      width={20}
                      height={20}
                      src={user.image || user.photoURL}
                      className="w-full h-full rounded-full object-cover"
                      alt="user img"
                    />
                  ) : (
                    <span className="text-xs font-black text-[#d4af37]">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-black text-white uppercase truncate">
                    {user.name}
                  </h4>
                  <p className="text-[10px] text-gray-600 font-mono truncate italic">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                <div className="flex flex-col">
                  <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">
                    Total Lessons
                  </span>
                  <span className="text-xl font-mono font-black text-[#d4af37]">
                    {user.totalLessons || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handlePromote(user)}
                      className="bg-white/5 p-2 rounded-lg text-[#d4af37] border border-white/5"
                    >
                      <FaShieldAlt size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(user)}
                    className="bg-red-500/10 p-2 rounded-lg text-red-500 border border-red-500/10"
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="mt-10 py-20 text-center border border-dashed border-gray-800 rounded-2xl">
            <p className="text-gray-600 font-black uppercase text-[10px] tracking-[0.4em]">
              No matching personnel found in registry
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsersByAdminPage;
