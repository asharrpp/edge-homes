'use client';

import { usePathname } from 'next/navigation';

interface NavItem {
	href: string;
	exact?: boolean;
	subRoutes?: string[];
}

export function useNavigation() {
	const pathname = usePathname();

	const isActive = (item: NavItem): boolean => {
		const { href, exact = false, subRoutes = [] } = item;

		// Check exact match
		if (exact) {
			return pathname === href;
		}

		// Check main route match
		if (pathname === href || pathname.startsWith(href + '/')) {
			return true;
		}

		// Check sub-routes
		if (subRoutes.some((subRoute) => pathname === subRoute || pathname.startsWith(subRoute + '/'))) {
			return true;
		}

		return false;
	};

	return { isActive, pathname };
}
