import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react';
import { api } from '@/lib/reusableApi';
import { getUserToken } from '@/lib/core/session';

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams;

  const token = await getUserToken();

  if (!session_id) {
    throw new Error('Please provide a valid session_id');
  }

  // Stripe theke session data
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent'],
  });

  const { status, customer_details } = session;
  const customerEmail = customer_details?.email;
  console.log('customerEmail', customerEmail);

  if (status === 'open') {
    return redirect('/');
  }

  if (status === 'complete') {
    //plan upadate api
    try {
      await api.patch(
        '/users/plan-update',
        { email: customerEmail },
        { Authorization: `Bearer ${token}` },
      );
    } catch (err) {
      console.error('API Plan Update Error:', err.message);
    }

    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6 bg-transparent">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center shadow-2xl shadow-emerald-500/10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-emerald-400 font-bold mb-4">
            ⭐ Account Upgraded to Premium
          </p>
          <p className="text-neutral-400 mb-8">
            Thank you for your purchase. Your order has been processed.
          </p>

          <div className="bg-neutral-800/50 rounded-2xl p-6 mb-8 text-left border border-neutral-700/50">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-400 mt-1" />
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Confirmation Sent To
                </p>
                <p className="text-white font-medium break-all">
                  {customerEmail}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/user/add-lesson"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Start Creating Lessons
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
