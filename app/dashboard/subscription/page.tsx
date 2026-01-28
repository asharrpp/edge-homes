import { redirect } from 'next/navigation';

import SubscriptionClient from '@/components/pages/user/subscription/subscriptionClient';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { FetchSubscriptionResponse } from '@/lib/types';

export default async function SubscriptionPage() {
	const { backEndUrl } = configurations.envs;
	const session = await getSession(USER_COOKIE_NAME);

	if (!session) {
		redirect(configurations.urls.User.SignIn);
	}

	const accessToken = await getCookie(USER_COOKIE_NAME);
	const userId = session.sub;

	const headers = {
		'Authorization': `Bearer ${accessToken?.value}`,
		'Content-Type': 'application/json',
	};

	let subscriptionData: FetchSubscriptionResponse | null = null;
	let error: string | null = null;

	try {
		const request = await fetch(`${backEndUrl}/user/subscription-details`, {
			cache: 'no-store',
			headers,
		});

		if (!request.ok) {
			throw new Error(`Failed to fetch subscription data: ${request.status}`);
		}

		const response = await request.json();
		subscriptionData = response;
	} catch (err) {
		error = 'Failed to load subscription information. Please try again later.';
	}

	return (
		<SubscriptionClient
			subscriptionData={subscriptionData}
			userId={userId}
			error={error}
		/>
	);
}
