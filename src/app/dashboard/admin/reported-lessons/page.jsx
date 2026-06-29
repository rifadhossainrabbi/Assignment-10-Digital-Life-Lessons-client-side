'use client';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import {
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiSearch,
  FiExternalLink,
  FiClock,
  FiMail,
  FiUser,
  FiAlertTriangle,
  FiImage,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/reusableApi';

/**
 * Centered Confirmation Modal Component
 * Requirement 3: Replaces window.confirm() with a centered UI
 * Eita screen er ekdom majhkane ashbe r pechoner sob blur thakbe
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#14110C] border border-[#231E15] p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl"
      >
        <FiAlertTriangle
          className={`${type === 'delete' ? 'text-red-500' : 'text-[#E5A93C]'} text-4xl mx-auto mb-4`}
        />
        <h3 className="text-xl font-serif text-[#F4EFEA] mb-2">{title}</h3>
        <p className="text-sm text-[#5C544A] mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 hover:cursor-pointer py-3 text-[10px] font-black uppercase border border-[#231E15] hover:bg-[#231E15] text-[#F4EFEA] rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 hover:cursor-pointer py-3 text-[10px] font-black uppercase ${type === 'delete' ? 'bg-red-600' : 'bg-green-600'} text-white rounded-xl transition-all shadow-lg`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ReportedLessonsPage = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  // Requirement 10: Specific button er loading state track korar jonno
  const [actionLoading, setActionLoading] = useState(null);

  // Centered modal er state handle korar jonno
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '',
    data: null,
  });

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (!isPending && !session) router.replace('/signin');
  }, [session, isPending, router]);

  // Requirement 9: Error handling soho data fetch kora
  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/reported-lessons');
      setReports(data);
    } catch (err) {
      toast.error(err.message || 'System synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  // Report gulo ignore ba clear korar logic
  const handleIgnore = async lessonId => {
    setConfirmModal({ isOpen: false });
    try {
      setActionLoading(lessonId);
      await api.delete(`/admin/reports/ignore/${lessonId}`);
      toast.success('Flags cleared successfully');
      fetchReports();
    } catch (err) {
      toast.error(err.message || 'Failed to clear reports');
    } finally {
      setActionLoading(null);
    }
  };

  // Requirement 2 & 12: Cascading Purge logic
  const handleDeleteLesson = async lessonId => {
    setConfirmModal({ isOpen: false });
    try {
      setActionLoading(lessonId);
      await api.delete(`/admin/lessons/${lessonId}`);
      toast.success('Lesson purged completely');
      fetchReports();
      setSelectedReport(null);
    } catch (err) {
      toast.error(err.message || 'Purge sequence failed');
    } finally {
      setActionLoading(null);
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
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-4 md:p-12 relative">
      <Toaster position="top-center" />

      {/* Center Modal call kora hocche */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={() =>
          confirmModal.type === 'delete'
            ? handleDeleteLesson(confirmModal.data._id)
            : handleIgnore(confirmModal.data._id)
        }
        type={confirmModal.type}
        title={
          confirmModal.type === 'delete' ? 'Purge Lesson?' : 'Ignore Reports?'
        }
        message={
          confirmModal.type === 'delete'
            ? 'Are you sure you want to PERMANENTLY delete this lesson? All metadata will be destroyed.'
            : 'This will remove all flags while keeping the lesson live.'
        }
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Search Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif text-[#E6DFD3]">
              Reported Flags
            </h1>
            <p className="text-[10px] text-[#5C544A] mt-2 font-mono uppercase tracking-[0.4em]">
              Violation & Moderation Hub
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C544A]" />
            <input
              type="text"
              placeholder="SEARCH..."
              className="w-full bg-[#14110C] border border-[#231E15] rounded-xl py-4 pl-12 pr-4 text-[10px] font-black focus:border-[#E5A93C] outline-none text-[#F4EFEA]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Requirement 11: Empty State */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-[#14110C] rounded-3xl border border-dashed border-[#231E15]">
            <p className="text-[#5C544A] font-serif italic text-lg">
              No reported lessons. Community is currently clean.
            </p>
          </div>
        ) : (
          <div className="hidden lg:block bg-[#14110C] border border-[#231E15] rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#231E15] text-[9px] font-black uppercase text-[#5C544A] tracking-widest">
                  <th className="py-6 px-8">Lesson Metadata</th>
                  <th className="py-6 px-6">Reports</th>
                  {/* Requirement 7: Extra column */}
                  <th className="py-6 px-6">Last Flagged</th>
                  <th className="py-6 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#231E15]/30">
                {filteredReports.map(group => (
                  <tr
                    key={group._id}
                    className="hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        {/* Lesson er image r title dekhao */}
                        {group.lessonImage ? (
                          <img
                            src={group.lessonImage}
                            className="w-10 h-10 rounded-lg object-cover border border-[#231E15]"
                            alt="preview"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#231E15] flex items-center justify-center">
                            <FiImage className="text-gray-600" />
                          </div>
                        )}
                        <Link
                          href={`/public-lessons/${group._id}`}
                          className="font-serif text-[#F4EFEA] hover:text-[#E5A93C] flex items-center gap-1"
                        >
                          <span>{group.lessonTitle}</span>
                          <FiExternalLink size={10} className="opacity-40" />
                        </Link>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[9px] font-black">
                        {group.reportCount} Flags
                      </span>
                    </td>
                    <td className="py-6 px-6 text-[10px] text-gray-500">
                      {new Date(group.lastReportedAt).toLocaleDateString()}
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReport(group)}
                          className="p-2 bg-white/5 text-gray-400 hover:text-[#E5A93C] hover:cursor-pointer rounded-lg transition-all"
                        >
                          <FiEye size={14} />
                        </button>
                        <button
                          disabled={actionLoading === group._id}
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: 'ignore',
                              data: group,
                            })
                          }
                          className="p-2 bg-green-500/10 text-green-400 rounded-lg disabled:opacity-30 hover:cursor-pointer"
                        >
                          {/* Requirement 10: Spinner logic inside button */}
                          {actionLoading === group._id ? (
                            <span className="animate-spin block h-3 w-3 border-2 border-green-400 border-t-transparent rounded-full"></span>
                          ) : (
                            <FiCheckCircle size={14} />
                          )}
                        </button>
                        <button
                          disabled={actionLoading === group._id}
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              type: 'delete',
                              data: group,
                            })
                          }
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg disabled:opacity-30 hover:cursor-pointer"
                        >
                          {actionLoading === group._id ? (
                            <span className="animate-spin block h-3 w-3 border-2 border-red-500 border-t-transparent rounded-full"></span>
                          ) : (
                            <FiTrash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Investigation Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Background Blur */}
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
              className="relative w-full max-w-lg bg-[#14110C] border border-[#231E15] rounded-3xl p-8 shadow-2xl z-[105]"
            >
              {/* Requirement 6: Modal Header with Lesson Image */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-black/30 rounded-2xl border border-white/5">
                {selectedReport.lessonImage && (
                  <img
                    src={selectedReport.lessonImage}
                    className="w-16 h-16 rounded-xl object-cover border border-[#231E15]"
                    alt="lesson"
                  />
                )}
                <div>
                  <h3 className="text-xl font-serif text-[#F4EFEA] leading-tight">
                    {selectedReport.lessonTitle}
                  </h3>
                  <p className="text-[9px] text-[#E5A93C] font-black uppercase tracking-widest mt-1">
                    Status: Under Moderation ({selectedReport.reportCount}{' '}
                    Flags)
                  </p>
                </div>
              </div>

              {/* Requirement 1: Reporter Info cards */}
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedReport.allReports.map((report, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                        {report.reason}
                      </span>
                      <span className="text-[9px] text-gray-500">
                        <FiClock className="inline mr-1" />
                        {new Date(report.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Reporter Evidence Section - Data joined from user table */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
                      <p className="text-[8px] font-black text-[#5C544A] uppercase tracking-widest mb-2">
                        Reporter Identity
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E5A93C]/10 flex items-center justify-center text-[#E5A93C] font-bold text-xs uppercase">
                          {report.reporterInfo?.name ? (
                            report.reporterInfo.name.charAt(0)
                          ) : (
                            <FiUser />
                          )}
                        </div>
                        <div>
                          {/* Name r Email ekhan theke dekhabe */}
                          <p className="text-[11px] text-[#E6DFD3] font-medium">
                            {report.reporterInfo?.name ||
                              report.reporterName ||
                              'Anonymous User'}
                          </p>
                          <p className="text-[10px] text-gray-500 italic">
                            <FiMail className="inline mr-1" />
                            {report.reporterInfo?.email ||
                              report.reporterEmail ||
                              report.reportedUserEmail ||
                              'Email unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 italic leading-relaxed">
                        "
                        {report.additionalDetails ||
                          'No further details provided.'}
                        "
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full mt-8 py-4 bg-[#E5A93C] text-black font-black hover:cursor-pointer text-[10px] uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-xl"
              >
                Close Investigation
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportedLessonsPage;
