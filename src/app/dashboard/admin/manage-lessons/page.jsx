'use client';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import {
  FaTrashAlt,
  FaStar,
  FaCheckCircle,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaArchive,
  FaUser,
  FaExternalLinkAlt,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { api } from '@/lib/reusableApi';
import { FiBookOpen } from 'react-icons/fi';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-gray-800 p-8 rounded-2xl w-full max-w-sm text-center">
        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
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
            className="flex-1 py-3 text-[10px] font-black uppercase bg-red-600 text-white rounded-lg"
          >
            Purge Record
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageLessonsPageByAdmin = () => {
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    publicCount: 0,
    privateCount: 0,
    featuredCount: 0,
    flaggedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState({ isOpen: false, lesson: null });


  const [imageErrors, setImageErrors] = useState({});

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  const fetchLessons = async () => {
    try {
      const data = await api.get('/admin/all-lessons');
      setLessons(data.lessons);
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || 'System sync failed');
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, field, currentValue) => {
    try {
      await api.patch(`/admin/lessons/status/${id}`, {
        [field]: !currentValue,
      });
      fetchLessons();
      toast.success(`${field.replace('is', '')} status updated`);
    } catch (err) {
      toast.error(err.message || 'Registry update failed');
    }
  };

  const handleDeleteLesson = async () => {
    const { lesson } = modal;
    try {
      await api.delete(`/admin/lessons/${lesson._id}`);
      fetchLessons();
      toast.success('Record purged successfully');
    } catch (err) {
      toast.error(err.message || 'Purge failed');
    }
    setModal({ isOpen: false, lesson: null });
  };

  const handleImageError = id => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const filteredLessons = lessons.filter(l => {
    if (filter === 'All') return true;
    if (filter === 'Public' || filter === 'Private')
      return l.visibility === filter;
    if (filter === 'Featured') return l.isFeatured === true;
    if (filter === 'Flagged') return l.reports && l.reports.length > 0;
    return l.category === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-[#0a0a0a] min-h-screen text-white font-sans">
      <Toaster position="top-right" />

      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, lesson: null })}
        onConfirm={handleDeleteLesson}
        title="Confirm Purge"
        message={`CRITICAL ACTION: Permanently wipe lesson "${modal.lesson?.title}" from registry?`}
      />

      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-gray-800 pb-8">
          <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase mb-8 flex items-center gap-4">
            <FaArchive className="text-[#d4af37]" /> Lesson{' '}
            <span className="text-[#d4af37]">Archive</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Public Access',
                value: stats.publicCount,
                color: 'text-emerald-500',
              },
              {
                label: 'Private Vault',
                value: stats.privateCount,
                color: 'text-gray-500',
              },
              {
                label: 'Featured Wisdom',
                value: stats.featuredCount,
                color: 'text-[#d4af37]',
              },
              {
                label: 'Reported Flags',
                value: stats.flaggedCount || 0,
                color: 'text-red-500',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-[#111] border border-white/5 p-5 rounded-2xl"
              >
                <p className="text-[9px] uppercase tracking-widest text-gray-600 font-black mb-1">
                  {s.label}
                </p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111] p-5 rounded-2xl border border-white/5 mb-8">
          <div className="flex items-center gap-3">
            <FaFilter className="text-[#d4af37] text-xs" />
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">
              Filter Registry:
            </span>
          </div>
          <select
            className="bg-black border border-gray-800 text-[10px] uppercase tracking-widest text-gray-300 py-3 px-4 rounded-xl outline-none"
            onChange={e => setFilter(e.target.value)}
            value={filter}
          >
            <option value="All">Master Archive</option>
            <option value="Public">Public Visibility</option>
            <option value="Private">Private Vault</option>
            <option value="Featured">Featured Content</option>
            <option value="Flagged">Flagged / Reported</option>
          </select>
        </div>

        {/* Desktop View Table */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-white/5 bg-[#111]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/40 text-[9px] uppercase tracking-[3px] text-gray-600 border-b border-gray-800">
              <tr>
                <th className="px-8 py-5">Lesson Identity</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {filteredLessons.map(lesson => (
                <tr
                  key={lesson._id}
                  className="hover:bg-white/[0.01] transition-all group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {/* Image Handler with Fallback Icon */}
                      <Link
                        href={`/public-lessons/${lesson._id}`}
                        className="shrink-0 group/img"
                      >
                        <div className="w-12 h-12 rounded-full border border-gray-800 group-hover/img:border-[#d4af37] flex items-center justify-center bg-black overflow-hidden transition-all">
                          {lesson.image && !imageErrors[lesson._id] ? (
                            <img
                              src={lesson.image}
                              alt="lesson"
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(lesson._id)}
                            />
                          ) : (
                            <FiBookOpen className="text-[#d4af37] text-lg" />
                          )}
                        </div>
                      </Link>

                      <div>
                        <Link
                          href={`/public-lessons/${lesson._id}`}
                          className="group/title flex items-center gap-2"
                        >
                          <h3 className="text-sm font-black text-gray-200 group-hover/title:text-[#d4af37] uppercase truncate max-w-[200px]">
                            {lesson.title}
                          </h3>
                          <FaExternalLinkAlt className="text-[9px] text-gray-700" />
                        </Link>
                        {/* Author Link */}
                        <Link
                          href={`/author-profile/${lesson.author?.userId}`}
                          className="text-[9px] text-gray-500 mt-1 uppercase font-bold flex items-center gap-2 hover:text-white transition-colors"
                        >
                          <FaUser className="text-[8px] text-[#d4af37]" />
                          {lesson.author?.name || 'Anonymous'}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[9px] font-black border border-gray-800 px-3 py-1 text-gray-500 uppercase rounded-full">
                      {lesson.category}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center gap-5 text-sm">
                      <FaEye
                        className={
                          lesson.visibility === 'Public'
                            ? 'text-emerald-500'
                            : 'text-gray-800'
                        }
                        title="Visibility"
                      />
                      <FaCheckCircle
                        className={
                          lesson.isReviewed ? 'text-blue-500' : 'text-gray-800'
                        }
                        title="Reviewed"
                      />
                      <FaStar
                        className={
                          lesson.isFeatured ? 'text-[#d4af37]' : 'text-gray-800'
                        }
                        title="Featured"
                      />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            lesson._id,
                            'isFeatured',
                            lesson.isFeatured,
                          )
                        }
                        className={`text-[9px] font-black border px-3 py-2 uppercase transition-all ${lesson.isFeatured ? 'border-[#d4af37] text-[#d4af37]' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}
                      >
                        {lesson.isFeatured ? 'Featured' : 'Mark Featured'}
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            lesson._id,
                            'isReviewed',
                            lesson.isReviewed,
                          )
                        }
                        className={`text-[9px] font-black border px-3 py-2 uppercase transition-all ${lesson.isReviewed ? 'border-blue-500 text-blue-500' : 'border-gray-800 text-gray-600 hover:border-gray-600'}`}
                      >
                        {lesson.isReviewed ? 'Reviewed' : 'Review'}
                      </button>
                      <button
                        onClick={() => setModal({ isOpen: true, lesson })}
                        className="text-gray-700 hover:text-red-500 transition-colors p-2"
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

        {/* Mobile View Card Layout */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map(lesson => (
            <div
              key={lesson._id}
              className="bg-[#111] p-6 rounded-2xl border border-white/5"
            >
              <Link
                href={`/public-lessons/${lesson._id}`}
                className="text-sm font-black text-white uppercase block mb-2 hover:text-[#d4af37]"
              >
                {lesson.title}
              </Link>
              <Link
                href={`/author-profile/${lesson.author?.userId}`}
                className="text-[10px] text-gray-500 uppercase mb-4 block hover:text-white"
              >
                By {lesson.author?.name}
              </Link>
              <div className="flex justify-between items-center pt-4 border-t border-gray-900">
                <div className="flex gap-4">
                  <FaEye
                    className={
                      lesson.visibility === 'Public'
                        ? 'text-emerald-500'
                        : 'text-gray-800'
                    }
                  />
                  <FaStar
                    className={
                      lesson.isFeatured ? 'text-[#d4af37]' : 'text-gray-800'
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ isOpen: true, lesson })}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/10"
                  >
                    <FaTrashAlt size={14} />
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

export default ManageLessonsPageByAdmin;
