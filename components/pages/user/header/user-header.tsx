import { Bell, Calendar, ChevronRight, HelpCircle, MessageSquare, Settings, User } from 'lucide-react';
import Link from 'next/link';

import { configurations } from '@/config';
import { UserType } from '@/lib/types';

import { UserLogOut } from './log-out.client';

// User Header Component
interface UserHeaderProps {
	profile: Omit<UserType, 'password'>;
}

export function UserHeader({ profile }: UserHeaderProps) {
	const userData = {
		name: profile.name || 'Guest User',
		email: profile.email || 'guest@edgehomes.com',
		initials: profile.avatar || 'GU',
		memberSince: new Date().toISOString(),
	};

	return (
		<header className="bg-white border-b border-gray-200">
			<div className="px-4 md:px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Left Section - Mobile Menu & Welcome */}
					<div className="flex items-center space-x-4">
						{/* Mobile Menu Button (hidden on desktop) */}
						<button className="md:hidden p-2 rounded-md hover:bg-gray-100">
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>

						<div>
							<h1 className="text-lg md:text-xl font-bold text-gray-900">Welcome, {userData.name}</h1>
							<p className="text-sm text-gray-500 hidden md:block">{userData.email}</p>
						</div>
					</div>

					{/* Right Section */}
					<div className="flex items-center space-x-3 md:space-x-4">
						{/* Quick Actions */}
						<div className="flex items-center space-x-2">
							{/* Help */}
							{/* <Link
								href={configurations.urls.User.Reviews}
								className="p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
								aria-label="Help">
								<HelpCircle className="w-5 h-5 text-gray-600" />
							</Link> */}

							{/* Messages */}
							{/* <Link
								href={configurations.urls.User.Messages}
								className="relative p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
								aria-label="Messages">
								<MessageSquare className="w-5 h-5 text-gray-600" />
								<span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
							</Link> */}

							{/* Notifications */}
							{/* <Link
								href={configurations.urls.User.Settings}
								className="relative p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
								aria-label="Notifications">
								<Bell className="w-5 h-5 text-gray-600" />
								<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
							</Link> */}

							{/* User Profile Dropdown Trigger */}
							<div className="relative group">
								<button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
									<div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center">
										<span className="font-bold text-white text-sm md:text-base">{userData.initials}</span>
									</div>
									<div className="hidden md:block text-left">
										<p className="font-medium text-gray-900 text-sm">{userData.name}</p>
										<p className="text-xs text-gray-500">My Account</p>
									</div>
									<ChevronRight className="w-4 h-4 text-gray-500 hidden md:block" />
								</button>

								{/* Dropdown Menu */}
								<div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden group-hover:block">
									<Link
										href={configurations.urls.User.Payment}
										className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50">
										<User className="w-4 h-4" />
										<span>Profile</span>
									</Link>
									<Link
										href={configurations.urls.User.Bookings}
										className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50">
										<Calendar className="w-4 h-4" />
										<span>My Bookings</span>
									</Link>
									<Link
										href={configurations.urls.User.Settings}
										className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50">
										<Settings className="w-4 h-4" />
										<span>Settings</span>
									</Link>
									<div className="border-t border-gray-200 my-2"></div>
									<UserLogOut />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
