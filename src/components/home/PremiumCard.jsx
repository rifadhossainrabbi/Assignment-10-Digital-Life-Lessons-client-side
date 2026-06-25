'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CircleCheck } from '@gravity-ui/icons';

const PremiumCard = () => {
  const features = [
    'Advanced AI Reflection Analysis',
    'Unlimited Lesson Archiving & Private Vaults',
    'Priority Access to Global Mastermind Events',
  ];

  return (
    <section className="w-full bg-[#0a0a0a] py-16 md:py-24">
      <div className="container mx-auto px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#111] border border-white/5 rounded-[40px] p-8 md:p-16 relative overflow-hidden shadow-2xl"
        >
          {/* Gold Glow Effect */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d4af37]/10 blur-[120px] rounded-full" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
              <span className="bg-[#d4af37]/10 text-[#d4af37] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-[#d4af37]/20 w-fit">
                Lifetime Access
              </span>
              <span className="text-gray-500 text-xs font-medium tracking-widest uppercase">
                Invest in your legacy
              </span>
            </div>

            <h2 className="text-4xl md:text-7xl font-serif text-white mb-10 tracking-tight leading-tight">
              Unlock <span className="italic text-[#d4af37]">Premium</span>{' '}
              Learning
            </h2>

            <ul className="grid grid-cols-1 md:grid-cols-1 gap-5 mb-14">
              {features.map((item, i) => (
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className="flex items-center text-gray-400 group"
                >
                  <div className="mr-4 bg-white/5 p-1.5 rounded-full group-hover:bg-[#d4af37]/20 transition-colors">
                    <CircleCheck className="text-[#d4af37]" width={20} />
                  </div>
                  <span className="text-sm md:text-lg font-medium tracking-wide">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-12 pt-6 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500 leading-tight">
                  One-time <br /> payment
                </div>
                <div className="text-5xl md:text-6xl font-serif text-white flex items-start">
                  <span className="text-2xl mt-2 mr-1 text-[#d4af37]">$</span>
                  1500
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: '#f2c94c' }}
                whileTap={{ scale: 0.98 }}
                className="bg-[#d4af37] text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(212,175,55,0.2)] transition-all cursor-pointer"
              >
                Upgrade to Premium Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumCard;
