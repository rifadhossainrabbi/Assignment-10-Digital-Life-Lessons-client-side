'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiBookOpen,
  FiHeart,
  FiBookmark,
  FiPlusCircle,
  FiUser,
  FiActivity,
} from 'react-icons/fi';
import DashboardChart from '@/components/Dashboard/DashboardChart';
import { useSession } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();

  const [stats, setStats] = useState({
    totalCreated: 0,
    totalLiked: 0,
    totalFavs: 0,
  });
  const [userLessons, setUserLessons] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!sessionData?.user) {
      router.push('/login');
      return;
    }

    // ID টি স্ট্রিং হিসেবে নেওয়া নিশ্চিত করুন
    const currentUserId = sessionData.user.id || sessionData.user._id;

    if (!currentUserId) return;

    setApiLoading(true);

    // API কল
    Promise.all([
      fetch(`http://localhost:5000/user-stats/${currentUserId}`).then(res =>
        res.json(),
      ),
      fetch(`http://localhost:5000/user-lessons/${currentUserId}`).then(res =>
        res.json(),
      ),
    ])
      .then(([statsData, lessonsData]) => {
        setStats(statsData);
        setUserLessons(lessonsData); // এখানে চার্টের ডাটা সেট হচ্ছে
      })
      .catch(err => console.error('Fetch Error:', err))
      .finally(() => setApiLoading(false));
  }, [sessionData, isPending, router]);
  console.log(userLessons, "users Lesson ")

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center text-center font-mono text-xs text-[#E5A93C] tracking-widest animate-pulse">
        SYNCHRONIZING TELEMETRY ANALYTICS...
      </div>
    );
  }

  if (!sessionData?.user) return null;

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] p-4 md:p-8 font-sans antialiased selection:bg-[#E5A93C]/30">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER BLOCK */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0F0E0C] to-[#161411] border border-[#211E1A] p-6 md:p-8 rounded-xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#E5A93C] tracking-[0.3em] uppercase mb-2">
              <span className="w-1.5 h-1.5 bg-[#E5A93C] rounded-full animate-pulse"></span>
              // CORE MONITOR TERMINAL
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#F4EFEA] font-medium tracking-wide">
              Welcome back,{' '}
              <span className="text-[#E5A93C] font-semibold">
                {sessionData?.user?.name}
              </span>
            </h1>
            <p className="text-xs text-[#8C8275] font-mono mt-1.5 flex items-center gap-1.5">
              <FiActivity className="text-emerald-500" /> System Status: Secure
              Authorized Session Active
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/add-lesson')}
            className="group flex items-center gap-2 bg-gradient-to-r from-[#E5A93C] to-[#CE952B] text-black text-xs font-mono font-bold uppercase tracking-wider px-5 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(229,169,60,0.3)] transition-all duration-300 w-full md:w-auto justify-center"
          >
            <FiPlusCircle className="text-sm transition-transform group-hover:rotate-90" />{' '}
            Transmit New Wisdom
          </button>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-[#0F0E0C]/90 backdrop-blur-md border border-[#1A1612] p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-[#8C8275] uppercase tracking-wider">
                  Published Lessons
                </p>
                <p className="text-4xl font-serif text-[#F4EFEA] mt-2 font-bold tracking-tight">
                  {stats.totalCreated}
                </p>
              </div>
              <div className="p-3.5 bg-[#1A150E] border border-[#E5A93C]/20 text-[#E5A93C] rounded-lg">
                <FiBookOpen className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#0F0E0C]/90 backdrop-blur-md border border-[#1A1612] p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-[#8C8275] uppercase tracking-wider">
                  Footprint Likes
                </p>
                <p className="text-4xl font-serif text-[#F4EFEA] mt-2 font-bold tracking-tight">
                  {stats.totalLiked}
                </p>
              </div>
              <div className="p-3.5 bg-[#1F1214] border border-red-500/20 text-red-400 rounded-lg">
                <FiHeart className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#0F0E0C]/90 backdrop-blur-md border border-[#1A1612] p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-[#8C8275] uppercase tracking-wider">
                  Saved Favorites
                </p>
                <p className="text-4xl font-serif text-[#F4EFEA] mt-2 font-bold tracking-tight">
                  {stats.totalFavs}
                </p>
              </div>
              <div className="p-3.5 bg-[#121724] border border-blue-500/20 text-blue-400 rounded-lg">
                <FiBookmark className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* INTEGRATED CHARTS COMPONENT */}
        {apiLoading ? (
          <div className="text-center py-12 font-mono text-xs text-[#E5A93C] tracking-widest animate-pulse bg-[#0F0E0C] border border-[#1A1612] rounded-xl p-12">
            FETCHING USER LOGS ECOSYSTEM...
          </div>
        ) : (
          <DashboardChart mockLessonsData={userLessons} />
        )}

        {/* FOOTER METADATA */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-[#8C8275]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1A150E] border border-[#E5A93C]/20 flex items-center justify-center text-[#E5A93C]">
              <FiUser className="text-sm" />
            </div>
            <span>
              Identity Link:{' '}
              <span className="text-[#BAB0A3] font-semibold">
                {sessionData?.user?.email}
              </span>
            </span>
          </div>
          <div className="text-[10px] tracking-widest uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-3 py-1 rounded-md">
            Verified Secure Node
          </div>
        </div>
      </div>
    </div>
  );
}
