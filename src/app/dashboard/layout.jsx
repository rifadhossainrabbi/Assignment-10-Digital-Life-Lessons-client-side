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
      {/* Dashboard Sidebar Component */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden">
        {/* Added padding to prevent content from touching the edges on smaller screens */}
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
