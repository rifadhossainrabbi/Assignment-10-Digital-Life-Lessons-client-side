'use client';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiLock,
  FiSend,
  FiInfo,
  FiUser,
} from 'react-icons/fi';

const ReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  reason,
  setReason,
  lessonId,
}) => {
  if (!isOpen) return null;

  const reasons = [
    { id: 'Inappropriate Content', icon: <FiLock /> },
    { id: 'Spam / Advertisement', icon: <FiSend /> },
    { id: 'Plagiarism / Copyright', icon: <FiInfo /> },
    { id: 'Hate Speech', icon: <FiUser /> },
    { id: 'Other Issues', icon: <FiAlertTriangle /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#0F0E0C] border border-red-500/20 p-8 md:p-10 max-w-md w-full shadow-[0_0_80px_rgba(239,68,68,0.15)] rounded-2xl"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-8">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
            <FiAlertTriangle className="text-red-500 text-3xl" />
          </div>
          <div>
            <h3 className="text-2xl font-serif text-white tracking-tight">
              Report Insight
            </h3>
            <p className="text-[10px] font-mono text-[#8C8275] uppercase tracking-widest mt-1 italic">
              Ref: {lessonId?.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        <p className="text-sm text-[#BAB0A3] mb-8 leading-relaxed font-serif italic">
          "Select the primary reason for flagging this wisdom."
        </p>

        <div className="space-y-3 mb-10">
          {reasons.map(r => (
            <button
              key={r.id}
              onClick={() => setReason(r.id)}
              className={`w-full flex items-center p-4 text-[11px] font-mono border transition-all uppercase tracking-[0.1em] rounded-lg group ${
                reason === r.id
                  ? 'border-red-500 text-red-500 bg-red-500/5'
                  : 'border-[#1A1612] text-[#5C544A] hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="mr-4 opacity-50 group-hover:opacity-100">
                {r.icon}
              </span>
              {r.id}
              {reason === r.id && (
                <motion.div
                  layoutId="active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-mono border border-[#1A1612] text-[#8C8275] uppercase tracking-widest hover:text-white transition-all rounded-lg"
          >
            Discard
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 py-4 text-[10px] font-mono bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 shadow-xl transition-all rounded-lg"
          >
            Submit Flag
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportModal;
