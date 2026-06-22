'use client';

import React, { useState, useEffect } from 'react';
import { redirect, useRouter } from 'next/navigation'; // redirect এবং useRouter ইমপোর্ট করা হয়েছে
import { FiBookOpen, FiHeart, FiBookmark } from 'react-icons/fi';
import DashboardChart from '@/components/Dashboard/DashboardChart';
import { authClient } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter(); // নেভিগেশন বাটনের জন্য
  const { data: sessionData, isPending } = authClient.useSession();

  const [stats, setStats] = useState({
    totalCreated: 0,
    totalLiked: 0,
    totalFavs: 0,
  });
  const [userLessons, setUserLessons] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  if (!isPending && !sessionData) {
    redirect('/signin');
  }

  useEffect(() => {
    // সেশন না থাকলে বা লোডিং চললে ডেটা ফেচ করার দরকার নেই
    if (isPending || !sessionData?.user) return;

    const currentUserId = sessionData.user.id;
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

    setApiLoading(true);

    // মাল্টিপল এপিআই কল একসাথে হ্যান্ডেল করা
    Promise.all([
      fetch(`${serverUrl}/user-stats/${currentUserId}`).then(res => res.json()),
      fetch(`${serverUrl}/user-lessons/${currentUserId}`).then(res =>
        res.json(),
      ),
    ])
      .then(([statsData, lessonsData]) => {
        setStats(statsData || { totalCreated: 0, totalLiked: 0, totalFavs: 0 });
        setUserLessons(lessonsData || []);
      })
      .catch(err => console.error('Dashboard Fetch Error:', err))
      .finally(() => setApiLoading(false));
  }, [sessionData, isPending]);

  // মেইন লোডিং স্টেট
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center font-mono text-[#E5A93C]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent border-[#E5A93C] rounded-full animate-spin"></div>
          <span className="tracking-widest uppercase text-xs">
            Initializing Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-[#0F0E0C] border border-[#211E1A] p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif text-[#F4EFEA]">
              Welcome,{' '}
              <span className="text-[#E5A93C]">{sessionData?.user?.name}</span>
            </h1>
            <p className="text-[10px] text-[#8C8275] font-mono mt-1 uppercase tracking-widest">
              Digital Sanctuary Status:{' '}
              <span className="text-green-500">Online</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/user/add-lesson')}
            className="bg-[#E5A93C] hover:bg-[#d49a2d] text-black px-6 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/10"
          >
            + Create New Lesson
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Lessons Created"
            value={stats.totalCreated}
            icon={<FiBookOpen size={20} />}
            color="text-[#E5A93C]"
          />
          <StatCard
            title="Total Appreciation"
            value={stats.totalLiked}
            icon={<FiHeart size={20} />}
            color="text-rose-400"
          />
          <StatCard
            title="Wisdom Preserved"
            value={stats.totalFavs}
            icon={<FiBookmark size={20} />}
            color="text-sky-400"
          />
        </div>

        {/* Analytics Section */}
        <div className="bg-[#0F0E0C] border border-[#1A1612] p-6 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-[#E5A93C]"></div>
            <h2 className="text-xs font-mono uppercase text-[#8C8275] tracking-widest">
              Growth Analytics
            </h2>
          </div>

          {apiLoading ? (
            <div className="h-[300px] w-full bg-[#141311] animate-pulse rounded-lg flex items-center justify-center text-[10px] font-mono text-[#26221C]">
              GENERATING ANALYTICS...
            </div>
          ) : (
            <DashboardChart mockLessonsData={userLessons} />
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable StatCard Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-[#0F0E0C] border border-[#1A1612] p-6 rounded-xl flex items-center justify-between group hover:border-[#E5A93C]/20 transition-all">
      <div>
        <p className="text-[10px] font-mono text-[#8C8275] uppercase tracking-tighter">
          {title}
        </p>
        <p className="text-4xl font-serif text-[#F4EFEA] mt-2 font-bold group-hover:text-[#E5A93C] transition-colors">
          {value || 0}
        </p>
      </div>
      <div
        className={`p-4 bg-[#1A150E] border border-white/5 rounded-2xl ${color} shadow-inner shadow-black/40`}
      >
        {icon}
      </div>
    </div>
  );
}
