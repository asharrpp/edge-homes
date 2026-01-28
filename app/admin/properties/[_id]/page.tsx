import { AlertTriangle, Bath, Bed, Building, Calendar, CheckCircle, Clock, DollarSign, MapPin, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { PropertyClient } from '@/components/pages/admin/property/property-client';
import { BackButton } from '@/components/ui/back-button';
import { PropertyStatusBadge } from '@/components/ui/property-status-badge';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { BookingStatus, RevalidateTags } from '@/lib/enums';
import { PropertyType } from '@/lib/types';
import { formatCurrency, formatPrice } from '@/lib/utils';

export default async function PropertyDetailsPage({ params }: { params: Promise<{ _id: string }> }) {
	const { _id } = await params;
	const { backEndUrl } = configurations.envs;
	const session = await getSession(ADMIN_COOKIE_NAME);

	if (!session) {
		redirect(configurations.urls.Admin.SignIn);
	}

	const accessToken = await getCookie(ADMIN_COOKIE_NAME);
	const headers = {
		'Authorization': `Bearer ${accessToken?.value}`,
		'Content-Type': 'application/json',
	};

	let property: PropertyType | null = null;
	let error = false;

	try {
		const request = await fetch(`${backEndUrl}/property/${_id}/admin`, {
			headers,
			next: { tags: [RevalidateTags.PROPERTY] },
		});

		if (!request.ok) {
			throw new Error(`Failed to fetch property: ${request.status}`);
		}

		property = (await request.json()) as PropertyType;
	} catch (error) {
		error = true;
	}

	// If property not found or error
	if (error || !property) {
		return (
			<main className="space-y-8">
				<BackButton />
				<div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
					<div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
						<AlertTriangle className="w-8 h-8" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
					<p className="text-gray-600">The property you're looking for doesn't exist.</p>
					<BackButton variant="sleek" />
				</div>
			</main>
		);
	}

	// Format the price for display
	const formattedPrice = formatPrice(property.price);

	const bookingStats = property.bookingStats || {
		totalBookings: 0,
		confirmedBookings: 0,
		pendingBookings: 0,
		cancelledBookings: 0,
		revenueGenerated: 0,
		occupancyRate: 0,
		recentBookings: [],
	};

	return (
		<main className="space-y-8">
			{/* Header with back navigation */}
			<div className="flex items-center justify-between">
				<BackButton label="Back to Properties" />

				<div className="flex items-center gap-3">
					<PropertyStatusBadge available={property.available} />
					<span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">{property.type}</span>
				</div>
			</div>

			<div className="relative">
				<div className="relative h-[350px] xl:h-[400px] w-full overflow-hidden bg-gray-900">
					{property.video?.url ? (
						<div className="relative w-full h-full">
							<video
								src={property.video.url}
								controls
								autoPlay
								muted
								loop
								className="w-full h-full object-cover"
							/>
							<div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">Video Tour</div>
						</div>
					) : (
						<div className="grid grid-cols-3 h-full gap-1">
							{property.images.slice(0, 3).map((image, index) => (
								<div
									key={index}
									className="relative overflow-hidden">
									<img
										src={image.url}
										alt={`${property.title} - View ${index + 1}`}
										className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
									/>
									{index === 0 && property.images.length > 1 && (
										<div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">Main Image</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				{property.images.length > 1 && (
					<div className="mt-4">
						<div className="flex gap-2 overflow-x-auto pb-2">
							{property.images.map((image, index) => (
								<button
									key={index}
									className="flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-amber-500 transition-all">
									<img
										src={image.url}
										alt={`Thumbnail ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Main Content Grid */}
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column: Property Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Key Specifications */}
					<div className="bg-white rounded-2xl border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-6">Property Specifications</h2>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
									<Bed className="w-6 h-6" />
								</div>
								<p className="text-sm text-gray-500">Bedrooms</p>
								<p className="text-xl font-bold text-gray-900">{property.beds}</p>
							</div>

							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
									<Bath className="w-6 h-6" />
								</div>
								<p className="text-sm text-gray-500">Bathrooms</p>
								<p className="text-xl font-bold text-gray-900">{property.baths}</p>
							</div>

							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
									<Building className="w-6 h-6" />
								</div>
								<p className="text-sm text-gray-500">Property Type</p>
								<p className="text-lg font-semibold text-gray-900 capitalize">{property.type.replace('-', ' ')}</p>
							</div>

							<div className="text-center p-4 bg-gray-50 rounded-lg">
								<div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
									<CheckCircle className="w-6 h-6" />
								</div>
								<p className="text-sm text-gray-500">Status</p>
								<p className={`text-lg font-semibold ${property.available ? 'text-green-600' : 'text-red-600'}`}>{property.available ? 'Available' : 'Booked'}</p>
							</div>
						</div>
					</div>

					{/* Features & Amenities */}
					{property.features && property.features.length > 0 && (
						<div className="bg-white rounded-2xl border border-gray-200 p-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-6">Features & Amenities</h2>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{property.features.map((feature, index) => (
									<div
										key={index}
										className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
										<div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
											<CheckCircle className="w-4 h-4 text-green-500" />
										</div>
										<span className="text-gray-700">{feature}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Recent Bookings */}
					{bookingStats.recentBookings.length > 0 && (
						<div className="bg-white rounded-2xl border border-gray-200 p-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Bookings</h2>

							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dates</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
											<th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
										</tr>
									</thead>
									<tbody>
										{bookingStats.recentBookings.map((booking: any) => (
											<tr
												key={booking._id}
												className="border-b border-gray-100 last:border-0">
												<td className="py-3 px-4">
													<div>
														<p className="font-medium text-gray-900">{booking.customerName}</p>
														<p className="text-sm text-gray-500">{booking.customerEmail}</p>
													</div>
												</td>
												<td className="py-3 px-4">
													<div>
														<p className="text-sm text-gray-900">{new Date(booking.checkInDate).toLocaleDateString()}</p>
														{booking.checkOutDate && <p className="text-xs text-gray-500">to {new Date(booking.checkOutDate).toLocaleDateString()}</p>}
													</div>
												</td>
												<td className="py-3 px-4">
													<span className="font-semibold text-gray-900">{formatCurrency(booking.totalAmount || 0, property.price.currency)}</span>
												</td>
												<td className="py-3 px-4">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															booking.status === BookingStatus.CONFIRMED
																? 'bg-green-100 text-green-800'
																: booking.status === BookingStatus.PENDING
																	? 'bg-yellow-100 text-yellow-800'
																	: 'bg-red-100 text-red-800'
														}`}>
														{booking.status}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="mt-4 text-center">
								<button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All Bookings →</button>
							</div>
						</div>
					)}

					{/* Metadata */}
					<div className="bg-white rounded-2xl border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">More Information</h2>

						<div className="space-y-3">
							<div className="flex justify-between items-center py-2 border-b border-gray-100">
								<span className="text-gray-500">Price Breakdown</span>
								<div className="text-right">
									<div className="font-semibold text-gray-900">{formattedPrice}</div>
									<div className="text-xs text-gray-500">
										{property.price.currency} {property.price.amount.toLocaleString()} per {property.price.duration}
									</div>
								</div>
							</div>

							<div className="flex justify-between items-center py-2">
								<span className="text-gray-500">Last Updated</span>
								<span className="text-gray-900">{property.updatedAt ? new Date(property.updatedAt).toDateString() : '-'}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column: Actions & Management */}
				<div className="space-y-6">
					{/* Booking Statistics */}
					<div className="bg-white rounded-2xl border border-gray-200 p-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-6">Booking Statistics</h2>

						<div className="space-y-6">
							<div>
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm text-gray-500">Total Bookings</p>
									<Calendar className="w-4 h-4 text-gray-400" />
								</div>
								<p className="text-2xl font-bold text-gray-900">{bookingStats.totalBookings}</p>
								<div className="flex gap-2 mt-1">
									<span className={`text-xs px-2 py-1 rounded-full ${bookingStats.confirmedBookings > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
										{bookingStats.confirmedBookings} confirmed
									</span>
									<span className={`text-xs px-2 py-1 rounded-full ${bookingStats.pendingBookings > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
										{bookingStats.pendingBookings} pending
									</span>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm text-gray-500">Revenue Generated</p>
									<DollarSign className="w-4 h-4 text-gray-400" />
								</div>
								<p className="text-2xl font-bold text-gray-900">{formatCurrency(bookingStats.revenueGenerated, property.price.currency)}</p>
								<p className="text-xs text-gray-500 mt-1">From {bookingStats.confirmedBookings} bookings</p>
							</div>

							<div>
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm text-gray-500">Occupancy Rate</p>
									<TrendingUp className="w-4 h-4 text-gray-400" />
								</div>
								<p className="text-2xl font-bold text-gray-900">{bookingStats.occupancyRate}%</p>
								<div className="w-full bg-gray-200 rounded-full h-2 mt-2">
									<div
										className="bg-green-500 h-2 rounded-full"
										style={{ width: `${bookingStats.occupancyRate}%` }}></div>
								</div>
								<p className="text-xs text-gray-500 mt-1">Based on last 30 days</p>
							</div>

							<div>
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm text-gray-500">Avg. Booking Duration</p>
									<Clock className="w-4 h-4 text-gray-400" />
								</div>
								<p className="text-2xl font-bold text-gray-900">{bookingStats.averageStayDuration}</p>
							</div>
						</div>
					</div>

					<PropertyClient
						showPropertyManagement
						isAdmin={session.isAdmin}
						property={property}
					/>
				</div>
			</section>
		</main>
	);
}
