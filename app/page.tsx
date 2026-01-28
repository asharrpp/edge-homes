import { Footer } from '@/components/global/footer';
import { Header } from '@/components/global/header';
import { HomeClient } from '@/components/pages/home/homeClient';
import { configurations } from '@/config';
import { FetchAllPropertiesResponse } from '@/lib/types';

export default async function HomePage() {
	const { backEndUrl } = configurations.envs;

	let properties: FetchAllPropertiesResponse['properties'] = [];
	let pagination: FetchAllPropertiesResponse['pagination'] | null = null;
	try {
		const request = await fetch(`${backEndUrl}/property`);
		const response = (await request.json()) as FetchAllPropertiesResponse;
		properties = response.properties;
		pagination = response.pagination;
	} catch (error) {
		void error;
	}

	return (
		<main className="min-h-screen bg-gray-50 font-sans text-gray-800">
			<Header />
			<section className="min-h-[90dvh]">
				<HomeClient
					propertiesArray={properties}
					propertiesPagination={pagination}
				/>
			</section>
			<Footer />
		</main>
	);
}
