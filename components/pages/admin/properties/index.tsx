'use client';

import { Bath, Bed, Building, CheckCircle, MoreVertical, Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Pagination } from '@/components/global/pagination';
import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { PropertyTypeValue } from '@/lib/enums';
import { FetchAllAdminPropertiesResponse, PropertyType } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

import { AddPropertyModal } from './add-property-modal';
import { DeleteConfirmationModal } from './delete-confirmation-modal';
import { EditPropertyModal } from './edit-property-modal';

interface PropertiesClientProps {
	properties: FetchAllAdminPropertiesResponse['properties'];
	pagination: FetchAllAdminPropertiesResponse['pagination'] | null;
	totalProperties: FetchAllAdminPropertiesResponse['totalProperties'];
	availableProperties: FetchAllAdminPropertiesResponse['availableProperties'];
	bookedProperties: FetchAllAdminPropertiesResponse['bookedProperties'];
}

export default function PropertiesClient({
	properties: initialProperties,
	pagination: initialPagination,
	totalProperties: initialTotalProperties,
	availableProperties: initialAvailableProperties,
	bookedProperties: initialBookedProperties,
}: PropertiesClientProps) {
	const { push } = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	// State for filters
	const [searchTerm, setSearchTerm] = useState('');
	const [typeFilter, setTypeFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [page, setPage] = useState(initialPagination?.page || 1);

	// State for data
	const [properties, setProperties] = useState(initialProperties);
	const [pagination, setPagination] = useState(initialPagination);
	const [totalProperties, setTotalProperties] = useState(initialTotalProperties);
	const [availableProperties, setAvailableProperties] = useState(initialAvailableProperties);
	const [bookedProperties, setBookedProperties] = useState(initialBookedProperties);
	const [isLoading, setIsLoading] = useState(false);
	const [editingProperty, setEditingProperty] = useState<PropertyType | null>(null);
	const [deletingProperty, setDeletingProperty] = useState<{ id: string; title: string } | null>(null);

	// State for Modals
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	useEffect(() => {
		const shouldOpenModal = searchParams.get('add-property');

		if (shouldOpenModal === 'true') {
			setIsModalOpen(true);

			// Optional but strongly recommended:
			// remove the query param so refreshes don’t re-open the modal
			const params = new URLSearchParams(searchParams.toString());
			params.delete('add-property');

			const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

			push(newUrl);
		}
	}, [searchParams, pathname, push]);

	const handleEditClick = (property: PropertyType) => {
		setEditingProperty(property);
		setIsEditModalOpen(true);
	};

	const handleDeleteClick = (property: PropertyType) => {
		setDeletingProperty({ id: property._id, title: property.title });
		setIsDeleteModalOpen(true);
	};

	const handleEditSuccess = async () => {
		// Refresh properties list
		await handleSuccess();
		setIsEditModalOpen(false);
		setEditingProperty(null);
	};

	const handleDeleteSuccess = async () => {
		// Refresh properties list
		await handleSuccess();
		setIsDeleteModalOpen(false);
		setDeletingProperty(null);
	};

	// Apply filters and fetch new data
	const applyFilters = async () => {
		setIsLoading(true);
		try {
			// Build query params
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			if (typeFilter) params.append('type', typeFilter);
			if (statusFilter) params.append('available', statusFilter);
			params.append('page', page.toString());
			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(ADMIN_COOKIE_NAME);
			if (!accessToken) {
				push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}

			const response = await fetch(`${backEndUrl}/property/fetch-all?${params.toString()}`, {
				headers: {
					'Authorization': `Bearer ${accessToken.value}`,
					'Content-Type': 'application/json',
				},
			});

			const data: FetchAllAdminPropertiesResponse = await response.json();

			setProperties(data.properties);
			setPagination(data.pagination);
			setTotalProperties(data.totalProperties);
			setAvailableProperties(data.availableProperties);
			setBookedProperties(data.bookedProperties);
		} catch (error) {
			toast.error(`Failed to fetch properties: ${(error as Error).message}`);
		} finally {
			setIsLoading(false);
		}
	};

	// Reset all filters
	const resetFilters = () => {
		setSearchTerm('');
		setTypeFilter('');
		setStatusFilter('');
		setPage(1);
		// Re-fetch without filters
		const fetchInitialData = async () => {
			setIsLoading(true);
			try {
				const { backEndUrl } = configurations.envs;
				const accessToken = await getCookie(ADMIN_COOKIE_NAME);
				if (!accessToken) {
					push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
					return;
				}
				const response = await fetch(`${backEndUrl}/property/fetch-all`, {
					headers: {
						'Authorization': `Bearer ${accessToken.value}`,
						'Content-Type': 'application/json',
					},
				});

				const data: FetchAllAdminPropertiesResponse = await response.json();

				setProperties(data.properties);
				setPagination(data.pagination);
				setTotalProperties(data.totalProperties);
				setAvailableProperties(data.availableProperties);
				setBookedProperties(data.bookedProperties);
			} catch (error) {
				toast.error(`Failed to reset filters: ${(error as Error).message}`);
			} finally {
				setIsLoading(false);
			}
		};

		fetchInitialData();
	};

	// Handle pagination
	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
		setPage(newPage);
		// Fetch data for the new page
		const fetchPageData = async () => {
			setIsLoading(true);
			try {
				const params = new URLSearchParams();
				if (searchTerm) params.append('search', searchTerm);
				if (typeFilter) params.append('type', typeFilter);
				if (statusFilter) params.append('status', statusFilter);
				params.append('page', newPage.toString());
				const { backEndUrl } = configurations.envs;
				const accessToken = await getCookie(ADMIN_COOKIE_NAME);
				if (!accessToken) {
					push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
					return;
				}

				const response = await fetch(`${backEndUrl}/property/fetch-all?${params.toString()}`, {
					headers: {
						'Authorization': `Bearer ${accessToken.value}`,
						'Content-Type': 'application/json',
					},
				});

				const data: FetchAllAdminPropertiesResponse = await response.json();

				setProperties(data.properties);
				setPagination(data.pagination);
			} catch (error) {
				toast.error(`Failed to fetch page: ${(error as Error).message}`);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPageData();
	};

	// Handle on successful property addition
	const handleSuccess = async () => {
		try {
			setIsLoading(true);

			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(ADMIN_COOKIE_NAME);

			if (!accessToken) {
				push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}

			// Build query params with current filters
			const params = new URLSearchParams();
			if (searchTerm) params.append('search', searchTerm);
			if (typeFilter) params.append('type', typeFilter);
			if (statusFilter) params.append('available', statusFilter);
			params.append('page', page.toString());

			const response = await fetch(`${backEndUrl}/property/fetch-all?${params.toString()}`, {
				headers: {
					'Authorization': `Bearer ${accessToken.value}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const data: FetchAllAdminPropertiesResponse = await response.json();

				// Update all state with fresh data
				setProperties(data.properties);
				setPagination(data.pagination);
				setTotalProperties(data.totalProperties);
				setAvailableProperties(data.availableProperties);
				setBookedProperties(data.bookedProperties);
			}
		} catch (error) {
			toast.error((error as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Properties</h1>
					<p className="text-gray-500 mt-2">Manage all properties listed on EdgeHomes</p>
				</div>

				<button
					onClick={() => setIsModalOpen(true)}
					className="inline-flex items-center gap-2 bg-amber-600 hover:bg-bg-amber-700 text-white font-semibold px-5 py-3 rounded-lg transition">
					<Plus className="w-4 h-4" />
					Add Property
				</button>

				<AddPropertyModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSuccess={handleSuccess}
				/>
			</div>

			{/* Loading Overlay */}
			{isLoading && (
				<div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
					<div className="bg-white p-6 rounded-xl shadow-lg">
						<p className="text-gray-700">Loading properties...</p>
					</div>
				</div>
			)}

			{/* Stats Bar */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
					<p className="text-sm text-gray-500">Total Properties</p>
					<p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
				</div>
				<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
					<p className="text-sm text-gray-500">Available</p>
					<p className="text-2xl font-bold text-gray-900">{availableProperties}</p>
				</div>
				<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
					<p className="text-sm text-gray-500">Booked</p>
					<p className="text-2xl font-bold text-gray-900">{bookedProperties}</p>
				</div>
				<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
					<p className="text-sm text-gray-500">Showing</p>
					<p className="text-2xl font-bold text-gray-900">{properties ? properties.length : 0}</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
				<input
					type="text"
					placeholder="Search by title or location..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="flex-1 min-w-[240px] px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
				/>

				<select
					value={typeFilter}
					onChange={(e) => setTypeFilter(e.target.value)}
					className="px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
					<option value="">All Types</option>
					<option value={PropertyTypeValue.SHORT_LET}>Short-let</option>
					<option value={PropertyTypeValue.LONG_STAY}>Long-stay</option>
				</select>

				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
					<option value="">All Status</option>
					<option value="available">Available</option>
					<option value="booked">Booked</option>
				</select>

				<button
					onClick={applyFilters}
					disabled={isLoading}
					className="px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
					{isLoading ? 'Applying...' : 'Apply Filters'}
				</button>

				{(searchTerm || typeFilter || statusFilter) && (
					<button
						onClick={resetFilters}
						disabled={isLoading}
						className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50">
						Clear Filters
					</button>
				)}
			</div>

			{/* Properties Grid */}
			{properties.length === 0 ? (
				<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
					<div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<Building className="w-8 h-8" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900">{isLoading ? 'Loading properties...' : 'No properties found'}</h3>
					<p className="text-sm text-gray-500 mt-1">
						{searchTerm || typeFilter || statusFilter ? 'Try changing your filters to see more results.' : 'Add your first property to start receiving bookings.'}
					</p>
					{searchTerm || typeFilter || statusFilter ? (
						<button
							onClick={resetFilters}
							disabled={isLoading}
							className="mt-4 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-3 rounded-lg transition disabled:opacity-50">
							Clear All Filters
						</button>
					) : (
						<button className="mt-4 inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-3 rounded-lg transition">
							<Plus className="w-4 h-4" />
							Add Your First Property
						</button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{properties.map((property) => (
						<div
							key={property._id}
							className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
							onClick={(e) => {
								// Only navigate if the click wasn't on action buttons
								if (!(e.target as HTMLElement).closest('.action-button')) {
									push(`/admin/properties/${property._id}`);
								}
							}}>
							{/* Property Image */}
							<div className="relative h-48 overflow-hidden bg-gray-100">
								<img
									src={property.images[0].url}
									alt={property.title}
									className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
								/>
								<div className="absolute top-3 left-3 flex gap-2">
									<span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">{property.type}</span>
									<span className={`text-xs font-bold px-3 py-1 rounded-full ${property.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
										{property.available ? 'Available' : 'Booked'}
									</span>
								</div>
							</div>

							{/* Property Details */}
							<div className="p-6">
								<div className="flex items-start justify-between mb-3 gap-3">
									<div className="min-w-0 flex-1">
										<h3 className="text-lg font-bold text-gray-900 truncate">{property.title}</h3>

										<div className="flex items-center text-gray-500 text-sm mt-1 min-w-0">
											<Building className="w-4 h-4 mr-1 shrink-0" />
											<span className="truncate">{property.location}</span>
										</div>
									</div>

									<div className="text-right shrink-0">
										<p className="text-xl font-bold text-gray-900">{formatPrice(property.price)}</p>
									</div>
								</div>

								{/* Beds & Baths */}
								<div className="flex items-center gap-4 text-gray-600 mb-4">
									<div className="flex items-center">
										<Bed className="w-4 h-4 mr-1" />
										<span className="text-sm">{property.beds} Beds</span>
									</div>
									<div className="flex items-center">
										<Bath className="w-4 h-4 mr-1" />
										<span className="text-sm">{property.baths} Baths</span>
									</div>
								</div>

								{/* Features */}
								{property.features && property.features.length > 0 && (
									<div className="mb-4">
										<div className="flex flex-wrap gap-2">
											{property.features.slice(0, 3).map((feature, index) => (
												<span
													key={index}
													className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
													{feature}
												</span>
											))}
											{property.features.length > 3 && <span className="text-xs text-gray-400 px-2 py-1">+{property.features.length - 3} more</span>}
										</div>
									</div>
								)}

								{/* Actions */}
								<div className="flex items-center justify-between pt-4 border-t border-gray-100">
									<div className="flex items-center gap-2">
										{property.available ? (
											<span className="flex items-center text-sm text-green-600">
												<CheckCircle className="w-4 h-4 mr-1" />
												Ready for bookings
											</span>
										) : (
											<span className="flex items-center text-sm text-red-600">
												<XCircle className="w-4 h-4 mr-1" />
												Currently booked
											</span>
										)}
									</div>

									<div
										className="flex items-center gap-2"
										onClick={(e) => e.stopPropagation()}>
										<button
											onClick={() => handleEditClick(property)}
											className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition action-button"
											title="Edit">
											<Pencil className="w-4 h-4" />
										</button>
										<button
											onClick={() => handleDeleteClick(property)}
											className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition action-button"
											title="Delete">
											<Trash2 className="w-4 h-4" />
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{pagination && pagination.totalPages > 1 && (
				<div className="mt-12">
					<Pagination
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						totalItems={pagination.itemCount}
						itemsPerPage={pagination.limit}
						onPageChange={handlePageChange}
						isLoading={isLoading}
						hasNextPage={pagination.hasNextPage}
						hasPreviousPage={pagination.hasPreviousPage}
					/>
				</div>
			)}

			{/* Edit Property Modal */}
			<EditPropertyModal
				isAdmin
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setEditingProperty(null);
				}}
				onSuccess={handleEditSuccess}
				property={editingProperty}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				isAdmin
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
