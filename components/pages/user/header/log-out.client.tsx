'use client';

import { LogOut } from 'lucide-react';
import router from 'next/router';
import { toast } from 'sonner';

import { configurations } from '@/config';
import { logOut } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';

export function UserLogOut() {
	const handleLogout = async () => {
		try {
			await logOut(USER_COOKIE_NAME);
			toast.success('Logged out successfully');
			router.push(configurations.urls.Admin.SignIn);
		} catch (error) {
			toast.error('Failed to logout');
		}
	};

	return (
		<button
			onClick={handleLogout}
			className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left">
			<LogOut className="w-4 h-4" />
			<span>Logout</span>
		</button>
	);
}
