import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginPage = req.nextUrl.pathname === '/admin/login';
  
  // Allow access to login page
  if (isAdminLoginPage) {
    return NextResponse.next();
  }

  // Protect admin pages
  if (isAdminPage) {
    // The Firebase Auth state will handle protection client-side
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
