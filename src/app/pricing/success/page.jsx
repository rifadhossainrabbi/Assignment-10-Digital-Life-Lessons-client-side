import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react'; // Assuming you use lucide-react icons

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams;

  // 1. Validate if session_id exists
  if (!session_id) {
    throw new Error('Please provide a valid session_id (`cs_test_...`)');
  }

  // 2. Retrieve session data from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent'],
  });

  const { status, customer_details } = session;
  const customerEmail = customer_details?.email;

  // 3. If payment is still pending/open, redirect away
  if (status === 'open') {
    return redirect('/');
  }

  // 4. Render Success UI if payment is complete
  if (status === 'complete') {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6 bg-transparent">
        {/* Dark Theme Card Container */}
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center shadow-2xl shadow-emerald-500/10">
          {/* Success Icon Animation/Graphic */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-neutral-400 mb-8">
            Thank you for your purchase. Your order has been processed.
          </p>

          {/* Details Box */}
          <div className="bg-neutral-800/50 rounded-2xl p-6 mb-8 text-left border border-neutral-700/50">
            <div className="flex items-start gap-3 mb-4">
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

            <p className="text-sm text-neutral-400">
              Transaction ID:{' '}
              <span className="text-neutral-500 font-mono text-xs">
                {session_id.slice(0, 20)}...
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-sm text-neutral-500 mt-4">
              Need help? Contact us at{' '}
              <a
                href="mailto:support@yourdomain.com"
                className="text-emerald-400 hover:underline"
              >
                support@yourdomain.com
              </a>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return null;
}
