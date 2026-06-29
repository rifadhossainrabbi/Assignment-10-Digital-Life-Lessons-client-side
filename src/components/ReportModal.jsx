'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
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
  const [details, setDetails] = useState(''); // Text field for requirements

  if (!isOpen) return null;

  const reasons = [
    { id: 'Inappropriate Content', icon: <FiLock /> },
    { id: 'Spam / Advertisement', icon: <FiSend /> },
    { id: 'Plagiarism / Copyright', icon: <FiInfo /> },
    { id: 'Hate Speech', icon: <FiUser /> },
    { id: 'Other Issues', icon: <FiAlertTriangle /> },
  ];

  const handleReportSubmit = () => {
    // Passes both the selected reason and the typed details
    onSubmit(reason, details);
    setDetails(''); // Clear after submit
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-[#0F0E0C] border border-red-500/20 p-8 md:p-10 max-w-md w-full shadow-2xl rounded-2xl"
      >
        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
          <FiAlertTriangle className="text-red-500 text-3xl" />
          <h3 className="text-2xl font-serif text-white tracking-tight">
            Report Content
          </h3>
        </div>

        {/* Reason Selection (Acting as Dropdown) */}
        <div className="space-y-2 mb-6">
          <label className="text-[10px] font-mono text-[#5C544A] uppercase tracking-widest block mb-2">
            Primary Reason
          </label>
          <div className="grid grid-cols-1 gap-2">
            {reasons.map(r => (
              <button
                key={r.id}
                onClick={() => setReason(r.id)}
                className={`w-full flex items-center p-3 text-[10px] font-mono border hover:cursor-pointer transition-all uppercase tracking-[0.1em] rounded-lg ${
                  reason === r.id
                    ? 'border-red-500 text-red-500 bg-red-500/5'
                    : 'border-[#1A1612] text-[#5C544A] hover:text-white'
                }`}
              >
                {r.id}
              </button>
            ))}
          </div>
        </div>

        {/* Required Text Field */}
        <div className="mb-8">
          <label className="text-[10px] font-mono text-[#5C544A] uppercase tracking-widest block mb-2">
            Additional Description
          </label>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="Explain why you are reporting this..."
            className="w-full bg-[#0A0908] border border-[#1A1612] rounded-lg p-4 text-sm text-[#BAB0A3] outline-none focus:border-red-500/50 min-h-[100px]"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[10px] font-mono border hover:cursor-pointer border-[#1A1612] text-[#8C8275] uppercase rounded-lg"
          >
            Discard
          </button>
          <button
            onClick={handleReportSubmit}
            className="flex-1 py-4 text-[10px] hover:cursor-pointer font-mono bg-red-600 text-white font-bold uppercase rounded-lg"
          >
            Submit Report
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportModal;
