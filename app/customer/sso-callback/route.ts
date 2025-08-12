import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      const signInUrl = new URL('/customer/sign-in', request.url);
      return NextResponse.redirect(signInUrl);
    }

    const dashboardUrl = new URL('/customer/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    console.error('SSO callback error:', error);
    const signInUrl = new URL('/customer/sign-in', request.url);
    signInUrl.searchParams.set('error', 'authentication_failed');
    return NextResponse.redirect(signInUrl);
  }
}