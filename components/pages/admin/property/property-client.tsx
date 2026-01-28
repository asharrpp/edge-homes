'use client';

import { Check, CheckCircle, Copy, Edit, Link, Loader2, Share2, Trash2, XCircle } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { revalidateTagAction } from '@/actions/revalidate-action';
import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { RevalidateTags } from '@/lib/enums';
import { PropertyType } from '@/lib/types';

import { DeleteConfirmationModal } from '../properties/delete-confirmation-modal';
import { EditPropertyModal } from '../properties/edit-property-modal';

interface PropertyClientProps {
	showPropertyManagement?: true;
	isAdmin: boolean;
	property: PropertyType;
}

export function PropertyClient({ isAdmin, showPropertyManagement, property }: PropertyClientProps) {
	const { push } = useRouter();
	const pathname = usePathname();

	const [isLoading, setIsLoading] = useState(false);
	const [editingProperty, setEditingProperty] = useState<PropertyType | null>(null);
	const [deletingProperty, setDeletingProperty] = useState<{ id: string; title: string } | null>(null);
	const [copiedLink, setCopiedLink] = useState(false);

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [showVerifyConfirm, setShowVerifyConfirm] = useState(false);

	// Generate property URLs
	const getPropertyUrls = () => {
		const baseUrl = configurations.envs.baseUrl || window.location.origin;

		// Admin URL (current page)
		const adminUrl = configurations.urls.Admin.property.replace('[propertyId]', property._id);

		// Public URL (if you have a public facing page)
		// You'll need to adjust this based on your actual public routes
		const publicUrl = configurations.urls.Public.Property.replace('[propertyId]', property._id);

		// Shortened link (using your own domain or service)
		const shortUrl = configurations.urls.Public.Property.replace('[propertyId]', property._id);

		return {
			adminUrl,
			publicUrl,
			shortUrl,
		};
	};

	const handleCopyLink = async (linkType: 'admin' | 'public' | 'short') => {
		const urls = getPropertyUrls();
		let linkToCopy = '';

		switch (linkType) {
			case 'admin':
				linkToCopy = urls.adminUrl;
				break;
			case 'public':
				linkToCopy = urls.publicUrl;
				break;
			case 'short':
				linkToCopy = urls.shortUrl;
				break;
		}

		try {
			await navigator.clipboard.writeText(linkToCopy);
			setCopiedLink(true);
			toast.success('Link copied to clipboard!');

			// Reset copied state after 2 seconds
			setTimeout(() => setCopiedLink(false), 2000);
		} catch (err) {
			toast.error('Failed to copy link. Please try again.');
		}
	};

	const handleShareViaAPI = async () => {
		const urls = getPropertyUrls();

		if (navigator.share) {
			try {
				await navigator.share({
					title: `Check out ${property.title}`,
					text: `Check out this property: ${property.title} at ${property.location}`,
					url: urls.publicUrl,
				});
				toast.success('Shared successfully!');
			} catch (err: any) {
				if (err.name !== 'AbortError') {
					toast.error('Failed to share. Please try another method.');
				}
			}
		} else {
			// Fallback: copy public link
			handleCopyLink('public');
		}
	};

	const handleEditClick = (property: PropertyType) => {
		setEditingProperty(property);
		setIsEditModalOpen(true);
	};

	const handleDeleteClick = (property: PropertyType) => {
		setDeletingProperty({ id: property._id, title: property.title });
		setIsDeleteModalOpen(true);
	};

	const handleEditSuccess = async () => {
		await revalidateTagAction(RevalidateTags.PROPERTY);
		setIsEditModalOpen(false);
		setEditingProperty(null);
	};

	const handleDeleteSuccess = async () => {
		await revalidateTagAction(RevalidateTags.PROPERTY);
		setIsDeleteModalOpen(false);
		setDeletingProperty(null);
	};

	const onTogglePropertyAvailability = async (available: boolean) => {
		try {
			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(ADMIN_COOKIE_NAME);
			if (!accessToken) {
				push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}

			setIsLoading(true);
			const formDataToSend = new FormData();
			formDataToSend.append('available', `${available}`);

			const request = await fetch(`${backEndUrl}/property/${property._id}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken.value}`,
				},
				body: formDataToSend,
			});

			const response = await request.json();
			if ('error' in response) {
				toast.error(response.message || 'Something went wrong. Please try again.');
				return;
			}

			await revalidateTagAction(RevalidateTags.PROPERTY);
			toast.success(`Property marked as ${available ? 'available' : 'booked'}!`);
		} catch (err: any) {
			toast.error(err.message || 'Something went wrong. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyProperty = async () => {
		try {
			setIsVerifying(true);
			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(ADMIN_COOKIE_NAME);

			if (!accessToken) {
				push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}

			const response = await fetch(`${backEndUrl}/property/${property._id}/verify`, {
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${accessToken.value}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ isVerified: !property.isVerified }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to verify property');
			}

			// Revalidate the property data
			await revalidateTagAction(RevalidateTags.PROPERTY);

			toast.success(`Property ${property.isVerified ? 'unverified' : 'verified'} successfully!`);
			setShowVerifyConfirm(false);
		} catch (err: any) {
			toast.error(err.message || 'Something went wrong. Please try again.');
		} finally {
			setIsVerifying(false);
		}
	};

	// Generate QR Code for property
	const generateQRCodeUrl = () => {
		const urls = getPropertyUrls();
		const qrText = encodeURIComponent(urls.publicUrl);
		return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrText}`;
	};

	const handleOpenShareModal = () => {
		setIsShareModalOpen(true);
	};

	return (
		<>
			{showPropertyManagement && isAdmin && (
				<div className="bg-white rounded-2xl border border-gray-200 p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Property Management</h2>

					<div className="space-y-3">
						<button
							onClick={() => handleEditClick(property)}
							className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-500 ease-in-out">
							<Edit className="w-4 h-4" />
							Edit Property Details
						</button>

						{property.isVerified ? (
							<button
								onClick={() => setShowVerifyConfirm(true)}
								className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-500 hover:text-white font-semibold py-3 px-4 rounded-lg transition duration-500 ease-in-out">
								<XCircle className="w-4 h-4" />
								Unverify Property
							</button>
						) : (
							<button
								onClick={() => setShowVerifyConfirm(true)}
								className="w-full flex items-center justify-center gap-2 border border-green-300 text-green-700 hover:bg-green-500 hover:text-white font-semibold py-3 px-4 rounded-lg transition duration-500 ease-in-out">
								<CheckCircle className="w-4 h-4" />
								Approve Property
							</button>
						)}

						{property.available ? (
							<button
								disabled={isLoading}
								onClick={() => onTogglePropertyAvailability(false)}
								className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-500 hover:text-white font-semibold py-3 px-4 rounded-lg transition duration-500 ease-in-out">
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
									</>
								) : (
									<>
										<XCircle className="w-4 h-4" />
										Mark as Booked
									</>
								)}
							</button>
						) : (
							<button
								disabled={isLoading}
								onClick={() => onTogglePropertyAvailability(true)}
								className="w-full flex items-center justify-center gap-2 border border-green-300 text-green-700 hover:bg-green-500 hover:text-white font-semibold py-3 px-4 rounded-lg transition duration-500 ease-in-out">
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
									</>
								) : (
									<>
										<CheckCircle className="w-4 h-4" />
										Mark as Available
									</>
								)}
							</button>
						)}

						<button
							onClick={() => handleDeleteClick(property)}
							className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-500 hover:text-white font-semibold py-3 px-4 rounded-lg transition duration-500 ease-in-out">
							<Trash2 className="w-4 h-4" />
							Delete Property
						</button>
					</div>
				</div>
			)}

			<div className="bg-white rounded-2xl border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>

				<div className="space-y-3">
					<button
						onClick={handleOpenShareModal}
						className="w-full flex items-center justify-between text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-3 rounded-lg transition group">
						<div className="flex items-center gap-3">
							<Share2 className="w-4 h-4" />
							<span>Share Property Link</span>
						</div>
						<Link className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>

					{/* Option 2: Direct copy public link */}
					<button
						onClick={() => handleCopyLink('public')}
						className="w-full flex items-center justify-between text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-3 rounded-lg transition group">
						<div className="flex items-center gap-3">
							{copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
							<span>{copiedLink ? 'Copied!' : 'Copy Public Link'}</span>
						</div>
					</button>
				</div>
			</div>

			{showVerifyConfirm && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
						<div className="flex items-start gap-4">
							<div className={`flex-shrink-0 p-3 rounded-full ${property.isVerified ? 'bg-red-100' : 'bg-green-100'}`}>
								{property.isVerified ? <XCircle className="w-6 h-6 text-red-600" /> : <CheckCircle className="w-6 h-6 text-green-600" />}
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">{property.isVerified ? 'Unverify Property' : 'Verify Property'}</h3>
								<p className="text-gray-600">
									Are you sure you want to {property.isVerified ? 'unverify' : 'verify'} <span className="font-semibold">{property.title}</span>?
									{property.isVerified ? ' This will hide it from public listings.' : ' This will make it visible to customers.'}
								</p>
							</div>
						</div>

						<div className="mt-6 flex items-center justify-end gap-3">
							<button
								type="button"
								onClick={() => setShowVerifyConfirm(false)}
								disabled={isVerifying}
								className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
								Cancel
							</button>
							<button
								type="button"
								onClick={handleVerifyProperty}
								disabled={isVerifying}
								className={`px-4 py-2 text-white font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50 ${
									property.isVerified ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
								}`}>
								{isVerifying ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Processing...
									</>
								) : (
									<>{property.isVerified ? 'Unverify Property' : 'Verify Property'}</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Share Modal */}
			{isShareModalOpen && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-lg font-semibold text-gray-900">Share Property</h3>
							<button
								onClick={() => setIsShareModalOpen(false)}
								className="text-gray-400 hover:text-gray-600">
								<XCircle className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<h4 className="text-sm font-medium text-gray-700 mb-2">Property</h4>
								<div className="p-3 bg-gray-50 rounded-lg">
									<p className="font-medium text-gray-900">{property.title}</p>
									<p className="text-sm text-gray-500 mt-1">{property.location}</p>
								</div>
							</div>

							<div>
								<h4 className="text-sm font-medium text-gray-700 mb-2">Share Options</h4>

								<div className="grid grid-cols-1 gap-3">
									{/* Web Share API */}
									<button
										onClick={handleShareViaAPI}
										className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
										<div className="flex items-center gap-3">
											<Share2 className="w-4 h-4 text-blue-500" />
											<div className="text-left">
												<p className="font-medium text-gray-900">Share via...</p>
												<p className="text-xs text-gray-500">Apps like WhatsApp, Email, etc.</p>
											</div>
										</div>
									</button>

									{/* Copy Admin Link */}
									<button
										onClick={() => handleCopyLink('admin')}
										className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
										<div className="flex items-center gap-3">
											<Link className="w-4 h-4 text-amber-500" />
											<div className="text-left">
												<p className="font-medium text-gray-900">Admin Link</p>
												<p className="text-xs text-gray-500">For internal use</p>
											</div>
										</div>
										{copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
									</button>

									{/* Copy Public Link */}
									<button
										onClick={() => handleCopyLink('public')}
										className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
										<div className="flex items-center gap-3">
											<Link className="w-4 h-4 text-green-500" />
											<div className="text-left">
												<p className="font-medium text-gray-900">Public Link</p>
												<p className="text-xs text-gray-500">For customers</p>
											</div>
										</div>
										{copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
									</button>
								</div>
							</div>

							{/* QR Code Section */}
							<div>
								<h4 className="text-sm font-medium text-gray-700 mb-2">QR Code</h4>
								<div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
									<div className="flex-shrink-0">
										<img
											src={generateQRCodeUrl()}
											alt="Property QR Code"
											className="w-24 h-24 border border-gray-200 rounded"
										/>
									</div>
									<div className="flex-1">
										<p className="text-sm text-gray-600">Scan this QR code to quickly access the property page on mobile devices.</p>
										<button
											onClick={() => {
												// Download QR code
												const link = document.createElement('a');
												link.href = generateQRCodeUrl();
												link.download = `property-${property._id}-qrcode.png`;
												document.body.appendChild(link);
												link.click();
												document.body.removeChild(link);
												toast.success('QR Code downloaded!');
											}}
											className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
											Download QR Code
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-6 pt-6 border-t border-gray-200">
							<button
								onClick={() => setIsShareModalOpen(false)}
								className="w-full py-2 px-4 text-white font-medium rounded-lg bg-amber-600 hover:bg-amber-700 transition">
								Done
							</button>
						</div>
					</div>
				</div>
			)}

			<EditPropertyModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setEditingProperty(null);
				}}
				onSuccess={handleEditSuccess}
				property={editingProperty}
			/>

			<DeleteConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setDeletingProperty(null);
				}}
				onSuccess={handleDeleteSuccess}
				propertyId={deletingProperty?.id || ''}
				propertyTitle={deletingProperty?.title || ''}
			/>
		</>
	);
}
