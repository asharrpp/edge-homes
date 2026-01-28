'use client';

import { Building, Building2, Calendar, ChevronLeft, ChevronRight, CreditCard, Crown, Heart, Home, LogOut, MessageSquare, Search, Settings, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { configurations } from '@/config';
import { logOut } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { UserType } from '@/lib/types';

import { NavItem } from '../../admin/nav-items';

interface UserSidebarProps {
	profile: Omit<UserType, 'password'>;
}

export function UserSidebar({ profile }: UserSidebarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);

	// Routes where sidebar should be hidden (login, signup, etc.)
	const excludeSidebar = [configurations.urls.User.SignIn, configurations.urls.User.SignUp];

	const shouldHideSidebar = excludeSidebar.some((route) => pathname === route || pathname.startsWith(route + '/'));

	if (shouldHideSidebar) {
		return null;
	}

	const navigationItems = [
		{
			name: 'Dashboard',
			href: configurations.urls.User.Dashboard,
			icon: Home,
			exact: true,
			badge: 0,
		},
		{
			name: 'Find Properties',
			href: configurations.urls.User.Properties,
			icon: Search,
			description: 'Browse & book',
		},
		{
			name: 'My Properties',
			href: configurations.urls.User.MyProperties,
			icon: Building2,
			description: 'Manage your properties',
		},
		{
			name: 'My Bookings',
			href: configurations.urls.User.Bookings,
			icon: Calendar,
			subRoutes: ['/user/bookings/upcoming', '/user/bookings/past', '/user/bookings/manage'],
		},
		{
			name: 'Subscription plan',
			href: configurations.urls.User.Subscription,
			icon: Crown,
		},
		{
			name: 'Payments',
			href: configurations.urls.User.Payment,
			icon: CreditCard,
		},
		{
			name: 'Settings',
			href: configurations.urls.User.Settings,
			icon: Settings,
		},
	];

	const handleLogout = async () => {
		try {
			await logOut(USER_COOKIE_NAME);
			toast.success('Logged out successfully');
			router.push(configurations.urls.User.SignIn);
		} catch (error) {
			toast.error('Failed to logout');
		}
	};

	return (
		<aside className={`h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
			{/* Logo Section */}
			<div className={`${collapsed ? 'p-6 pl-4' : 'p-6'} border-b border-gray-800 flex-shrink-0`}>
				<div className="flex items-center justify-between">
					{!collapsed && (
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
								<Building className="w-5 h-5 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-bold tracking-tight">
									EDGE<span className="text-amber-400">HOMES</span>
								</h1>
								<p className="text-xs text-gray-400">Guest Portal</p>
							</div>
						</div>
					)}
					{collapsed && (
						<div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mx-auto">
							<Building className="w-5 h-5 text-white" />
						</div>
					)}
					<button
						onClick={() => setCollapsed(!collapsed)}
						className="p-1.5 rounded-md hover:bg-gray-800 transition"
						aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
						{collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
					</button>
				</div>
			</div>

			{/* Navigation Container - Scrollable */}
			<div className="flex-1 overflow-y-auto py-4">
				<nav className="px-4 space-y-1">
					{navigationItems.map((item) => (
						<NavItem
							collapsed={collapsed}
							item={item}
							key={item.href}
						/>
					))}
				</nav>
			</div>

			{/* User Profile & Logout - Fixed at bottom */}
			<div className="border-t border-gray-800 flex-shrink-0">
				<div className="p-4">
					<div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
						{!collapsed && (
							<>
								<div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
									<span className="font-bold">{profile.avatar}</span>
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate text-white">{profile.name}</p>
									<p className="text-sm text-gray-300 truncate">{profile.email}</p>
									{/* {profile.memberSince && (
                    <p className="text-xs text-gray-400 mt-1">
                      Member since {new Date(profile.memberSince).getFullYear()}
                    </p>
                  )} */}
								</div>
							</>
						)}
						{collapsed && (
							<div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
								<span className="font-bold">{profile.avatar}</span>
							</div>
						)}
					</div>

					<button
						onClick={handleLogout}
						className={`mt-4 flex items-center space-x-3 w-full px-4 py-3 rounded-lg hover:bg-gray-800 transition cursor-pointer ${collapsed ? 'justify-center' : ''}`}
						title={collapsed ? 'Logout' : undefined}>
						<LogOut className="w-5 h-5 text-gray-300" />
						{!collapsed && <span className="font-medium text-gray-300">Logout</span>}
					</button>
				</div>
			</div>
		</aside>
	);
}
