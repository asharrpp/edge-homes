'use client';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Pagination } from '@/components/global/pagination';
import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { BookingTypeWithPrice, PaginationType } from '@/lib/types';

interface BookingsClientProps {
	bookingsArray: BookingTypeWithPrice[];
	bookingsPagination: any | null; // replace with actual pagination type if needed
}

export function BookingsClient({ bookingsArray, bookingsPagination }: BookingsClientProps) {
	const [bookings, setBookings] = useState<BookingTypeWithPrice[]>(bookingsArray);
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [pagination, setPagination] = useState<PaginationType | null>(bookingsPagination);

	useEffect(() => {
		setBookings(bookingsArray);
	}, [bookingsArray]);

	const fetchFilteredBookings = async (search: string, page = 1) => {
		try {
			setIsLoading(true);

			const { backEndUrl } = configurations.envs;

			const accessToken = await getCookie(USER_COOKIE_NAME);

			const headers = {
				'Authorization': `Bearer ${accessToken?.value}`,
				'Content-Type': 'application/json',
			};
			const params = new URLSearchParams();
			if (search) params.append('search', search);
			params.append('page', page.toString());
			params.append('limit', pagination?.limit.toString() || '12');

			const request = await fetch(`${backEndUrl}/bookings/user?${params.toString()}`, { headers });

			const data = await request.json();
			setBookings(data.bookings || []);
			setPagination(data.pagination || null);
		} catch (error) {
			void error;
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = async () => {
		await fetchFilteredBookings(searchTerm, pagination?.page);
	};

	// Handle pagination change
	const handlePageChange = async (newPage: number) => {
		if (isLoading) return;
		await fetchFilteredBookings(searchTerm, newPage);
	};

	return (
		<div className="space-y-6">
			<section className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
				<div className="flex-1">
					<h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
				</div>

				<div className="flex items-center gap-2 w-full md:w-auto">
					<div className="relative flex-1 md:flex-auto">
						<input
							type="text"
							placeholder="Search by property or customer email..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pr-12 px-4 py-3 border text-black placeholder:text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
						/>

						<button
							type="button"
							onClick={handleSearch}
							className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-amber-600 transition-colors duration-200"
							aria-label="Search Properties">
							<Search className="w-5 h-5" />
						</button>
					</div>
				</div>
			</section>

			{/* Loading */}
			{isLoading && (
				<div className="flex justify-center py-12">
					<svg
						className="animate-spin h-10 w-10 text-amber-600"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24">
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
						/>
					</svg>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && bookings.length === 0 && <div className="text-center py-12 text-gray-500">No bookings found.</div>}

			{/* Bookings Table */}
			{!isLoading && bookings.length > 0 && (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border rounded-lg">
						<thead className="bg-gray-100">
							<tr>
								<th className="py-2 px-4 text-left">Property</th>
								<th className="py-2 px-4 text-left">Customer</th>
								<th className="py-2 px-4 text-left">Check In</th>
								<th className="py-2 px-4 text-left">Check Out</th>
								<th className="py-2 px-4 text-left">Amount</th>
								<th className="py-2 px-4 text-left">Status</th>
							</tr>
						</thead>
						<tbody>
							{bookings.map((b) => (
								<tr
									key={b._id}
									className="border-t">
									<td className="py-2 px-4">{b.propertyTitle}</td>
									<td className="py-2 px-4">{b.customerEmail}</td>
									<td className="py-2 px-4">{format(new Date(b.checkInDate), 'dd MMM yyyy')}</td>
									<td className="py-2 px-4">{format(new Date(b.checkOutDate), 'dd MMM yyyy')}</td>
									<td className="py-2 px-4 font-bold">${b.totalAmount.toFixed(2)}</td>
									<td className="py-2 px-4">{b.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
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
		</div>
	);
}
