'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiZap, FiAward, FiLock } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { useSession } from '@/lib/auth-client'; // আপনার Better-Auth ক্লায়েন্ট পাথ

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const user = session?.user;
  const isPremiumUser = user?.isPremium === true;

  // Stripe Checkout Session Handle Function
  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please log in to initiate the upgrade sequence.');
      return;
    }

    setIsRedirecting(true);
    const checkoutToast = toast.loading('Connecting secure Stripe gateway...');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/create-checkout-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id || user.uid,
            email: user.email,
          }),
        },
      );

      const data = await response.json();

      if (data.url) {
        // Stripe Checkout পেইজে রিডাইরেক্ট
        window.location.href = data.url;
      } else {
        throw new Error(data.message || 'Stripe initialization failed.');
      }
    } catch (error) {
      console.error('Stripe Error:', error);
      toast.error(error.message || 'Payment gateway connection refused.', {
        id: checkoutToast,
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0D0A] flex items-center justify-center font-mono text-[#E5A93C]">
        Loading tier matrices...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0D0A] text-[#E6DFD3] p-6 md:p-12 font-sans antialiased selection:bg-[#E5A93C] selection:text-black">
      <Toaster
        toastOptions={{
          style: {
            background: '#14110C',
            color: '#E6DFD3',
            border: '1px solid #231E15',
            borderRadius: '0px',
          },
        }}
      />

      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto mb-16 text-center">
        <p className="text-[10px] font-mono text-[#E5A93C]/60 uppercase tracking-[0.3em] mb-2">
          Membership Matrices
        </p>
        <h1 className="text-4xl font-serif text-[#E6DFD3] tracking-wide mb-4">
          Elevate Your Consciousness
        </h1>
        <p className="text-xs text-[#9C9485] max-w-md mx-auto leading-relaxed">
          Unlock unlimited wisdom storage and stream premium life formulas
          shared by vetted tier thinkers.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT CARD: PLAN OPTIONS & CHECKOUT BANNER (4-Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#14110C] border border-[#231E15] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
            {/* Background Accent Lines */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5A93C]/5 blur-3xl rounded-full pointer-events-none" />

            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A93C] bg-[#1C1812] border border-[#2E281D] px-2.5 py-1">
                    Lifetime Access
                  </span>
                  <h2 className="text-3xl font-serif text-[#E6DFD3] tracking-wide mt-4">
                    Premium ⭐
                  </h2>
                </div>
                {isPremiumUser && (
                  <div className="flex items-center gap-1.5 text-xs text-[#E5A93C] font-mono border border-[#E5A93C]/30 bg-[#E5A93C]/10 px-2.5 py-1 animate-pulse">
                    <FiAward className="w-3.5 h-3.5" /> Active Tier
                  </div>
                )}
              </div>

              <div className="my-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-serif tracking-tight text-[#E5A93C]">
                    ৳১৫০০
                  </span>
                  <span className="text-xs text-[#9C9485] font-mono">
                    / one-time payment
                  </span>
                </div>
                <p className="text-xs text-[#9C9485] mt-3 leading-relaxed">
                  No subscription models. No friction layers. Pay once, preserve
                  your wisdom archive permanently.
                </p>
              </div>
            </div>

            {/* CONDITIONAL ACTION BUTTON */}
            {isPremiumUser ? (
              <div className="border border-[#2E281D] bg-[#1C1812] p-4 text-center space-y-2">
                <p className="text-xs font-serif text-[#E5A93C] tracking-wide">
                  You hold the Master Key
                </p>
                <p className="text-[10px] font-mono text-[#9C9485]/60">
                  All premium entries unlocked inside the browse console.
                </p>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: isRedirecting ? 1 : 1.01 }}
                whileTap={{ scale: isRedirecting ? 1 : 0.99 }}
                onClick={handleUpgrade}
                disabled={isRedirecting}
                className="w-full bg-[#E5A93C] text-black font-semibold font-serif h-14 text-xs tracking-widest uppercase transition-all duration-300 hover:bg-[#d4982f] flex items-center justify-center gap-2"
              >
                <FiZap className="w-4 h-4 fill-current" />{' '}
                {isRedirecting ? 'REDIRECTING...' : 'CHOOSE PREMIUM PLAN'}
              </motion.button>
            )}
          </div>
        </div>

        {/* RIGHT CARD: THE COMPARISON TABLE (7-Cols) */}
        <div className="lg:col-span-7 bg-[#14110C] border border-[#231E15] p-6 md:p-8 shadow-2xl">
          <p className="text-xs text-[#9C9485] font-semibold uppercase tracking-wider mb-6">
            Capability Metrics
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#2E281D] text-[#9C9485]/70 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 pb-4 font-medium w-1/2">
                    Core Capability
                  </th>
                  <th className="py-3 pb-4 font-medium text-center">
                    Standard
                  </th>
                  <th className="py-3 pb-4 font-medium text-center text-[#E5A93C]">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1812]">
                {/* Row 1 */}
                <tr className="hover:bg-[#1C1812]/40 transition-colors">
                  <td className="py-3.5 text-[#E6DFD3] font-medium">
                    Create Public / Private Lessons
                  </td>
                  <td className="py-3.5 text-center text-[#9C9485]/60 font-mono">
                    Max 5 Entries
                  </td>
                  <td className="py-3.5 text-center text-[#E5A93C] font-mono font-bold">
                    Unlimited
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-[#1C1812]/40 transition-colors">
                  <td className="py-3.5 text-[#E6DFD3] font-medium">
                    Premium Lock Engine Access
                  </td>
                  <td className="py-3.5 flex justify-center py-3.5">
                    <FiX className="w-4 h-4 text-red-500/50" />
                  </td>
                  <td className="py-3.5 text-center text-emerald-500">
                    <FiCheck className="w-4 h-4 mx-auto" />
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-[#1C1812]/40 transition-colors">
                  <td className="py-3.5 text-[#E6DFD3] font-medium">
                    Ad-Free Aesthetic Experience
                  </td>
                  <td className="py-3.5 text-center text-[#9C9485]/60 font-mono">
                    With Ads
                  </td>
                  <td className="py-3.5 text-center text-[#E5A93C] font-mono">
                    Pure UI
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-[#1C1812]/40 transition-colors">
                  <td className="py-3.5 text-[#E6DFD3] font-medium">
                    Priority Archive Listing
                  </td>
                  <td className="py-3.5 flex justify-center py-3.5">
                    <FiX className="w-4 h-4 text-red-500/50" />
                  </td>
                  <td className="py-3.5 text-center text-emerald-500">
                    <FiCheck className="w-4 h-4 mx-auto" />
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-[#1C1812]/40 transition-colors">
                  <td className="py-3.5 text-[#E6DFD3] font-medium">
                    Access Locked Community Content
                  </td>
                  <td className="py-3.5 flex justify-center py-3.5">
                    <FiLock className="w-3.5 h-3.5 text-[#9C9485]/40" />
                  </td>
                  <td className="py-3.5 text-center text-emerald-500">
                    <FiCheck className="w-4 h-4 mx-auto" />
                  </td>
                </tr>

                {/* Row 6 */}
                <tr className="hover:bg-[#1C1812]/40 transition-colors">
                  <td className="py-3.5 text-[#E6DFD3] font-medium">
                    Verified Identity Golden Badge
                  </td>
                  <td className="py-3.5 flex justify-center py-3.5">
                    <FiX className="w-4 h-4 text-red-500/50" />
                  </td>
                  <td className="py-3.5 text-center text-emerald-500">
                    <FiCheck className="w-4 h-4 mx-auto" />
                  </td>
                </tr>

                {/* Row 7 */}
                <tr className="hover:bg-[#1C1812]/40 transition-colors">
                  <td className="py-3.5 text-[#E6DFD3] font-medium">
                    Advanced PDF Export Protocol
                  </td>
                  <td className="py-3.5 flex justify-center py-3.5">
                    <FiX className="w-4 h-4 text-red-500/50" />
                  </td>
                  <td className="py-3.5 text-center text-emerald-500">
                    <FiCheck className="w-4 h-4 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
