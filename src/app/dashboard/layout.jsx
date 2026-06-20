import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import React from 'react';
import { auth } from '@/lib/auth'; // আপনার Better Auth-এর মেইন সার্ভার ইনস্ট্যান্স পাথটি দিন
import { headers } from 'next/headers';
import { redirect } from 'next/navigation'; // এখানে notFound বাদ দিয়ে শুধু redirect রাখলেই হবে

const DashboardLayout = async ({ children }) => {
  // Better Auth-এ সার্ভার কম্পোনেন্ট থেকে সেশন রিড করার নিয়ম
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  // যদি সেশন না থাকে (null হয়), তবে সরাসরি Sign In পেজে রিডাইরেক্ট করবে
  if (!sessionData) {
    redirect('/signin'); // আপনার সাইন-ইন পেজের রাউট যদি '/login' হয়, তবে এখানে '/login' লিখুন
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
