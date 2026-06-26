'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const AdminDashboardCharts = ({ data }) => {
  return (
    <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255, 255, 255, 0.05)"
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
          />

          <Tooltip
            cursor={{ stroke: '#d4af37', strokeWidth: 1 }}
            contentStyle={{
              backgroundColor: '#111',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '12px',
              fontSize: '11px',
              color: '#fff',
            }}
          />

          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            formatter={value => (
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500">
                {value}
              </span>
            )}
          />

          <Area
            name="Lessons"
            type="monotone"
            dataKey="lessonCount"
            stroke="#d4af37"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorLessons)"
          />

          <Area
            name="Users"
            type="monotone"
            dataKey="userCount"
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminDashboardCharts;
