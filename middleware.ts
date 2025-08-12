import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/customer/sign-in(.*)',
  '/customer/sign-up(.*)',
  '/customer/sso-callback(.*)',
  '/api(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Get the auth state
  const authState = await auth();
  
  if (!isPublicRoute(req)) {
    // Check if user is authenticated
    if (!authState.userId) {
      // Redirect to sign-in page
      const signInUrl = new URL('/customer/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    '/((?!.+\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
};