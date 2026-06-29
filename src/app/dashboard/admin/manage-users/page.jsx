'use client';
import { authClient } from '@/lib/auth-client';
import { api } from '@/lib/reusableApi';
import Image from 'next/image';
import Link from 'next/link'; // নিশ্চিত করুন এটি ইমপোর্ট করা আছে
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
import ConfiremDeletModal from '../manage-lessons/ConfiremDeletModal';

const ManageUsersByAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: '', user: null });

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  const getUsers = async () => {
    try {
      const data = await api.get('/admin/users');
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error.message);
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    const targetUser = modal.user;
    setUsers(prev =>
      prev.map(u => (u._id === targetUser._id ? { ...u, role: 'admin' } : u)),
    );
    setModal({ isOpen: false, type: '', user: null });

    try {
      await api.patch(`/admin/users/role/${targetUser._id}`, {});
      toast.success(`${targetUser.name} is now an Admin!`);
    } catch (err) {
      getUsers();
      toast.error('Failed to promote user.');
    }
  };

  const handleDelete = async () => {
    const targetUser = modal.user;
    setUsers(prev => prev.filter(u => u._id !== targetUser._id));
    setModal({ isOpen: false, type: '', user: null });

    try {
      await api.delete(`/admin/users/${targetUser._id}`);
      toast.success('User removed from system.');
    } catch (err) {
      getUsers();
      toast.error('Deletion failed.');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

      <ConfiremDeletModal
        isOpen={modal.isOpen}
        type={modal.type}
        onClose={() => setModal({ isOpen: false, type: '', user: null })}
        onConfirm={modal.type === 'promote' ? handlePromote : handleDelete}
        title={modal.type === 'promote' ? 'Promote User' : 'Delete User'}
        message={
          modal.type === 'promote'
            ? `Grant Admin access to ${modal.user?.name}?`
            : `Are you sure you want to permanently delete ${modal.user?.name}?`
        }
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-gray-800 pb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#d4af37] flex items-center gap-3 uppercase tracking-tighter">
              <FaUsersCog className="text-white" /> User Management
            </h2>
          </div>

          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="SEARCH BY NAME..."
              className="w-full bg-[#111] border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-[11px] font-bold focus:border-[#d4af37] outline-none transition-all uppercase tracking-widest text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-black/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
              <tr>
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Email</th>
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
                    {/* এখানে Link ব্যবহার করা হয়েছে */}
                    <Link
                      href={`/author-profile/${user._id}`}
                      className="group flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full border border-gray-700 overflow-hidden shrink-0 group-hover:border-[#d4af37] transition-all">
                        {user.image || user.photoURL ? (
                          <Image
                            width={40}
                            height={40}
                            src={user.image || user.photoURL}
                            className="w-full h-full object-cover"
                            alt="user"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black text-[#d4af37] font-black text-xs">
                            {getInitials(user.name)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200 uppercase group-hover:text-[#d4af37] transition-all">
                          {user.name}
                        </p>
                        {user.isPremium && (
                          <span className="text-[8px] text-[#d4af37] font-black uppercase flex items-center gap-1">
                            <FaCrown size={8} /> Premium
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-8 py-6 text-xs text-gray-500 font-mono">
                    {user.email}
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`text-[9px] font-black px-3 py-1 rounded-full border ${user.role === 'admin' ? 'border-[#d4af37] text-[#d4af37]' : 'border-gray-800 text-gray-500'}`}
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
                          onClick={() =>
                            setModal({ isOpen: true, type: 'promote', user })
                          }
                          className="text-[9px] font-black uppercase border hover:cursor-pointer border-gray-700 px-4 py-2 hover:bg-[#d4af37] hover:text-black transition-all rounded-md"
                        >
                          Set Admin
                        </button>
                      )}
                      <button
                        disabled={session?.user?.id === user._id}
                        onClick={() =>
                          setModal({ isOpen: true, type: 'delete', user })
                        }
                        className="p-2 text-gray-700 hover:text-red-500 disabled:opacity-20 cursor-pointer"
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

        {/* Mobile View */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-xl"
            >
              {/* মোবাইল ভিউতে এখানে Link ব্যবহার করা হয়েছে */}
              <Link
                href={`/author-profile/${user._id}`}
                className="group flex items-center gap-4 mb-6"
              >
                <div className="w-12 h-12 rounded-full border border-gray-700 overflow-hidden flex items-center justify-center bg-black group-hover:border-[#d4af37] transition-all">
                  {user.image ? (
                    <Image
                      width={48}
                      height={48}
                      src={user.image}
                      className="rounded-full"
                      alt="img"
                    />
                  ) : (
                    <span className="text-xs font-black text-[#d4af37]">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase group-hover:text-[#d4af37] transition-all">
                    {user.name}
                  </h4>
                  <p className="text-[10px] text-gray-600 font-mono">
                    {user.email}
                  </p>
                </div>
              </Link>

              <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                <span className="text-xl font-mono font-black text-[#d4af37]">
                  {user.totalLessons || 0}
                </span>
                <div className="flex gap-2">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() =>
                        setModal({ isOpen: true, type: 'promote', user })
                      }
                      className="bg-white/5 p-2 rounded-lg text-[#d4af37] hover:bg-amber-500 hover:text-black transition-all"
                    >
                      <FaShieldAlt size={14} />
                    </button>
                  )}
                  <button
                    disabled={session?.user?.id === user._id}
                    onClick={() =>
                      setModal({ isOpen: true, type: 'delete', user })
                    }
                    className="p-2 text-gray-700 hover:text-red-500 disabled:opacity-20"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageUsersByAdminPage;
