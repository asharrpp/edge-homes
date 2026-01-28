import { AlertCircle, Bell, Building, Calendar, CheckCircle, Clock, CreditCard, Home, MapPin, MessageSquare, Plus, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';

interface DashboardBooking {
	id: string;
	propertyName: string;
	location: string;
	checkIn: string;
	checkOut?: string;
	status: 'pending' | 'confirmed' | 'cancelled';
	nights: number;
	total: number;
	propertyId: string;
}

interface RecentProperty {
	id: string;
	name: string;
	location: string;
	price: number;
	image: string;
}

interface QuickAction {
	label: string;
	icon: string;
	href: string;
}

interface DashboardData {
	userProfile: {
		name: string;
		email: string;
		credits: number;
		memberSince?: string;
	};
	stats: {
		totalBookings: number;
		upcomingBookings: number;
		totalSpent: number;
		creditsAvailable: number;
		propertiesListed: number;
	};
	upcomingBookings: DashboardBooking[];
	recentBookings: RecentProperty[];
	quickActions: QuickAction[];
}

async function fetchDashboardData(accessToken: string): Promise<DashboardData | null> {
	const { backEndUrl } = configurations.envs;

	try {
		const response = await fetch(`${backEndUrl}/user/dashboard/summary`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			cache: 'no-store',
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch dashboard data: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		void error;
		return null;
	}
}

export default async function UserDashboardPage() {
	const session = await getSession(USER_COOKIE_NAME);

	if (!session) {
		redirect(configurations.urls.User.SignIn);
	}

	const accessToken = await getCookie(USER_COOKIE_NAME);

	if (!accessToken) {
		redirect(configurations.urls.User.SignIn);
	}

	const dashboardData = await fetchDashboardData(accessToken.value);

	// Fallback mock data
	const mockData: DashboardData = {
		userProfile: {
			name: session.name || 'User',
			email: session.email || '',
			credits: 0,
		},
		stats: {
			totalBookings: 0,
			upcomingBookings: 0,
			totalSpent: 0,
			creditsAvailable: 0,
			propertiesListed: 0,
		},
		upcomingBookings: [],
		recentBookings: [],
		quickActions: [
			{ label: 'Browse Properties', icon: 'Home', href: configurations.urls.User.Properties },
			{ label: 'My Bookings', icon: 'Calendar', href: configurations.urls.User.Bookings },
			{ label: 'My Subscriptions', icon: 'CreditCard', href: configurations.urls.User.Subscription },
			// { label: 'List Property', icon: 'Plus', href: configurations.urls.User.CreateProperty }
		],
	};

	const data = dashboardData || mockData;

	// Helper function to format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-NG', {
			style: 'currency',
			currency: 'NGN',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// Helper function to format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	// Map icon names to components
	const getIconComponent = (iconName: string) => {
		const iconMap: Record<string, any> = {
			Home: Home,
			Calendar: Calendar,
			CreditCard: CreditCard,
			Plus: Plus,
			Building: Building,
			Bell: Bell,
			MessageSquare: MessageSquare,
		};
		return iconMap[iconName] || Home;
	};

	return (
		<main className="space-y-6">
			{/* Welcome Header */}
			<div className="bg-gradient-to-r from-gray-900 to-amber-700 rounded-2xl p-8 text-white">
				<div className="max-w-2xl">
					<h2 className="text-3xl font-bold mb-2">Welcome back, {data.userProfile.name}! 👋</h2>
					<p className="text-amber-100">
						{data.userProfile.memberSince ? `Member since ${new Date(data.userProfile.memberSince).getFullYear()}` : 'Ready for your next extended stay?'}
					</p>
					<Link
						href={configurations.urls.User.Properties}
						className="mt-6 inline-block bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
						Browse Properties
					</Link>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Bookings</p>
							<p className="text-2xl font-bold mt-1 text-gray-500">{data.stats.totalBookings}</p>
						</div>
						<div className="bg-amber-100 p-3 rounded-lg">
							<Calendar className="w-6 h-6 text-amber-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">All-time bookings made</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Upcoming Bookings</p>
							<p className="text-2xl font-bold mt-1 text-gray-500">{data.stats.upcomingBookings}</p>
						</div>
						<div className="bg-blue-100 p-3 rounded-lg">
							<Clock className="w-6 h-6 text-blue-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Confirmed bookings coming up</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Spent</p>
							<p className="text-2xl font-bold mt-1 text-gray-500">{formatCurrency(data.stats.totalSpent)}</p>
						</div>
						<div className="bg-green-100 p-3 rounded-lg">
							<TrendingUp className="w-6 h-6 text-green-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Lifetime spending</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Credits</p>
							<p className="text-2xl font-bold mt-1 text-gray-500">{data.stats.creditsAvailable}</p>
						</div>
						<div className="bg-purple-100 p-3 rounded-lg">
							<CreditCard className="w-6 h-6 text-purple-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Available listing credits</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Properties</p>
							<p className="text-2xl font-bold mt-1 text-gray-500">{data.stats.propertiesListed}</p>
						</div>
						<div className="bg-amber-100 p-3 rounded-lg">
							<Building className="w-6 h-6 text-amber-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Your listed properties</p>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Upcoming Bookings & Quick Actions */}
				<div className="lg:col-span-2 space-y-6">
					{/* Upcoming Bookings */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
							{data.upcomingBookings.length > 0 && (
								<Link
									href={configurations.urls.User.Bookings}
									className="text-sm text-amber-600 hover:text-amber-700 font-medium">
									View All
								</Link>
							)}
						</div>

						<div className="space-y-4">
							{data.upcomingBookings.length > 0 ? (
								data.upcomingBookings.map((booking) => {
									const StatusIcon = booking.status === 'confirmed' ? CheckCircle : AlertCircle;
									const statusColor = booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';

									return (
										<div
											key={booking.id}
											className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
											<div className="flex-1">
												<div className="flex items-start gap-3">
													<div className={`p-2 rounded-lg ${booking.status === 'confirmed' ? 'bg-green-100' : 'bg-amber-100'}`}>
														<StatusIcon className={`w-5 h-5 ${booking.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}`} />
													</div>
													<div>
														<h3 className="font-semibold text-gray-900">{booking.propertyName}</h3>
														<div className="flex items-center text-sm text-gray-500 mt-1">
															<MapPin className="w-4 h-4 mr-1" />
															{booking.location}
														</div>
														<div className="flex items-center gap-4 mt-2 text-sm">
															<div>
																<span className="text-gray-500">Check-in:</span> <span className="font-medium">{formatDate(booking.checkIn)}</span>
															</div>
															<div>
																<span className="text-gray-500">Nights:</span> <span className="font-medium">{booking.nights}</span>
															</div>
														</div>
													</div>
												</div>
											</div>

											<div className="mt-4 md:mt-0 md:text-right">
												<p className="text-2xl font-bold text-gray-900">{formatCurrency(booking.total)}</p>
												<span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${statusColor}`}>
													{booking.status === 'confirmed' ? 'Confirmed' : 'Pending Approval'}
												</span>
												<div className="mt-3">
													<Link
														href={configurations.urls.User.Booking.replace('[bookingId]', booking.id)}
														className="text-sm text-amber-600 hover:text-amber-700 font-medium">
														View Details
													</Link>
												</div>
											</div>
										</div>
									);
								})
							) : (
								<div className="text-center py-8">
									<Calendar className="w-12 h-12 text-gray-300 mx-auto" />
									<p className="text-gray-500 mt-4">No upcoming bookings</p>
									<Link
										href={configurations.urls.User.Properties}
										className="mt-4 inline-block text-amber-600 hover:text-amber-700 font-medium">
										Browse Properties
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Column - Recently Booked Properties */}
				<div className="space-y-6">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-gray-900">Recently Booked</h2>
							{data.recentBookings.length > 0 && (
								<Link
									href={configurations.urls.User.Properties}
									className="text-sm text-amber-600 hover:text-amber-700 font-medium">
									See More
								</Link>
							)}
						</div>

						<div className="space-y-4">
							{data.recentBookings.length > 0 ? (
								data.recentBookings.map((property) => (
									<Link
										key={property.id}
										href={`/user/properties/${property.id}`}
										className="block group">
										<div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
											<div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
												<img
													src={property.image}
													alt={property.name}
													className="w-full h-full object-cover"
												/>
											</div>
											<div>
												<h3 className="font-semibold text-gray-900 group-hover:text-amber-600 transition">{property.name}</h3>
												<div className="flex items-center text-sm text-gray-500 mt-1">
													<MapPin className="w-3 h-3 mr-1" />
													{property.location}
												</div>
												<div className="flex items-center justify-between mt-2">
													<span className="font-bold text-gray-900">{formatCurrency(property.price)}/night</span>
													{/* Future rating implementation
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-medium ml-1">{property.rating}</span>
                          </div>
                          */}
												</div>
											</div>
										</div>
									</Link>
								))
							) : (
								<div className="text-center py-12">
									<Building className="w-8 h-8 text-gray-300 mx-auto mb-2" />
									<p className="text-gray-500">No recent bookings</p>
									<p className="text-sm text-gray-400 mt-1">Your recent bookings will appear here</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
