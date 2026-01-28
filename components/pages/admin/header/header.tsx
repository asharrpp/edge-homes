import { Bell, HelpCircle, Search } from 'lucide-react';
import Link from 'next/link';

import { configurations } from '@/config';
import { UserType } from '@/lib/types';

import { ClientHeader } from './client-header';

interface AdminHeaderProps {
	profile: Omit<UserType, 'password'>;
}

export function AdminHeader({ profile }: AdminHeaderProps) {
	// Fetch user data from your API or session
	const userData = {
		name: profile.name || 'Admin User',
		email: profile.email || 'admin@edgehomes.com',
		initials: profile.avatar || 'A',
		role: 'Administrator',
	};

	return (
		<header className="bg-white border-b border-gray-200">
			<div className="px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Left Section */}
					<div className="flex items-center space-x-4">
						<div>
							{/* <h1 className="text-2xl font-bold text-gray-900">title</h1> */}
							<p className="text-sm text-gray-500">Welcome back, {userData.name}</p>
						</div>
					</div>

					{/* Right Section */}
					<div className="flex items-center space-x-4">
						{/* Search */}
						{/* <div className="hidden md:block relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="Search..."
								className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none w-64"
							/>
						</div> */}

						{/* Help */}
						<Link
							href={configurations.urls.Admin.Dashboard}
							className="p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
							aria-label="Help">
							<HelpCircle className="w-5 h-5 text-gray-600" />
						</Link>

						{/* Notifications */}
						<Link
							href={configurations.urls.Admin.notifications}
							className="relative">
							<div
								className="p-2 rounded-md hover:bg-gray-100 transition relative cursor-pointer"
								aria-label="Notifications">
								<Bell className="w-5 h-5 text-gray-600" />
								<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
							</div>
						</Link>

						{/* User Profile */}
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
								<span className="font-bold text-white">{userData.initials}</span>
							</div>
							<div className="hidden md:block">
								<p className="font-medium text-gray-900">{userData.name}</p>
								<p className="text-sm text-gray-500">{userData.role}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<ClientHeader />
		</header>
	);
}
