import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const pb = new PocketBase('https://db.pangohub.fjelldata.com');

  const authCookie = request.cookies.get('pb_auth');
  if (authCookie) {
    pb.authStore.loadFromCookie(`pb_auth=${authCookie.value}`);
  }

  try {
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
      
      const cookieString = pb.authStore.exportToCookie({ httpOnly: false });
      const match = cookieString.match(/pb_auth=([^;]+)/);
      
      if (match) {
        response.cookies.set('pb_auth', match[1], {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: false
        });
      }
    }
  } catch (err) {
    pb.authStore.clear();
    response.cookies.delete('pb_auth');
  }

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

  if (isDashboard && !pb.authStore.isValid) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && pb.authStore.isValid) {
    const isSignupWithToken = request.nextUrl.pathname === '/auth/signup' && request.nextUrl.searchParams.has('token');
    
    if (!isSignupWithToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
