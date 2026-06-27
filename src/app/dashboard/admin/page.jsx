'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiBookOpen,
  FiAlertTriangle,
  FiCalendar,
  FiActivity,
  FiAward,
  FiStar,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminDashboardCharts from '@/components/Dashboard/AdminDashboardCharts';
import { api } from '@/lib/reusableApi';

const AdminDashboardHome = () => {
  const [dashboardData, setDashboardData] = useState({
    users: [],
    lessons: [],
    reports: [],
    stats: {},
    chartData: [],
    topContributors: [],
    todayLessons: 0,
    loading: true,
  });

  const { data: session, isPending: authLoading } = authClient.useSession();
  console.log('session', session);
  const router = useRouter();

  const getInitials = name => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (!authLoading && (!session || session.user.role !== 'admin')) {
      router.replace('/signin');
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [userRes, lessonRes, reportRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/all-lessons'),
          api.get('/admin/reported-lessons'),
        ]);

        const lessons = lessonRes.lessons || [];
        const users = userRes || [];
        const todayStr = new Date().toISOString().split('T')[0];

        const processChartData = () => {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return days.map(day => ({
            date: day,
            lessonCount: lessons.filter(
              l =>
                new Date(l.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                }) === day,
            ).length,
            userCount: users.filter(
              u =>
                new Date(u.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                }) === day,
            ).length,
          }));
        };

        const calculateTopContributors = () => {
          const userAgg = lessons.reduce((acc, l) => {
            const id = l.author?.userId;
            if (id) {
              acc[id] = acc[id] || { likes: 0, count: 0 };
              acc[id].likes += l.likes?.length || 0;
              acc[id].count += 1;
            }
            return acc;
          }, {});

          return users
            .map(u => ({
              ...u,
              score:
                (userAgg[u._id]?.likes || 0) * 2 +
                (userAgg[u._id]?.count || 0) * 5,
              totalLikes: userAgg[u._id]?.likes || 0,
              totalLessons: userAgg[u._id]?.count || 0,
            }))
            .filter(u => u.totalLessons > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        };

        setDashboardData({
          users,
          lessons,
          reports: reportRes || [],
          stats: lessonRes.stats || {},
          chartData: processChartData(),
          topContributors: calculateTopContributors(),
          todayLessons: lessons.filter(l => l.createdAt.startsWith(todayStr))
            .length,
          loading: false,
        });
      } catch (err) {
        console.error('Dashboard Data Sync Error:', err.message);
      }
    };

    if (session?.user.role === 'admin') fetchAllData();
  }, [session]);

  if (authLoading || dashboardData.loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#0a0a0a] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-2 border-t-transparent border-[#d4af37] rounded-full"
        />
        <p className="text-[#d4af37] font-black text-[10px] tracking-widest uppercase">
          Initializing_Admin_Core...
        </p>
      </div>
    );

  const stats = [
    {
      label: 'Total Users',
      value: dashboardData.users.length,
      icon: <FiUsers />,
      color: 'text-white',
    },
    {
      label: 'Public Wisdom',
      value: dashboardData.stats.publicCount || 0,
      icon: <FiBookOpen />,
      color: 'text-[#d4af37]',
    },
    {
      label: 'Reported Flags',
      value: dashboardData.reports.length,
      icon: <FiAlertTriangle />,
      color: 'text-red-500',
    },
    {
      label: "Today's Entry",
      value: dashboardData.todayLessons,
      icon: <FiCalendar />,
      color: 'text-white',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#0a0a0a] min-h-screen text-gray-400">
      {/* Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
          Master <span className="text-[#d4af37]">Panel</span>
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 mt-2 italic">
          Security & Intelligence Interface
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#111] p-6 rounded-2xl border border-white/5 group hover:border-[#d4af37]/30 transition-all"
          >
            <div className={`${stat.color} text-2xl mb-4`}>{stat.icon}</div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
              {stat.label}
            </p>
            <h2 className="text-3xl font-black text-white mt-1">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-[#111] p-6 rounded-3xl border border-white/5 overflow-hidden">
          <h3 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-sm mb-6">
            <FiActivity className="text-[#d4af37]" /> Platform Growth Dynamics
          </h3>
          <AdminDashboardCharts data={dashboardData.chartData} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <div className="bg-[#111] p-6 rounded-3xl border border-white/5">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-6">
              <FiAward className="text-[#d4af37]" /> Elite Contributors
            </h3>
            <div className="space-y-5">
              {dashboardData.topContributors.map((user, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between min-w-0"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-9 h-9 rounded-full bg-gray-800 border-white/10 flex items-center justify-center shrink-0 overflow-hidden hover:border-amber-500 border-0 hover:border-2">
                      {/* এখানে session?.user?.id এর বদলে user._id হবে */}
                      <Link href={`/author-profile/${user._id}`}>
                        {user?.image ? (
                          <Image
                            alt="User Image"
                            width={30}
                            height={30}
                            src={user?.image}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-gray-400">
                            {user?.name.slice(0, 2)}
                          </span>
                        )}
                      </Link>
                    </div>
                    <div className="truncate">
                      {/* নামকেও ক্লিকেবল করার জন্য Link ব্যবহার করা ভালো */}
                      <Link href={`/author-profile/${user._id}`}>
                        <p className="text-xs font-bold text-white truncate hover:text-[#d4af37] transition-colors">
                          {user.name}
                        </p>
                      </Link>
                      <p className="text-[9px] text-[#d4af37] font-black uppercase">
                        {user.totalLessons} Lessons
                      </p>
                    </div>
                  </div>
                  <FiStar className="text-[#d4af37] shrink-0" size={12} />
                </div>
              ))}
            </div>
          </div>

          {/* Reported Flags  */}
          <div className="bg-[#111] p-6 rounded-3xl border border-red-900/20">
            <h3 className="text-red-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <FiAlertTriangle /> Critical Flags
            </h3>
            <div className="space-y-3">
              {dashboardData.reports.slice(0, 3).map((r, i) => (
                <div
                  key={i}
                  className="p-3 bg-black/40 rounded-xl text-[10px] border border-white/5"
                >
                  <p className="text-gray-300 font-bold truncate italic">
                    {r.lessonTitle || 'System Flag'}
                  </p>
                  <p className="text-red-400 mt-1 uppercase font-black tracking-tighter">
                    Reason: {r.reason}
                  </p>
                </div>
              ))}
              <Link
                href="/dashboard/admin/reported-lessons"
                className="block w-full text-center py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white hover:text-black transition-all"
              >
                Moderate All Records
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
