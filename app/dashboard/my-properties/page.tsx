import { redirect } from 'next/navigation';

import { MyPropertiesClient } from '@/components/pages/user/my-properties/my-property-client';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { FetchAllPropertiesResponse, UserType } from '@/lib/types';

export default async function MyProperties() {
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

	let properties: FetchAllPropertiesResponse['properties'] = [];
	let pagination: FetchAllPropertiesResponse['pagination'] | null = null;
	let credits = 0;

	try {
		const [PropertiesRequest, ProfileRequest] = await Promise.all([
			fetch(`${backEndUrl}/property/my-properties`, {
				cache: 'no-store',
				headers,
			}),
			fetch(`${backEndUrl}/user/profile`, {
				cache: 'no-store',
				headers,
			}),
		]);
		const propertiesResponse = (await PropertiesRequest.json()) as FetchAllPropertiesResponse;
		const profileResponse = (await ProfileRequest.json()) as UserType;
		properties = propertiesResponse.properties || [];
		pagination = propertiesResponse.pagination || null;
		credits = profileResponse.listingCredits || 0;
	} catch (error) {
		void error;
	}

	return (
		<main className="space-y-6">
			<MyPropertiesClient
				credits={credits}
				propertiesArray={properties}
				propertiesPagination={pagination}
			/>
		</main>
	);
}
