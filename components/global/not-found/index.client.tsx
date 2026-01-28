'use client';

import { ArrowLeft, Home, LayoutDashboard, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { configurations } from '@/config';

export type NotFoundContext = 'admin' | 'user' | 'generic';

export function resolveNotFoundContext(pathname: string): NotFoundContext {
	if (pathname.startsWith(configurations.urls.Admin.Dashboard)) return 'admin';
	if (pathname.startsWith(configurations.urls.User.Dashboard)) return 'user';
	return 'generic';
}

export function NotFoundClient() {
	const pathname = usePathname();
	const context = resolveNotFoundContext(pathname);

	const variants = {
		generic: {
			title: 'Page not found',
			description: 'The page you’re looking for doesn’t exist or has been moved.',
			href: configurations.urls.Home,
			action: 'Back to Home',
			icon: Home,
			wrapper: 'bg-[#fefefe]',
			card: 'bg-white border-gray-200 text-black',
			accent: 'from-gray-900 to-amber-700',
		},
		admin: {
			title: 'Admin page unavailable',
			description: 'This admin route doesn’t exist or you don’t have access to it.',
			href: configurations.urls.Admin.Dashboard,
			action: 'Back to Admin Overview',
			icon: ShieldAlert,
			wrapper: 'bg-gray-950',
			card: 'bg-gray-900 border-gray-800 text-white',
			accent: 'from-gray-900 to-amber-600',
		},
		user: {
			title: 'Page not found',
			description: 'Looks like you took a wrong turn. Let’s get you back.',
			href: configurations.urls.User.Dashboard,
			action: 'Back to Dashboard',
			icon: LayoutDashboard,
			wrapper: 'bg-gray-50',
			card: 'bg-white border-gray-200 text-black',
			accent: 'from-amber-500 to-amber-700',
		},
	};

	const v = variants[context];
	const Icon = v.icon;

	return (
		<main className={`min-h-screen flex items-center justify-center p-6 ${v.wrapper}`}>
			<section className={`w-full max-w-md rounded-2xl border shadow-xl p-8 transition-all ${v.card}`}>
				{/* Icon */}
				<div className="flex justify-center mb-6">
					<div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r ${v.accent}`}>
						<Icon className="w-8 h-8 text-white" />
					</div>
				</div>

				{/* Content */}
				<div className="text-center space-y-3">
					<h1 className="text-2xl font-bold tracking-tight">{v.title}</h1>
					<p className={`text-sm ${context === 'admin' ? 'text-gray-400' : 'text-gray-600'}`}>{v.description}</p>
				</div>

				{/* Action */}
				<Link
					href={v.href}
					className={`mt-8 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${
						context === 'admin' ? 'bg-amber-600 hover:bg-amber-500 text-gray-900' : 'bg-gray-900 hover:bg-gray-800 text-white'
					}`}>
					<ArrowLeft className="w-4 h-4" />
					{v.action}
				</Link>
			</section>
		</main>
	);
}
