'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfiremDeletModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const isPromote = type === 'promote';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#111] border border-gray-800 p-8 rounded-2xl w-full max-w-sm text-center shadow-2xl"
        >
          <FaExclamationTriangle
            className={`${isPromote ? 'text-amber-500' : 'text-red-500'} text-4xl mx-auto mb-4`}
          />
          <h3 className="text-white font-black text-xl mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-8">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-[10px] font-bold uppercase border border-gray-700 hover:bg-gray-800 text-white rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${
                isPromote
                  ? 'bg-amber-600 text-black hover:bg-amber-500'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfiremDeletModal;
