'use server';

import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { configurations } from '@/config';

import { jwtToken } from './types';

export const createCookie = async (payload: { name: string; value: string }) => {
	const decoded = jwt.decode(payload.value) as { exp?: number };

	if (!decoded?.exp) {
		throw new Error('Invalid token: Missing expiration');
	}

	const expiresAt = new Date(decoded.exp * 1000);
	const Cookies = await cookies();

	Cookies.set(payload.name, payload.value, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: expiresAt,
		secure: process.env.NODE_ENV === 'production',
	});
};

export const deleteCookie = async (name: string) => {
	const Cookies = await cookies();

	Cookies.delete(name);
};

export const logOut = async (activeTokenName: string) => {
	const Cookies = await cookies();

	Cookies.delete(activeTokenName);
	// redirect(configurations.urls.Home);
};

export const hasCookie = async (name: string) => {
	const Cookies = await cookies();

	return Cookies.has(name);
};

export const getCookie = async (name: string) => {
	const Cookies = await cookies();

	return Cookies.get(name);
};

export const getSession = async (name: string) => {
	try {
		const token = await getCookie(name);
		if (token) {
			const decoded = jwt.decode(token.value) as jwtToken | null;
			if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
				return decoded;
			}
		}
		return null;
	} catch (error) {
		if (error instanceof Error) {
			return null;
		}
		return null;
	}
};
