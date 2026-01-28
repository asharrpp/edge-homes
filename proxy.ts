import * as jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

import { configurations } from './config';
import { ADMIN_COOKIE_NAME, USER_COOKIE_NAME } from './lib/constants';

import type { NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
	const currentUrl = request.nextUrl.pathname + request.nextUrl.search;
	const encodedRedirect = encodeURIComponent(currentUrl);

	const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
	const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

	// List of routes that should be publicly accessible
	const publicRoutes = [configurations.urls.Admin.SignIn, configurations.urls.User.SignIn, configurations.urls.Public.VerifyBookingPayment];

	// Check if current route is a public route
	const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/'));

	// If it's a public route, skip authentication
	if (isPublicRoute) {
		return NextResponse.next();
	}

	// Also check if user is already on sign-in page (prevents redirect loops)
	if (request.nextUrl.pathname.includes('sign')) {
		return NextResponse.next();
	}

	let cookieName = '';
	if (isAdminRoute) {
		cookieName = ADMIN_COOKIE_NAME;
	} else {
		cookieName = USER_COOKIE_NAME;
	}

	const token = request.cookies.get(cookieName);

	// If no token at all, redirect to appropriate sign-in page
	if (!token) {
		if (isAdminRoute) {
			return NextResponse.redirect(new URL(`${configurations.urls.Admin.SignIn}?redirect=${encodedRedirect}`, request.url));
		} else if (isDashboardRoute) {
			return NextResponse.redirect(new URL(`${configurations.urls.User.SignIn}?redirect=${encodedRedirect}`, request.url));
		}
		return NextResponse.next(); // Allow non-protected routes
	}

	// If token exists, validate it
	if (token) {
		try {
			const decoded = jwt.decode(token.value) as { exp?: number; role?: string; isAdmin?: boolean };

			// Check if token is expired
			if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
				// Additional role-based checks
				if (isAdminRoute) {
					// For admin routes, check if user is admin
					if (!decoded.isAdmin) {
						// User is not admin, redirect to dashboard or home
						return NextResponse.redirect(new URL(configurations.urls.Home, request.url));
					}

					// Admin user can proceed
					return NextResponse.next();
				}

				// For dashboard routes (non-admin), any valid token is fine
				if (isDashboardRoute) {
					return NextResponse.next();
				}

				// For other routes, allow access
				return NextResponse.next();
			}
		} catch (error) {
			void error;
		}
	}

	// Token is invalid/expired, redirect to appropriate sign-in
	if (isAdminRoute) {
		return NextResponse.redirect(new URL(`${configurations.urls.Admin.SignIn}?redirect=${encodedRedirect}`, request.url));
	} else if (isDashboardRoute) {
		return NextResponse.redirect(new URL(`${configurations.urls.User.SignIn}?redirect=${encodedRedirect}`, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*', '/dashboard/:path*'],
};
