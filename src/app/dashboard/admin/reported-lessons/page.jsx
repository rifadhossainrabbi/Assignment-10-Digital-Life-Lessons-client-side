'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiUser,
  FiClock,
  FiMail,
  FiMessageSquare,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ReportedLessonsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/reported-lessons`,
      );
      const data = await res.json();
      setReports(data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleIgnore = async lessonId => {
    if (
      !confirm('Ignore all reports for this lesson? Archive will be cleared.')
    )
      return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/reports/ignore/${lessonId}`,
        {
          method: 'DELETE',
        },
      );
      toast.success('Reports cleared. Lesson is now safe.');
      fetchReports();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDeleteLesson = async lessonId => {
    if (!confirm('PERMANENTLY delete this lesson? This cannot be undone.'))
      return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/lessons/${lessonId}`,
        {
          method: 'DELETE',
        },
      );
      toast.success('Lesson and all reports removed permanently');
      fetchReports();
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  if (loading)
    return (
      <div className="p-10 text-white font-mono animate-pulse">
        Scanning Archive Violations...
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-[#0A0908] min-h-screen text-[#BAB0A3]">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-white mb-2 tracking-tight">
          Reported / Flagged Lessons
        </h1>
        <p className="text-[10px] font-mono text-[#5C544A] uppercase tracking-[0.3em]">
          Moderation Management Console
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-[#0F0E0C] p-20 text-center border border-[#1A1612] rounded-2xl">
          <FiCheckCircle className="mx-auto text-4xl text-emerald-500 mb-4 opacity-20" />
          <p className="font-serif italic text-white">
            No pending reports. The platform is clean.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#1A1612] rounded-xl bg-[#0F0E0C]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1A1612] text-[10px] font-mono text-[#8C8275] uppercase tracking-[0.2em]">
              <tr>
                <th className="p-5">Lesson Title</th>
                <th className="p-5">Report Count</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {reports.map(group => (
                <tr
                  key={group._id}
                  className="border-t border-[#1A1612] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-5 font-serif text-white text-lg">
                    {group.lessonTitle}
                  </td>
                  <td className="p-5">
                    <span className="bg-red-500/10 text-red-500 px-4 py-1 rounded-full text-[10px] font-bold border border-red-500/20 uppercase tracking-widest">
                      {group.reportCount} Reports Received
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-3">
                    {/* View Reports Button with Eye Icon and Text */}
                    <button
                      onClick={() => setSelectedReport(group)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all text-[10px] font-mono uppercase tracking-widest border border-blue-500/20"
                    >
                      <FiEye /> View Reports
                    </button>

                    <button
                      onClick={() => handleIgnore(group._id)}
                      className="p-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20"
                      title="Ignore Reports"
                    >
                      <FiCheckCircle />
                    </button>

                    <button
                      onClick={() => handleDeleteLesson(group._id)}
                      className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                      title="Delete Lesson"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADMIN MODAL: Displaying ALL reasons with reporter info */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0F0E0C] border border-[#1A1612] p-8 max-w-2xl w-full rounded-2xl max-h-[85vh] overflow-y-auto relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-6 right-6 text-[#5C544A] hover:text-white transition-all"
              >
                <FiX size={24} />
              </button>

              <div className="mb-8">
                <h3 className="text-2xl font-serif text-white mb-1">
                  Investigation Report
                </h3>
                <p className="text-[10px] font-mono text-[#E5A93C] uppercase tracking-[0.3em]">
                  {selectedReport.lessonTitle}
                </p>
              </div>

              {/* Loop through all reasons given for this lesson */}
              <div className="space-y-6">
                {selectedReport.allReports.map((report, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-[#1A1612]/40 rounded-xl border border-white/5 group hover:border-red-500/30 transition-all"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                          <FiAlertTriangle className="text-red-500 text-xs" />
                        </div>
                        <span className="text-xs font-mono text-red-500 uppercase font-bold tracking-widest">
                          Reason: {report.reason}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-[#5C544A] flex items-center gap-1">
                        <FiClock />{' '}
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[11px] text-[#BAB0A3] font-mono">
                        <FiMail className="text-blue-500" />
                        <span className="text-[#8C8275]">Reporter:</span>{' '}
                        {report.reportedUserEmail}
                      </div>

                      {/* Requirement: Displaying Additional Text Field Info */}
                      <div className="mt-3 p-4 bg-black/40 rounded-lg border border-white/5">
                        <div className="flex gap-3">
                          <FiMessageSquare className="text-[#5C544A] mt-1 flex-shrink-0" />
                          <p className="text-sm text-[#BAB0A3] font-serif italic leading-relaxed">
                            "
                            {report.additionalDetails ||
                              'No additional context provided by reporter.'}
                            "
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-white/5 flex gap-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 py-4 bg-[#1A1612] text-white font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all rounded-lg"
                >
                  Close Inspection
                </button>
                <button
                  onClick={() => {
                    handleDeleteLesson(selectedReport._id);
                    setSelectedReport(null);
                  }}
                  className="flex-1 py-4 bg-red-600 text-white font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-red-700 transition-all rounded-lg shadow-lg"
                >
                  Purge Lesson
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportedLessonsPage;
