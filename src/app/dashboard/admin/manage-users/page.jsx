'use client';
import { authClient } from '@/lib/auth-client';
import { api } from '@/lib/reusableApi';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaTrashAlt,
  FaUsersCog,
  FaSearch,
  FaShieldAlt,
  FaCrown,
  FaExclamationTriangle,
} from 'react-icons/fa';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-gray-800 p-8 rounded-2xl w-full max-w-sm text-center">
        <FaExclamationTriangle className="text-[#d4af37] text-4xl mx-auto mb-4" />
        <h3 className="text-white font-black text-xl mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-8">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-bold uppercase border border-gray-700 hover:bg-gray-800 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-[10px] font-black uppercase bg-[#d4af37] text-black rounded-lg"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // 2. Fetch users using api.get
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

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 3. Promote user using api.patch (Token attached automatically)
  const handlePromote = async () => {
    const user = modal.user;
    try {
      // Body can be empty as the backend route handles the role update
      const resData = await api.patch(`/admin/users/role/${user._id}`, {});

      if (resData.modifiedCount > 0) {
        getUsers(); // Refresh the personnel list
        toast.success(`${user.name} is now an Admin!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to promote user.');
    }
    setModal({ isOpen: false, type: '', user: null });
  };

  // 4. Delete user using api.delete (Token attached automatically)
  const handleDelete = async () => {
    const user = modal.user;
    try {
      const resData = await api.delete(`/admin/users/${user._id}`);

      if (resData.deletedCount > 0) {
        getUsers(); // Refresh the personnel list
        toast.success('User removed from system.');
      }
    } catch (err) {
      toast.error(err.message || 'Deletion failed.');
    }
    setModal({ isOpen: false, type: '', user: null });
  };

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
      {/* promote admin modal */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, type: '', user: null })}
        onConfirm={modal.type === 'promote' ? handlePromote : handleDelete}
        title={modal.type === 'promote' ? 'Promote User' : 'Delete User'}
        message={
          modal.type === 'promote'
            ? `Are you sure you want to promote ${modal.user?.name} to Administrator?`
            : `This action will permanently remove ${modal.user?.name} from the system. Are you sure?`
        }
      />

      {/* main data */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-gray-800 pb-8">
          {/* header */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#d4af37] flex items-center gap-3 uppercase tracking-tighter">
              <FaUsersCog className="text-white" /> User Management
            </h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-1 font-bold">
              System Personnel Registry
            </p>
          </div>

          {/* search */}
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

        {/* Table Layout */}
        <div className="hidden lg:block bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            {/* table headers */}
            <thead className="bg-black/50 text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
              <tr>
                <th className="px-8 py-5">User Identity</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Authority</th>
                <th className="px-8 py-5 text-center">Lessons</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>

            {/* table */}
            <tbody className="divide-y divide-gray-900">
              {filteredUsers.map(user => (
                <tr
                  key={user._id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* user info */}
                  <td className="px-8 py-6">
                    <Link href={`/author-profile/${user._id}`}>
                      <div className="flex items-center gap-4">
                        {/* image */}
                        <div className="w-10 h-10 rounded-full border hover:border-amber-500 border-gray-700 flex items-center justify-center bg-black overflow-hidden shrink-0">
                          {user.image || user.photoURL ? (
                            <Image
                              width={30}
                              height={30}
                              src={user.image || user.photoURL}
                              className="w-full h-full object-cover"
                              alt="user"
                            />
                          ) : (
                            <span className="text-[10px] font-black text-[#d4af37]">
                              {getInitials(user.name)}
                            </span>
                          )}
                        </div>
                        {/* name */}
                        <div>
                          <p className="text-sm font-bold text-gray-200 hover:text-amber-500 uppercase">
                            {user.name}
                          </p>
                          {user.isPremium && (
                            <span className="text-[8px] text-[#d4af37] font-black uppercase flex items-center gap-1">
                              <FaCrown size={8} /> Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </td>

                  {/* user email */}
                  <td className="px-8 py-6 text-xs text-gray-500 font-mono italic">
                    {user.email}
                  </td>

                  {/* user role */}
                  <td className="px-8 py-6">
                    <span
                      className={`text-[9px] font-black px-3 py-1 rounded-full border ${user.role === 'admin' ? 'border-[#d4af37] text-[#d4af37]' : 'border-gray-800 text-gray-500'}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* user totallesson */}
                  <td className="px-8 py-6 text-center text-[#d4af37] font-black font-mono text-lg">
                    {user.totalLessons || 0}
                  </td>

                  {/* admin action buttons(set admin, delete user) */}
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() =>
                            setModal({ isOpen: true, type: 'promote', user })
                          }
                          className="text-[9px] font-black uppercase border border-gray-700 px-4 py-2 hover:bg-[#d4af37] hover:text-black transition-all"
                        >
                          Set Admin
                        </button>
                      )}
                      <button
                        disabled={session?.user?.id === user._id}
                        onClick={() =>
                          setModal({ isOpen: true, type: 'delete', user })
                        }
                        className="p-2 text-gray-700 hover:text-red-500 disabled:text-gray-900"
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
              className="bg-[#111] p-6 rounded-2xl border border-white/5"
            >
              {/* user info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center">
                  {user.image ? (
                    <Image
                      width={40}
                      height={40}
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
                  <h4 className="text-sm font-black text-white uppercase">
                    {user.name}
                  </h4>
                  <p className="text-[10px] text-gray-600 font-mono italic">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* totallesson and action buttons */}
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
                      className="bg-white/5 p-2 rounded-lg text-[#d4af37]"
                    >
                      <FaShieldAlt size={14} />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setModal({ isOpen: true, type: 'delete', user })
                    }
                    className="p-2 text-gray-700 hover:text-red-500"
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
