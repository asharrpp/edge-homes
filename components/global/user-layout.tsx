import { ReactNode } from 'react';

import { UserType } from '@/lib/types';

import { UserHeader } from '../pages/user/header/user-header';
import { UserSidebar } from '../pages/user/sidebar/user-sidebar';

interface UserRootLayoutProps {
	children: ReactNode;
	profile: Omit<UserType, 'password'>;
}

export function UserRootLayout({ children, profile }: UserRootLayoutProps) {
	return (
		<section className="min-h-screen bg-gray-50">
			<section className="flex h-screen">
				<aside className="hidden md:block relative">
					<UserSidebar profile={profile} />
				</aside>

				{/* Main Content */}
				<section className="flex-1 flex flex-col overflow-hidden relative">
					<UserHeader profile={profile} />
					<main className="flex-1 overflow-y-auto p-4 md:p-6">
						<div className="max-w-7xl mx-auto">{children}</div>
					</main>
				</section>
			</section>
		</section>
	);
}
