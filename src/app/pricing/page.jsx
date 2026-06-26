'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, Crown, Star } from 'lucide-react';
import { authClient } from '@/lib/auth-client'; // Real Auth Client

export default function PricingPage() {
  // Requirement: Use real session data from Better Auth
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Logical check to see if the user is already on the premium plan
  const isPremiumUser = user?.plan === 'premium';

  // Loading state while verifying user session
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center font-mono text-indigo-500 uppercase tracking-widest">
        Verifying Archives...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-indigo-500/30 pb-20">
      {/* --- HERO SECTION --- */}
      <div className="pt-24 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-indigo-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-3">
            Upgrade Matrix
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Investment in your growth, <br />
            <span className="text-indigo-500 italic">simplified.</span>
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Preserve your personal wisdom and gain access to the community's
            deepest insights. Choose the plan that fits your learning journey.
          </p>
        </motion.div>
      </div>

      {/* --- PRICING CARDS --- */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {/* Free Plan Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-[#18181B] border border-zinc-800 rounded-2xl p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">৳০</span>
                  <span className="text-zinc-500 text-sm">/ forever</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded tracking-widest">
                DEFAULT
              </span>
            </div>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Start documenting your life lessons and browse public community
              wisdom.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-zinc-600" /> Create up to 5
                lessons
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-zinc-600" /> Access to all Free
                public lessons
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-zinc-600" /> Personal Dashboard
                access
              </li>
            </ul>
          </div>
          <button
            disabled
            className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-500 text-xs font-semibold tracking-widest uppercase"
          >
            {isPremiumUser ? 'Plan Subscribed' : 'Active by Default'}
          </button>
        </motion.div>

        {/* Premium Plan Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-[#18181B] border-2 border-indigo-500/50 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_40px_-15px_rgba(99,102,241,0.3)] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Best Value
          </div>
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  Premium{' '}
                  <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">৳১৫০০</span>
                  <span className="text-zinc-500 text-sm">/ Lifetime</span>
                </div>
              </div>
              <Crown className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Unlock the full power of personal growth with unlimited storage
              and premium access.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-sm text-zinc-100">
                <Check className="w-4 h-4 text-indigo-500" /> Unlimited lesson
                creation
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-100">
                <Check className="w-4 h-4 text-indigo-500" /> Create Premium
                locked content
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-100">
                <Check className="w-4 h-4 text-indigo-500" /> View all Premium
                community lessons
              </li>
              <li className="flex items-center gap-3 text-sm text-zinc-100">
                <Check className="w-4 h-4 text-indigo-500" /> Golden Verified
                Badge
              </li>
            </ul>
          </div>

          {/* Requirement: Keep the original Form action system for Stripe */}
          <form action="/api/checkout_sessions" method="POST">
            <button
              type="submit"
              disabled={isPremiumUser}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold tracking-widest uppercase hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPremiumUser ? 'Already Premium ⭐' : 'Upgrade'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* --- COMPARISON TABLE --- */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Compare Features</h2>
          <p className="text-zinc-500 text-sm italic">
            Detailed breakdown of platform capabilities.
          </p>
        </div>

        <div className="bg-[#18181B] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="p-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Capabilities
                </th>
                <th className="p-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center">
                  Free Plan
                </th>
                <th className="p-5 text-xs font-semibold text-indigo-400 uppercase tracking-wider text-center">
                  Premium ⭐
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                {
                  f: 'Total Lessons to Create',
                  free: 'Up to 5',
                  prem: 'Unlimited',
                },
                { f: 'Premium Lesson Creation', free: false, prem: true },
                { f: 'Ad-Free Experience', free: false, prem: true },
                { f: 'Priority Public Listing', free: false, prem: true },
                { f: 'View Premium Content', free: false, prem: true },
                { f: 'Community Golden Badge', free: false, prem: true },
                { f: 'Advanced PDF Export', free: false, prem: true },
                {
                  f: 'Weekly Reflection Analytics',
                  free: 'Basic',
                  prem: 'Advanced',
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                >
                  <td className="p-5 text-zinc-300 font-medium">{row.f}</td>
                  <td className="p-5 text-center text-zinc-500">
                    {typeof row.free === 'string' ? (
                      row.free
                    ) : (
                      <Minus className="mx-auto w-4 h-4 opacity-30" />
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {row.prem === true ? (
                      <Check className="mx-auto w-5 h-5 text-indigo-500" />
                    ) : (
                      <span className="text-indigo-400 font-semibold">
                        {row.prem}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-800 pt-16">
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold mb-4">Pricing FAQ</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Quick answers about the lifetime membership and Stripe billing.
            </p>
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#18181B] border border-zinc-800 p-6 rounded-xl">
              <h4 className="font-semibold mb-2 text-sm text-zinc-200">
                Is the ৳১৫০০ price a monthly subscription?
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                No. This is a <strong>one-time lifetime payment</strong>. You
                pay once and keep all premium benefits forever.
              </p>
            </div>
            <div className="bg-[#18181B] border border-zinc-800 p-6 rounded-xl">
              <h4 className="font-semibold mb-2 text-sm text-zinc-200">
                How do I access premium lessons?
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Once upgraded, any lesson marked as "Premium Access" will
                automatically unlock for you in the feed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
