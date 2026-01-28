'use client';

import { BarChart3, Bell, Building, Calendar, ChevronLeft, ChevronRight, DollarSign, Home, LogOut, Settings, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { configurations } from '@/config';
import { logOut } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { UserType } from '@/lib/types';

import { NavItem } from './nav-items';

interface SidebarItem {
	name: string;
	href: string;
	icon: React.ElementType;
	subRoutes?: string[];
	exact?: boolean;
}

interface SidebarProps {
	profile: Omit<UserType, 'password'>;
}

export function AdminSidebar({ profile }: SidebarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const excludeSidebar = [
		configurations.urls.Admin.SignIn,
		// Add more routes as needed
	];

	// Check if current path should hide sidebar
	const shouldHideSidebar = excludeSidebar.some((route) => pathname === route || pathname.startsWith(route + '/'));

	if (shouldHideSidebar) {
		return null;
	}

	const navigationItems: SidebarItem[] = [
		{ name: 'Overview', href: configurations.urls.Admin.Dashboard, icon: Home, exact: true },
		{
			name: 'Properties',
			href: configurations.urls.Admin.properties,
			icon: Building,
			subRoutes: ['/admin/properties/add', '/admin/properties/edit', '/admin/properties/view'],
		},
		{
			name: 'Bookings',
			href: configurations.urls.Admin.bookings.booking,
			icon: Calendar,
			subRoutes: ['/admin/bookings/view', '/admin/bookings/manage'],
		},
		{
			name: 'Notifications',
			href: configurations.urls.Admin.notifications,
			icon: Bell,
		},
		{
			name: 'Settings',
			href: '/admin/settings',
			icon: Settings,
			subRoutes: ['/admin/settings/profile', '/admin/settings/security', '/admin/settings/preferences'],
		},
	];

	const handleLogout = async () => {
		try {
			await logOut(ADMIN_COOKIE_NAME);
			toast.success('Logged out successfully');
			router.push(configurations.urls.Admin.SignIn);
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
									EDGE<span className="text-amber-500">HOMES</span>
								</h1>
								<p className="text-xs text-gray-400">Admin Panel</p>
							</div>
						</div>
					)}
					{collapsed && (
						<div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mx-auto">
							<Building className="w-7 h-5 text-white" />
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
							key={item.name}
							item={item}
							collapsed={collapsed}
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
									{profile.isAdmin && <span className="inline-block mt-1 text-xs bg-amber-900 text-amber-100 px-2 py-0.5 rounded-full">Admin</span>}
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
