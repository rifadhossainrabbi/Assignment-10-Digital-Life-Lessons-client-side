'use client';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaUserShield,
  FaTrashAlt,
  FaUserCircle,
  FaUsersCog,
} from 'react-icons/fa';

const ManageUsersByAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/users');
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handlePromote = async user => {
    if (!window.confirm(`Promote ${user.name} to Admin?`)) return;
    try {
      const response = await fetch(
        `http://localhost:5000/admin/users/role/${user._id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        },
      );
      const resData = await response.json();
      if (resData.modifiedCount > 0) {
        getUsers();
        toast.success(`${user.name} is now an Admin!`, {
          style: {
            background: '#1a1a1a',
            color: '#fcd34d',
            border: '1px solid #fcd34d',
          },
        });
      }
    } catch (err) {
      toast.error('Promotion failed.');
    }
  };

  const handleDelete = async user => {
    if (!window.confirm(`Delete ${user.name}'s account?`)) return;
    try {
      const response = await fetch(
        `http://localhost:5000/admin/users/${user._id}`,
        {
          method: 'DELETE',
        },
      );
      const resData = await response.json();
      if (resData.deletedCount > 0) {
        getUsers();
        toast.success('User deleted');
      }
    } catch (err) {
      toast.error('Error deleting user');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fcd34d]"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-10 bg-[#0a0a0a] min-h-screen text-white font-sans">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 border-b border-gray-800 pb-6">
          <h2 className="text-2xl font-light tracking-[4px] text-[#fcd34d] flex items-center gap-3 uppercase">
            <FaUsersCog /> Manage Users
          </h2>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">
            Administrative Control Panel
          </p>
        </header>

        {/* Table Following Requirements */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] uppercase tracking-[2px] text-gray-500">
                <th className="px-6 py-4 font-bold">User Information</th>
                <th className="px-6 py-4 font-bold">Email Address</th>
                <th className="px-6 py-4 font-bold">Current Role</th>
                <th className="px-6 py-4 font-bold text-center">
                  Lessons Created
                </th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {users.map(user => (
                <tr
                  key={user._id}
                  className="hover:bg-white/[0.02] transition-all group"
                >
                  {/* Column 1: User Info */}
                  <td className="px-6 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-gray-700 p-0.5 rounded-sm">
                        {user.image || user.photoURL ? (
                          <img
                            src={user.image || user.photoURL}
                            alt=""
                            className="w-full h-full object-cover grayscale-[50%]"
                          />
                        ) : (
                          <FaUserCircle className="w-full h-full text-gray-700" />
                        )}
                      </div>
                      <span className="text-lg font-medium text-gray-200 tracking-wide">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Column 2: Email */}
                  <td className="px-6 py-8 text-sm text-gray-500 font-light tracking-wide">
                    {user.email}
                  </td>

                  {/* Column 3: Role (Styled like image tiers) */}
                  <td className="px-6 py-8">
                    <div className="border border-gray-700 bg-gray-900/50 px-3 py-1 inline-block">
                      <span className="text-[10px] font-bold tracking-[2px] text-gray-400 uppercase">
                        {user.role === 'admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </div>
                  </td>

                  {/* Column 4: Lessons Count */}
                  <td className="px-6 py-8 text-center">
                    <span className="text-[#fcd34d] font-mono font-bold text-lg">
                      {user.totalLessons || 0}
                    </span>
                  </td>

                  {/* Column 5: Actions */}
                  <td className="px-6 py-8 text-right">
                    <div className="flex items-center justify-end gap-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handlePromote(user)}
                          className="border border-[#fcd34d]/40 text-[#fcd34d] hover:bg-[#fcd34d] hover:text-black transition-all px-4 py-2 text-[10px] font-bold tracking-[2px] uppercase"
                        >
                          Promote to Admin
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-gray-600 hover:text-red-500 transition-colors p-2"
                        title="Delete User"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersByAdminPage;
