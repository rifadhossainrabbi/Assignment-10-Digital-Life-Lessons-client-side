'use client';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import {
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiClock,
  FiSearch,
  FiExternalLink,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ReportedLessonsPage = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/reported-lessons`,
      );
      const data = await res.json();
      setReports(data);
    } catch (err) {
      toast.error('System synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIgnore = async lessonId => {
    if (!confirm('Clear all flags? Archive status will return to normal.'))
      return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/reports/ignore/${lessonId}`,
        {
          method: 'DELETE',
        },
      );
      toast.success('Reports cleared successfully');
      fetchReports();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteLesson = async lessonId => {
    if (!confirm('PERMANENTLY purge this lesson? This action is irreversible.'))
      return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/lessons/${lessonId}`,
        {
          method: 'DELETE',
        },
      );
      toast.success('Lesson purged successfully');
      fetchReports();
      setSelectedReport(null);
    } catch (err) {
      toast.error('Deletion sequence failed');
    }
  };

  const filteredReports = reports.filter(group =>
    group.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center text-[#E5A93C] font-mono animate-pulse">
        SYNCING MODERATION LOGS...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-4 md:p-12">
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section - Matches MyLessonsPage */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif text-[#E6DFD3]">
              Reported Flags
            </h1>
            <p className="text-[10px] text-[#5C544A] mt-2 font-mono uppercase tracking-[0.4em]">
              Violation & Moderation Intelligence Interface
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C544A]" />
            <input
              type="text"
              placeholder="SEARCH BY TITLE..."
              className="w-full bg-[#14110C] border border-[#231E15] rounded-xl py-4 pl-12 pr-4 text-[10px] font-black focus:border-[#E5A93C] outline-none transition-all uppercase tracking-widest text-[#F4EFEA]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-[#14110C] rounded-3xl border border-dashed border-[#231E15]">
            <FiCheckCircle size={40} className="mx-auto text-[#231E15] mb-4" />
            <p className="text-[#5C544A] font-serif italic text-lg">
              Ecosystem safe. No violations recorded.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-[#14110C] border border-[#231E15] rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#231E15] text-[9px] font-black uppercase text-[#5C544A] tracking-widest">
                    <th className="py-6 px-8">Lesson Metadata</th>
                    <th className="py-6 px-6">Status</th>
                    <th className="py-6 px-8 text-right">
                      Moderation Controls
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#231E15]/30">
                  {filteredReports.map(group => (
                    <tr
                      key={group._id}
                      className="hover:bg-white/[0.01] transition-colors group"
                    >
                      <td className="py-6 px-8">
                        <Link
                          href={`/public-lessons/${group._id}`}
                          className="flex items-center gap-2 text-[#F4EFEA] hover:text-[#E5A93C] transition-colors"
                        >
                          <span className="font-serif text-base">
                            {group.lessonTitle}
                          </span>
                          <FiExternalLink size={12} className="opacity-50" />
                        </Link>
                      </td>
                      <td className="py-6 px-6">
                        <span className="bg-red-500/10 text-red-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                          {group.reportCount} Flags
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedReport(group)}
                            className="p-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-[#E5A93C] rounded-xl transition-all"
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            onClick={() => handleIgnore(group._id)}
                            className="p-2.5 bg-green-500/10 border border-green-500/10 text-green-400 hover:text-white hover:bg-green-600 rounded-xl transition-all"
                          >
                            <FiCheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(group._id)}
                            className="p-2.5 bg-red-500/10 border border-red-500/10 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredReports.map(group => (
                <div
                  key={group._id}
                  className="bg-[#14110C] border border-[#231E15] rounded-3xl p-6 space-y-4"
                >
                  <h4 className="font-serif text-lg text-[#F4EFEA]">
                    {group.lessonTitle}
                  </h4>
                  <span className="inline-block bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                    {group.reportCount} Flags
                  </span>
                  <div className="flex gap-2 pt-4 border-t border-white/5">
                    <button
                      onClick={() => setSelectedReport(group)}
                      className="flex-1 py-3 bg-white/5 text-center text-[10px] font-black uppercase tracking-widest rounded-xl"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleIgnore(group._id)}
                      className="p-3 bg-green-500/10 text-green-400 rounded-xl"
                    >
                      <FiCheckCircle />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(group._id)}
                      className="p-3 bg-red-500/10 text-red-500 rounded-xl"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal - Consistent with MyLessonsPage */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#14110C] border border-[#231E15] rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-xl font-serif text-[#F4EFEA] mb-6">
                Investigation Details
              </h3>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedReport.allReports.map((report, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/[0.02] rounded-xl border border-white/5"
                  >
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">
                      {report.reason}
                    </p>
                    <p className="text-sm text-gray-400">
                      "{report.additionalDetails}"
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full mt-8 py-4 bg-[#E5A93C] text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportedLessonsPage;
