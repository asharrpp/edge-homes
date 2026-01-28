'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
	label?: string;
	variant?: 'classic-back-arrow' | 'sleek';
}

export function BackButton({ label = 'Go Back', variant }: BackButtonProps) {
	const router = useRouter();
	const classVariant = {
		'sleek': 'mt-6 inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-3 rounded-lg transition cursor-pointer',
		'classic-back-arrow': 'inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium cursor-pointer',
	};

	return (
		<button
			onClick={() => router.back()}
			className={variant ? classVariant[variant] : classVariant['classic-back-arrow']}>
			<ArrowLeft className="size-4" />
			{label}
		</button>
	);
}
