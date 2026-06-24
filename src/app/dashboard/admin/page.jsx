'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  AlertTriangle,
  Star,
  Activity,
  Award,
  Calendar,
  Heart,
  BookOpen,
} from 'lucide-react';
import AdminDashboardCharts from '@/components/Dashboard/AdminDashboardCharts';
import Link from 'next/link';

const AdminDashboardHome = () => {
  const [dashboardData, setDashboardData] = useState({
    users: [],
    lessons: [],
    reports: [],
    stats: {},
    chartData: [],
    topContributors: [], // Only top 5 based on combined stats
    todayLessons: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [userRes, lessonRes, reportRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/users`).then(res =>
            res.json(),
          ),
          fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/all-lessons`).then(
            res => res.json(),
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/reported-lessons`,
          ).then(res => res.json()),
        ]);

        const lessons = lessonRes.lessons || [];
        const users = userRes || [];

        // --- Logic: Calculate Today's Lessons ---
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = lessons.filter(
          l => new Date(l.createdAt).toISOString().split('T')[0] === todayStr,
        ).length;

        // --- Logic: Process Weekly Growth Chart ---
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

        // --- Logic: Advanced Top Contributor Selection (Likes + Lessons) ---
        const calculateTopContributors = () => {
          // 1. Create a map to aggregate likes and lesson counts per user
          const userAggregation = lessons.reduce((acc, lesson) => {
            const authorId = lesson.author?.userId;
            if (authorId) {
              if (!acc[authorId]) acc[authorId] = { likes: 0, count: 0 };
              acc[authorId].likes += lesson.likes?.length || 0;
              acc[authorId].count += 1;
            }
            return acc;
          }, {});

          // 2. Map user objects with their aggregated scores
          const rankedUsers = users.map(user => {
            const aggregated = userAggregation[user._id] || {
              likes: 0,
              count: 0,
            };
            return {
              ...user,
              totalPlatformLikes: aggregated.likes,
              totalPlatformLessons: aggregated.count,
              // Scoring formula: prioritize users with high engagement (likes) and consistency (lessons)
              contributionScore: aggregated.likes * 2 + aggregated.count * 5,
            };
          });

          // 3. Sort by contribution score and return top 5
          return rankedUsers
            .filter(u => u.totalPlatformLessons > 0)
            .sort((a, b) => b.contributionScore - a.contributionScore)
            .slice(0, 5);
        };

        setDashboardData({
          users,
          lessons,
          reports: reportRes || [],
          stats: lessonRes.stats || {},
          chartData: processChartData(),
          topContributors: calculateTopContributors(),
          todayLessons: todayCount,
          loading: false,
        });
      } catch (error) {
        console.error('Critical Error Loading Dashboard:', error);
      }
    };

    fetchAllData();
  }, []);

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#020617] text-indigo-400 font-bold italic tracking-widest animate-pulse">
        ARCHIVE_INITIALIZING...
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: dashboardData.users.length,
      icon: <Users size={20} />,
      color: 'text-blue-400',
    },
    {
      label: 'Public Wisdom',
      value: dashboardData.stats.publicCount,
      icon: <BookOpen size={20} />,
      color: 'text-indigo-400',
    },
    {
      label: 'Reported Flags',
      value: dashboardData.reports.length,
      icon: <AlertTriangle size={20} />,
      color: 'text-rose-400',
    },
    {
      label: "Today's Lessons",
      value: dashboardData.todayLessons,
      icon: <Calendar size={20} />,
      color: 'text-emerald-400',
    },
  ];

  return (
    <div className="p-6 bg-[#020617] min-h-screen text-slate-300 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-600 bg-clip-text text-transparent italic tracking-tight">
          Admin Intelligence Console
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
          Ecosystem Monitoring & Contributor Metrics
        </p>
      </motion.div>

      {/* Overview Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4, backgroundColor: '#1e293b' }}
            className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-2xl transition-colors"
          >
            <div
              className={`${card.color} mb-4 p-2 bg-slate-900 w-fit rounded-lg shadow-inner`}
            >
              {card.icon}
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              {card.label}
            </p>
            <h3 className="text-3xl font-bold mt-1 text-white tabular-nums">
              {card.value}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Tracker */}
        <div className="lg:col-span-2 bg-[#0f172a] p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white italic">
              <Activity className="text-indigo-500" /> Platform Flow Tracker
            </h3>
            <div className="flex gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-indigo-400">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> Lessons
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Users
              </span>
            </div>
          </div>
          <AdminDashboardCharts data={dashboardData.chartData} />
        </div>

        {/* Sidebar: TOP CONTRIBUTORS (Likes + Lessons Logic) */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 shadow-xl border-t-2 border-t-amber-500/20">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="text-amber-500" /> Top Contributors
                </h3>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                  Ranking: Lessons & Engagement
                </p>
              </div>
              <Star className="text-amber-500/20" size={30} />
            </div>

            <div className="space-y-6">
              {dashboardData.topContributors.map((user, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between group cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          user.image ||
                          user.photoURL ||
                          'https://i.ibb.co.com/vP99Tpx/user.png'
                        }
                        className="w-10 h-10 rounded-full border-2 border-slate-800 group-hover:border-amber-500/40 transition-all duration-300"
                        alt="pfp"
                      />
                      {idx === 0 && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 shadow-lg border border-black animate-bounce">
                          <Star size={8} className="text-black fill-black" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate w-28 group-hover:text-amber-400 transition-colors">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase">
                        <span className="flex items-center gap-0.5 text-rose-500">
                          <Heart size={8} fill="currentColor" />{' '}
                          {user.totalPlatformLikes}
                        </span>
                        <span>•</span>
                        <span className="text-indigo-400">
                          {user.totalPlatformLessons} Contributions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shadow-sm">
                      #{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reported Content Dashboard Widget */}
          <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20 shadow-lg">
            <h4 className="font-bold text-rose-500 mb-4 flex items-center gap-2 uppercase text-[10px] tracking-widest">
              <AlertTriangle size={14} /> Reported Archives
            </h4>
            <div className="space-y-3">
              {dashboardData.reports.length > 0 ? (
                dashboardData.reports.slice(0, 2).map((report, i) => (
                  <div
                    key={i}
                    className="p-3 bg-black/20 rounded-xl border border-white/5 group hover:bg-black/40 transition-all"
                  >
                    <p className="text-[11px] font-bold text-slate-200 truncate italic">
                      "{report.lessonTitle || 'System_Record'}"
                    </p>
                    <p className="text-[9px] text-rose-400 mt-1 font-black tracking-tighter uppercase">
                      ISSUE:{' '}
                      {report?.reason?.toUpperCase() || 'UNDEFINED_VIOLATION'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-600 text-center py-4 font-bold uppercase">
                  Archive Clean
                </p>
              )}

              <Link href={'/dashboard/admin/reported-lessons'}>
                <button className="w-full text-[9px] font-black text-rose-500 mt-2 py-2.5 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest">
                  Moderate All Reports
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
