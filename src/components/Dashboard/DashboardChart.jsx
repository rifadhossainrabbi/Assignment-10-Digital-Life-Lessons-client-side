'use client';
import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardChart({ mockLessonsData = [] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Process data for the Synchronized Area Chart
  const chartData = [...mockLessonsData]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-8) // Displaying last 8 lessons for optimal layout
    .map(lesson => ({
      name: lesson.title?.substring(0, 8) + '..',
      Likes: lesson.likesCount || 0,
      Favorites: lesson.favoritesCount || 0,
    }));

  if (!isMounted)
    return <div className="h-[400px] bg-transparent animate-pulse" />;

  return (
    <div className="space-y-6">
      {/* Top Chart: Likes Synchronization */}
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} syncId="wisdomMetrics">
            <defs>
              <linearGradient id="gradLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E5A93C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E5A93C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1A1612"
              vertical={false}
            />
            <XAxis dataKey="name" hide />
            <YAxis
              tick={{ fill: '#524B41', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0908',
                border: '1px solid #211E1A',
                borderRadius: '12px',
              }}
              itemStyle={{ color: '#E5A93C', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="Likes"
              stroke="#E5A93C"
              strokeWidth={2}
              fill="url(#gradLikes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Chart: Favorites Synchronization */}
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} syncId="wisdomMetrics">
            <defs>
              <linearGradient id="gradFavs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1A1612"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: '#524B41', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#524B41', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0908',
                border: '1px solid #211E1A',
                borderRadius: '12px',
              }}
              itemStyle={{ color: '#0ea5e9', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="Favorites"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#gradFavs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
