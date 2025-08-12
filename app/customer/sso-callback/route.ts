import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the current user
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.redirect('/customer/sign-in');
    }

    return NextResponse.redirect('/customer/dashboard');
  } catch (error) {
    console.error('SSO callback error:', error);
    return NextResponse.redirect('/customer/sign-in?error=authentication_failed');
  }
}