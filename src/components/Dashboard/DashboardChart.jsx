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
  useEffect(() => setIsMounted(true), []);

  const chartData = mockLessonsData.map(lesson => ({
    name: lesson.title?.substring(0, 10) + '...',
    Likes: lesson.likesCount || 0,
    Favorites: lesson.favoritesCount || 0,
  }));

  if (!isMounted) return <div className="h-[320px] bg-[#0F0E0C]" />;

  return (
    <div className="bg-[#0F0E0C] border border-[#1A1612] p-6 rounded-xl">
      <h3 className="text-sm font-serif text-[#F4EFEA] mb-6">
        Engagement Analytics
      </h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E5A93C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E5A93C" stopOpacity={0} />
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
            />
            <YAxis tick={{ fill: '#524B41', fontSize: 10 }} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0A0908',
                border: '1px solid #211E1A',
              }}
            />
            <Area
              type="monotone"
              dataKey="Likes"
              stroke="#E5A93C"
              fill="url(#colorL)"
            />
            <Area
              type="monotone"
              dataKey="Favorites"
              stroke="#3B82F6"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
