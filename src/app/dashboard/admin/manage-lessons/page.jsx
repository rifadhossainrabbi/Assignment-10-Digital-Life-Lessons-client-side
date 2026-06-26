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
  FaFlag,
  FaUser,
  FaExternalLinkAlt, // Added icon to indicate clickability
} from 'react-icons/fa';

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
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Load all records from server on mount
  useEffect(() => {
    fetchLessons();
  }, []);

  // Auth Guard: Redirect if session is lost or not an admin
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  // Fetch data function
  const fetchLessons = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/all-lessons`,
      );
      const data = await response.json();
      setLessons(data.lessons);
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('System Archive Error:', error);
      toast.error('Failed to connect to the master archive');
      setLoading(false);
    }
  };

  // Requirement: Update "isFeatured" or "isReviewed" status
  const handleUpdateStatus = async (id, field, currentValue) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/lessons/status/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: !currentValue }),
        },
      );

      if (response.ok) {
        fetchLessons(); // Refresh the list
        toast.success(`${field.replace('is', '')} status updated`);
      }
    } catch (err) {
      toast.error('Registry update failed');
    }
  };

  // Requirement: Delete inappropriate lessons with confirmation popup
  const handleDeleteLesson = async (id, title) => {
    const isConfirmed = window.confirm(
      `CRITICAL ACTION: Permanently wipe lesson "${title}" from registry?`,
    );
    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/lessons/${id}`,
        { method: 'DELETE' },
      );
      if (response.ok) {
        fetchLessons();
        toast.success('Record purged from database');
      }
    } catch (err) {
      toast.error('Purge sequence failed');
    }
  };

  // Requirement: Filter by Category, Visibility, Featured, or Flagged
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
    <div className="p-4 md:p-8 lg:p-12 bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-[#d4af37] selection:text-black">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header and Stats Display */}
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

        {/* Filtering Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111] p-5 rounded-2xl border border-white/5 mb-8">
          <div className="flex items-center gap-3">
            <FaFilter className="text-[#d4af37] text-xs" />
            <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">
              Filter Registry:
            </span>
          </div>
          <select
            className="bg-black border border-gray-800 text-[10px] uppercase tracking-widest text-gray-300 py-3 px-4 rounded-xl outline-none focus:border-[#d4af37] transition-all cursor-pointer"
            onChange={e => setFilter(e.target.value)}
            value={filter}
          >
            <option value="All">Master Archive</option>
            <optgroup label="Visibility" className="bg-black text-gray-500">
              <option value="Public">Public Visibility</option>
              <option value="Private">Private Vault</option>
            </optgroup>
            <optgroup label="Status" className="bg-black text-gray-500">
              <option value="Featured">Featured Content</option>
              <option value="Flagged">Flagged / Reported</option>
            </optgroup>
            <optgroup label="Categories" className="bg-black text-gray-500">
              <option value="Personal Growth">Personal Growth</option>
              <option value="Career">Career</option>
              <option value="Relationships">Relationships</option>
              <option value="Mindset">Mindset</option>
              <option value="Mistakes Learned">Mistakes Learned</option>
            </optgroup>
          </select>
        </div>

        {/* Desktop View: Tables (Data-dense layout) */}
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
                    <div>
                      {/* Navigate to dynamic lesson details page on click */}
                      <Link
                        href={`/public-lessons/${lesson._id}`}
                        className="group/link flex items-center gap-2 max-w-xs"
                      >
                        <h3 className="text-sm font-black text-gray-200 group-hover/link:text-[#d4af37] group-hover/link:underline underline-offset-4 transition-all uppercase truncate cursor-pointer">
                          {lesson.title}
                        </h3>
                        <FaExternalLinkAlt className="text-[10px] text-gray-700 group-hover/link:text-[#d4af37] opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </Link>

                      <p className="text-[9px] text-gray-600 mt-2 uppercase font-bold flex items-center gap-2">
                        <FaUser className="text-[8px] text-[#d4af37]" />{' '}
                        {lesson.author?.name || 'Anonymous_Creator'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-[9px] font-black border border-gray-800 px-3 py-1 text-gray-500 uppercase tracking-widest bg-black rounded-full">
                      {lesson.category}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center gap-5 text-base">
                      <div
                        title="Visibility"
                        className={
                          lesson.visibility === 'Public'
                            ? 'text-emerald-500'
                            : 'text-gray-800'
                        }
                      >
                        {lesson.visibility === 'Public' ? (
                          <FaEye />
                        ) : (
                          <FaEyeSlash />
                        )}
                      </div>
                      <div
                        title="Reviewed Status"
                        className={
                          lesson.isReviewed ? 'text-blue-500' : 'text-gray-800'
                        }
                      >
                        <FaCheckCircle />
                      </div>
                      <div
                        title="Featured Status"
                        className={
                          lesson.isFeatured ? 'text-[#d4af37]' : 'text-gray-800'
                        }
                      >
                        <FaStar />
                      </div>
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
                        className={`text-[9px] font-black border px-3 py-2 uppercase tracking-tighter transition-all ${lesson.isFeatured ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5' : 'border-gray-800 text-gray-600 hover:border-gray-500'}`}
                      >
                        {lesson.isFeatured ? 'FEATURED' : 'MARK FEATURED'}
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            lesson._id,
                            'isReviewed',
                            lesson.isReviewed,
                          )
                        }
                        className={`text-[9px] font-black border px-3 py-2 uppercase tracking-tighter transition-all ${lesson.isReviewed ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-gray-800 text-gray-600 hover:border-gray-500'}`}
                      >
                        {lesson.isReviewed ? 'APPROVED' : 'REVIEW'}
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteLesson(lesson._id, lesson.title)
                        }
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

        {/* Mobile View: Card Layout for better accessibility */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map(lesson => (
            <div
              key={lesson._id}
              className="bg-[#111] p-6 rounded-2xl border border-white/5 relative"
            >
              <div className="mb-4">
                {/* Navigate to dynamic lesson details page on click (Mobile) */}
                <Link
                  href={`/public-lessons/${lesson._id}`}
                  className="group flex items-start justify-between gap-2"
                >
                  <h3 className="text-sm font-black text-white uppercase truncate group-hover:text-[#d4af37] transition-colors cursor-pointer group-hover:underline underline-offset-4">
                    {lesson.title}
                  </h3>
                  <FaExternalLinkAlt
                    className="text-gray-600 group-hover:text-[#d4af37] shrink-0"
                    size={10}
                  />
                </Link>
                <p className="text-[9px] text-[#d4af37] font-black mt-2 uppercase flex items-center gap-1">
                  <FaUser size={8} />{' '}
                  {lesson.author?.name || 'Anonymous_Creator'}
                </p>
              </div>

              <div className="flex gap-2 mb-6">
                <span className="text-[8px] font-black bg-black border border-gray-800 px-2 py-1 uppercase">
                  {lesson.category}
                </span>
                {lesson.reports?.length > 0 && (
                  <span className="text-[8px] font-black bg-red-950/20 border border-red-900/30 text-red-500 px-2 py-1 uppercase flex items-center gap-1">
                    <FaFlag size={8} /> Flagged
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-900">
                <div className="flex gap-4 text-sm">
                  <FaEye
                    className={
                      lesson.visibility === 'Public'
                        ? 'text-emerald-500'
                        : 'text-gray-800'
                    }
                  />
                  <FaCheckCircle
                    className={
                      lesson.isReviewed ? 'text-blue-500' : 'text-gray-800'
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
                    onClick={() =>
                      handleUpdateStatus(
                        lesson._id,
                        'isFeatured',
                        lesson.isFeatured,
                      )
                    }
                    className={`p-2 rounded-lg border transition-colors ${lesson.isFeatured ? 'border-[#d4af37] text-[#d4af37]' : 'border-gray-800 text-gray-600'}`}
                  >
                    <FaStar size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/10 transition-colors"
                  >
                    <FaTrashAlt size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLessons.length === 0 && (
          <div className="py-24 text-center border border-dashed border-gray-800 rounded-3xl mt-10">
            <p className="text-gray-600 uppercase tracking-[0.4em] text-[10px] font-black italic">
              NO RECORDS MATCH THE SEARCH PARAMETERS
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLessonsPageByAdmin;
