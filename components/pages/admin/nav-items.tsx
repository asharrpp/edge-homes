'use client';

import Link from 'next/link';

import { useNavigation } from '@/hooks/useNavigation';

interface NavItemProps {
	item: {
		name: string;
		href: string;
		icon: React.ElementType;
		badge?: number;
		exact?: boolean;
		subRoutes?: string[];
	};
	collapsed: boolean;
}

export function NavItem({ item, collapsed }: NavItemProps) {
	const { isActive } = useNavigation();
	const active = isActive(item);
	const Icon = item.icon;

	return (
		<Link
			key={item.name}
			href={item.href}
			className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
				active ? 'bg-amber-600 text-white' : 'hover:bg-gray-800 text-gray-300 hover:text-white'
			}`}>
			<Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
			{!collapsed && <span className="font-medium">{item.name}</span>}
		</Link>
	);
}
