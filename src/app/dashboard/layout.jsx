import React from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';

const DashboardLayout = async ({ children }) => {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    redirect('/signin');
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#050505]">
      {/* Sidebar/TopNav */}
      <DashboardSidebar />

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* 
          On Mobile: Top padding ensures content starts after the sticky nav 
          On Desktop: Normal padding
        */}
        <div className="min-h-full p-4 md:p-0 lg:p-0">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
