import { ReactNode } from 'react';

import { UserType } from '@/lib/types';

import { AdminHeader } from '../pages/admin/header/header';
import { AdminSidebar } from '../pages/admin/side-bar';

interface AdminRootLayoutProps {
	children: ReactNode;
	profile: Omit<UserType, 'password'>;
}

export function AdminRootLayout({ children, profile }: AdminRootLayoutProps) {
	return (
		<section className="min-h-screen bg-gray-50">
			<section className="flex h-screen">
				<aside className="hidden md:block relative">
					<AdminSidebar profile={profile} />
				</aside>

				{/* Main Content */}
				<section className="flex-1 flex flex-col overflow-hidden relative">
					<AdminHeader profile={profile} />
					<main className="flex-1 overflow-y-auto p-6">
						<div className="max-w-7xl mx-auto">{children}</div>
					</main>
				</section>
			</section>
		</section>
	);
}
