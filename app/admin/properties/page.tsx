import { redirect } from 'next/navigation';

import PropertiesClient from '@/components/pages/admin/properties';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { RevalidateTags } from '@/lib/enums';
import { FetchAllAdminPropertiesResponse } from '@/lib/types';

export default async function PropertiesPage() {
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

	let properties: FetchAllAdminPropertiesResponse['properties'] = [];
	let pagination: FetchAllAdminPropertiesResponse['pagination'] | null = null;
	let totalProperties: FetchAllAdminPropertiesResponse['totalProperties'] = 0;
	let availableProperties: FetchAllAdminPropertiesResponse['availableProperties'] = 0;
	let bookedProperties: FetchAllAdminPropertiesResponse['bookedProperties'] = 0;
	try {
		const request = await fetch(`${backEndUrl}/property/fetch-all`, {
			headers,
			next: { tags: [RevalidateTags.PROPERTIES] },
		});
		const response = (await request.json()) as FetchAllAdminPropertiesResponse;
		properties = response.properties;
		pagination = response.pagination;
		totalProperties = response.totalProperties;
		availableProperties = response.availableProperties;
		bookedProperties = response.bookedProperties;
	} catch (error) {
		void error;
	}

	return (
		<main className="space-y-6">
			<PropertiesClient
				properties={properties}
				pagination={pagination}
				totalProperties={totalProperties}
				availableProperties={availableProperties}
				bookedProperties={bookedProperties}
			/>
		</main>
	);
}
