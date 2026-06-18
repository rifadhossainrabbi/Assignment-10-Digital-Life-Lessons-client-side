import DashboardSidebar from '@/components/Dashboard/User/DashboardSidebar';
import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    // On mobile: flex-col (Sidebar header on top, content below)
    // On Desktop: flex-row (Sidebar on left, content on right)
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
