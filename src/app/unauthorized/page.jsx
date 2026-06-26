'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon Container */}
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-red-100 rounded-full animate-pulse">
            <ShieldAlert size={64} className="text-red-600" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Access Denied
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Oops! It looks like you don't have the necessary permissions to view
          this content. This area is restricted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-200"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-12 text-sm text-gray-400">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
