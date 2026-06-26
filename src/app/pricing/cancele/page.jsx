import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

export default function CancelPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-6 bg-transparent">
      {/* Dark Theme Card Container */}
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center shadow-2xl shadow-red-500/10">
        {/* Cancel Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Payment Canceled
        </h1>
        <p className="text-neutral-400 mb-8">
          It looks like you cancelled the payment process. No charges were made
          to your account.
        </p>

        {/* Message Box */}
        <div className="bg-neutral-800/50 rounded-2xl p-6 mb-8 text-left border border-neutral-700/50">
          <p className="text-sm text-neutral-300 leading-relaxed">
            If this was a mistake or you encountered an issue with the payment
            gateway, you can try again anytime.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* try again */}
          <Link
            href="/pricing"
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Link>

          <Link
            href="/"
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-neutral-600 mt-8 font-mono uppercase tracking-widest">
          Digital Life Lessons • Transaction Aborted
        </p>
      </div>
    </main>
  );
}
