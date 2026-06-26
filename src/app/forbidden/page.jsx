'use client';

import Link from 'next/link';
import { LockKeyhole, Home, ChevronLeft, ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6 py-24">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code & Graphic */}
        <div className="relative flex justify-center mb-10">
          <span className="text-[150px] font-black text-gray-100 select-none leading-none">
            403
          </span>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="p-5 bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
              <LockKeyhole
                size={60}
                className="text-amber-500 animate-bounce"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Forbidden Area!
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
            Sorry, your current account doesn&apos;t have the permissions needed
            to access this page. This vault is locked for you.
          </p>
        </div>

        {/* Action Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
            Go Back
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-300"
          >
            <Home size={20} />
            Return Home
          </Link>
        </div>

        {/* Technical Info (Optional) */}
        <div className="mt-16 flex items-center justify-center gap-2 text-gray-400">
          <ShieldX size={16} />
          <span className="text-xs uppercase tracking-widest font-medium">
            Security Protocol: Protected Route
          </span>
        </div>
      </div>
    </div>
  );
}
