import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from './lib/auth';

export async function proxy(request) {
  console.log('Message from Proxy');

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pricing/:path*',
    '/public-lesson/:path*',
    '/dashboard/user/:path*',
    '/dashboard/admin/:path*',
  ],
};
