'use client';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  FaTrashAlt,
  FaStar,
  FaCheckCircle,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaArchive,
  FaListUl,
} from 'react-icons/fa';

const ManageLessonsPageByAdmin = () => {
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    publicCount: 0,
    privateCount: 0,
    featuredCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // Load all data from the server
  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/all-lessons');
      const data = await response.json();
      setLessons(data.lessons);
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to connect to the archive');
      setLoading(false);
    }
  };

  // Requirement: Make featured & Mark content as reviewed
  const handleUpdateStatus = async (id, field, currentValue) => {
    try {
      const response = await fetch(
        `http://localhost:5000/admin/lessons/status/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: !currentValue }),
        },
      );

      if (response.ok) {
        fetchLessons(); // Refresh list to see updates
        toast.success(`${field.replace('is', '')} status updated`, {
          style: {
            background: '#1a1a1a',
            color: '#fcd34d',
            border: '1px solid #fcd34d',
          },
        });
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  // Requirement: Delete inappropriate lessons with confirmation popup
  const handleDeleteLesson = async (id, title) => {
    const isConfirmed = window.confirm(
      `Permanently delete the lesson: "${title}"?`,
    );
    if (!isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/admin/lessons/${id}`,
        {
          method: 'DELETE',
        },
      );
      if (response.ok) {
        fetchLessons();
        toast.success('Lesson removed permanently');
      }
    } catch (err) {
      toast.error('Could not delete the lesson');
    }
  };

  // Requirement: Filter by category, visibility, or featured status
  const filteredLessons = lessons.filter(l => {
    if (filter === 'All') return true;
    if (filter === 'Public' || filter === 'Private')
      return l.visibility === filter;
    if (filter === 'Featured') return l.isFeatured === true;
    return l.category === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#fcd34d]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-[#fcd34d] selection:text-black">
      <Toaster position="bottom-right" />

      <div className="max-w-7xl mx-auto">
        {/* Requirement: Header and Stats (Public count, Private count, etc.) */}
        <header className="mb-12 border-b border-gray-800 pb-8">
          <h2 className="text-3xl font-light tracking-[5px] text-[#fcd34d] uppercase mb-10 flex items-center gap-4">
            <FaArchive className="text-2xl" /> Manage Lessons
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Records',
                value: stats.total,
                color: 'text-gray-200',
              },
              {
                label: 'Public Content',
                value: stats.publicCount,
                color: 'text-[#fcd34d]',
              },
              {
                label: 'Private Vault',
                value: stats.privateCount,
                color: 'text-gray-500',
              },
              {
                label: 'Featured List',
                value: stats.featuredCount,
                color: 'text-indigo-400',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-gray-900/30 border border-gray-800 p-5 rounded-sm shadow-inner"
              >
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                  {s.label}
                </p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </header>

        {/* Requirement: Filtering Section */}
        <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 border border-gray-800 mb-8">
          <FaFilter className="text-[#fcd34d] text-sm ml-2" />
          <span className="text-[10px] uppercase tracking-widest text-gray-500 mr-2">
            Filter By:
          </span>
          <select
            className="bg-transparent text-xs outline-none cursor-pointer uppercase tracking-widest text-gray-300 border-none focus:ring-0"
            onChange={e => setFilter(e.target.value)}
            value={filter}
          >
            <option value="All" className="bg-[#1a1a1a]">
              All Archive
            </option>
            <option value="Public" className="bg-[#1a1a1a]">
              Visibility: Public
            </option>
            <option value="Private" className="bg-[#1a1a1a]">
              Visibility: Private
            </option>
            <option value="Featured" className="bg-[#1a1a1a]">
              Status: Featured
            </option>
            <option value="Personal Growth" className="bg-[#1a1a1a]">
              Category: Personal Growth
            </option>
            <option value="Mindset" className="bg-[#1a1a1a]">
              Category: Mindset
            </option>
            <option value="Career" className="bg-[#1a1a1a]">
              Category: Career
            </option>
          </select>
        </div>

        {/* Lessons Table Layout */}
        <div className="overflow-x-auto rounded-sm border border-gray-900 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-800 text-[10px] uppercase tracking-[3px] text-gray-500">
                <th className="px-8 py-5">Lesson Metadata</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5 text-center">Status Indicators</th>
                <th className="px-8 py-5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {filteredLessons.map(lesson => (
                <tr
                  key={lesson._id}
                  className="hover:bg-white/[0.03] transition-all group"
                >
                  {/* Column 1: Lesson Info */}
                  <td className="px-8 py-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-200 tracking-wide group-hover:text-[#fcd34d] transition-colors">
                        {lesson.title}
                      </h3>
                      <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest flex items-center gap-2">
                        <FaListUl className="text-[8px]" /> Author:{' '}
                        {lesson.author?.name || 'Unknown'}
                      </p>
                    </div>
                  </td>

                  {/* Column 2: Category */}
                  <td className="px-6 py-8">
                    <span className="text-[9px] font-bold border border-gray-800 px-3 py-1.5 bg-black text-gray-500 uppercase tracking-widest rounded-sm">
                      {lesson.category}
                    </span>
                  </td>

                  {/* Column 3: Status Indicators (Icons) */}
                  <td className="px-6 py-8">
                    <div className="flex justify-center gap-6 text-lg">
                      <div
                        title={`Visibility: ${lesson.visibility}`}
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
                        title={
                          lesson.isReviewed ? 'Reviewed' : 'Awaiting Review'
                        }
                        className={
                          lesson.isReviewed ? 'text-blue-500' : 'text-gray-800'
                        }
                      >
                        <FaCheckCircle />
                      </div>
                      <div
                        title={
                          lesson.isFeatured
                            ? 'Featured Content'
                            : 'Not Featured'
                        }
                        className={
                          lesson.isFeatured ? 'text-[#fcd34d]' : 'text-gray-800'
                        }
                      >
                        <FaStar />
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Moderation Buttons */}
                  <td className="px-8 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100">
                      {/* Featured Toggle */}
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            lesson._id,
                            'isFeatured',
                            lesson.isFeatured,
                          )
                        }
                        className={`text-[9px] font-bold border px-3 py-2 uppercase tracking-tighter transition-all ${
                          lesson.isFeatured
                            ? 'border-[#fcd34d] text-[#fcd34d] bg-[#fcd34d]/5'
                            : 'border-gray-800 text-gray-600 hover:border-gray-500'
                        }`}
                      >
                        {lesson.isFeatured ? 'Featured' : 'Make Featured'}
                      </button>

                      {/* Reviewed Toggle */}
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            lesson._id,
                            'isReviewed',
                            lesson.isReviewed,
                          )
                        }
                        className={`text-[9px] font-bold border px-3 py-2 uppercase tracking-tighter transition-all ${
                          lesson.isReviewed
                            ? 'border-blue-500 text-blue-500 bg-blue-500/5'
                            : 'border-gray-800 text-gray-600 hover:border-gray-500'
                        }`}
                      >
                        {lesson.isReviewed ? 'Approved' : 'Review'}
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() =>
                          handleDeleteLesson(lesson._id, lesson.title)
                        }
                        className="ml-2 text-gray-700 hover:text-red-500 transition-colors p-2"
                        title="Delete Permanently"
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredLessons.length === 0 && (
            <div className="py-24 text-center bg-[#0d0d0d]">
              <p className="text-gray-600 uppercase tracking-widest text-xs font-light">
                No matching wisdom records found in the archive
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLessonsPageByAdmin;
