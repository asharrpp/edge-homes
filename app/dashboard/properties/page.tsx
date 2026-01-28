import 'react-datepicker/dist/react-datepicker.css';

import { redirect } from 'next/navigation';

import { UserPropertiesClient } from '@/components/pages/user/properties/properties-client';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { FetchAllPropertiesResponse } from '@/lib/types';

export default async function PropertiesPage() {
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

	try {
		const request = await fetch(`${backEndUrl}/property/user`, {
			cache: 'no-store',
			headers,
		});
		const response = (await request.json()) as FetchAllPropertiesResponse;
		properties = response.properties || [];
		pagination = response.pagination || null;
	} catch (error) {
		void error;
	}

	return (
		<main className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Find Your Perfect Stay</h1>
					<p className="text-gray-500 mt-2">Browse and book premium properties for your extended stay</p>
				</div>
			</div>

			<UserPropertiesClient
				propertiesArray={properties}
				propertiesPagination={pagination}
			/>
		</main>
	);
}
