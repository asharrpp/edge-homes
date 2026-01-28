'use client';

import { Home, MapPin, Plus, Search, Shield, User, Zap } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Pagination } from '@/components/global/pagination/index';
import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { PaginationType, PropertyType } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

import { AddPropertyModal } from '../../admin/properties/add-property-modal';
import { DeleteConfirmationModal } from '../../admin/properties/delete-confirmation-modal';
import { EditPropertyModal } from '../../admin/properties/edit-property-modal';

interface MyPropertiesClientProps {
	propertiesArray: PropertyType[];
	propertiesPagination: PaginationType | null;
	credits: number;
}

export function MyPropertiesClient({ propertiesArray, credits, propertiesPagination }: MyPropertiesClientProps) {
	const [isLoading, setIsLoading] = useState(false);

	const [properties, setProperties] = useState<PropertyType[]>([]);
	const [pagination, setPagination] = useState<PaginationType | null>(propertiesPagination);
	const [searchTerm, setSearchTerm] = useState(''); // <-- search state

	const [deletingProperty, setDeletingProperty] = useState<{ id: string; title: string } | null>(null);
	const [editingProperty, setEditingProperty] = useState<PropertyType | null>(null);

	// Track loaded images
	const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

	// Modals
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	useEffect(() => {
		setProperties(propertiesArray);

		// Pre-load images when properties are set
		if (propertiesArray.length > 0) {
			propertiesArray.forEach((property) => {
				// Create image element for pre-loading
				const img = document.createElement('img');
				img.src = property.images[0].url;
				img.onload = () => {
					setLoadedImages((prev) => new Set(prev).add(`${property._id}-main`));
				};
			});
		}
	}, [propertiesArray]);

	// Function to get the appropriate image source
	const getImageSrc = (property: PropertyType) => {
		const imageKey = `${property._id}-main`;
		if (loadedImages.has(imageKey)) {
			return property.images[0].url;
		}

		// Use placeholder from images array if available
		if (property.images && property.images.length > 0 && property.images[0].placeholderUrl) {
			return property.images[0].placeholderUrl;
		}

		// Fallback to the main image
		return property.images[0].url;
	};

	// Function to get image classes based on loading state
	const getImageClasses = (property: PropertyType) => {
		const imageKey = `${property._id}-main`;
		const baseClasses = 'object-cover transition-all duration-500';

		if (loadedImages.has(imageKey)) {
			return `${baseClasses} opacity-100`;
		}

		return `${baseClasses} opacity-0`;
	};

	// Handle image load
	const handleImageLoad = (propertyId: string) => {
		setLoadedImages((prev) => new Set(prev).add(`${propertyId}-main`));
	};

	const fetchFilteredProperties = async (filters: { location: string }, page = 1) => {
		try {
			setIsLoading(true);

			const { backEndUrl } = configurations.envs;

			const accessToken = await getCookie(USER_COOKIE_NAME);

			const headers = {
				'Authorization': `Bearer ${accessToken?.value}`,
				'Content-Type': 'application/json',
			};
			const params = new URLSearchParams();

			params.append('page', page.toString());
			params.append('limit', pagination?.limit.toString() || '6');
			params.append('location', filters.location.trim());

			const request = await fetch(`${backEndUrl}/property/my-properties?${params.toString()}`, {
				headers,
			});
			const data = await request.json();
			setProperties(data.properties);
			setPagination(data.pagination);
			setLoadedImages(new Set());
		} catch (error) {
			void error;
		} finally {
			setIsLoading(false);
		}
	};

	// Handle pagination change
	const handlePageChange = async (newPage: number) => {
		if (isLoading) return;
		await fetchFilteredProperties({ location: searchTerm }, newPage);
	};

	const handleSearch = async () => {
		await fetchFilteredProperties({ location: searchTerm });
	};

	const handleEditClick = (property: PropertyType) => {
		setEditingProperty(property);
		setIsEditModalOpen(true);
	};

	const handleDeleteClick = (property: PropertyType) => {
		setDeletingProperty({ id: property._id, title: property.title });
		setIsDeleteModalOpen(true);
	};

	// Modals callbacks (example)
	const handleSuccess = async () => {};
	const handleEditSuccess = async () => {};
	const handleDeleteSuccess = async () => {};

	return (
		<>
			{/* Header + Add Property + Credits */}
			<section className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
				<div className="flex-1">
					<h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
					<p className="text-gray-500 text-sm">Manage and update your property listings</p>
				</div>

				<div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
					{/* Credits Display */}
					<div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg w-full md:w-auto">
						<Zap className="w-4 h-4 text-amber-600" />
						<span className="font-bold text-amber-700 text-sm">
							{credits} Credit{credits !== 1 ? 's' : ''} Available
						</span>
					</div>

					<div className="flex items-center gap-2 w-full md:w-auto">
						<div className="relative flex-1 md:flex-auto">
							<input
								type="text"
								placeholder="Search by title or location..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pr-12 px-4 py-3 border text-black placeholder:text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
							/>

							{/* Search Icon */}
							<button
								type="button"
								onClick={handleSearch}
								className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors duration-200"
								aria-label="Search Properties">
								<Search className="w-5 h-5" />
							</button>
						</div>

						{/* Add Property */}
						<button
							type="button"
							onClick={() => setIsModalOpen(true)}
							className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 whitespace-nowrap">
							<Plus className="w-5 h-5" /> Add Property
						</button>
					</div>
				</div>

				<AddPropertyModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSuccess={handleSuccess}
				/>
			</section>

			{/* Empty State */}

			{isLoading ? (
				<div className="flex items-center justify-center py-24">
					<svg
						className="animate-spin h-12 w-12 text-amber-600"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24">
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
					</svg>
				</div>
			) : properties.length === 0 ? (
				<div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
					<Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
					<h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
					<p className="text-gray-500 mb-6">Try adjusting your search or add a new property.</p>

					<button
						onClick={() => setIsModalOpen(true)}
						type="button"
						className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
						<Plus className="w-5 h-5" /> Add Property
					</button>
				</div>
			) : (
				<>
					{/* Properties Grid */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{properties.map((property) => {
							const isImageLoaded = loadedImages.has(`${property._id}-main`);

							return (
								<div
									key={property._id}
									className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden">
									{/* Image Container */}
									<div className="relative h-48 overflow-hidden bg-gray-100">
										{!isImageLoaded && (
											<div className="absolute inset-0 flex items-center justify-center">
												<div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
											</div>
										)}

										<Image
											src={getImageSrc(property)}
											alt={property.title}
											fill
											className={getImageClasses(property)}
											onLoadingComplete={() => handleImageLoad(property._id)}
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											priority={false}
											loading="lazy"
										/>

										<div className="absolute top-3 left-3">
											<span className={`text-xs font-bold px-3 py-1 rounded-full ${property.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
												{property.isVerified ? 'Published' : 'Un-verified'}
											</span>
										</div>
									</div>

									{/* Content */}
									<div className="p-5">
										<h3 className="font-bold text-lg text-gray-900 mb-2">{property.title}</h3>
										<div className="flex items-center text-gray-600 text-sm mb-3">
											<MapPin className="w-4 h-4 mr-1 text-amber-500" />
											{property.location}
										</div>
										<div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
											<span className="flex items-center">
												<User className="w-4 h-4 mr-1" />
												{property.beds} beds
											</span>
											<span className="flex items-center">
												<Shield className="w-4 h-4 mr-1" />
												{property.baths} baths
											</span>
										</div>

										<div className="border-t border-gray-100 mb-4" />

										<div className="flex items-center justify-between">
											<div className="text-xl font-bold text-gray-900">{formatPrice(property.price)}</div>
											<div className="flex gap-2">
												<button
													onClick={() => handleDeleteClick(property)}
													className="px-3 py-2 text-sm border rounded-lg text-black hover:bg-amber-600 hover:text-white transition-colors duration-500 ease-in-out">
													Delete
												</button>
												<button
													onClick={() => handleEditClick(property)}
													className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-amber-600 transition-colors duration-500 ease-in-out">
													Edit
												</button>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</>
			)}

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<div className="mt-8">
					<Pagination
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						totalItems={pagination.itemCount}
						itemsPerPage={pagination.limit}
						hasNextPage={pagination.hasNextPage}
						onPageChange={handlePageChange}
						hasPreviousPage={pagination.hasPreviousPage}
					/>
				</div>
			)}

			{/* Modals */}
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
