'use client';

import { Menu } from 'lucide-react';

interface ClientHeaderProps {}

export function ClientHeader({}: ClientHeaderProps) {
	const onMenuClick = () => {};
	return (
		<button
			onClick={onMenuClick}
			className="md:hidden absolute left-4 top-4 p-2 rounded-md hover:bg-gray-100 transition z-50"
			aria-label="Toggle menu">
			<Menu className="w-5 h-5 text-gray-600" />
		</button>
	);
}
