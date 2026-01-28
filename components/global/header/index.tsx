import Link from 'next/link';

import { configurations } from '@/config';

export function Header() {
	return (
		<nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-20">
					<div className="flex items-center">
						{/* Logo */}
						<div className="text-2xl font-bold tracking-tighter text-gray-900">
							EDGE<span className="text-amber-600">HOMES</span>.
						</div>
					</div>
					<div className="hidden md:flex space-x-8">
						<Link
							href="#"
							className="text-gray-900 hover:text-amber-600 font-medium">
							Home
						</Link>
						<Link
							href="#listings"
							className="text-gray-500 hover:text-amber-600 font-medium">
							Properties
						</Link>
						<Link
							href="#contact"
							className="text-gray-500 hover:text-amber-600 font-medium">
							Contact
						</Link>
					</div>
					<Link
						href={configurations.urls.User.SignIn}
						className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-amber-600 transition duration-300">
						List Your Property
					</Link>
				</div>
			</div>
		</nav>
	);
}
