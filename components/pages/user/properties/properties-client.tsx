'use client';

import { CheckCircle, Filter, MapPin, Search, Shield, User, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { toast } from 'sonner';

import { Pagination } from '@/components/global/pagination';
import { configurations } from '@/config';
import { insuranceFee } from '@/lib/constants';
import { PropertyTypeValue } from '@/lib/enums';
import { FetchAllPropertiesResponse, PaginationType, PropertyType } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface PropertiesClientProps {
	propertiesArray: PropertyType[];
	propertiesPagination: PaginationType | null;
}

export function UserPropertiesClient({ propertiesArray, propertiesPagination }: PropertiesClientProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState([]);
	const { push } = useRouter();

	// Track loaded images
	const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

	const [formStatus, setFormStatus] = useState('idle');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedProp, setSelectedProp] = useState<PropertyType | null>(null);
	const [properties, setProperties] = useState<PropertyType[]>([]);
	const [formData, setFormData] = useState({ name: '', email: '', CheckInDate: '', CheckOutDate: '', phone: '' });
	const [currentPage, setCurrentPage] = useState(propertiesPagination?.page || 1);
	const [pagination, setPagination] = useState<PaginationType | null>(propertiesPagination);
	const [filters, setFilters] = useState({
		location: '',
		type: '',
		priceRange: '',
	});

	// Initialize with server props
	useEffect(() => {
		setProperties(propertiesArray);
	}, []);

	useEffect(() => {
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
		const baseClasses = 'w-full h-full object-cover group-hover:scale-105 transition duration-500';

		if (loadedImages.has(imageKey)) {
			return `${baseClasses} opacity-100`;
		}

		return `${baseClasses} opacity-0`;
	};

	// Handle image load
	const handleImageLoad = (propertyId: string) => {
		setLoadedImages((prev) => new Set(prev).add(`${propertyId}-main`));
	};

	const parsePriceRange = (priceRange: string) => {
		if (!priceRange) return {};

		if (priceRange.includes('-')) {
			const [min, max] = priceRange.split('-');
			return { min, max };
		}

		if (priceRange.endsWith('+')) {
			return { min: priceRange.replace('+', '') };
		}

		return {};
	};

	// Handle pagination change
	const handlePageChange = async (newPage: number) => {
		if (isLoading) return;
		await fetchFilteredProperties(filters, newPage);
	};

	// Fetch filtered properties based on search
	const fetchFilteredProperties = async (filters: { location: string; type: string; priceRange: string }, page = 1) => {
		setIsLoading(true);

		try {
			const { backEndUrl } = configurations.envs;
			const params = new URLSearchParams();

			if (filters.location.trim()) {
				params.append('location', filters.location.trim());
			}

			if (filters.type) {
				params.append('type', filters.type);
			}

			const { min, max } = parsePriceRange(filters.priceRange);

			if (min !== undefined) params.append('min', min);
			if (max !== undefined) params.append('max', max);

			params.append('page', page.toString());
			params.append('limit', pagination?.limit.toString() || '6');

			const res = await fetch(`${backEndUrl}/property?${params.toString()}`);
			const data: FetchAllPropertiesResponse = await res.json();

			setProperties(data.properties);
			setPagination(data.pagination);
			setCurrentPage(page);
			setLoadedImages(new Set());

			document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
		} catch (err) {
			toast.error('Failed to fetch properties');
		} finally {
			setIsLoading(false);
		}
	};

	const clearFilters = () => {
		setFilters({ location: '', type: '', priceRange: '' });
		setProperties(propertiesArray); // back to SSR data
		setPagination(propertiesPagination);
	};

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		fetchFilteredProperties(filters, 1);
	};

	const openBookingModal = (property: PropertyType) => {
		setSelectedProp(property);
		setFormStatus('idle');
		setErrorMessage([]);
		setIsModalOpen(true);
	};

	// In handleSubmitBooking
	const handleSubmitBooking = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormStatus('submitting');
		setErrorMessage([]);

		try {
			const { backEndUrl } = configurations.envs;

			if (!selectedProp) {
				return;
			}

			const bookingData = {
				isDashboard: 'true',
				propertyId: selectedProp._id,
				customerName: formData.name,
				customerEmail: formData.email,
				customerPhone: formData.phone,
				checkInDate: formData.CheckInDate,
				checkOutDate: formData.CheckOutDate,
				totalAmount: Number(selectedProp.price.amount) + insuranceFee, // Update for prod
			};

			const response = await fetch(`${backEndUrl}/payments/booking/initialize`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bookingData),
			});

			const result = await response.json();

			if ('error' in result) {
				const errorMessage = Array.isArray(result.message) ? result.message : [result.message];
				setErrorMessage(errorMessage);
				setFormStatus('error');
				return;
			}

			if (result.authorization_url) {
				// Redirect to payment gateway
				window.location.href = result.authorization_url;
			} else {
				throw new Error('Payment initialization failed');
			}
			// await fetchFilteredProperties(filters);
			// setFormStatus('idle');
			// setFormData({ name: '', email: '', CheckInDate: '', CheckOutDate: '', phone: '' });
			// setIsModalOpen(false);
			// Send Email notification
		} catch (error) {
			setFormStatus('error');
			toast.error('Failed to submit booking');
		}
	};

	return (
		<>
			{/* Search & Filter Card */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
				<div className="flex items-center gap-2 mb-4">
					<Filter className="w-5 h-5 text-amber-600" />
					<h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
				</div>

				<form
					onSubmit={onSubmit}
					className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Location */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
							<div className="relative">
								<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="text"
									name="location"
									value={filters.location}
									onChange={(e) => setFilters({ ...filters, location: e.target.value })}
									placeholder="Any location"
									className="w-full pl-10 pr-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
								/>
							</div>
						</div>

						{/* Property Type */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
							<select
								name="type"
								value={filters.type}
								onChange={(e) => setFilters({ ...filters, type: e.target.value })}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white text-black">
								<option value="">All Types</option>
								<option value={PropertyTypeValue.SHORT_LET}>Short-let</option>
								<option value={PropertyTypeValue.LONG_STAY}>Long-stay</option>
							</select>
						</div>

						{/* Price Range */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
							<select
								name="priceRange"
								value={filters.priceRange}
								onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white text-black">
								<option value="">Any Price</option>
								<option value="0-20000">Under 20,000</option>
								<option value="20000-40000">20,000 - 40,000</option>
								<option value="40000-60000">40,000 - 60,000</option>
								<option value="60000+">60,000 +</option>
							</select>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<button
							type="button"
							onClick={clearFilters}
							className="text-sm text-gray-600 hover:text-gray-900">
							Clear all filters
						</button>

						<div className="flex items-center gap-3">
							<button
								type="reset"
								onClick={clearFilters}
								className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-black font-medium">
								Reset
							</button>
							<button
								type="submit"
								className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-amber-600 font-medium flex items-center gap-2">
								<Search className="w-4 h-4" />
								Search Properties
							</button>
						</div>
					</div>
				</form>
			</div>

			{/* Properties Grid */}
			{properties.length === 0 ? (
				<div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
					<Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
					<h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
					<p className="text-gray-500 mb-6">Try adjusting your search filters or browse all properties.</p>
					<button
						type="button"
						onClick={clearFilters}
						className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium">
						View All Properties
					</button>
				</div>
			) : (
				<>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{properties.map((property) => {
							const isImageLoaded = loadedImages.has(`${property._id}-main`);

							return (
								<div
									onClick={() => push(configurations.urls.User.Property.replace('[propertyId]', property._id))}
									key={property._id}
									className="group cursor-pointer bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition overflow-hidden">
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
											width={400}
											height={400}
											className={getImageClasses(property)}
											onLoadingComplete={() => handleImageLoad(property._id)}
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											priority={false}
											loading="lazy"
										/>

										{/* Top Badges */}
										<div className="absolute top-3 left-3 flex gap-2">
											<span
												className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
													property.type === PropertyTypeValue.SHORT_LET ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
												}`}>
												{property.type}
											</span>
											{!property.available && <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">Booked</span>}
										</div>
									</div>

									{/* Property Details */}
									<div className="p-5">
										<div className="flex items-start justify-between mb-2">
											<h3 className="font-bold text-lg text-gray-900 group-hover:text-amber-600 transition">{property.title}</h3>
											{/* <div className="flex items-center gap-1 text-sm">
											<span className="text-amber-500">★</span>
											<span className="font-medium">4.8</span>
										</div> */}
										</div>

										<div className="flex items-center text-gray-600 text-sm mb-3">
											<MapPin className="w-4 h-4 mr-1 text-amber-500" />
											{property.location}
										</div>

										{/* Features */}
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

										{/* Divider */}
										<div className="border-t border-gray-100 mb-4"></div>

										{/* Price & Action */}
										<div className="flex items-center justify-between">
											<div>
												<div className="text-2xl font-bold text-gray-900">{formatPrice(property.price)}</div>
											</div>

											{/* <Link
											href={configurations.urls.User.Property.replace('[propertyId]', property._id)}
											className={`px-5 py-2 rounded-lg font-medium transition ${
												property.available ? 'bg-gray-900 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
											}`}>
											{property.available ? 'View Details' : 'Unavailable'}
										</Link> */}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													openBookingModal(property);
												}}
												disabled={!property.available}
												className={`px-5 py-2 rounded-lg font-medium transition ${
													property.available ? 'bg-gray-900 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
												}`}>
												{property.available ? 'Book Now' : 'Unavailable'}
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>

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
				</>
			)}

			{/* --- BOOKING MODAL --- */}
			{isModalOpen && (
				<section className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<div className="bg-white rounded-2xl max-w-lg w-full p-8 relative">
						<button
							onClick={() => setIsModalOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
							<X className="w-6 h-6" />
						</button>

						{formStatus === 'success' ? (
							<div className="text-center py-10">
								<div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
									<CheckCircle className="w-8 h-8" />
								</div>
								<h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Received!</h3>
								<p className="text-gray-500">
									Thank you. Our team will contact you shortly to confirm your stay at <span className="font-bold text-gray-900">{selectedProp?.title}</span>.
								</p>
								<button
									onClick={() => setIsModalOpen(false)}
									className="mt-6 text-amber-600 font-medium hover:underline">
									Close Window
								</button>
							</div>
						) : (
							<>
								<h3 className="text-2xl font-bold text-gray-900 mb-1">Book Your Stay</h3>
								<p className="text-gray-500 text-sm mb-6">
									Requesting: <span className="font-semibold text-amber-600">{selectedProp?.title}</span>
								</p>

								<form
									onSubmit={handleSubmitBooking}
									className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
										<input
											required
											type="text"
											className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
										<input
											required
											type="text"
											className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
											onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
										<input
											required
											type="email"
											className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
											<DatePicker
												selected={formData.CheckInDate ? new Date(formData.CheckInDate) : null}
												onChange={(date: any) => setFormData({ ...formData, CheckInDate: date?.toISOString() || '' })}
												selectsStart
												startDate={formData.CheckInDate ? new Date(formData.CheckInDate) : null}
												endDate={formData.CheckOutDate ? new Date(formData.CheckOutDate) : null}
												minDate={new Date()}
												excludeDateIntervals={selectedProp?.blockedDates?.map((range: any) => ({
													start: new Date(range.from),
													end: new Date(range.to),
												}))}
												placeholderText="Select date"
												className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
											<DatePicker
												selected={formData.CheckOutDate ? new Date(formData.CheckOutDate) : null}
												onChange={(date: any) => setFormData({ ...formData, CheckOutDate: date?.toISOString() || '' })}
												selectsEnd
												startDate={formData.CheckInDate ? new Date(formData.CheckInDate) : null}
												endDate={formData.CheckOutDate ? new Date(formData.CheckOutDate) : null}
												minDate={formData.CheckInDate ? new Date(formData.CheckInDate) : new Date()}
												excludeDateIntervals={selectedProp?.blockedDates?.map((range: any) => ({
													start: new Date(range.from),
													end: new Date(range.to),
												}))}
												placeholderText="Select date"
												className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
												required
											/>
										</div>
									</div>

									<div className="">{errorMessage.length > 0 && errorMessage.map((message) => <p className="text-center text-red-500">{message}</p>)}</div>

									<button
										type="submit"
										disabled={formStatus === 'submitting'}
										className="w-full bg-gray-900 hover:bg-amber-600 text-white font-bold py-4 rounded-lg transition duration-300 mt-4 flex justify-center items-center">
										{formStatus === 'submitting' ? 'Processing...' : 'Confirm Booking Request'}
									</button>
								</form>
							</>
						)}
					</div>
				</section>
			)}
		</>
	);
}
