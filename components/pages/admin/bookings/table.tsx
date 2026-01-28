'use client';

import { Building, Calendar, CheckCircle, Eye, Loader2, MoreVertical, User, XCircle } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Pagination } from '@/components/global/pagination';
import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { BookingFetchResponseType } from '@/lib/types';

interface TableProps {
	bookings: BookingFetchResponseType['bookings'];
	pagination: BookingFetchResponseType['pagination'];
	currentStatus: string;
}

export function BookingsTable({ bookings, pagination, currentStatus }: TableProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
	const [confirmAction, setConfirmAction] = useState<{
		bookingId: string;
		status: 'confirmed' | 'cancelled';
	} | null>(null);

	const [selectedBooking, setSelectedBooking] = useState<BookingFetchResponseType['bookings'][0] | null>(null);

	const { backEndUrl } = configurations.envs;

	const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
		setLoadingId(bookingId);

		try {
			const accessToken = await getCookie(ADMIN_COOKIE_NAME);
			if (!accessToken) {
				router.push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}

			if (status === 'confirmed') {
				const response = await fetch(`${backEndUrl}/bookings/${bookingId}/confirm`, {
					method: 'PATCH',
					headers: {
						'Authorization': `Bearer ${accessToken.value}`,
						'Content-Type': 'application/json',
					},
				});

				if (response.ok) {
					toast.success(`Booking 'confirmed' successfully`);
					router.refresh(); // Refresh the page data
				} else {
					throw new Error('Failed to update booking status');
				}
			} else {
				const response = await fetch(`${backEndUrl}/bookings/${bookingId}/cancel`, {
					method: 'PATCH',
					headers: {
						'Authorization': `Bearer ${accessToken.value}`,
						'Content-Type': 'application/json',
					},
				});

				if (response.ok) {
					toast.success(`Booking 'cancelled' successfully`);
					router.refresh(); // Refresh the page data
				} else {
					throw new Error('Failed to update booking status');
				}
			}
		} catch (error) {
			toast.error('Failed to update booking status');
		} finally {
			setLoadingId(null);
			setShowActionsMenu(null);
		}
	};

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('page', newPage.toString());
		router.push(`/admin/bookings?${params.toString()}`);
	};

	const viewBookingDetails = (booking: BookingFetchResponseType['bookings'][0]) => {
		setSelectedBooking(booking);
		setShowDetailsModal(true);
	};

	const getStatusBadge = (status: string) => {
		const styles = {
			pending: 'bg-amber-100 text-amber-800',
			confirmed: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800',
			completed: 'bg-blue-100 text-blue-800',
		};

		return (
			<span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</span>
		);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	if (bookings.length === 0) {
		return (
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
				<Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
				<p className="text-gray-500">{currentStatus ? `No ${currentStatus} bookings found. Try a different filter.` : 'No bookings have been made yet.'}</p>
			</div>
		);
	}

	return (
		<>
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Property</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{bookings.map((booking) => (
								<tr
									key={booking._id}
									className="hover:bg-gray-50 transition">
									<td className="px-6 py-4">
										<div>
											<div className="flex items-center space-x-3">
												<div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center">
													<User className="w-5 h-5" />
												</div>
												<div>
													<p className="font-medium text-gray-900">{booking.customerName}</p>
													<p className="text-sm text-gray-500">{booking.customerEmail}</p>
													<div className="flex items-center mt-1 text-sm text-gray-400">
														<Building className="w-3 h-3 mr-1" />
														{booking.propertyTitle}
													</div>
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="space-y-1">
											<div className="flex items-center text-sm text-gray-900">
												<Calendar className="w-4 h-4 mr-2 text-gray-400" />
												Check-in: {formatDate(booking.checkInDate)}
											</div>
											<div className="flex items-center text-sm text-gray-900">
												<Calendar className="w-4 h-4 mr-2 text-gray-400" />
												Check-out: {formatDate(booking.checkOutDate)}
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="text-lg font-semibold text-gray-900">₦{booking.totalAmount.toLocaleString()}</div>
										<div className="text-sm text-gray-500">Created: {formatDate(booking.createdAt)}</div>
									</td>
									<td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
									<td className="px-6 py-4">
										<div className="flex items-center space-x-2">
											<button
												onClick={() => viewBookingDetails(booking)}
												className="p-2 text-gray-400 hover:text-gray-600 transition"
												title="View Details">
												<Eye className="w-5 h-5" />
											</button>

											{booking.status === 'pending' &&
												(loadingId === booking._id ? (
													<div className="flex items-center justify-center w-[72px]">
														<Loader2 className="w-5 h-5 animate-spin text-gray-400" />
													</div>
												) : (
													<>
														<button
															onClick={() =>
																setConfirmAction({
																	bookingId: booking._id,
																	status: 'confirmed',
																})
															}
															className="p-2 text-green-400 hover:text-green-600 transition"
															title="Confirm Booking">
															<CheckCircle className="w-5 h-5" />
														</button>

														<button
															onClick={() =>
																setConfirmAction({
																	bookingId: booking._id,
																	status: 'cancelled',
																})
															}
															className="p-2 text-red-400 hover:text-red-600 transition"
															title="Cancel Booking">
															<XCircle className="w-5 h-5" />
														</button>
													</>
												))}

											<div className="relative">
												<button
													onClick={() => setShowActionsMenu(showActionsMenu === booking._id ? null : booking._id)}
													className="p-2 text-gray-400 hover:text-gray-600 transition"
													title="More Actions">
													<MoreVertical className="w-5 h-5" />
												</button>

												{showActionsMenu === booking._id && (
													<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[50]">
														<button
															onClick={() => {
																navigator.clipboard.writeText(booking._id);
																toast.success('Booking ID copied to clipboard');
																setShowActionsMenu(null);
															}}
															className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
															Copy Booking ID
														</button>
														<button
															onClick={() => {
																// Implement email customer
																toast.info('Email feature coming soon');
																setShowActionsMenu(null);
															}}
															className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
															Email Customer
														</button>
														<button
															onClick={() => {
																// Implement view property
																router.push(configurations.urls.Admin.property.replace('[propertyId]', booking.property._id));

																setShowActionsMenu(null);
															}}
															className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
															View Property
														</button>
													</div>
												)}
											</div>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{pagination && pagination.totalPages > 1 && (
					<div className="mt-12">
						<Pagination
							currentPage={pagination.page}
							totalPages={pagination.totalPages}
							totalItems={pagination.itemCount}
							itemsPerPage={pagination.limit}
							onPageChange={handlePageChange}
							isLoading={loadingId ? true : false}
							hasNextPage={pagination.hasNextPage}
							hasPreviousPage={pagination.hasPreviousPage}
						/>
					</div>
				)}
			</div>

			{/* Booking Details Modal */}
			{showDetailsModal && selectedBooking && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
								<button
									onClick={() => setShowDetailsModal(false)}
									className="p-2 text-gray-400 hover:text-gray-600">
									✕
								</button>
							</div>

							<div className="space-y-6">
								{/* Customer Info */}
								<div className="bg-gray-50 rounded-xl p-6">
									<h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">Full Name</p>
											<p className="font-medium text-gray-900">{selectedBooking.customerName}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Email Address</p>
											<p className="font-medium text-gray-900">{selectedBooking.customerEmail}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Phone Number</p>
											<p className="font-medium text-gray-900">{selectedBooking.customerPhone}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Booking ID</p>
											<p className="font-medium text-gray-900 font-mono">{selectedBooking._id}</p>
										</div>
									</div>
								</div>

								{/* Property Info */}
								<div className="bg-gray-50 rounded-xl p-6">
									<h4 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h4>
									<div className="space-y-3">
										<div>
											<p className="text-sm text-gray-500">Property Name</p>
											<p className="font-medium text-gray-900">{selectedBooking.propertyTitle}</p>
										</div>
										<button
											onClick={() => {
												setShowDetailsModal(false);
												router.push(configurations.urls.Admin.property.replace('[propertyId]', selectedBooking.property._id));
											}}
											className="text-amber-600 hover:text-amber-700 font-medium">
											View Property Details →
										</button>
									</div>
								</div>

								{/* Booking Dates */}
								<div className="bg-gray-50 rounded-xl p-6">
									<h4 className="text-lg font-semibold text-gray-900 mb-4">Booking Dates</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">Check-in Date</p>
											<p className="font-medium text-gray-900">{formatDate(selectedBooking.checkInDate)}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Check-out Date</p>
											<p className="font-medium text-gray-900">{formatDate(selectedBooking.checkOutDate)}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Booking Created</p>
											<p className="font-medium text-gray-900">{formatDate(selectedBooking.createdAt)}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Nights</p>
											<p className="font-medium text-gray-900">
												{Math.ceil((new Date(selectedBooking.checkOutDate).getTime() - new Date(selectedBooking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
											</p>
										</div>
									</div>
								</div>

								{/* Payment & Status */}
								<div className="bg-gray-50 rounded-xl p-6">
									<h4 className="text-lg font-semibold text-gray-900 mb-4">Payment & Status</h4>
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-gray-500">Total Amount</p>
											<p className="text-3xl font-bold text-gray-900">
												{selectedBooking.property.price.currency}
												{selectedBooking.totalAmount.toLocaleString()}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm text-gray-500">Booking Status</p>
											{getStatusBadge(selectedBooking.status)}
										</div>
									</div>
								</div>

								{/* Actions */}
								{selectedBooking.status === 'pending' &&
									(loadingId === selectedBooking._id ? (
										<div className="flex justify-center py-4">
											<Loader2 className="w-6 h-6 animate-spin text-gray-400" />
										</div>
									) : (
										<div className="flex space-x-4">
											<button
												onClick={() => {
													setConfirmAction({
														bookingId: selectedBooking._id,
														status: 'confirmed',
													});
													setShowDetailsModal(false);
												}}
												className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition">
												Confirm Booking
											</button>

											<button
												onClick={() => {
													setConfirmAction({
														bookingId: selectedBooking._id,
														status: 'cancelled',
													});
													setShowDetailsModal(false);
												}}
												className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition">
												Cancel Booking
											</button>
										</div>
									))}
							</div>
						</div>
					</div>
				</div>
			)}

			{confirmAction && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl w-full max-w-md p-6">
						<h3 className="text-xl font-bold text-gray-900 mb-2">{confirmAction.status === 'confirmed' ? 'Confirm Booking' : 'Cancel Booking'}</h3>

						<p className="text-gray-600 mb-6">
							Are you sure you want to <span className="font-semibold">{confirmAction.status}</span> this booking?
							<br />
							This action cannot be undone.
						</p>

						<div className="flex gap-3">
							<button
								onClick={() => setConfirmAction(null)}
								className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
								No, go back
							</button>

							<button
								onClick={() => {
									handleStatusUpdate(confirmAction.bookingId, confirmAction.status);
									setConfirmAction(null);
									setShowDetailsModal(false);
								}}
								className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold ${
									confirmAction.status === 'confirmed' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
								}`}>
								Yes, {confirmAction.status}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
