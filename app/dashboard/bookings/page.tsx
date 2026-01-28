import { redirect } from 'next/navigation';

import { BookingsClient } from '@/components/pages/user/bookings/booking-client';
import { MyPropertiesClient } from '@/components/pages/user/my-properties/my-property-client';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { BookingFetchResponseType, FetchAllPropertiesResponse } from '@/lib/types';

export default async function BookingsPage() {
	const { backEndUrl } = configurations.envs;
	const session = await getSession(USER_COOKIE_NAME);

	if (!session) {
		redirect(configurations.urls.User.SignIn);
	}

	const accessToken = await getCookie(USER_COOKIE_NAME);

	const headers = {
		'Authorization': `Bearer ${accessToken?.value}`,
		'Content-Type': 'application/json',
	};

	let bookings: BookingFetchResponseType['bookings'] = [];
	let pagination: BookingFetchResponseType['pagination'] | null = null;

	try {
		const request = await fetch(`${backEndUrl}/bookings/user`, {
			cache: 'no-store',
			headers,
		});
		const response = (await request.json()) as BookingFetchResponseType;
		bookings = response.bookings || [];
		pagination = response.pagination || null;
	} catch (error) {
		void error;
	}

	return (
		<main className="space-y-6">
			<BookingsClient
				bookingsArray={bookings}
				bookingsPagination={pagination}
			/>
		</main>
	);
}
