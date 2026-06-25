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
    .slice(-8) // Optimal for mobile and desktop
    .map(lesson => ({
      name: lesson.title?.substring(0, 6) + '..', // Slightly shorter for mobile labels
      Likes: lesson.likesCount || 0,
      Favorites: lesson.favoritesCount || 0,
    }));

  if (!isMounted)
    return (
      <div className="h-[300px] md:h-[400px] bg-transparent animate-pulse" />
    );

  // Common chart styles to avoid repetition
  const axisStyle = { fill: '#524B41', fontSize: 10, fontWeight: 500 };
  const tooltipStyle = {
    backgroundColor: '#0A0908',
    border: '1px solid #211E1A',
    borderRadius: '12px',
    fontSize: '11px',
  };

  return (
    <div className="space-y-4 md:space-y-8 w-full overflow-hidden">
      {/* Top Chart: Likes Synchronization */}
      <div className="h-[140px] sm:h-[180px] lg:h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            syncId="wisdomMetrics"
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }} // Negative left to align with edge
          >
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
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#E5A93C' }}
              cursor={{ stroke: '#211E1A', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="Likes"
              stroke="#E5A93C"
              strokeWidth={2}
              fill="url(#gradLikes)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Chart: Favorites Synchronization */}
      <div className="h-[160px] sm:h-[200px] lg:h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            syncId="wisdomMetrics"
            margin={{ top: 5, right: 10, left: -20, bottom: 20 }} // Space for XAxis labels
          >
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
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              dy={10} // Moves labels down slightly
            />
            <YAxis
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: '#0ea5e9' }}
              cursor={{ stroke: '#211E1A', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="Favorites"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#gradFavs)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
