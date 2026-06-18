'use client';

import React from 'react';
import Link from 'next/link';
import { HiHome } from 'react-icons/hi';
import Image from 'next/image';

const NotFoundPage = () => {
  return (
    <div className="relative min-h-screen bg-[#1a120b] flex items-center justify-center overflow-hidden p-6">
      {/* Background বড় করে লেখা 404 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h1 className="text-[15rem] md:text-[25rem] lg:text-[30rem] font-bold text-white/[0.03] leading-none">
          404
        </h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
        {/* Image Container */}
        <div className="mb-8 relative group">
          {/* ইমেজের পেছনে হালকা গ্লো ইফেক্ট */}
          <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>

          <div className="relative w-64 h-64 md:w-80 md:h-80 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <Image
              // এখানে width এবং height বাড়িয়ে ৫০০ করে দিন যাতে ইমেজ ক্লিয়ার থাকে
              width={500}
              height={500}
              src="/asstes/AB6AXuCSHXbbEMqiiz-cT32wS0nv2i15oPiZtktCPN_MqtKLKUxLTQ2ttzjTtmwNAVeFWlSwsDDDkUnOApBUE-SGkQFPK8pYFphL0R2a94wOUh2fUN6KyXe7F4talgLe5Y7YWw2AIg2KAMEI6dBhT5SeBix7YELe8az8HZgRPjH66yCSdzJrQlpC95kLhpA4T4r1xcPPdA4-9Np0kjZksCL.png"
              alt="Wisdom Lost"
              priority // এই ইমেজটি আগে লোড হওয়ার জন্য
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#ffb247] mb-6 tracking-wide drop-shadow-lg">
          Wisdom Lost
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-lg leading-relaxed mb-10 px-4">
          The chapter you seek has dissolved into the ether of time. Even the
          most dedicated seekers find themselves at a dead end occasionally.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#ffb247] hover:bg-[#e6a03e] text-[#1a120b] px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg active:scale-95"
          >
            <HiHome size={20} />
            Return to Home
          </Link>

          <Link
            href="/public-lessons"
            className="bg-transparent hover:bg-white/5 text-gray-300 border border-white/10 hover:border-white/20 px-8 py-3 rounded-xl font-medium transition-all duration-300 active:scale-95"
          >
            Search the Library
          </Link>
        </div>
      </div>

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-transparent to-black/60"></div>
    </div>
  );
};

export default NotFoundPage;
