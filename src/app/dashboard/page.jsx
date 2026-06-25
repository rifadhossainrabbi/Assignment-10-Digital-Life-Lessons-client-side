'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiBook,
  FiHeart,
  FiStar,
  FiArrowRight,
  FiActivity,
} from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import DashboardChart from '@/components/Dashboard/DashboardChart';

export default function UserDashboardHome() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [userLessons, setUserLessons] = useState([]);
  const [stats, setStats] = useState({
    totalCreated: 0,
    totalSaved: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/signin');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    // Safety check for session
    if (isPending || !session?.user) return;

    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    const userId = session.user.id;

    const fetchDashboardData = async () => {
      try {
        // Fetching data from your existing backend routes
        const [lessonsRes, favoritesRes] = await Promise.all([
          fetch(`${serverUrl}/lessons/user/${userId}`).then(res => res.json()),
          fetch(`${serverUrl}/favorites/${userId}`).then(res => res.json()),
        ]);

        // Calculate total likes accumulated from all lessons
        const accumulatedLikes = lessonsRes.reduce(
          (acc, curr) => acc + (curr.likesCount || 0),
          0,
        );

        setStats({
          totalCreated: lessonsRes.length,
          totalSaved: favoritesRes.length,
          totalLikes: accumulatedLikes,
        });

        setUserLessons(lessonsRes);
      } catch (err) {
        console.error('Dashboard Data Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, isPending]);

  if (isPending || loading) return <LoadingUI />;

  return (
    <div className="space-y-8 p-4 md:p-5 text-[#D1C7BD] min-h-screen bg-[#0A0908]">
      {/* Requirement: Welcome Header & Quick Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-serif text-[#F4EFEA]">
            Welcome back, {session?.user?.name.split(' ')[0]}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[10px] text-[#8C8275] font-mono uppercase tracking-[0.2em]">
              Sanctuary Active • {session?.user?.role}
            </p>
          </div>
        </motion.div>

        <button
          onClick={() => router.push('/dashboard/user/add-lesson')}
          className="group flex items-center gap-2 bg-[#E5A93C] text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#F4EFEA] transition-all shadow-xl shadow-amber-900/10"
        >
          <FiPlus className="group-hover:rotate-90 transition-transform" /> New
          Life Lesson
        </button>
      </div>

      {/* Requirement: Total Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Lessons Created"
          value={stats.totalCreated}
          icon={<FiBook />}
          color="text-amber-500"
        />
        <StatCard
          label="Wisdom Saved"
          value={stats.totalSaved}
          icon={<FiStar />}
          color="text-sky-400"
        />
        <StatCard
          label="Total Appreciation"
          value={stats.totalLikes}
          icon={<FiHeart />}
          color="text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requirement: Analytics Chart Section */}
        <div className="lg:col-span-2 space-y-4 bg-[#0F0E0C] border border-[#1A1612] p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-[#E5A93C]" />
            <h2 className="text-xs font-mono text-[#8C8275] uppercase tracking-widest">
              Growth & Engagement Analytics
            </h2>
          </div>
          <DashboardChart mockLessonsData={userLessons} />
        </div>

        {/* Requirement: Recently Added Lessons & Quick Shortcuts */}
        <div className="space-y-6">
          <div className="bg-[#0F0E0C] border border-[#1A1612] p-6 rounded-2xl">
            <h3 className="text-xs font-mono text-[#8C8275] uppercase tracking-widest mb-6 pb-2 border-b border-white/5">
              Recently Added
            </h3>
            <div className="space-y-5">
              {userLessons.length > 0 ? (
                userLessons.slice(0, 4).map(lesson => (
                  <div key={lesson._id} className="group cursor-pointer">
                    <p className="text-sm text-[#F4EFEA] font-serif group-hover:text-[#E5A93C] transition-colors truncate mb-1">
                      {lesson.title}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#524B41] font-mono">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-[#8C8275] uppercase tracking-tighter">
                        {lesson.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#524B41] italic">
                  No records in the archive.
                </p>
              )}
            </div>

            <button
              onClick={() => router.push('/dashboard/user/my-lessons')}
              className="w-full mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-[#8C8275] hover:text-[#E5A93C] transition-all py-3 border border-white/5 rounded-xl hover:bg-white/5"
            >
              Explore Full Archive <FiArrowRight />
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#0F0E0C] border border-[#1A1612] p-4 rounded-2xl grid grid-cols-2 gap-2">
            <ShortcutLink label="Profile" href="/dashboard/profile" />
            <ShortcutLink label="Settings" href="/dashboard/settings" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-[#0F0E0C] border border-[#1A1612] p-6 rounded-2xl flex items-center justify-between group hover:border-[#E5A93C]/30 transition-all">
      <div>
        <p className="text-[10px] font-mono text-[#8C8275] uppercase tracking-[0.2em]">
          {label}
        </p>
        <p className="text-4xl font-serif text-[#F4EFEA] mt-2 font-bold group-hover:text-[#E5A93C] transition-colors">
          {value}
        </p>
      </div>
      <div
        className={`p-4 bg-white/[0.03] border border-white/5 rounded-2xl ${color} shadow-inner`}
      >
        {icon}
      </div>
    </div>
  );
}

// Reusable Shortcut Component
function ShortcutLink({ label, href }) {
  return (
    <a
      href={href}
      className="bg-white/5 p-3 rounded-xl text-center text-[10px] font-mono uppercase tracking-widest text-[#8C8275] hover:text-[#E5A93C] transition-all"
    >
      {label}
    </a>
  );
}

// Loading Skeleton
function LoadingUI() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#0A0908] text-[#524B41] font-mono text-[10px] uppercase tracking-[0.3em]">
      <div className="w-10 h-10 border-2 border-t-transparent border-[#E5A93C] rounded-full animate-spin"></div>
      Synchronizing Sanctuary Data...
    </div>
  );
}
