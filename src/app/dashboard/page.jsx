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
import { authClient } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const { data: sessionData, isPending } = authClient.useSession();

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

    const currentUserId = sessionData.user.id;
    setApiLoading(true);

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
        setUserLessons(lessonsData);
      })
      .catch(err => console.error('Fetch Error:', err))
      .finally(() => setApiLoading(false));
  }, [sessionData, isPending, router]);

  if (isPending)
    return (
      <div className="min-h-screen bg-[#0A0908] flex items-center justify-center font-mono text-[#E5A93C]">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0A0908] text-[#D1C7BD] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-[#0F0E0C] border border-[#211E1A] p-6 rounded-xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif text-[#F4EFEA]">
              Welcome, {sessionData?.user?.name}
            </h1>
            <p className="text-xs text-[#8C8275] font-mono mt-1">
              System Status: Active
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/add-lesson')}
            className="bg-[#E5A93C] text-black px-5 py-3 rounded-lg text-xs font-bold uppercase"
          >
            + New Lesson
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Lessons"
            value={stats.totalCreated}
            icon={<FiBookOpen />}
            color="text-[#E5A93C]"
          />
          <StatCard
            title="Total Likes"
            value={stats.totalLiked}
            icon={<FiHeart />}
            color="text-red-400"
          />
          <StatCard
            title="Favorites"
            value={stats.totalFavs}
            icon={<FiBookmark />}
            color="text-blue-400"
          />
        </div>

        {apiLoading ? (
          <div className="h-[300px] bg-[#0F0E0C] animate-pulse rounded-xl" />
        ) : (
          <DashboardChart mockLessonsData={userLessons} />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-[#0F0E0C] border border-[#1A1612] p-6 rounded-xl flex items-center justify-between">
      <div>
        <p className="text-[10px] font-mono text-[#8C8275] uppercase">
          {title}
        </p>
        <p className="text-4xl font-serif text-[#F4EFEA] mt-2 font-bold">
          {value}
        </p>
      </div>
      <div
        className={`p-3 bg-[#1A150E] border border-white/5 rounded-lg ${color}`}
      >
        {icon}
      </div>
    </div>
  );
}
