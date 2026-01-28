import { BookingsHeader } from '@/components/pages/admin/bookings/booking-header';
import { BookingsStats } from '@/components/pages/admin/bookings/stats';
import { BookingsTable } from '@/components/pages/admin/bookings/table';
import { configurations } from '@/config';
import { RevalidateTags } from '@/lib/enums';
import { BookingFetchResponseType } from '@/lib/types';

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
	const { backEndUrl } = configurations.envs;
	const { page, limit, search, status } = await searchParams;

	const params = new URLSearchParams();
	if (page) params.append('page', page.toString());
	if (limit) params.append('limit', limit.toString());
	if (status && typeof status === 'string') params.append('status', status);
	if (search && typeof search === 'string') params.append('search', search);

	// Fetch bookings data
	let bookingsData: BookingFetchResponseType = {
		bookings: [],
		pagination: { page: 1, limit: 10, itemCount: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
	};

	try {
		const response = await fetch(`${backEndUrl}/bookings?${params.toString()}`, {
			next: { tags: [RevalidateTags.BOOKINGS] },
		});

		if (response.ok) {
			bookingsData = await response.json();
		}
	} catch (error) {
		void error;
	}

	// Fetch stats data
	let stats = null;
	try {
		const statsResponse = await fetch(`${backEndUrl}/bookings/stats`, {
			next: { tags: [RevalidateTags.BOOKINGS] },
		});

		if (statsResponse.ok) {
			stats = await statsResponse.json();
		}
	} catch (error) {
		void error;
	}

	return (
		<main className="space-y-6">
			<BookingsHeader />
			<BookingsStats stats={stats} />
			<BookingsTable
				bookings={bookingsData.bookings}
				pagination={bookingsData.pagination}
				currentStatus={status && typeof status === 'string' ? status : 'all'}
			/>
		</main>
	);
}
