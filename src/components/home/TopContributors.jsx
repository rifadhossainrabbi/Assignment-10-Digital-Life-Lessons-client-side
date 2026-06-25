'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiBookOpen } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const TopContributors = () => {
  const router = useRouter();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${serverUrl}/top-contributors`)
      .then(res => res.json())
      .then(data => {
        setContributors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Archive Sync Error:', err);
        setLoading(false);
      });
  }, [serverUrl]);
  console.log(contributors);

  if (loading) {
    return (
      <div className="w-full bg-[#0A0908] py-20 text-center text-[#E5A93C] font-mono uppercase tracking-widest animate-pulse">
        Scanning Contributor Records...
      </div>
    );
  }

  return (
    <section className="container py-24 bg-[#0A0908] border-t border-white/5">
      <div className="container mx-auto px-6 md:px-10">
        {/* Section Header */}
        <header className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-white italic tracking-wide"
          >
            Top Contributors
          </motion.h2>
          <div className="h-1.5 w-16 bg-[#E5A93C] mt-6 rounded-full shadow-[0_0_15px_rgba(229,169,60,0.3)]"></div>
        </header>
        {/* Contributors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {contributors.length > 0 ? (
            contributors.map((person, idx) => (
              <motion.div
                key={person._id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
                onClick={() => router.push(`/author-profile/${person._id}`)}
                className="group relative bg-[#14110C] border border-[#1A1612] rounded-2xl p-10 text-center cursor-pointer hover:border-[#E5A93C]/40 transition-all duration-500 shadow-2xl overflow-hidden"
              >
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#E5A93C]/5 blur-[80px] rounded-full group-hover:bg-[#E5A93C]/10 transition-all duration-700"></div>

                <div className="relative inline-block mb-6">
                  <div className="w-28 h-28 rounded-full border-2 border-[#1A1612] p-1.5 group-hover:border-[#E5A93C]/50 transition-all duration-500 bg-[#0A0908]">
                    <Image
                      width={112}
                      height={112}
                      // ইমেজ হ্যান্ডলিং ফিক্স
                      src={
                        person?.image && person.image !== ''
                          ? person.image
                          : 'https://i.ibb.co.com/vP99Tpx/user.png'
                      }
                      alt={person?.name || 'Contributor'}
                      className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#E5A93C] text-black p-2 rounded-full shadow-lg border-2 border-[#14110C]">
                    <FiAward size={14} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-white group-hover:text-[#E5A93C] transition-colors leading-tight">
                    {person?.name || 'Anonymous Seeker'}
                  </h3>
                  <p className="text-[10px] text-[#5C544A] font-mono uppercase tracking-[0.2em]">
                    Verified Insight Provider
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#1A1612] flex items-center justify-center gap-3">
                  <FiBookOpen className="text-[#E5A93C] text-sm" />
                  <span className="text-sm font-bold text-white tracking-tighter">
                    {person.totalLessons}{' '}
                    <span className="text-[9px] text-[#5C544A] font-mono uppercase ml-1">
                      Lessons Shared
                    </span>
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            // ডাটা না থাকলে খালি দেখাবে না
            <div className="col-span-full py-10 text-center text-[#5C544A] font-mono text-xs uppercase tracking-widest">
              No Contributor records found in the archive.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopContributors;
