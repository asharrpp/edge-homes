'use client';

import { AlertTriangle, Loader2, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';

interface DeleteConfirmationModalProps {
	isAdmin?: true;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	propertyId: string;
	propertyTitle: string;
}

export function DeleteConfirmationModal({ isOpen, isAdmin, onClose, onSuccess, propertyId, propertyTitle }: DeleteConfirmationModalProps) {
	const { push } = useRouter();
	const pathname = usePathname();
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		setIsDeleting(true);
		setError(null);

		try {
			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(ADMIN_COOKIE_NAME);

			if (!accessToken) {
				push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}
			const url = isAdmin ? `${backEndUrl}/property/${propertyId}` : `${backEndUrl}/property/${propertyId}/user`;

			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${accessToken.value}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to delete property');
			}

			// Success
			onSuccess();
			onClose();
		} catch (err: any) {
			setError(err.message || 'Something went wrong. Please try again.');
		} finally {
			setIsDeleting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-red-100 rounded-lg">
							<AlertTriangle className="w-6 h-6 text-red-600" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-gray-900">Delete Property</h3>
							<p className="text-sm text-gray-500">This action cannot be undone</p>
						</div>
					</div>
					<button
						onClick={onClose}
						disabled={isDeleting}
						className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50">
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					{error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

					<p className="text-gray-700">
						Are you sure you want to delete <span className="font-semibold text-gray-900">"{propertyTitle}"</span>? This will permanently remove the property and all
						associated data.
					</p>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
					<button
						onClick={onClose}
						disabled={isDeleting}
						className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
						Cancel
					</button>
					<button
						onClick={handleDelete}
						disabled={isDeleting}
						className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
						{isDeleting ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Deleting...
							</>
						) : (
							'Delete Property'
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
