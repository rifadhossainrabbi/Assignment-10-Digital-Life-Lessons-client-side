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

  // ডাটা ফরম্যাটিং নিশ্চিত করা
  const chartData = Array.isArray(mockLessonsData)
    ? mockLessonsData.map(lesson => ({
        name:
          lesson.title?.length > 10
            ? `${lesson.title.substring(0, 10)}...`
            : lesson.title,
        Likes: lesson.likesCount || 0,
        Favorites: lesson.favoritesCount || 0,
      }))
    : [];
  console.log('Chart Data', chartData)

  if (!isMounted)
    return <div className="h-[320px] bg-[#0F0E0C] animate-pulse rounded-xl" />;

  if (chartData.length === 0) {
    return (
      <div className="h-[320px] flex flex-col items-center justify-center border border-[#1A1612] rounded-xl text-[#524B41] font-mono text-xs bg-[#0F0E0C]">
        <p>NO ANALYTICS DATA FOUND</p>
        <p className="mt-2 text-[10px] opacity-50 uppercase">
          Start transmitting wisdom to see stats
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0E0C] border border-[#1A1612] p-6 rounded-xl w-full shadow-inner">
      <div className="mb-6">
        <h3 className="text-sm font-serif text-[#F4EFEA] flex items-center gap-2">
          <span className="w-2 h-2 bg-[#E5A93C] rounded-full"></span>
          Engagement Analytics
        </h3>
        <p className="text-[10px] text-[#8C8275] uppercase tracking-widest mt-1 ml-4">
          Visualizing wisdom footprint metrics
        </p>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E5A93C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E5A93C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFavs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1A1612"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#524B41', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#524B41', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0908',
                border: '1px solid #211E1A',
                borderRadius: '8px',
              }}
              itemStyle={{ fontSize: '11px', textTransform: 'uppercase' }}
            />
            <Area
              type="monotone"
              dataKey="Likes"
              stroke="#E5A93C"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLikes)"
            />
            <Area
              type="monotone"
              dataKey="Favorites"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFavs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
