'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { MapPin, Search, Shield, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { toast } from 'sonner';

import { Pagination } from '@/components/global/pagination';
import { configurations } from '@/config';
import { insuranceFee } from '@/lib/constants';
import { PropertyTypeValue } from '@/lib/enums';
import { FetchAllPropertiesResponse, PaginationType, PropertyType } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface HomeClientProps {
	propertiesArray: FetchAllPropertiesResponse['properties'];
	propertiesPagination: PaginationType | null;
}
type BookingFlow = 'options' | 'pay' | 'owner';

export const HomeClient = ({ propertiesArray, propertiesPagination }: HomeClientProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState([]);
	const [searchParams, setSearchParams] = useState({
		location: '',
		type: '',
	});
	// Track loaded images
	const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
	const [formStatus, setFormStatus] = useState('idle');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedProp, setSelectedProp] = useState<any>(null);
	const [properties, setProperties] = useState<FetchAllPropertiesResponse['properties']>([]);
	const [formData, setFormData] = useState({ name: '', email: '', CheckInDate: '', CheckOutDate: '', phone: '' });
	const [currentPage, setCurrentPage] = useState(propertiesPagination?.page || 1);
	const [pagination, setPagination] = useState<PaginationType | null>(propertiesPagination);
	const [activeFilters, setActiveFilters] = useState({ location: '', type: '' });
	const [bookingFlow, setBookingFlow] = useState<BookingFlow>('options');

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

	// Handle image load
	const handleImageLoad = (propertyId: string) => {
		setLoadedImages((prev) => new Set(prev).add(`${propertyId}-main`));
	};

	// Fetch filtered properties based on search
	const fetchFilteredProperties = async (filters: { location: string; type: string }, page = 1) => {
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

			params.append('page', page.toString());
			params.append('limit', (propertiesPagination?.limit || 5).toString());

			const request = await fetch(`${backEndUrl}/property?${params.toString()}`);
			const response = (await request.json()) as FetchAllPropertiesResponse;

			setProperties(response.properties);
			setPagination(response.pagination);
			setCurrentPage(page);
			setLoadedImages(new Set());

			document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
		} catch (error) {
			toast.error('Failed to fetch properties: ' + (error as Error).message);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle pagination change
	const handlePageChange = async (newPage: number) => {
		if (isLoading) return;
		await fetchFilteredProperties(activeFilters, newPage);
	};

	const handleFilter = async (type: string) => {
		const nextFilters = {
			...activeFilters,
			type: type === 'All' ? '' : type,
		};

		setActiveFilters(nextFilters);
		await fetchFilteredProperties(nextFilters, 1);
	};

	// Handle search form submission
	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();

		const nextFilters = {
			location: searchParams.location,
			type: searchParams.type || '',
		};

		setActiveFilters(nextFilters);
		await fetchFilteredProperties(nextFilters, 1);
	};

	// Clear all filters
	const clearFilters = async () => {
		const cleared = { location: '', type: '' };

		setSearchParams(cleared);
		setActiveFilters(cleared);

		await fetchFilteredProperties(cleared, 1);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setSearchParams((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// const openBooking = (property: any) => {
	// 	setSelectedProp(property);
	// 	setIsModalOpen(true);
	// 	setFormStatus('idle');
	// };

	const openBooking = (property: any) => {
		setSelectedProp(property);
		setBookingFlow('options');
		setIsModalOpen(true);
	};

	// In handleSubmitBooking
	const handleSubmitBooking = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormStatus('submitting');
		setErrorMessage([]);

		try {
			const { backEndUrl } = configurations.envs;

			const bookingData = {
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
			// Send Email notification
		} catch (error) {
			setFormStatus('error');
			toast.error('Failed to submit booking');
		}
	};

	return (
		<>
			{/* --- HERO SECTION --- */}
			<section className="relative bg-gray-900 h-[600px] flex items-center justify-center overflow-hidden">
				{/* Background Overlay */}
				<div className="absolute inset-0 bg-black/60 z-10"></div>
				<div className="absolute inset-0 z-0">
					{/* Bottom / base image – always visible underneath */}
					<img
						src="/hero-1.webp"
						alt="Luxury Apartment 1"
						className="absolute inset-0 w-full h-full object-cover"
					/>

					{/* Top image – fades in/out */}
					<img
						src="/hero-2.webp"
						alt="Luxury Apartment 2"
						className="absolute inset-0 w-full h-full object-cover animate-crossfade"
					/>
				</div>

				<div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
					<span className="text-amber-500 font-semibold tracking-widest uppercase mb-4 block">Premium Living</span>
					<h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
						Discover Your Perfect <br />
						<span className="text-amber-500">Space in the City</span>
					</h1>
					<p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
						Experience luxury short-lets and premium long-stay apartments in the most exclusive locations in hearts of Lagos.
					</p>

					{/* Search Bar */}
					<form
						onSubmit={handleSearch}
						className="bg-white p-2 rounded-full flex flex-col md:flex-row items-center max-w-3xl mx-auto shadow-2xl">
						<div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200">
							<label
								htmlFor="location"
								className="block text-xs font-bold text-gray-400 uppercase">
								Location
							</label>
							<input
								id="location"
								name="location"
								type="text"
								placeholder="e.g. Victoria Island"
								value={searchParams.location}
								onChange={handleInputChange}
								className="w-full outline-none text-gray-700 font-medium"
							/>
						</div>

						<div className="flex-1 px-6 py-3 mr-2 w-full border-b md:border-b-0 md:border-r border-gray-200">
							<label
								htmlFor="type"
								className="block text-xs font-bold text-gray-400 uppercase">
								Type
							</label>
							<select
								id="type"
								name="type"
								value={searchParams.type}
								onChange={handleInputChange}
								className="w-full outline-none text-gray-700 font-medium bg-transparent">
								<option value="">All Types</option>
								<option value={PropertyTypeValue.SHORT_LET}>Short-let</option>
								<option value={PropertyTypeValue.LONG_STAY}>Long-stay</option>
							</select>
						</div>

						<button
							type="submit"
							className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-full transition w-full md:w-auto mt-2 md:mt-0">
							<Search className="w-6 h-6 mx-auto" />
						</button>
					</form>
				</div>
			</section>

			{/* --- FEATURED PROPERTIES --- */}
			<section
				id="listings"
				className="max-w-7xl mx-auto px-4 py-20">
				<div className="flex justify-between items-end mb-12">
					<div>
						<h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
						<p className="text-gray-500 mt-2">Curated luxury for business and leisure.</p>
					</div>

					<div className="hidden md:flex space-x-2 bg-gray-100 p-1 rounded-lg">
						{['All', PropertyTypeValue.SHORT_LET, PropertyTypeValue.LONG_STAY].map((type) => {
							const isActive = type === 'All' ? activeFilters.type === '' : activeFilters.type === type;

							return (
								<button
									key={type}
									onClick={() => handleFilter(type)}
									className={`px-4 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
									{type}
								</button>
							);
						})}
					</div>
				</div>

				{/* Loading Overlay */}
				{isLoading && (
					<div className="relative">
						<div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
							<div className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg">
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								<span className="font-medium">Loading properties...</span>
							</div>
						</div>
					</div>
				)}

				{/* Properties Grid */}
				{properties.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
						<p className="text-gray-400 mt-2">Try adjusting your search filters.</p>
						<button
							onClick={clearFilters}
							className="mt-4 text-amber-600 hover:text-amber-700 underline">
							Clear all filters
						</button>
					</div>
				) : (
					<>
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							{properties.map((prop) => {
								const isImageLoaded = loadedImages.has(`${prop._id}-main`);

								return (
									<div
										key={prop._id}
										className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
										<div className="relative h-64 overflow-hidden bg-gray-100">
											{/* Loading Spinner */}
											{!isImageLoaded && (
												<div className="absolute inset-0 flex items-center justify-center">
													<div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
												</div>
											)}

											{/* Cloudinary Image - Cloudinary handles optimization */}
											<Image
												src={prop.images[0].url}
												alt={prop.title}
												className={`w-full h-full object-cover transform group-hover:scale-110 transition duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
												onLoad={() => handleImageLoad(prop._id)}
												width={300}
												height={500}
												loading="lazy" // Native browser lazy loading
											/>
										</div>
										<div className="p-6">
											<div className="flex justify-between items-start mb-2">
												<h3 className="text-xl font-bold text-gray-900">{prop.title}</h3>
											</div>
											<div className="flex items-center text-gray-500 mb-4 text-sm">
												<MapPin className="w-4 h-4 mr-1 text-amber-500" />
												{prop.location}
											</div>

											<div className="flex items-center gap-4 text-sm text-gray-600 mb-6 border-y border-gray-100 py-3">
												<span className="flex items-center">
													<User className="w-4 h-4 mr-1" /> {prop.beds} Beds
												</span>
												<span className="flex items-center">
													<Shield className="w-4 h-4 mr-1" /> {prop.baths} Baths
												</span>
											</div>

											<div className="flex items-center justify-between">
												<div className="text-lg font-bold text-gray-900">{formatPrice(prop.price)}</div>
												<button
													onClick={() => openBooking(prop)}
													disabled={!prop.available}
													className={`px-5 py-2 rounded-lg font-medium transition ${
														prop.available ? 'bg-gray-900 text-white hover:bg-amber-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
													}`}>
													{prop.available ? 'Book Now' : 'Unavailable'}
												</button>
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{/* Pagination Component */}
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
					</>
				)}
			</section>

			{/* --- BOOKING MODAL --- */}
			{isModalOpen && (
				<section className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<div className="bg-white rounded-2xl max-w-lg w-full p-8 relative">
						<button
							onClick={() => setIsModalOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
							<X className="w-6 h-6" />
						</button>

						{/* ───────────────── OPTION STEP ───────────────── */}
						{bookingFlow === 'options' && (
							<>
								<h3 className="text-2xl font-bold text-gray-900 mb-2">How would you like to book?</h3>
								<p className="text-gray-500 mb-6">{selectedProp?.title}</p>

								<div className="space-y-4">
									<button
										onClick={() => setBookingFlow('pay')}
										className="w-full bg-gray-900 hover:bg-amber-600 text-white font-bold py-4 rounded-lg transition-all ease-in-out duration-500">
										Pay Now
									</button>

									<button
										onClick={() => setBookingFlow('owner')}
										className="w-full border border-gray-300 hover:border-amber-600 text-gray-900 hover:text-amber-600 font-bold py-4 rounded-lg transition-all ease-in-out duration-500">
										Book with Property Owner
									</button>
								</div>
							</>
						)}

						{/* ───────────────── PAY NOW STEP ───────────────── */}
						{bookingFlow === 'pay' && (
							<>
								<button
									onClick={() => setBookingFlow('options')}
									className="text-sm text-gray-500 hover:text-gray-900 mb-4 underline">
									← Back
								</button>

								<h3 className="text-2xl font-bold text-gray-900 mb-1">Book Your Stay</h3>
								<p className="text-gray-500 text-sm mb-6">
									Requesting: <span className="font-semibold text-amber-600">{selectedProp?.title}</span>
								</p>

								{/* 🔁 YOUR EXISTING FORM — UNCHANGED */}
								<form
									onSubmit={handleSubmitBooking}
									className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
										<input
											required
											type="text"
											className="w-full p-3 border border-gray-300 rounded-lg"
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
										<input
											required
											type="text"
											className="w-full p-3 border border-gray-300 rounded-lg"
											onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
										<input
											required
											type="email"
											className="w-full p-3 border border-gray-300 rounded-lg"
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="">
											<DatePicker
												selected={formData.CheckInDate ? new Date(formData.CheckInDate) : null}
												onChange={(date: any) => setFormData({ ...formData, CheckInDate: date?.toISOString() || '' })}
												placeholderText="Check-in"
												className="w-full p-3 border border-gray-300 rounded-lg"
												minDate={new Date()}
											/>
										</div>

										<div className="">
											<DatePicker
												selected={formData.CheckOutDate ? new Date(formData.CheckOutDate) : null}
												onChange={(date: any) => setFormData({ ...formData, CheckOutDate: date?.toISOString() || '' })}
												placeholderText="Check-out"
												className="w-full p-3 border border-gray-300 rounded-lg"
												minDate={formData.CheckInDate ? new Date(formData.CheckInDate) : new Date()}
											/>
										</div>
									</div>

									{errorMessage.length > 0 &&
										errorMessage.map((msg, i) => (
											<p
												key={i}
												className="text-center text-red-500 text-sm">
												{msg}
											</p>
										))}

									<button
										type="submit"
										disabled={formStatus === 'submitting'}
										className="w-full bg-gray-900 hover:bg-amber-600 text-white font-bold py-4 rounded-lg transition">
										{formStatus === 'submitting' ? 'Processing…' : 'Confirm Booking Request'}
									</button>
								</form>
							</>
						)}

						{/* ───────────────── OWNER CONTACT STEP ───────────────── */}
						{bookingFlow === 'owner' && (
							<>
								<button
									onClick={() => setBookingFlow('options')}
									className="text-sm text-gray-500 hover:text-gray-900 mb-4 underline">
									← Back
								</button>

								<h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Property Owner</h3>
								<p className="text-gray-500 mb-6">Reach out directly to finalize your booking.</p>

								<div className="space-y-4 text-sm">
									<div className="flex justify-between items-center">
										<span className="text-gray-500">Name</span>
										<span className="font-medium text-gray-900">{selectedProp?.createdBy?.name || 'N/A'}</span>
									</div>

									<div className="flex justify-between items-center">
										<span className="text-gray-500">Email</span>
										{selectedProp?.createdBy?.email ? (
											<Link
												href={`mailto:${selectedProp.createdBy.email}`}
												className="text-amber-600 font-medium hover:underline">
												{selectedProp.createdBy.email}
											</Link>
										) : (
											<span className="text-gray-400">Not available</span>
										)}
									</div>

									<div className="flex justify-between items-center">
										<span className="text-gray-500">Phone</span>
										{selectedProp?.createdBy?.phone ? (
											<Link
												href={`tel:${selectedProp.createdBy.phone}`}
												className="text-amber-600 font-medium hover:underline">
												{selectedProp.createdBy.phone}
											</Link>
										) : (
											<span className="text-gray-400">Not available</span>
										)}
									</div>
								</div>
							</>
						)}
					</div>
				</section>
			)}
		</>
	);
};
