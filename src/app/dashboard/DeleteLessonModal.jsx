'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';

const DeleteLessonModal = ({ isOpen, onClose, onConfirm, lessonTitle }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#14110C] border border-[#231E15] rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <FiAlertTriangle className="text-red-500 text-3xl" />
              </div>
              <h3 className="text-2xl font-serif text-[#F4EFEA] mb-3">
                Erase Wisdom?
              </h3>
              <p className="text-sm text-[#5C544A] leading-relaxed mb-10">
                You are about to permanently remove{' '}
                <span className="text-white">{lessonTitle}</span>. This action
                cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 hover:cursor-pointer py-4 rounded-xl border border-[#231E15] text-[#5C544A] text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 hover:cursor-pointer py-4 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg"
                >
                  Erase Forever
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteLessonModal;
