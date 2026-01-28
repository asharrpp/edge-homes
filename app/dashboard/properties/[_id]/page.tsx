import { AlertTriangle, Bath, Bed, Building, CheckCircle, MapPin } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { PropertyClient } from '@/components/pages/admin/property/property-client';
import { BackButton } from '@/components/ui/back-button';
import { PropertyStatusBadge } from '@/components/ui/property-status-badge';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { RevalidateTags } from '@/lib/enums';
import { PropertyType } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default async function PropertyDetailsPage({ params }: { params: Promise<{ _id: string }> }) {
	const { _id } = await params;
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

	let property: PropertyType | null = null;
	let error = false;

	try {
		const request = await fetch(`${backEndUrl}/property/${_id}`, {
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

			{/* Property Hero Section */}
			<section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
				{/* Image Gallery */}
				<div className="relative h-64 md:h-80 lg:h-96 bg-gray-100">
					<Image
						src={property.images[0].url}
						alt={property.title}
						width={1050}
						height={1050}
						className="w-full h-full object-cover"
					/>
					<div className="absolute bottom-4 left-4">{/* You could add multiple image indicators here */}</div>
				</div>

				{/* Property Header Info */}
				<div className="p-6">
					<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
						<div className="flex-1">
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>

							<div className="flex items-center gap-2 mt-2 text-gray-600">
								<MapPin className="w-4 h-4" />
								<span className="text-sm md:text-base">{property.location}</span>
							</div>
						</div>

						<div className="text-right">
							<div className="text-2xl md:text-3xl font-bold text-gray-900">{formattedPrice}</div>
							<p className="text-sm text-gray-500 mt-1">{property.available ? 'Available for booking' : 'Currently booked'}</p>
						</div>
					</div>
				</div>
			</section>

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
					<PropertyClient
						isAdmin={session.isAdmin}
						property={property}
					/>
				</div>
			</section>
		</main>
	);
}
