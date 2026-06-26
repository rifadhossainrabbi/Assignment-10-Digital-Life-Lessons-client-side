'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

/**
 * Reusable Centered Confirmation Modal
 * Replaces browser default confirm() for a consistent UI
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#14110C] border border-[#231E15] p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl"
      >
        <FiAlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />

        <h3 className="text-xl font-serif text-[#F4EFEA] mb-2">
          Remove from Saved?
        </h3>

        <p className="text-sm text-[#5C544A] mb-8 leading-relaxed">
          Are you sure you want to remove{' '}
          <span className="text-gray-300 italic">"{title}"</span> from your
          wisdom collection?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[10px] font-black uppercase border border-[#231E15] hover:bg-[#231E15] text-[#F4EFEA] rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-[10px] font-black uppercase bg-red-600 text-white rounded-xl transition-all shadow-lg shadow-red-900/20"
          >
            Remove
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmModal;
