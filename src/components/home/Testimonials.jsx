'use client';
import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sophia Martinez',
    role: 'Tech Lead @ GlobalFoundry',
    image: 'https://i.pravatar.cc/150?u=sophia',
    quote:
      "The ability to tag my lessons with emotional tones has changed how I reflect on my leadership style. It's the most valuable digital tool I own.",
    stars: 5,
  },
  {
    name: "James O'Brien",
    role: 'Founder, Echo Systems',
    image: 'https://i.pravatar.cc/150?u=james',
    quote:
      "I started documenting my journey as an entrepreneur here. Looking back at my 'Failure' lessons from 2 years ago is what keeps me grounded today.",
    stars: 5,
    featured: true,
  },
  {
    name: 'Dr. Helena Vance',
    role: 'Psychologist & Author',
    image: 'https://i.pravatar.cc/150?u=helena',
    quote:
      'The community aspect is incredible. Finding people who struggled with the same life transitions makes me feel less alone in my growth.',
    stars: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="w-full bg-[#0a0a0a] py-24 border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-5 md:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center text-4xl md:text-7xl font-serif text-white mb-24 italic tracking-tight"
        >
          Voices of Growth
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className={`relative p-10 rounded-[40px] border transition-all duration-500 flex flex-col justify-between ${
                t.featured
                  ? 'bg-[#111] border-[#d4af37]/30 shadow-[0_0_60px_rgba(212,175,55,0.05)] md:-translate-y-6'
                  : 'bg-transparent border-white/5 hover:border-white/20'
              }`}
            >
              {t.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full whitespace-nowrap shadow-xl">
                  Featured Story
                </div>
              )}

              <div>
                <div className="flex gap-1 mb-8 text-[#d4af37]">
                  {[...Array(t.stars)].map((_, index) => (
                    <span key={index} className="text-xl">
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-gray-300 text-lg md:text-xl font-medium italic leading-[1.8] mb-12">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-5 border-t border-white/5 pt-8 mt-auto">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-bold text-base tracking-wide">
                    {t.name}
                  </h4>
                  <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] mt-1">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
